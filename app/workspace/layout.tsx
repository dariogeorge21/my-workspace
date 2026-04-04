import { Sidebar } from "@/components/sidebar"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white dark:bg-slate-950 text-zinc-900 dark:text-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
