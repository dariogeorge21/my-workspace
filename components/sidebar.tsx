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
      <nav className="flex-1 space-y-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/workspace' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-slate-950/50 h-screen p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold tracking-tight">Workspace</h2>
          <ThemeToggle />
        </div>
        <NavLinks />
      </div>

      {/* Mobile Header & Sheet */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-slate-950">
        <h2 className="text-lg font-bold tracking-tight">Workspace</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-4 pt-12 flex flex-col bg-zinc-50/95 dark:bg-slate-950/95 backdrop-blur-xl">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
