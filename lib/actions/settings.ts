"use server"

import { db } from "@/lib/db"
import { userSettings, dashboardApps, appPrompts, personalPrompts, passwordEntries, quickCommands } from "@/lib/db/schema"
import { eq, desc, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/session"

// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------

export async function getDashboardStats() {
  await verifySession()
  try {
    const [appPromptsCount] = await db.select({ value: count() }).from(appPrompts)
    const [personalPromptsCount] = await db.select({ value: count() }).from(personalPrompts)
    const [passwordsCount] = await db.select({ value: count() }).from(passwordEntries)
    const [commandsCount] = await db.select({ value: count() }).from(quickCommands)

    return {
      success: true,
      data: {
        appPrompts: appPromptsCount.value,
        personalPrompts: personalPromptsCount.value,
        passwords: passwordsCount.value,
        commands: commandsCount.value
      }
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return { success: false, data: { appPrompts: 0, personalPrompts: 0, passwords: 0, commands: 0 } }
  }
}

export async function getSettings() {
  await verifySession()

  try {
    const data = await db.select().from(userSettings).limit(1)
    if (data.length === 0) {
      // Create default settings if none exist
      const [newSettings] = await db.insert(userSettings).values({
        theme_preference: "system",
        quick_nav_settings: { show_apps: true, show_personal: true, show_passwords: true, show_files: true, show_commands: true },
        dashboard_stats_settings: { show_projects: true, show_words: true, show_time: true }
      }).returning()
      return { success: true, data: newSettings }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return { success: false, error: "Failed to fetch settings" }
  }
}

export async function updateSettings(id: string, payload: any) {
  await verifySession()

  try {
    await db.update(userSettings)
      .set({
        ...payload,
        updated_at: new Date()
      })
      .where(eq(userSettings.id, id))
    
    revalidatePath("/workspace")
    revalidatePath("/workspace/settings")
    return { success: true }
  } catch (error) {
    console.error("Failed to update settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

// ----------------------------------------------------------------------------
// Dashboard Apps
// ----------------------------------------------------------------------------

export async function getDashboardApps() {
  await verifySession()

  try {
    const data = await db.select().from(dashboardApps).orderBy(desc(dashboardApps.sort_order))
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch apps:", error)
    return { success: false, error: "Failed to fetch apps" }
  }
}

export async function createDashboardApp(payload: { application_name: string, application_url: string, icon_url?: string, sort_order: number }) {
  await verifySession()

  try {
    await db.insert(dashboardApps).values({
      application_name: payload.application_name,
      application_url: payload.application_url,
      icon_url: payload.icon_url || null,
      sort_order: payload.sort_order,
    })
    revalidatePath("/workspace")
    revalidatePath("/workspace/settings")
    return { success: true }
  } catch (error) {
    console.error("Failed to create app:", error)
    return { success: false, error: "Failed to create app" }
  }
}

export async function updateDashboardApp(id: string, payload: { application_name?: string, application_url?: string, icon_url?: string, sort_order?: number }) {
  await verifySession()

  try {
    await db.update(dashboardApps)
      .set({
        ...payload,
        updated_at: new Date()
      })
      .where(eq(dashboardApps.id, id))
    revalidatePath("/workspace")
    revalidatePath("/workspace/settings")
    return { success: true }
  } catch (error) {
    console.error("Failed to update app:", error)
    return { success: false, error: "Failed to update app" }
  }
}

export async function deleteDashboardApp(id: string) {
  await verifySession()

  try {
    await db.delete(dashboardApps).where(eq(dashboardApps.id, id))
    revalidatePath("/workspace")
    revalidatePath("/workspace/settings")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete app:", error)
    return { success: false, error: "Failed to delete app" }
  }
}
