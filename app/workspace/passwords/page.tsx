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
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">My Passwords</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Secure encrypted vault for your application credentials.</p>
        </div>
        <Button onClick={() => openEditor(null)} className="rounded-xl px-6 bg-zinc-900 text-white dark:bg-white dark:text-black transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Password
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
          <Input 
            placeholder="Search applications or usernames..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md h-11 focus-visible:ring-1 focus-visible:ring-white/20 transition-all relative z-10"
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] bg-white/60 dark:bg-black/40 relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/80 dark:bg-white/5 border-b border-black/5 dark:border-white/10 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {!isLoading && entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center glass-ambient-glow">
                        <KeyRound className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <p>No passwords found in vault.</p>
                    </div>
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/90 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">
                    {entry.application_name}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {entry.username}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono tracking-widest text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-white/5 px-2 py-1 rounded-md border border-black/5 dark:border-white/5">
                        {revealedPasswords[entry.id] || entry.encrypted_password}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10" onClick={() => handleReveal(entry.id)}>
                        {revealedPasswords[entry.id] ? <EyeOff className="w-3.5 h-3.5 text-zinc-500" /> : <Eye className="w-3.5 h-3.5 text-zinc-500" />}
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                    {formatDistanceToNow(new Date(entry.updated_at))} ago
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-white/20 dark:border-white/10 glass-panel bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => handleCopyPassword(entry.id)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                          <Copy className="w-4 h-4 mr-2" /> Copy Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(entry.username)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                          <Copy className="w-4 h-4 mr-2" /> Copy Username
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditor(entry.id)} className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/10">
                          <KeyRound className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <div className="h-px bg-zinc-200 dark:bg-white/10 my-1 mx-2" />
                        <DropdownMenuItem onClick={() => handleDelete(entry.id)} className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/20">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Modals */}
      <VaultAuthModal 
        isOpen={isAuthModalOpen} 
        onSuccess={handleAuthSuccess} 
        onCancel={() => { setIsAuthModalOpen(false); setPendingAction(null); }} 
      />

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-white/20 dark:border-white/10 glass-panel bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
              {editingId ? "Edit Password Entry" : "New Password Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEntry} className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Application Name</label>
              <Input 
                value={formData.app} 
                onChange={(e) => setFormData({...formData, app: e.target.value})} 
                placeholder="e.g. GitHub, Vercel"
                className="rounded-xl border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username / Email</label>
              <Input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="developer@example.com"
                className="rounded-xl border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <Input 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder="Enter raw password"
                className="rounded-xl border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-white/20"
                autoComplete="new-password"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditorOpen(false)} className="rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 transition-all">
                Save Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
