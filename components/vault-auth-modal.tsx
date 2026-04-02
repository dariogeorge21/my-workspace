"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { verifyMasterPasswordForVault } from "@/lib/actions/password-auth"

export function VaultAuthModal({ 
  isOpen, 
  onSuccess, 
  onCancel 
}: { 
  isOpen: boolean, 
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await verifyMasterPasswordForVault(password)
      if (res.success) {
        setPassword("") // reset form
        onSuccess()
      } else {
        setError(res.error || "Incorrect master password")
      }
    } catch (err) {
      setError("Validation failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Unlock Vault</DialogTitle>
          <DialogDescription>
            Please enter your master password to access encrypted entries.
            Verification lasts for 2 minutes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            type="password"
            autoFocus
            placeholder="Master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="rounded-xl border-zinc-200 dark:border-zinc-800 h-11"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !password} className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Unlock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
