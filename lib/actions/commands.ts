"use server"

import { db } from "@/lib/db"
import { favoriteCommands } from "@/lib/db/schema"
import { eq, ilike, or, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/session"

export async function getCommands(query = "") {
  await verifySession()

  try {
    const data = await db.select().from(favoriteCommands)
      .where(
        query 
          ? or(
              ilike(favoriteCommands.command_name, `%${query}%`),
              ilike(favoriteCommands.command, `%${query}%`)
            )
          : undefined
      )
      .orderBy(desc(favoriteCommands.updated_at))
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch commands:", error)
    return { success: false, error: "Failed to fetch commands" }
  }
}

export async function createCommand(payload: { command_name: string, command: string }) {
  await verifySession()

  try {
    await db.insert(favoriteCommands).values({
      command_name: payload.command_name,
      command: payload.command,
    })
    revalidatePath("/workspace/commands")
    return { success: true }
  } catch (error) {
    console.error("Failed to create command:", error)
    return { success: false, error: "Failed to create command" }
  }
}

export async function updateCommand(id: string, payload: { command_name: string, command: string }) {
  await verifySession()

  try {
    await db.update(favoriteCommands)
      .set({
        ...payload,
        updated_at: new Date()
      })
      .where(eq(favoriteCommands.id, id))
    revalidatePath("/workspace/commands")
    return { success: true }
  } catch (error) {
    console.error("Failed to update command:", error)
    return { success: false, error: "Failed to update command" }
  }
}

export async function deleteCommand(id: string) {
  await verifySession()

  try {
    await db.delete(favoriteCommands).where(eq(favoriteCommands.id, id))
    revalidatePath("/workspace/commands")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete command:", error)
    return { success: false, error: "Failed to delete command" }
  }
}
