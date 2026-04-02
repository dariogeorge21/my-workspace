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
        router.push(`/workspace/${type === 'app' ? 'app-prompts' : 'my-prompts'}/${res.data.id}`);
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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <Link href={`/workspace/${basePath}`}>
          <Button variant="ghost" size="sm" className="rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !heading.trim()} 
          className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 transition-all"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'}`}>
            {isActive ? <Play className="w-3 h-3 fill-current" /> : <Clock className="w-3 h-3" />}
            {formatTime(timeSeconds)} {isActive ? 'Typing...' : 'Idle'}
          </div>
          <div className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
            {wordCount} words
          </div>
        </div>

        <Input 
          placeholder="Prompt Heading..." 
          value={heading}
          onChange={(e) => handleTextChange(e, 'heading')}
          className="text-3xl md:text-5xl font-bold tracking-tight border-none bg-transparent shadow-none px-0 py-8 focus-visible:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 h-auto"
        />
      </div>

      <Textarea 
        placeholder="Start writing your prompt here..." 
        value={content}
        onChange={(e) => handleTextChange(e, 'content')}
        className="min-h-[50vh] md:min-h-[65vh] text-lg leading-relaxed border-none bg-transparent shadow-none px-0 resize-none focus-visible:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
      />
    </div>
  )
}
