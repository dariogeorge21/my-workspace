"use client"

import { useState, useEffect } from "react"
import { getFiles, createFile, updateFile, deleteFile } from "@/lib/actions/files"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus, MoreHorizontal, FileText, Link as LinkIcon, Trash2, Edit2, ExternalLink, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Textarea } from "@/components/ui/textarea"

type FileCategory = "Notes" | "Code" | "Resources" | "Other"

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<{
    file_name: string,
    category: string,
    storage_mode: "TEXT" | "URL",
    file_content: string
  }>({
    file_name: "",
    category: "Notes",
    storage_mode: "TEXT",
    file_content: ""
  })
  
  const [isSaving, setIsSaving] = useState(false)

  const fetchFiles = async (query = "") => {
    setIsLoading(true)
    const res = await getFiles(query)
    if (res.success && res.data) {
      setFiles(res.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchFiles(search), 300)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const openEditor = (file: any = null) => {
    if (file) {
      setEditingId(file.id)
      setFormData({
        file_name: file.file_name,
        category: file.category,
        storage_mode: file.storage_mode as "TEXT" | "URL",
        file_content: file.file_content
      })
    } else {
      setEditingId(null)
      setFormData({
        file_name: "",
        category: "Notes",
        storage_mode: "TEXT",
        file_content: ""
      })
    }
    setIsEditorOpen(true)
  }

  const saveFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file_name || !formData.file_content) {
      return toast.error("Please fill required fields")
    }

    setIsSaving(true)
    let res
    if (editingId) {
      res = await updateFile(editingId, formData)
    } else {
      res = await createFile(formData)
    }
    setIsSaving(false)

    if (res.success) {
      toast.success(editingId ? "File updated" : "File created")
      setIsEditorOpen(false)
      fetchFiles(search)
    } else {
      toast.error(res.error || "Failed to save file")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    const res = await deleteFile(id)
    if (res.success) {
      toast.success("File deleted")
      fetchFiles(search)
    } else {
      toast.error(res.error || "Failed to delete file")
    }
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied content to clipboard")
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Files & Resources</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Store quick text notes, scripts, or external links.</p>
        </div>
        <Button onClick={() => openEditor()} className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4 mr-2" />
          Add File
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search files by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-800 h-11 bg-white/50 dark:bg-slate-900/50"
          />
        </div>
      </div>

      {!isLoading && files.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <FileText className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No files found</h3>
          <p className="text-zinc-500 mt-2 max-w-sm mx-auto">Create a new text note or save a URL linking to cloud storage or resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {files.map((file) => (
            <Card key={file.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file.storage_mode === "URL" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                    {file.storage_mode === "URL" ? <LinkIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[150px] sm:max-w-[200px]">{file.file_name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{file.category}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
                    {file.storage_mode === "URL" ? (
                      <DropdownMenuItem onClick={() => window.open(file.file_content, "_blank")} className="cursor-pointer">
                        <ExternalLink className="w-4 h-4 mr-2 text-zinc-500" /> Open Link
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleCopyText(file.file_content)} className="cursor-pointer">
                        <Copy className="w-4 h-4 mr-2 text-zinc-500" /> Copy Text
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => openEditor(file)} className="cursor-pointer">
                      <Edit2 className="w-4 h-4 mr-2 text-zinc-500" /> Edit File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(file.id, file.file_name)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                      <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 min-h-[60px] font-mono bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                {file.storage_mode === "TEXT" ? (
                  file.file_content
                ) : (
                  <span className="truncate block mt-2 text-indigo-500">{file.file_content}</span>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                <span>{file.storage_mode === "URL" ? "External Link" : "Copied Text"}</span>
                <span>{formatDistanceToNow(new Date(file.updated_at))} ago</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Editor/Creation Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingId ? "Edit File" : "New File"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={saveFile} className="flex-1 flex flex-col space-y-4 py-4 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">File Name</label>
              <Input 
                value={formData.file_name} 
                onChange={(e) => setFormData({...formData, file_name: e.target.value})} 
                placeholder="Database Schema, Figma Source..."
                className="rounded-xl"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, storage_mode: "TEXT"})}
                    className={`flex-1 text-sm py-1.5 rounded-lg transition-all ${formData.storage_mode === "TEXT" ? "bg-white dark:bg-slate-800 shadow-sm font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                  >
                    Text Note
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, storage_mode: "URL"})}
                    className={`flex-1 text-sm py-1.5 rounded-lg transition-all ${formData.storage_mode === "URL" ? "bg-white dark:bg-slate-800 shadow-sm font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                  >
                    URL Link
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                <Input 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  placeholder="Notes, Resources..."
                  className="rounded-xl"
                  list="categories"
                />
                <datalist id="categories">
                  <option value="Notes" />
                  <option value="Resources" />
                  <option value="Code" />
                  <option value="Scripts" />
                  <option value="Links" />
                  <option value="Cloud" />
                </datalist>
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {formData.storage_mode === "TEXT" ? "File Content / Text Notes" : "External URL"}
              </label>
              {formData.storage_mode === "TEXT" ? (
                <Textarea 
                  value={formData.file_content} 
                  onChange={(e) => setFormData({...formData, file_content: e.target.value})} 
                  placeholder="Type your notes here..."
                  className="rounded-xl flex-1 min-h-[200px] resize-none font-mono text-sm leading-relaxed"
                />
              ) : (
                <Input 
                  type="url"
                  value={formData.file_content} 
                  onChange={(e) => setFormData({...formData, file_content: e.target.value})} 
                  placeholder="https://..."
                  className="rounded-xl font-mono text-sm"
                />
              )}
            </div>

            <DialogFooter className="pt-2 flex-shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                Save File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
