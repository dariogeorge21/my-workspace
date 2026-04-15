"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWritingTracker } from "@/lib/hooks/use-writing-tracker"
import { getPrompt, createPrompt, updatePrompt, PromptType } from "@/lib/actions/prompts"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Save, Loader2, Play } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface PromptEditorProps {
  type: PromptType;
  id: string; // 'new' if creating a new one
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function PromptEditor({ type, id }: PromptEditorProps) {
  const router = useRouter()
  const isNew = id === 'new'
  
  const [heading, setHeading] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!isNew)

  // Initialize tracking hook
  const { timeSeconds, isActive, recordActivity, setTimeSeconds } = useWritingTracker(0)

  // Load existing data if editing
  useEffect(() => {
    async function loadData() {
      if (isNew) return;
      const data = await getPrompt(type, id);
      if (data) {
        setHeading(data.heading);
        setContent(data.content);
        setTimeSeconds(data.time_taken_seconds);
      } else {
        toast.error("Prompt not found");
        router.push(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}`);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id, type, isNew, setTimeSeconds, router]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: 'heading' | 'content') => {
    recordActivity();
    if (field === 'heading') setHeading(e.target.value);
    if (field === 'content') setContent(e.target.value);
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleSave = async () => {
    if (!heading.trim()) return toast.error("Please enter a heading");
    
    setIsSaving(true);
    const data = {
      heading,
      content,
      time_taken_seconds: timeSeconds,
      word_count: wordCount
    };

    let res;
    if (isNew) {
      res = await createPrompt(type, data);
    } else {
      res = await updatePrompt(type, id, data);
    }

    if (res.success) {
      toast.success("Prompt saved perfectly");
      if (isNew) {
        if (res.data?.id) {
          router.push(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}/${res.data.id}`);
        } else {
          toast.error("Prompt created, but redirect data is missing");
        }
      }
    } else {
      toast.error(res.error || "Failed to save");
    }
    setIsSaving(false);
  };

  const basePath = type === 'app' ? 'app-prompts' : 'my-prompts';

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-64 animate-pulse"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 relative min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-white/5 dark:bg-white/5 blur-3xl rounded-[100px]" />
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 relative z-10" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl min-h-[85vh] relative flex flex-col border border-white/20 dark:border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] bg-white/60 dark:bg-black/40 overflow-hidden">
        
        {/* Ambient Backlight */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <Link href={`/workspace/${basePath}`}>
            <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-zinc-500 hover:text-zinc-900 bg-white/50 hover:bg-white/80 dark:text-zinc-400 dark:bg-white/5 dark:hover:bg-white/10 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gallery
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'}`}>
                {isActive ? <Play className="w-3 h-3 fill-current" /> : <Clock className="w-3 h-3" />}
                {formatTime(timeSeconds)} {isActive ? 'Typing...' : 'Idle'}
              </div>
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm px-3 py-1.5 rounded-lg">
                {wordCount} words
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving || !heading.trim()} 
              className="rounded-xl h-10 px-6 w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Prompt'}
            </Button>
          </div>
        </div>

        {/* Mobile stats (visible only on small screens) */}
        <div className="sm:hidden flex items-center justify-between mb-8 pb-4 border-b border-black/5 dark:border-white/10 relative z-10">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'}`}>
            {isActive ? <Play className="w-3 h-3 fill-current" /> : <Clock className="w-3 h-3" />}
            {formatTime(timeSeconds)}
          </div>
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm px-3 py-1.5 rounded-lg">
            {wordCount} words
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <Input 
            placeholder="Untitled Prompt" 
            value={heading}
            onChange={(e) => handleTextChange(e, 'heading')}
            className="text-4xl md:text-5xl font-bold tracking-tight border-none bg-transparent shadow-none px-0 py-6 mb-4 focus-visible:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 h-auto caret-blue-500"
          />
          
          <Textarea 
            placeholder="Start writing your prompt here... Type '/' for commands." 
            value={content}
            onChange={(e) => handleTextChange(e, 'content')}
            className="flex-1 min-h-[40vh] text-lg leading-relaxed border-none bg-transparent shadow-none px-0 py-2 resize-none focus-visible:ring-0 placeholder:text-zinc-400/50 dark:placeholder:text-zinc-700/50 caret-blue-500 selection:bg-blue-500/20 text-zinc-800 dark:text-zinc-200"
          />
        </div>
      </div>
    </div>
  )
}
