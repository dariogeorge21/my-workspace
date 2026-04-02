'use server';

import { db } from "@/lib/db";
import { appPrompts, personalPrompts } from "@/lib/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type PromptType = 'app' | 'personal';

function getTable(type: PromptType) {
  return type === 'app' ? appPrompts : personalPrompts;
}

export async function getPrompts(type: PromptType, search?: string) {
  const table = getTable(type);
  try {
    return await db
      .select()
      .from(table)
      .where(
        search
          ? or(
              ilike(table.heading, `%${search}%`),
              ilike(table.content, `%${search}%`)
            )
          : undefined
      )
      .orderBy(desc(table.updated_at));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getPrompt(type: PromptType, id: string) {
  const table = getTable(type);
  try {
    const result = await db.select().from(table).where(eq(table.id, id)).limit(1);
    return result[0] || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createPrompt(type: PromptType, data: { heading: string, content: string, time_taken_seconds: number, word_count: number }) {
  const table = getTable(type);
  try {
    const result = await db.insert(table).values(data).returning();
    revalidatePath(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}`);
    return { success: true, data: result[0] };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Failed to create prompt' };
  }
}

export async function updatePrompt(type: PromptType, id: string, data: { heading?: string, content?: string, time_taken_seconds?: number, word_count?: number }) {
  const table = getTable(type);
  try {
    const result = await db.update(table).set({ ...data, updated_at: new Date() }).where(eq(table.id, id)).returning();
    revalidatePath(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}`);
    revalidatePath(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}/${id}`);
    return { success: true, data: result[0] };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Failed to update prompt' };
  }
}

export async function deletePrompt(type: PromptType, id: string) {
  const table = getTable(type);
  try {
    await db.delete(table).where(eq(table.id, id));
    revalidatePath(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Failed to delete prompt' };
  }
}

export async function duplicatePrompt(type: PromptType, id: string) {
  const existing = await getPrompt(type, id);
  if (!existing) return { success: false, error: 'Prompt not found' };
  
  const { heading, content, time_taken_seconds, word_count } = existing;
  return await createPrompt(type, { 
    heading: `${heading} (Copy)`, 
    content, 
    time_taken_seconds, 
    word_count 
  });
}
