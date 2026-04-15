"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getPrompts, deletePrompt, duplicatePrompt, PromptType } from "@/lib/actions/prompts"
import { Search, Plus, MoreVertical, Copy, Trash2, Clock, List, LayoutGrid, Download } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface PromptGalleryProps {
  type: PromptType;
  title: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function PromptGallery({ type, title }: PromptGalleryProps) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = async (query = "") => {
    setIsLoading(true);
    const data = await getPrompts(type, query);
    setPrompts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPrompts(search);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, type]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    const res = await deletePrompt(type, id);
    if (res.success) {
      toast.success("Prompt deleted");
      setPrompts(prompts.filter(p => p.id !== id));
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicatePrompt(type, id);
    if (res.success) {
      toast.success("Prompt duplicated");
      fetchPrompts(search);
    } else {
      toast.error(res.error || "Failed to duplicate");
    }
  };

  const exportPrompt = (heading: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${heading || "prompt"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported prompt as .txt");
  }

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }

  const basePath = type === 'app' ? 'app-prompts' : 'my-prompts';

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">{title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Manage and organize your reusable prompts.</p>
        </div>
        <Link href={`/workspace/${basePath}/new`}>
          <Button className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-black transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus className="w-4 h-4 mr-2" />
            New Prompt
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
          <Input 
            placeholder="Search prompts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md h-11 focus-visible:ring-1 focus-visible:ring-white/20 transition-all relative z-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 glass-panel p-1 rounded-xl">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode('grid')}
            className={`rounded-lg h-9 w-9 transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode('list')}
            className={`rounded-lg h-9 w-9 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isLoading && prompts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 glass-panel rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 mt-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-16 h-16 mb-6 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center glass-ambient-glow">
            <LayoutGrid className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
          <p className="text-zinc-500 mb-6 max-w-sm text-center">Get started by creating your first prompt to organize your workflows.</p>
          <Link href={`/workspace/${basePath}/new`}>
            <Button className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-black">
              Create Prompt
            </Button>
          </Link>
        </div>
      )}

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        {prompts.map((prompt) => (
          <div 
            key={prompt.id} 
            className={`glass-panel flex flex-col justify-between border-white/20 dark:border-white/10 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] bg-white/60 dark:bg-black/40 group overflow-hidden relative ${viewMode === 'grid' ? 'p-6 min-h-[220px]' : 'flex-row items-center p-4'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className={`relative z-10 flex-1 ${viewMode === 'list' && 'flex items-center justify-between gap-6 w-full'}`}>
              <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/workspace/${basePath}/${prompt.id}`} className="group/link block">
                    <h3 className="font-semibold text-lg hover:text-blue-500 dark:hover:text-blue-400 transition-colors line-clamp-1">{prompt.heading}</h3>
                  </Link>
                  {viewMode === 'grid' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full ml-4 -mt-1 -mr-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 transition-colors shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-white/20 dark:border-white/10 glass-panel bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => copyPrompt(prompt.content)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(prompt.id)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                          <Plus className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportPrompt(prompt.heading, prompt.content)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                          <Download className="w-4 h-4 mr-2" /> Export .txt
                        </DropdownMenuItem>
                        <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2" />
                        <DropdownMenuItem onClick={() => handleDelete(prompt.id)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/20">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {viewMode === 'grid' ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 mb-6 leading-relaxed group-hover:dark:text-zinc-300 transition-colors">
                    {prompt.content}
                  </p>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-1 truncate mt-1">
                    {prompt.content}
                  </p>
                )}
              </div>
              
              <div className={`relative z-10 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide ${viewMode === 'list' && 'ml-4 shrink-0'}`}>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100/80 dark:bg-white/5 rounded-md border border-black/5 dark:border-white/5">
                  <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> {formatTime(prompt.time_taken_seconds)}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100/80 dark:bg-white/5 rounded-md border border-black/5 dark:border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  {prompt.word_count} words
                </div>
                {viewMode === 'list' && (
                  <div className="flex items-center gap-1 text-zinc-400 ml-4 font-normal">
                    <span>{formatDistanceToNow(new Date(prompt.updated_at))} ago</span>
                  </div>
                )}
              </div>
            </div>

            {viewMode === 'list' && (
              <div className="relative z-10 ml-4 shrink-0 block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-white/20 dark:border-white/10 glass-panel bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                    <DropdownMenuItem onClick={() => copyPrompt(prompt.content)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(prompt.id)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                      <Plus className="w-4 h-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportPrompt(prompt.heading, prompt.content)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                      <Download className="w-4 h-4 mr-2" /> Export .txt
                    </DropdownMenuItem>
                    <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2" />
                    <DropdownMenuItem onClick={() => handleDelete(prompt.id)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/20">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

