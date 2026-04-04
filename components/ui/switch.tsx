"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function Switch({
  checked,
  onCheckedChange,
  className,
  disabled = false,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        // Base container styles
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
        // Focus states for accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Dynamic background color based on state
        checked ? "bg-slate-900 dark:bg-slate-50" : "bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        className={cn(
          // The sliding circle (thumb) styles
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
          // Dynamic translation based on state
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}