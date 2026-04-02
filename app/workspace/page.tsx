"use client"

import { Card } from "@/components/ui/card"
import { FileText, Bookmark, Lock, FolderOpen, Terminal, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Overview of your workspace assets and quick actions.</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ 
          { title: 'App Prompts', value: '12', icon: FileText, delay: 0 },
          { title: 'My Prompts', value: '5', icon: Bookmark, delay: 75 },
          { title: 'Passwords', value: '18', icon: Lock, delay: 150 },
          { title: 'Commands', value: '34', icon: Terminal, delay: 225 },
        ].map((stat) => (
          <Card 
            key={stat.title} 
            className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-wide uppercase text-[10px]">{stat.title}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                <stat.icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Quick Navigation */}
      <section>
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Application Prompts", desc: "Manage specific app prompts", href: "/workspace/app-prompts", icon: FileText },
            { title: "Personal Passwords", desc: "Secure encrypted vault", href: "/workspace/passwords", icon: Lock },
            { title: "Favorite Commands", desc: "Quick copy terminal snippets", href: "/workspace/commands", icon: Terminal },
            { title: "Personal Files", desc: "Stored securely", href: "/workspace/files", icon: FolderOpen },
            { title: "Settings", desc: "Configure your workspace", href: "/workspace/settings", icon: Settings },
          ].map((nav) => (
            <Link key={nav.title} href={nav.href}>
              <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors duration-200 group h-full flex flex-col">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-xl mb-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <nav.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-50">{nav.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{nav.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* My Apps Panel */}
      <section>
        <h2 className="text-xl font-bold tracking-tight mb-4">My Apps</h2>
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm">
                N
              </div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Notion</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#5E6AD2] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                L
              </div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Linear</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FF4F00] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#FF4F00]/20">
                R
              </div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Raycast</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 min-w-[80px] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-xl text-zinc-400 flex items-center justify-center">
                +
              </div>
              <span className="text-xs font-medium text-zinc-500">Edit Apps</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
