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
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and organize your reusable prompts.</p>
        </div>
        <Link href={`/workspace/${basePath}/new`}>
          <Button className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" />
            New Prompt
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search prompts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-slate-900/50 h-11"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setViewMode('grid')}
            className={`rounded-xl border-zinc-200 dark:border-zinc-800 h-11 w-11 ${viewMode === 'grid' ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-transparent'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setViewMode('list')}
            className={`rounded-xl border-zinc-200 dark:border-zinc-800 h-11 w-11 ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-transparent'}`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isLoading && prompts.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent shadow-none">
          <p className="text-zinc-500 mb-4">No prompts found.</p>
          <Link href={`/workspace/${basePath}/new`}>
            <Button variant="outline" className="rounded-xl">Create your first prompt</Button>
          </Link>
        </Card>
      )}

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
        {prompts.map((prompt) => (
          <Card 
            key={prompt.id} 
            className={`p-5 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ${viewMode === 'list' && 'flex-row items-center p-4'}`}
          >
            <div className={`flex-1 ${viewMode === 'list' && 'flex items-center justify-between gap-6 mr-4'}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/workspace/${basePath}/${prompt.id}`} className="group relative">
                    <h3 className="font-semibold text-lg hover:text-blue-500 transition-colors line-clamp-1">{prompt.heading}</h3>
                  </Link>
                  {viewMode === 'grid' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="w-4 h-4 text-zinc-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => copyPrompt(prompt.content)} className="cursor-pointer">
                          <Copy className="w-4 h-4 mr-2 text-zinc-500" /> Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(prompt.id)} className="cursor-pointer">
                          <Plus className="w-4 h-4 mr-2 text-zinc-500" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportPrompt(prompt.heading, prompt.content)} className="cursor-pointer">
                          <Download className="w-4 h-4 mr-2 text-zinc-500" /> Export .txt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(prompt.id)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                          <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {viewMode === 'grid' && (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 mb-4 leading-relaxed group-hover:opacity-80 transition-opacity">
                    {prompt.content}
                  </p>
                )}
              </div>
              
              <div className={`flex items-center gap-3 text-xs text-zinc-500 font-medium tracking-wide ${viewMode === 'list' && 'gap-6 shrink-0'}`}>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                  <Clock className="w-3 h-3" /> {formatTime(prompt.time_taken_seconds)}
                </div>
                <div className="flex items-center gap-1">
                  <span>{prompt.word_count} words</span>
                </div>
                {viewMode === 'list' && (
                  <div className="flex items-center gap-1 text-zinc-400 ml-4 font-normal">
                    <span>{formatDistanceToNow(new Date(prompt.updated_at))} ago</span>
                  </div>
                )}
              </div>
            </div>

            {viewMode === 'list' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0">
                    <MoreVertical className="w-4 h-4 text-zinc-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => copyPrompt(prompt.content)} className="cursor-pointer">
                    <Copy className="w-4 h-4 mr-2 text-zinc-500" /> Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(prompt.id)} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2 text-zinc-500" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportPrompt(prompt.heading, prompt.content)} className="cursor-pointer">
                    <Download className="w-4 h-4 mr-2 text-zinc-500" /> Export .txt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(prompt.id)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
