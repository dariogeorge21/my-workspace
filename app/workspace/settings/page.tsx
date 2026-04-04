"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { getSettings, updateSettings, getDashboardApps, createDashboardApp, updateDashboardApp, deleteDashboardApp } from "@/lib/actions/settings"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Monitor, Moon, Sun, LayoutDashboard, Link as LinkIcon, Trash2, Plus, GripVertical } from "lucide-react"

type QuickNavSettings = {
  show_apps: boolean
  show_personal: boolean
  show_passwords: boolean
  show_files: boolean
  show_commands: boolean
}

type DashboardStatsSettings = {
  show_projects: boolean
  show_words: boolean
  show_time: boolean
}

function isQuickNavSettings(value: unknown): value is QuickNavSettings {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.show_apps === "boolean" &&
    typeof v.show_personal === "boolean" &&
    typeof v.show_passwords === "boolean" &&
    typeof v.show_files === "boolean" &&
    typeof v.show_commands === "boolean"
  )
}

function isDashboardStatsSettings(value: unknown): value is DashboardStatsSettings {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.show_projects === "boolean" &&
    typeof v.show_words === "boolean" &&
    typeof v.show_time === "boolean"
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // DB Settings
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [quickNav, setQuickNav] = useState<QuickNavSettings>({ show_apps: true, show_personal: true, show_passwords: true, show_files: true, show_commands: true })
  const [stats, setStats] = useState<DashboardStatsSettings>({ show_projects: true, show_words: true, show_time: true })
  
  // Apps
  const [apps, setApps] = useState<any[]>([])
  const [newApp, setNewApp] = useState({ name: "", url: "", icon: "" })
  const [isAddingApp, setIsAddingApp] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [settingsRes, appsRes] = await Promise.all([getSettings(), getDashboardApps()])
      
      if (settingsRes.success && settingsRes.data) {
        setSettingsId(settingsRes.data.id)
        if (isQuickNavSettings(settingsRes.data.quick_nav_settings)) {
          setQuickNav(settingsRes.data.quick_nav_settings)
        }
        if (isDashboardStatsSettings(settingsRes.data.dashboard_stats_settings)) {
          setStats(settingsRes.data.dashboard_stats_settings)
        }
      }
      
      if (appsRes.success && appsRes.data) setApps(appsRes.data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    if (settingsId) {
      await updateSettings(settingsId, { theme_preference: newTheme })
    }
  }

  const handleQuickNavToggle = async (key: keyof typeof quickNav, checked: boolean) => {
    const previous = quickNav
    const updated = { ...quickNav, [key]: checked }
    setQuickNav(updated)

    if (!settingsId) return

    const res = await updateSettings(settingsId, { quick_nav_settings: updated })
    if (res.success) {
      toast.success("Preferences updated")
    } else {
      setQuickNav(previous)
      toast.error(res.error || "Failed to update preferences")
    }
  }

  const handleStatsToggle = async (key: keyof typeof stats, checked: boolean) => {
    const previous = stats
    const updated = { ...stats, [key]: checked }
    setStats(updated)

    if (!settingsId) return

    const res = await updateSettings(settingsId, { dashboard_stats_settings: updated })
    if (res.success) {
      toast.success("Preferences updated")
    } else {
      setStats(previous)
      toast.error(res.error || "Failed to update preferences")
    }
  }

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApp.name || !newApp.url) return toast.error("Name and URL are required")
    
    setIsAddingApp(true)
    const res = await createDashboardApp({
      application_name: newApp.name,
      application_url: newApp.url,
      icon_url: newApp.icon,
      sort_order: apps.length
    })
    setIsAddingApp(false)

    if (res.success) {
      toast.success("App added")
      setNewApp({ name: "", url: "", icon: "" })
      fetchData()
    } else {
      toast.error(res.error || "Failed to add app")
    }
  }

  const handleDeleteApp = async (id: string) => {
    const res = await deleteDashboardApp(id)
    if (res.success) {
      toast.success("App removed")
      fetchData()
    } else {
      toast.error(res.error || "Failed to remove app")
    }
  }

  // Not rendering strict DND-kit logic for simplicity, just displaying the list for this phase.
  // Re-ordering can be done using up/down actions if needed.

  if (!mounted) return null

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your workspace appearance and dashboard configurations.</p>
      </div>

      <div className="grid gap-8">
        {/* Appearance */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-zinc-500" /> Appearance
          </h2>
          <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center justify-center p-6 border rounded-xl transition-all ${
                  theme === "light" 
                    ? "border-zinc-900 bg-zinc-50 text-zinc-900 shadow-sm" 
                    : "border-zinc-200 hover:bg-zinc-50/50 text-zinc-500 hover:text-zinc-900 bg-white"
                }`}
              >
                <Sun className="w-8 h-8 mb-3" />
                <span className="font-medium text-sm">Light Mode</span>
              </button>
              
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center justify-center p-6 border rounded-xl transition-all ${
                  theme === "dark" 
                    ? "border-zinc-100 bg-zinc-800 text-zinc-50 shadow-sm dark:bg-slate-800" 
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-slate-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 bg-white dark:bg-slate-900"
                }`}
              >
                <Moon className="w-8 h-8 mb-3" />
                <span className="font-medium text-sm">Dark Mode</span>
              </button>
              
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center justify-center p-6 border rounded-xl transition-all ${
                  theme === "system" 
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-slate-800 text-zinc-900 dark:text-zinc-50 shadow-sm" 
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-slate-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 bg-white dark:bg-slate-900"
                }`}
              >
                <Monitor className="w-8 h-8 mb-3" />
                <span className="font-medium text-sm">System</span>
              </button>
            </div>
          </Card>
        </section>

        {/* Dashboard Configuration */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-zinc-500" /> Dashboard Features
          </h2>
          <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="p-6">
              <h3 className="font-medium mb-4 text-zinc-900 dark:text-zinc-100">Quick Navigation Elements</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Application Prompts</span>
                  <Switch checked={quickNav.show_apps} onCheckedChange={(checked) => handleQuickNavToggle("show_apps", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Personal Prompts</span>
                  <Switch checked={quickNav.show_personal} onCheckedChange={(checked) => handleQuickNavToggle("show_personal", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Passwords</span>
                  <Switch checked={quickNav.show_passwords} onCheckedChange={(checked) => handleQuickNavToggle("show_passwords", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Files</span>
                  <Switch checked={quickNav.show_files} onCheckedChange={(checked) => handleQuickNavToggle("show_files", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Commands</span>
                  <Switch checked={quickNav.show_commands} onCheckedChange={(checked) => handleQuickNavToggle("show_commands", checked)} />
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-medium mb-4 text-zinc-900 dark:text-zinc-100">Statistics Cards</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Projects / Total Prompts</span>
                  <Switch checked={stats.show_projects} onCheckedChange={(checked) => handleStatsToggle("show_projects", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Word Counts</span>
                  <Switch checked={stats.show_words} onCheckedChange={(checked) => handleStatsToggle("show_words", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Writing Time Tracker</span>
                  <Switch checked={stats.show_time} onCheckedChange={(checked) => handleStatsToggle("show_time", checked)} />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* My Apps Management */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-zinc-500" /> My Apps 
          </h2>
          <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6">
            <p className="text-sm text-zinc-500 mb-6">Manage external applications shown on your dashboard for fast access.</p>
            
            <form onSubmit={handleAddApp} className="flex flex-col sm:flex-row items-end sm:items-start gap-4 mb-8">
              <div className="w-full space-y-2">
                <label className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">App Name</label>
                <Input value={newApp.name} onChange={(e) => setNewApp({...newApp, name: e.target.value})} placeholder="e.g. Figma" className="rounded-xl bg-white dark:bg-slate-900" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">URL</label>
                <Input type="url" value={newApp.url} onChange={(e) => setNewApp({...newApp, url: e.target.value})} placeholder="https://figma.com" className="rounded-xl bg-white dark:bg-slate-900" />
              </div>
              <Button type="submit" disabled={isAddingApp} className="rounded-xl w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 transition-transform active:scale-95 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                <Plus className="w-4 h-4 mr-2" /> Add App
              </Button>
            </form>

            <div className="space-y-3">
              {apps.length === 0 ? (
                <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No apps configured yet.</p>
                </div>
              ) : (
                apps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4 truncate">
                      <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-700 cursor-grab active:cursor-grabbing hidden sm:block" />
                      <div className="flex items-center gap-3 truncate">
                        {app.icon_url ? (
                          <img src={app.icon_url} alt="" className="w-6 h-6 rounded object-cover" />
                        ) : (
                          <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-zinc-500">
                            {app.application_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{app.application_name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate hidden sm:block">{app.application_url}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteApp(app.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
