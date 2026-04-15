"use client"

import { useState, useEffect } from "react"
import { getCommands, createCommand, updateCommand, deleteCommand } from "@/lib/actions/commands"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus, MoreHorizontal, TerminalSquare, Copy, Trash2, Edit2, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export default function CommandsPage() {
  const [commands, setCommands] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    command_name: "",
    command: ""
  })
  
  const [isSaving, setIsSaving] = useState(false)

  const fetchCommands = async (query = "") => {
    setIsLoading(true)
    const res = await getCommands(query)
    if (res.success && res.data) {
      setCommands(res.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchCommands(search), 300)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const openEditor = (command: any = null) => {
    if (command) {
      setEditingId(command.id)
      setFormData({
        command_name: command.command_name,
        command: command.command,
      })
    } else {
      setEditingId(null)
      setFormData({
        command_name: "",
        command: "",
      })
    }
    setIsEditorOpen(true)
  }

  const saveCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.command_name || !formData.command) {
      return toast.error("Please fill required fields")
    }

    setIsSaving(true)
    let res
    if (editingId) {
      res = await updateCommand(editingId, formData)
    } else {
      res = await createCommand(formData)
    }
    setIsSaving(false)

    if (res.success) {
      toast.success(editingId ? "Command updated" : "Command created")
      setIsEditorOpen(false)
      fetchCommands(search)
    } else {
      toast.error(res.error || "Failed to save command")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    const res = await deleteCommand(id)
    if (res.success) {
      toast.success("Command deleted")
      fetchCommands(search)
    } else {
      toast.error(res.error || "Failed to delete command")
    }
  }

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Command copied to clipboard")
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">Favorite Commands</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Fast access to your most used terminal snippets.</p>
        </div>
        <Button onClick={() => openEditor()} className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-black transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Command
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
          <Input 
            placeholder="Search commands by name or exact snippet..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md h-11 focus-visible:ring-1 focus-visible:ring-white/20 transition-all relative z-10"
          />
        </div>
      </div>

      {!isLoading && commands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass-panel rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 mt-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-16 h-16 mb-6 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center glass-ambient-glow">
            <TerminalSquare className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No commands saved</h3>
          <p className="text-zinc-500 mb-6 max-w-sm text-center">Store long or frequently used CLI commands for instant access.</p>
          <Button onClick={() => openEditor()} className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-black">
            Add Command
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commands.map((cmd) => (
            <div key={cmd.id} className="glass-panel rounded-2xl border border-white/20 dark:border-white/10 p-6 group relative bg-white/60 dark:bg-black/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100/80 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm text-zinc-700 dark:text-zinc-300 backdrop-blur-sm group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:group-hover:bg-blue-500/20 transition-colors">
                    <TerminalSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cmd.command_name}</h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-black/5 dark:hover:text-zinc-100 dark:hover:bg-white/10 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-white/20 dark:border-white/10 glass-panel bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl min-w-[160px]">
                    <DropdownMenuItem onClick={() => openEditor(cmd)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                      <Edit2 className="w-4 h-4 mr-2 text-zinc-500" /> Edit Command
                    </DropdownMenuItem>
                    <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2" />
                    <DropdownMenuItem onClick={() => handleDelete(cmd.id, cmd.command_name)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/20">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative z-10 bg-zinc-950/90 dark:bg-black/60 rounded-xl p-4 mt-auto group/code border border-white/10 shadow-inner">
                <div className="overflow-x-auto scrollbar-hide pr-10">
                  <code className="text-[13px] font-mono text-zinc-300 whitespace-pre">
                    {cmd.command}
                  </code>
                </div>
                <Button 
                  size="icon" 
                  onClick={() => handleCopyText(cmd.id, cmd.command)} 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg shadow-sm transition-all duration-200 ${
                    copiedId === cmd.id 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 opacity-100" 
                      : "bg-white/10 text-white hover:bg-white/20 opacity-0 group-hover/code:opacity-100"
                  }`}
                >
                  {copiedId === cmd.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl border border-white/20 dark:border-white/10 glass-panel bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
              {editingId ? "Edit Command" : "New Command"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={saveCommand} className="space-y-5 py-4 cursor-default">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Command Name</label>
              <Input 
                value={formData.command_name} 
                onChange={(e) => setFormData({...formData, command_name: e.target.value})} 
                placeholder="e.g. Docker Compose Reset"
                className="rounded-xl border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-white/20"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Command Snippet</label>
              <Textarea 
                value={formData.command} 
                onChange={(e) => setFormData({...formData, command: e.target.value})} 
                placeholder="docker-compose down -v && docker-compose up -d --build"
                className="rounded-xl min-h-[120px] font-mono text-sm leading-relaxed whitespace-pre-wrap resize-none border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-white/20"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 transition-all">
                Save Command
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
