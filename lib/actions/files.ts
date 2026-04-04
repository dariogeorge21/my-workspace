"use server"

import { db } from "@/lib/db"
import { personalFiles } from "@/lib/db/schema"
import { eq, ilike, or, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/session"

export async function getFiles(query = "") {
  await verifySession()

  try {
    const data = await db.select().from(personalFiles)
      .where(
        query 
          ? or(
              ilike(personalFiles.file_name, `%${query}%`),
              ilike(personalFiles.category, `%${query}%`)
            )
          : undefined
      )
      .orderBy(desc(personalFiles.updated_at))
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch files:", error)
    return { success: false, error: "Failed to fetch files" }
  }
}

export async function getFileById(id: string) {
  await verifySession()

  try {
    const data = await db.select().from(personalFiles).where(eq(personalFiles.id, id)).limit(1)
    if (data.length === 0) return { success: false, error: "File not found" }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Failed to fetch file:", error)
    return { success: false, error: "Failed to fetch file" }
  }
}

export async function createFile(payload: { file_name: string, category: string, storage_mode: "TEXT" | "URL", file_content: string }) {
  await verifySession()

  try {
    await db.insert(personalFiles).values({
      file_name: payload.file_name,
      category: payload.category,
      storage_mode: payload.storage_mode,
      file_content: payload.file_content,
    })
    revalidatePath("/workspace/files")
    return { success: true }
  } catch (error) {
    console.error("Failed to create file:", error)
    return { success: false, error: "Failed to create file" }
  }
}

export async function updateFile(id: string, payload: { file_name: string, category: string, storage_mode: "TEXT" | "URL", file_content: string }) {
  await verifySession()

  try {
    await db.update(personalFiles)
      .set({
        ...payload,
        updated_at: new Date()
      })
      .where(eq(personalFiles.id, id))
    revalidatePath("/workspace/files")
    return { success: true }
  } catch (error) {
    console.error("Failed to update file:", error)
    return { success: false, error: "Failed to update file" }
  }
}

export async function deleteFile(id: string) {
  await verifySession()

  try {
    await db.delete(personalFiles).where(eq(personalFiles.id, id))
    revalidatePath("/workspace/files")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete file:", error)
    return { success: false, error: "Failed to delete file" }
  }
}
