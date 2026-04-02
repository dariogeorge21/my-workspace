'use server';

import { db } from "@/lib/db";
import { passwordEntries } from "@/lib/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import { checkVaultAuth } from "./password-auth";
import { encryptText, decryptText } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export async function getPasswordEntries(search?: string) {
  try {
    const results = await db
      .select()
      .from(passwordEntries)
      .where(
        search
          ? or(
              ilike(passwordEntries.application_name, `%${search}%`),
              ilike(passwordEntries.username, `%${search}%`)
            )
          : undefined
      )
      .orderBy(desc(passwordEntries.updated_at));
    
    // Do NOT decrypt passwords here. Passwords should be "••••••••••••" by default.
    return results.map(entry => ({
      ...entry,
      encrypted_password: "••••••••••••" // mask it completely for the initial fetch
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getDecryptedPassword(id: string) {
  const isAuth = await checkVaultAuth();
  if (!isAuth) {
    return { success: false, requiresAuth: true, error: "Master password required" };
  }

  try {
    const result = await db.select().from(passwordEntries).where(eq(passwordEntries.id, id)).limit(1);
    if (!result.length) return { success: false, error: "Entry not found" };
    
    const plaintext = decryptText(result[0].encrypted_password);
    return { success: true, data: plaintext };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to decrypt password" };
  }
}

export async function createPasswordEntry(data: { application_name: string; username: string; plaintext_password: string }) {
  const isAuth = await checkVaultAuth();
  if (!isAuth) return { success: false, requiresAuth: true, error: "Master password required" };

  try {
    const encrypted = encryptText(data.plaintext_password);
    const result = await db.insert(passwordEntries).values({
      application_name: data.application_name,
      username: data.username,
      encrypted_password: encrypted,
    }).returning();
    
    revalidatePath('/workspace/passwords');
    return { success: true, data: result[0] };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to create entry" };
  }
}

export async function updatePasswordEntry(id: string, data: { application_name?: string; username?: string; plaintext_password?: string }) {
  const isAuth = await checkVaultAuth();
  if (!isAuth) return { success: false, requiresAuth: true, error: "Master password required" };

  try {
    const updates: any = { updated_at: new Date() };
    if (data.application_name) updates.application_name = data.application_name;
    if (data.username) updates.username = data.username;
    if (data.plaintext_password) updates.encrypted_password = encryptText(data.plaintext_password);

    const result = await db.update(passwordEntries).set(updates).where(eq(passwordEntries.id, id)).returning();
    
    revalidatePath('/workspace/passwords');
    return { success: true, data: result[0] };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to update entry" };
  }
}

export async function deletePasswordEntry(id: string) {
  const isAuth = await checkVaultAuth();
  if (!isAuth) return { success: false, requiresAuth: true, error: "Master password required" };

  try {
    await db.delete(passwordEntries).where(eq(passwordEntries.id, id));
    revalidatePath('/workspace/passwords');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to delete entry" };
  }
}
