"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Bookmark,
  Lock,
  FolderOpen,
  Terminal,
  Settings,
  LogOut,
  Menu
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { logout } from "@/lib/actions/auth"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useState } from "react"

const navItems = [
  { name: "Dashboard", href: "/workspace", icon: LayoutDashboard },
  { name: "Application Prompts", href: "/workspace/app-prompts", icon: FileText },
  { name: "My Prompts", href: "/workspace/my-prompts", icon: Bookmark },
  { name: "My Passwords", href: "/workspace/passwords", icon: Lock },
  { name: "Personal Files", href: "/workspace/files", icon: FolderOpen },
  { name: "Commands", href: "/workspace/commands", icon: Terminal },
  { name: "Settings", href: "/workspace/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  const NavLinks = () => (
    <>
      <nav className="flex-1 space-y-1.5 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/workspace' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "text-primary dark:text-[#a5b9f5] font-semibold"
                  : "text-zinc-600 dark:text-[#8b92a5] font-medium hover:text-zinc-900 dark:hover:text-[#eceef2]"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 dark:bg-[#8b9fd6]/10 border border-primary/20 dark:border-[#8b9fd6]/20 rounded-xl" />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-transparent group-hover:bg-zinc-100 dark:group-hover:bg-[#1e2230]/50 rounded-xl transition-colors duration-300" />
              )}
              
              <item.icon className={cn("w-5 h-5 relative z-10 transition-transform duration-300", isActive && "scale-110")} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="pt-6 border-t border-zinc-200 dark:border-[#222635] pb-2">
        <form action={logout}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-[#8b92a5] hover:text-red-600 dark:hover:text-[#e87c7c] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-transparent group-hover:bg-red-50 dark:group-hover:bg-[#e87c7c]/10 rounded-xl transition-colors duration-300" />
            <LogOut className="w-5 h-5 relative z-10 group-hover:-translate-x-0.5 transition-transform duration-300" />
            <span className="relative z-10">Log out</span>
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar with Light Glassmorphism */}
      <div className="hidden md:flex flex-col w-[280px] h-screen p-5 bg-white/70 dark:bg-[#090b11]/60 backdrop-blur-xl border-r border-zinc-200 dark:border-[#222635] shadow-[1px_0_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-none z-10">
        <div className="flex items-center justify-between mb-2 px-3">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-[#eceef2]">Workspace</h2>
          <ThemeToggle />
        </div>
        <NavLinks />
      </div>

      {/* Mobile Header & Sheet */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-[#222635] bg-white/70 dark:bg-[#090b11]/80 backdrop-blur-xl z-20 sticky top-0">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-[#eceef2]">Workspace</h2>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1e2230]">
                <Menu className="h-[22px] w-[22px] text-zinc-700 dark:text-[#eceef2]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6 pt-16 flex flex-col bg-white/95 dark:bg-[#12151e]/95 backdrop-blur-2xl border-l dark:border-[#222635]">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
