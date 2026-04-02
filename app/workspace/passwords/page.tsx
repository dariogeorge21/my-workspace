"use client"

import { useState, useEffect } from "react"
import { getPasswordEntries, getDecryptedPassword, deletePasswordEntry, createPasswordEntry, updatePasswordEntry } from "@/lib/actions/passwords"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus, MoreHorizontal, Eye, EyeOff, Copy, Trash2, KeyRound } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { VaultAuthModal } from "@/components/vault-auth-modal"

export default function PasswordsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ app: "", username: "", password: "" })
  const [isSaving, setIsSaving] = useState(false)

  // Viewer State (Revealing passwords inline)
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: string }>({})

  const fetchEntries = async (query = "") => {
    setIsLoading(true)
    const data = await getPasswordEntries(query)
    setEntries(data)
    setIsLoading(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchEntries(search), 300)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const requireAuthAndExecute = async (action: () => Promise<void>) => {
    setPendingAction(() => action)
    
    // Try executing directly first. If the server action returns requiresAuth: true, 
    // it will be caught in the action logic and the modal will trigger.
    await action()
  }

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false)
    if (pendingAction) {
      await pendingAction()
      setPendingAction(null)
    }
  }

  // Row actions
  const handleReveal = (id: string) => {
    if (revealedPasswords[id]) {
      // Hide
      const newRevealed = { ...revealedPasswords }
      delete newRevealed[id]
      setRevealedPasswords(newRevealed)
      return;
    }

    requireAuthAndExecute(async () => {
      const res = await getDecryptedPassword(id);
      if (res.requiresAuth) {
        setIsAuthModalOpen(true);
        return;
      }
      if (res.success && res.data) {
        setRevealedPasswords(prev => ({ ...prev, [id]: res.data }))
      } else {
        toast.error(res.error || "Failed to reveal");
      }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  const handleCopyPassword = (id: string) => {
    if (revealedPasswords[id]) {
      copyToClipboard(revealedPasswords[id]);
      return;
    }

    requireAuthAndExecute(async () => {
      const res = await getDecryptedPassword(id);
      if (res.requiresAuth) {
        setIsAuthModalOpen(true);
        return;
      }
      if (res.success && res.data) {
        copyToClipboard(res.data);
      } else {
        toast.error(res.error || "Failed to acquire password");
      }
    })
  }

  const handleDelete = (id: string) => {
    if(!confirm("Are you sure you want to delete this password entry?")) return;

    requireAuthAndExecute(async () => {
      const res = await deletePasswordEntry(id);
      if (res.requiresAuth) {
        setIsAuthModalOpen(true);
        return;
      }
      if (res.success) {
        toast.success("Entry deleted");
        setEntries(entries.filter(e => e.id !== id));
        // clean up revealed state
        const newRevealed = { ...revealedPasswords };
        delete newRevealed[id];
        setRevealedPasswords(newRevealed);
      } else {
        toast.error(res.error || "Failed to delete");
      }
    })
  }

  const openEditor = (id: string | null = null) => {
    requireAuthAndExecute(async () => {
      if (id) {
        // Edit mode
        const res = await getDecryptedPassword(id);
        if (res.requiresAuth) {
          setIsAuthModalOpen(true);
          return;
        }
        if (res.success && res.data) {
          const entry = entries.find(e => e.id === id);
          setFormData({ app: entry.application_name, username: entry.username, password: res.data });
          setEditingId(id);
          setIsEditorOpen(true);
        }
      } else {
        // Create Mode - wait we need auth to create too? PRD implies yes or we should guard creating.
        // Actually, to create we don't strictly need auth, but it protects vault.
        const res = await getDecryptedPassword('fake-id'); // checking auth. Alternatively, call a dummy auth check.
        if (res.requiresAuth) {
          setIsAuthModalOpen(true);
          return;
        }
        setFormData({ app: "", username: "", password: "" });
        setEditingId(null);
        setIsEditorOpen(true);
      }
    })
  }

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.app || !formData.username || !formData.password) {
      return toast.error("Please fill all fields");
    }

    setIsSaving(true);
    let res;
    if (editingId) {
      res = await updatePasswordEntry(editingId, { 
        application_name: formData.app, 
        username: formData.username, 
        plaintext_password: formData.password 
      });
    } else {
      res = await createPasswordEntry({
        application_name: formData.app, 
        username: formData.username, 
        plaintext_password: formData.password
      });
    }

    setIsSaving(false);
    
    if (res?.requiresAuth) {
      setIsAuthModalOpen(true);
      // Wait for re-trigger
      return;
    }

    if (res?.success) {
      toast.success(editingId ? "Entry updated" : "Entry created");
      setIsEditorOpen(false);
      fetchEntries(search);
      if (editingId) {
        const newRevealed = { ...revealedPasswords };
        delete newRevealed[editingId];
        setRevealedPasswords(newRevealed);
      }
    } else {
      toast.error(res?.error || "Error saving entry");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Passwords</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Secure encrypted vault for your application credentials.</p>
        </div>
        <Button onClick={() => openEditor(null)} className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4 mr-2" />
          Add Password
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search applications or usernames..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-800 h-11 bg-white/50 dark:bg-slate-900/50"
          />
        </div>
      </div>

      {/* Data Table manually built for better Shadcn custom look per PRD */}
      <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {!isLoading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No passwords found in vault.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">
                    {entry.application_name}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {entry.username}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono tracking-widest text-zinc-600 dark:text-zinc-400">
                        {revealedPasswords[entry.id] || entry.encrypted_password}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleReveal(entry.id)}>
                        {revealedPasswords[entry.id] ? <EyeOff className="w-3.5 h-3.5 text-zinc-500" /> : <Eye className="w-3.5 h-3.5 text-zinc-500" />}
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                    {formatDistanceToNow(new Date(entry.updated_at))} ago
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => handleCopyPassword(entry.id)} className="cursor-pointer">
                          <Copy className="w-4 h-4 mr-2 text-zinc-500" /> Copy Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(entry.username)} className="cursor-pointer">
                          <Copy className="w-4 h-4 mr-2 text-zinc-500" /> Copy Username
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditor(entry.id)} className="cursor-pointer">
                          <KeyRound className="w-4 h-4 mr-2 text-zinc-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(entry.id)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                          <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reusable Modals */}
      <VaultAuthModal 
        isOpen={isAuthModalOpen} 
        onSuccess={handleAuthSuccess} 
        onCancel={() => { setIsAuthModalOpen(false); setPendingAction(null); }} 
      />

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Password Entry" : "New Password Entry"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEntry} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Application Name</label>
              <Input 
                value={formData.app} 
                onChange={(e) => setFormData({...formData, app: e.target.value})} 
                placeholder="e.g. GitHub, Vercel"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username / Email</label>
              <Input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="developer@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <Input 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder="Enter raw password"
                className="rounded-xl"
                autoComplete="new-password"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                Save Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
