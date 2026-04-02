@AGENTS.md
# CLAUDE.md

## Project: Workspace Manager

A professional, aesthetic, and smooth productivity workspace for managing:
- prompts (application + personal)
- passwords (secure encrypted vault)
- personal files
- favorite commands
- customizable dashboard

---

## Core Philosophy

This project MUST feel:
- Minimal
- Fast
- Smooth and athestic
- Professional (Not flashy, but premium)
- Distraction-free

Think:
- Notion × Raycast × Linear × 1Password

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- NeonDB (PostgreSQL)
- bcrypt + crypto (security)

---

## UI/UX Rules (STRICT)

### Design Language
- Use **soft rounded corners (rounded-xl / 2xl)**
- Use **low-contrast borders** (`border-zinc-200` / `border-zinc-800`)
- Avoid heavy shadows — prefer subtle elevation
- Maintain **consistent spacing (p-4, p-6, gap-4)**

### Animations
- Use **subtle transitions only**
- Example:
  - `hover:-translate-y-1`
  - `transition-all duration-200`
- NO flashy animations

### Colors
- Light: white + zinc + soft blue accents
- Dark: deep slate + indigo accents
- Accent color should be consistent across app

---

## Layout Rules

### Global Layout
- Sidebar (desktop)
- Top bar (mobile)
- Content area = max-width centered

### Navigation
- Icon + label
- Active state:
  - subtle background
  - left border accent

---

## Feature Implementation Rules

### 1. Authentication
- Password from `.env`
- Validate using bcrypt
- Store session in HTTP-only cookies

---

### 2. Prompts System

Must support:
- CRUD
- Search + Filters
- Duplicate
- Export (.txt)
- Copy

#### Writing Time Tracker
- Track ONLY typing activity
- Pause after ~3 seconds idle
- Store time in seconds

---

### 3. Password Manager (CRITICAL SECURITY)

- Encrypt passwords using AES-256-GCM
- NEVER store plain text
- Master password check required for:
  - view
  - edit
  - delete
- Cache verification for 2 minutes

---

### 4. Files Module

Two modes:
- TEXT (stored in DB)
- URL (external file)

---

### 5. Commands Module

- Fast access
- One-click copy
- Should feel instant

---

### 6. Dashboard

Must include:
- Stats cards
- Quick navigation
- My Apps section

---

### 7. Settings

- Theme toggle
- Dashboard customization
- App shortcuts management

---

## Database Rules

- Use clear naming:
  - `app_prompts`
  - `personal_prompts`
  - `password_entries`
- ALWAYS include:
  - `created_at`
  - `updated_at`

---

## Performance Rules

- Use server components where possible
- Avoid unnecessary re-renders
- Optimize queries (indexed fields for search)

---

## Code Style

- Clean, modular structure
- Separate:
  - UI
  - logic
  - database
- No large monolithic components

---

## Security Rules (STRICT)

- All sensitive logic → server-side
- Encrypt passwords
- Never expose secrets to client
- Use `.env` properly

---

## AI Behavior Instructions

When generating code:
- Prefer clarity over cleverness
- Follow existing patterns strictly
- Do NOT introduce unnecessary libraries
- Keep UI consistent across pages
- Always think: "Does this feel premium?"

---

## End Goal

A workspace that feels:
> “I want to use this every day”