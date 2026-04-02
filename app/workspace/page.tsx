"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { FileText, Bookmark, Lock, FolderOpen, Terminal, Settings } from "lucide-react"
import Link from "next/link"
import { getSettings, getDashboardApps } from "@/lib/actions/settings"

export default function DashboardPage() {
  const [settings, setSettings] = useState<any>(null)
  const [apps, setApps] = useState<any[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      const [settingsRes, appsRes] = await Promise.all([getSettings(), getDashboardApps()])
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data)
      } else {
        setSettings({
          quick_nav_settings: { show_apps: true, show_personal: true, show_passwords: true, show_files: true, show_commands: true },
          dashboard_stats_settings: { show_projects: true, show_words: true, show_time: true }
        })
      }
      if (appsRes.success && appsRes.data) {
        setApps(appsRes.data)
      }
    }
    fetchData()
  }, [])

  if (!settings) return null // Or loading spinner

  const quickNav = settings.quick_nav_settings
  const stats = settings.dashboard_stats_settings

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Overview of your workspace assets and quick actions.</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.show_projects && (
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-wide uppercase text-[10px]">App Prompts</p>
                <p className="text-3xl font-bold tracking-tight">12</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"><FileText className="w-6 h-6 text-zinc-700 dark:text-zinc-300" /></div>
            </div>
          </Card>
        )}
        
        {stats?.show_projects && (
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-wide uppercase text-[10px]">My Prompts</p>
                <p className="text-3xl font-bold tracking-tight">5</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"><Bookmark className="w-6 h-6 text-zinc-700 dark:text-zinc-300" /></div>
            </div>
          </Card>
        )}
        
        {stats?.show_words && (
           <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-wide uppercase text-[10px]">Passwords</p>
                <p className="text-3xl font-bold tracking-tight">18</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"><Lock className="w-6 h-6 text-zinc-700 dark:text-zinc-300" /></div>
            </div>
          </Card>
        )}

        {stats?.show_time && (
           <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-wide uppercase text-[10px]">Commands</p>
                <p className="text-3xl font-bold tracking-tight">34</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"><Terminal className="w-6 h-6 text-zinc-700 dark:text-zinc-300" /></div>
            </div>
          </Card>
        )}
      </section>

      {/* Quick Navigation */}
      <section>
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickNav?.show_apps && (
            <Link href="/workspace/app-prompts">
              <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors duration-200 group h-full flex flex-col">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-xl mb-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform"><FileText className="w-5 h-5" /></div>
                <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-50">Application Prompts</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage specific app prompts</p>
              </Card>
            </Link>
          )}

          {quickNav?.show_passwords && (
            <Link href="/workspace/passwords">
              <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors duration-200 group h-full flex flex-col">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-xl mb-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform"><Lock className="w-5 h-5" /></div>
                <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-50">Personal Passwords</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Secure encrypted vault</p>
              </Card>
            </Link>
          )}

          {quickNav?.show_commands && (
             <Link href="/workspace/commands">
             <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors duration-200 group h-full flex flex-col">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-xl mb-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform"><Terminal className="w-5 h-5" /></div>
               <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-50">Favorite Commands</h3>
               <p className="text-sm text-zinc-500 dark:text-zinc-400">Quick copy terminal snippets</p>
             </Card>
           </Link>
          )}

          {quickNav?.show_files && (
             <Link href="/workspace/files">
             <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors duration-200 group h-full flex flex-col">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-xl mb-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform"><FolderOpen className="w-5 h-5" /></div>
               <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-50">Personal Files</h3>
               <p className="text-sm text-zinc-500 dark:text-zinc-400">Stored securely</p>
             </Card>
           </Link>
          )}

          <Link href="/workspace/settings">
            <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors duration-200 group h-full flex flex-col">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800/50 w-fit rounded-xl mb-4 text-zinc-500 group-hover:scale-105 transition-transform"><Settings className="w-5 h-5" /></div>
              <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-50">Settings</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure your workspace</p>
            </Card>
          </Link>
        </div>
      </section>

      {/* My Apps Panel */}
      <section>
        <h2 className="text-xl font-bold tracking-tight mb-4">My Apps</h2>
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-wrap gap-4">
            
            {apps.map(app => (
              <a key={app.id} href={app.application_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
                {app.icon_url ? (
                   <img src={app.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm">
                    {app.application_name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 max-w-[80px] truncate text-center">{app.application_name}</span>
              </a>
            ))}

            {apps.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 w-full border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
                No apps saved yet.
              </div>
            )}

            <Link href="/workspace/settings" className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-xl text-zinc-400 flex items-center justify-center">
                +
              </div>
              <span className="text-xs font-medium text-zinc-500">Edit Apps</span>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
