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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Favorite Commands</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Fast access to your most used terminal snippets.</p>
        </div>
        <Button onClick={() => openEditor()} className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4 mr-2" />
          Add Command
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search commands by name or exact snippet..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-800 h-11 bg-white/50 dark:bg-slate-900/50"
          />
        </div>
      </div>

      {!isLoading && commands.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <TerminalSquare className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No commands saved</h3>
          <p className="text-zinc-500 mt-2 max-w-sm mx-auto">Store long or frequently used CLI commands for instant access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {commands.map((cmd) => (
            <Card key={cmd.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <TerminalSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1">{cmd.command_name}</h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
                    <DropdownMenuItem onClick={() => openEditor(cmd)} className="cursor-pointer">
                      <Edit2 className="w-4 h-4 mr-2 text-zinc-500" /> Edit Command
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(cmd.id, cmd.command_name)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                      <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative bg-zinc-950 dark:bg-black rounded-xl p-4 mt-auto group/code">
                <div className="overflow-x-auto scrollbar-hide pr-10">
                  <code className="text-sm font-mono text-zinc-300 whitespace-pre">
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
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Command" : "New Command"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={saveCommand} className="space-y-4 py-4 cursor-default">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Command Name</label>
              <Input 
                value={formData.command_name} 
                onChange={(e) => setFormData({...formData, command_name: e.target.value})} 
                placeholder="e.g. Docker Compose Reset"
                className="rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Command Snippet</label>
              <Textarea 
                value={formData.command} 
                onChange={(e) => setFormData({...formData, command: e.target.value})} 
                placeholder="docker-compose down -v && docker-compose up -d --build"
                className="rounded-xl min-h-[120px] font-mono text-sm leading-relaxed whitespace-pre-wrap resize-none"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                Save Command
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
