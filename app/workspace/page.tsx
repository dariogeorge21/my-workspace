"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Bookmark, Lock, FolderOpen, Terminal, Settings } from "lucide-react"
import Link from "next/link"
import { getSettings, getDashboardApps, getDashboardStats } from "@/lib/actions/settings"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [settings, setSettings] = useState<any>(null)
  const [apps, setApps] = useState<any[]>([])
  const [statsData, setStatsData] = useState({ appPrompts: 0, personalPrompts: 0, passwords: 0, commands: 0 })
  
  useEffect(() => {
    const fetchData = async () => {
      toast.loading("✨ Initializing your workspace...", { 
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
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12 animate-in fade-in duration-700">
        <header className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-lg bg-primary/10 ring-1 ring-primary/20 animate-pulse" />
          <Skeleton className="h-5 w-96 rounded-md bg-muted animate-pulse delay-100" />
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 glass-panel flex items-center justify-between overflow-hidden relative min-h-[120px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] animate-[glow-pulse_2s_infinite]" />
              <div className="space-y-3 relative">
                <Skeleton className="h-3 w-20 rounded-md bg-primary/20" />
                <Skeleton className="h-10 w-16 rounded-lg bg-primary/10" />
              </div>
              <Skeleton className="w-14 h-14 rounded-2xl bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]" />
            </Card>
          ))}
        </section>

        <section>
          <div className="mb-6">
            <Skeleton className="h-8 w-40 rounded-lg bg-primary/10 border border-primary/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-6 h-48 glass-panel flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full" />
                 <Skeleton className="w-10 h-10 rounded-xl mb-6 bg-primary/20" />
                 <Skeleton className="h-6 w-32 rounded-md mb-3 bg-primary/15" />
                 <Skeleton className="h-4 w-48 rounded-md bg-primary/10" />
              </Card>
            ))}
          </div>
        </section>
      </div>
    )
  }

  const quickNav = settings.quick_nav_settings
  const stats = settings.dashboard_stats_settings

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-16 animate-in fade-in duration-700 pb-20">
      
      <header className="relative mt-4">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary/80">
          Command Center
        </h1>
        <p className="text-lg text-muted-foreground/80 font-medium max-w-2xl bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          High-level overview of your digital workspace assets.
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <div className="absolute -inset-10 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        {stats?.show_projects && (
          <Card className="p-6 glass-panel glass-panel-hover group overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <p className="text-xs font-bold text-muted-foreground mb-2 tracking-[0.2em] uppercase">App Prompts</p>
                 <p className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{statsData.appPrompts}</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                 <FileText className="w-6 h-6" />
               </div>
             </div>
          </Card>
        )}
        
        {stats?.show_projects && (
          <Card className="p-6 glass-panel glass-panel-hover group overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <p className="text-xs font-bold text-muted-foreground mb-2 tracking-[0.2em] uppercase">My Prompts</p>
                 <p className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{statsData.personalPrompts}</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center text-secondary-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                 <Bookmark className="w-6 h-6" />
               </div>
             </div>
          </Card>
        )}
        
        {stats?.show_words && (
           <Card className="p-6 glass-panel glass-panel-hover group overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <p className="text-xs font-bold text-muted-foreground mb-2 tracking-[0.2em] uppercase">Passwords</p>
                 <p className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{statsData.passwords}</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-500">
                 <Lock className="w-6 h-6" />
               </div>
             </div>
           </Card>
        )}

        {stats?.show_time && (
           <Card className="p-6 glass-panel glass-panel-hover group overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <p className="text-xs font-bold text-muted-foreground mb-2 tracking-[0.2em] uppercase">Commands</p>
                 <p className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{statsData.commands}</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                 <Terminal className="w-6 h-6" />
               </div>
             </div>
           </Card>
        )}
      </section>

      {/* Quick Navigation */}
      <section className="relative">
        <h2 className="text-2xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickNav?.show_apps && (
            <Link href="/workspace/app-prompts" className="block focus:outline-none focus:ring-2 ring-primary rounded-[2rem]">
              <Card className="p-8 h-full glass-panel glass-panel-hover glass-ambient-glow flex flex-col group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl shadow-black/10 border border-white/10 group-hover:border-primary/50">
                  <FileText className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Application Prompts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Manage specific app prompts and structural generation logic securely.</p>
              </Card>
            </Link>
          )}

          {quickNav?.show_passwords && (
            <Link href="/workspace/passwords" className="block focus:outline-none focus:ring-2 ring-primary rounded-[2rem]">
              <Card className="p-8 h-full glass-panel glass-panel-hover glass-ambient-glow flex flex-col group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-500 shadow-xl shadow-black/10 border border-white/10 group-hover:border-destructive/50">
                  <Lock className="w-6 h-6 text-destructive group-hover:text-destructive-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-destructive transition-colors">Personal Passwords</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Access your encrypted, high-security credential vault.</p>
              </Card>
            </Link>
          )}

          {quickNav?.show_commands && (
             <Link href="/workspace/commands" className="block focus:outline-none focus:ring-2 ring-primary rounded-[2rem]">
             <Card className="p-8 h-full glass-panel glass-panel-hover glass-ambient-glow flex flex-col group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 shadow-xl shadow-black/10 border border-white/10 group-hover:border-accent/50">
                  <Terminal className="w-6 h-6 text-accent-foreground" />
                </div>
               <h3 className="text-lg font-bold mb-2 group-hover:text-accent-foreground transition-colors">Favorite Commands</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">Repository of quick terminal commands and shell snippets.</p>
             </Card>
           </Link>
          )}

          {quickNav?.show_files && (
             <Link href="/workspace/files" className="block focus:outline-none focus:ring-2 ring-primary rounded-[2rem]">
             <Card className="p-8 h-full glass-panel glass-panel-hover glass-ambient-glow flex flex-col group">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-500 shadow-xl shadow-black/10 border border-white/10 group-hover:border-secondary/50">
                  <FolderOpen className="w-6 h-6 text-secondary-foreground group-hover:text-secondary-foreground" />
               </div>
               <h3 className="text-lg font-bold mb-2 group-hover:text-secondary-foreground transition-colors">Personal Files</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">Your encrypted file drop and long-term secure storage.</p>
             </Card>
           </Link>
          )}

          <Link href="/workspace/settings" className="block focus:outline-none focus:ring-2 ring-primary rounded-[2rem]">
            <Card className="p-8 h-full glass-panel glass-panel-hover glass-ambient-glow flex flex-col group border-dashed hover:border-solid hover:border-primary/50">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-background transition-all duration-500 shadow-xl shadow-black/10 border border-white/10">
                  <Settings className="w-6 h-6 text-muted-foreground group-hover:rotate-180 transition-transform duration-1000" />
               </div>
               <h3 className="text-lg font-bold mb-2">Settings Matrix</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">Configure UI states, feature flags, and module visibility.</p>
            </Card>
          </Link>
        </div>
      </section>

      {/* My Apps Panel */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">My Ecosystem</h2>
        </div>
        <Card className="p-8 glass-panel relative overflow-hidden">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex flex-wrap gap-6 relative z-10">
            {apps.map((app) => (
              <a 
                key={app.id} 
                href={app.application_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex flex-col items-center gap-3 p-4 min-w-[100px] hover:bg-white/5 rounded-[2rem] cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                {app.icon_url ? (
                   <div className="relative">
                     <img src={app.icon_url} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-xl border border-white/10 bg-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2 relative z-10" />
                     <div className="absolute inset-0 bg-primary/20 blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   </div>
                ) : (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-foreground flex items-center justify-center font-black text-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 group-hover:border-primary/50 group-hover:text-primary relative z-10 backdrop-blur-md">
                      {app.application_name.charAt(0)}
                    </div>
                    <div className="absolute inset-0 bg-primary/20 blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                )}
                <span className="text-xs font-semibold text-muted-foreground max-w-[90px] truncate text-center group-hover:text-foreground transition-colors">{app.application_name}</span>
              </a>
            ))}

            {apps.length === 0 && (
              <div className="px-6 py-12 text-center w-full border border-dashed rounded-[2rem] border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                   <FolderOpen className="w-6 h-6 text-muted-foreground/50" />
                 </div>
                 <p className="text-sm font-medium text-muted-foreground">No applications integrated yet.</p>
              </div>
            )}

            <Link 
              href="/workspace/settings" 
              className="group flex flex-col items-center gap-3 p-4 min-w-[100px] rounded-[2rem] cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl border border-dashed border-white/20 text-muted-foreground flex items-center justify-center transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                <span className="text-2xl font-light mb-1">+</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground/50 group-hover:text-primary transition-colors">Edit Ecosystem</span>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
