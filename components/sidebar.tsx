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
  Menu,
  Command
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { logout } from "@/lib/actions/auth"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

const navItems = [
  { name: "Dashboard", href: "/workspace", icon: LayoutDashboard },
  { name: "Application Prompts", href: "/workspace/app-prompts", icon: FileText },
  { name: "My Prompts", href: "/workspace/my-prompts", icon: Bookmark },
  { name: "My Passwords", href: "/workspace/passwords", icon: Lock },
  { name: "Personal Files", href: "/workspace/files", icon: FolderOpen },
  { name: "Commands", href: "/workspace/commands", icon: Terminal },
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
                "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-500 relative overflow-hidden",
                isActive
                  ? "text-primary-foreground shadow-[inset_0_1px_rgba(255,255,255,0.2)] bg-primary/90 shadow-xl shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[glow-pulse_3s_infinite]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}

        <div className="pt-6 mt-6 border-t border-border/50">
          <h4 className="px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">System</h4>
          <Link
            href="/workspace/settings"
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
              pathname.startsWith('/workspace/settings')
                 ? "text-primary-foreground shadow-[inset_0_1px_rgba(255,255,255,0.2)] bg-primary/90 shadow-xl shadow-primary/20"
                 : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
             <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
             Settings
          </Link>
        </div>
      </nav>
      <div className="pt-4 border-t border-border/50 pb-2">
        <form action={logout}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Log out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      <div className="hidden md:flex flex-col w-[280px] p-4 h-screen z-50">
        <div className="glass-panel h-full rounded-[2rem] flex flex-col p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-glass-gradient pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 px-2 pt-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Command className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Workspace</h2>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="flex-1 overflow-y-auto mt-2 no-scrollbar relative z-10">
             <NavLinks />
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
             <Command className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Workspace</h2>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[320px] p-4 pt-12 flex flex-col glass-panel border-l border-border/50">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
