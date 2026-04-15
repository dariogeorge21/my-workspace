"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Bookmark, Lock, FolderOpen, Terminal, Settings, ArrowUpRight, Plus } from "lucide-react"
import Link from "next/link"
import { getSettings, getDashboardApps, getDashboardStats } from "@/lib/actions/settings"
import { toast } from "sonner"

export default function DashboardPage() {
  const [settings, setSettings] = useState<any>(null)
  const [apps, setApps] = useState<any[]>([])
  const [statsData, setStatsData] = useState({ appPrompts: 0, personalPrompts: 0, passwords: 0, commands: 0 })
  
  useEffect(() => {
    const fetchData = async () => {
      toast.loading("Loading workspace...", { 
        id: "dashboard-load",
      })

      const [settingsRes, appsRes, statsRes] = await Promise.all([getSettings(), getDashboardApps(), getDashboardStats()])
      toast.dismiss("dashboard-load")
      
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
      if (statsRes.success && statsRes.data) {
        setStatsData(statsRes.data)
      }
    }
    fetchData()
  }, [])

  if (!settings) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700">
        <header className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-md bg-zinc-200 dark:bg-[#1e2230]" />
          <Skeleton className="h-5 w-96 rounded-md bg-zinc-200/50 dark:bg-[#1e2230]/50" />
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200 dark:border-[#222635] flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-20 rounded-md bg-zinc-200 dark:bg-[#1e2230]" />
                <Skeleton className="h-8 w-12 rounded-md bg-zinc-200 dark:bg-[#1e2230]" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl bg-zinc-200/50 dark:bg-[#1e2230]/50" />
            </div>
          ))}
        </section>
      </div>
    )
  }

  const quickNav = settings.quick_nav_settings
  const stats = settings.dashboard_stats_settings

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-[#f1f3f5]">Dashboard</h1>
        <p className="text-lg text-zinc-500 dark:text-[#8b92a5] max-w-2xl leading-relaxed">Overview of your workspace assets and quick actions.</p>
      </header>

      {/* Stats - Physical Architectural Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats?.show_projects && (
            <Card className="p-6 border-zinc-200 dark:border-[#222635] rounded-2xl bg-white dark:bg-[#12151e] group relative overflow-hidden flex flex-col justify-between h-[140px] shadow-sm premium-shadow transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between w-full">
                <span className="p-2.5 bg-zinc-100 dark:bg-[#1e2230] rounded-lg">
                  <FileText className="w-5 h-5 text-zinc-700 dark:text-[#d1d6e6]" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-[#f1f3f5]">{statsData.appPrompts}</p>
                <p className="text-xs font-semibold text-zinc-500 dark:text-[#8b92a5] mt-1 tracking-widest uppercase">App Prompts</p>
              </div>
            </Card>
          )}
          
          {stats?.show_projects && (
            <Card className="p-6 border-zinc-200 dark:border-[#222635] rounded-2xl bg-white dark:bg-[#12151e] group relative overflow-hidden flex flex-col justify-between h-[140px] shadow-sm premium-shadow transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between w-full">
                <span className="p-2.5 bg-zinc-100 dark:bg-[#1e2230] rounded-lg">
                  <Bookmark className="w-5 h-5 text-zinc-700 dark:text-[#d1d6e6]" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-[#f1f3f5]">{statsData.personalPrompts}</p>
                <p className="text-xs font-semibold text-zinc-500 dark:text-[#8b92a5] mt-1 tracking-widest uppercase">My Prompts</p>
              </div>
            </Card>
          )}
          
          {stats?.show_words && (
             <Card className="p-6 border-zinc-200 dark:border-[#222635] rounded-2xl bg-white dark:bg-[#12151e] group relative overflow-hidden flex flex-col justify-between h-[140px] shadow-sm premium-shadow transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between w-full">
                <span className="p-2.5 bg-zinc-100 dark:bg-[#1e2230] rounded-lg">
                  <Lock className="w-5 h-5 text-zinc-700 dark:text-[#d1d6e6]" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-[#f1f3f5]">{statsData.passwords}</p>
                <p className="text-xs font-semibold text-zinc-500 dark:text-[#8b92a5] mt-1 tracking-widest uppercase">Passwords</p>
              </div>
            </Card>
          )}

          {stats?.show_time && (
             <Card className="p-6 border-zinc-200 dark:border-[#222635] rounded-2xl bg-white dark:bg-[#12151e] group relative overflow-hidden flex flex-col justify-between h-[140px] shadow-sm premium-shadow transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between w-full">
                 <span className="p-2.5 bg-zinc-100 dark:bg-[#1e2230] rounded-lg">
                  <Terminal className="w-5 h-5 text-zinc-700 dark:text-[#d1d6e6]" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-[#f1f3f5]">{statsData.commands}</p>
                <p className="text-xs font-semibold text-zinc-500 dark:text-[#8b92a5] mt-1 tracking-widest uppercase">Commands</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Navigation - List format for variety instead of identical cards */}
      <section className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-[#eceef2]">Quick Navigation</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-4">
          {quickNav?.show_apps && (
            <Link href="/workspace/app-prompts" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#12151e] border border-transparent hover:border-zinc-200 dark:hover:border-[#222635] transition-all">
              <div className="mt-1 p-2 bg-zinc-100 dark:bg-[#1e2230] text-zinc-700 dark:text-[#8b9fd6] rounded-md group-hover:bg-primary group-hover:text-white transition-colors"><FileText className="w-4 h-4" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-[#f1f3f5] flex items-center gap-2">Application Prompts <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-zinc-400" /></h3>
                <p className="text-sm text-zinc-500 dark:text-[#8b92a5] mt-1">Manage specific app prompts</p>
              </div>
            </Link>
          )}

          {quickNav?.show_passwords && (
             <Link href="/workspace/passwords" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#12151e] border border-transparent hover:border-zinc-200 dark:hover:border-[#222635] transition-all">
             <div className="mt-1 p-2 bg-zinc-100 dark:bg-[#1e2230] text-zinc-700 dark:text-[#8b9fd6] rounded-md group-hover:bg-primary group-hover:text-white transition-colors"><Lock className="w-4 h-4" /></div>
             <div className="flex-1">
               <h3 className="font-semibold text-zinc-900 dark:text-[#f1f3f5] flex items-center gap-2">Personal Passwords <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-zinc-400" /></h3>
               <p className="text-sm text-zinc-500 dark:text-[#8b92a5] mt-1">Secure encrypted vault</p>
             </div>
           </Link>
          )}

          {quickNav?.show_commands && (
              <Link href="/workspace/commands" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#12151e] border border-transparent hover:border-zinc-200 dark:hover:border-[#222635] transition-all">
              <div className="mt-1 p-2 bg-zinc-100 dark:bg-[#1e2230] text-zinc-700 dark:text-[#8b9fd6] rounded-md group-hover:bg-primary group-hover:text-white transition-colors"><Terminal className="w-4 h-4" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-[#f1f3f5] flex items-center gap-2">Favorite Commands <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-zinc-400" /></h3>
                <p className="text-sm text-zinc-500 dark:text-[#8b92a5] mt-1">Quick copy terminal snippets</p>
              </div>
            </Link>
          )}

          {quickNav?.show_files && (
              <Link href="/workspace/files" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#12151e] border border-transparent hover:border-zinc-200 dark:hover:border-[#222635] transition-all">
              <div className="mt-1 p-2 bg-zinc-100 dark:bg-[#1e2230] text-zinc-700 dark:text-[#8b9fd6] rounded-md group-hover:bg-primary group-hover:text-white transition-colors"><FolderOpen className="w-4 h-4" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-[#f1f3f5] flex items-center gap-2">Personal Files <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-zinc-400" /></h3>
                <p className="text-sm text-zinc-500 dark:text-[#8b92a5] mt-1">Stored securely</p>
              </div>
            </Link>
          )}

          <Link href="/workspace/settings" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#12151e] border border-transparent hover:border-zinc-200 dark:hover:border-[#222635] transition-all">
            <div className="mt-1 p-2 bg-zinc-100 dark:bg-[#1e2230] text-zinc-700 dark:text-zinc-500 rounded-md group-hover:bg-zinc-800 group-hover:text-white transition-colors"><Settings className="w-4 h-4" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-[#f1f3f5] flex items-center gap-2">Settings <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-zinc-400" /></h3>
              <p className="text-sm text-zinc-500 dark:text-[#8b92a5] mt-1">Configure your workspace</p>
            </div>
          </Link>
        </div>
      </section>

      {/* My Apps Panel - Elegant App Dock Style */}
      <section className="space-y-6 pt-4">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-[#eceef2]">My Apps</h2>
        </header>

        <div className="p-8 rounded-2xl bg-zinc-50/50 dark:bg-[#12151e]/50 border border-zinc-200 dark:border-[#222635] shadow-inner relative">
          <div className="flex flex-wrap gap-6 items-center">
            
            {apps.map(app => (
              <a key={app.id} href={app.application_url} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 w-20 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl p-1 bg-white dark:bg-[#1a1e2b] shadow-sm border border-zinc-200 dark:border-[#222635] group-hover:-translate-y-1 group-hover:shadow-md dark:group-hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center overflow-hidden">
                  {app.icon_url ? (
                     <img src={app.icon_url} alt="" className="w-full h-full rounded-xl object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-zinc-100 dark:bg-[#090b11] text-zinc-900 dark:text-white flex items-center justify-center font-bold text-xl">
                      {app.application_name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-[13px] font-medium text-zinc-600 dark:text-[#8b92a5] truncate w-full text-center group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{app.application_name}</span>
              </a>
            ))}

            {apps.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 w-full rounded-xl">
                No apps saved yet.
              </div>
            )}

            <Link href="/workspace/settings" className="group flex flex-col items-center gap-3 w-20 cursor-pointer">
              <div className="w-16 h-16 rounded-2xl border border-dashed border-zinc-300 dark:border-[#4e597c] flex items-center justify-center bg-transparent group-hover:bg-zinc-100 dark:group-hover:bg-[#1a1e2b] transition-all">
                <Plus className="w-6 h-6 text-zinc-400 dark:text-[#4e597c] group-hover:text-zinc-600 dark:group-hover:text-[#8b9fd6] transition-colors" />
              </div>
              <span className="text-[13px] font-medium text-zinc-500 dark:text-[#4e597c] truncate w-full text-center group-hover:text-zinc-700 dark:group-hover:text-[#8b9fd6] transition-colors">Add App</span>
            </Link>

          </div>
        </div>
      </section>
    </div>
  )
}
