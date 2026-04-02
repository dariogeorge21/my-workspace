# Workspace Manager

Workspace Manager is a premium productivity workspace for managing:

- Application prompts
- Personal prompts
- Encrypted passwords
- Personal files (text or URL)
- Favorite commands
- Dashboard shortcuts and settings

Built with Next.js App Router, TypeScript, Tailwind CSS + Shadcn UI, Drizzle ORM, and Neon PostgreSQL.

## Features

- Secure master-password login (bcrypt verification)
- Protected workspace routes via middleware + JWT cookie sessions
- Password vault entries encrypted with AES-256-GCM
- Prompt writing-time tracking based on typing activity
- Dashboard quick navigation and app shortcuts
- Theme and dashboard customization settings

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS + Shadcn UI components
- Drizzle ORM + drizzle-kit
- Neon PostgreSQL (`@neondatabase/serverless`)
- Security: `bcrypt`, `jose`, Node `crypto`

## Project Structure

```text
app/
	workspace/
		app-prompts/
		my-prompts/
		passwords/
		files/
		commands/
		settings/
components/
	ui/
	prompts/
lib/
	actions/
	db/
		migrations/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database (Neon recommended)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Generate secure secrets and update `.env`:

- `MASTER_PASSWORD_HASH`: bcrypt hash of your chosen master password
- `ENCRYPTION_KEY`: 64-char hex key for AES-256-GCM
- `JWT_SECRET`: long random string for JWT signing

4. Apply database schema (see Database Setup section).

5. Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment Variables

Required values in `.env`:

```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
MASTER_PASSWORD_HASH="<bcrypt-hash>"
ENCRYPTION_KEY="<64-char-hex-key>"
JWT_SECRET="<long-random-secret>"
NODE_ENV="development"
```

### Generate `MASTER_PASSWORD_HASH`

Use Node + bcrypt to create a hash (15 rounds):

```bash
node -e "const bcrypt=require('bcrypt');bcrypt.hash('YourStrongPasswordHere',15).then(console.log)"
```

### Generate `ENCRYPTION_KEY`

Option A (OpenSSL):

```bash
openssl rand -hex 32
```

Option B (Node):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

This project uses Drizzle ORM with PostgreSQL.

- Schema file: `lib/db/schema.ts`
- Drizzle config: `drizzle.config.ts`
- Initial migration: `lib/db/migrations/0001_initial_schema.sql`

### Apply initial migration

Run `lib/db/migrations/0001_initial_schema.sql` against your database (for example, using Neon SQL editor or your SQL client).

### Generate new migrations (when schema changes)

```bash
npx drizzle-kit generate
```

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - run production build
- `npm run lint` - run ESLint

## Security Notes

- Master password is never stored in plaintext; only a bcrypt hash is used.
- Workspace access is protected by HTTP-only JWT session cookie (`workspace_session`).
- Password entries are encrypted server-side using AES-256-GCM.
- Vault re-authentication uses a short-lived cookie (`pm_auth_vault`, 2 minutes) for sensitive password actions.
- Keep all secrets in `.env`; never commit real secret values.

## Core Modules

- `lib/actions/auth.ts` - login/logout and master-password verification
- `lib/actions/prompts.ts` - app/personal prompt CRUD and search
- `lib/actions/passwords.ts` - encrypted password vault CRUD
- `lib/actions/password-auth.ts` - vault master-password re-check
- `lib/actions/files.ts` - personal file CRUD (TEXT or URL mode)
- `lib/actions/commands.ts` - favorite command CRUD
- `lib/actions/settings.ts` - dashboard and theme settings

## Route Overview

- `/workspace` - dashboard
- `/workspace/app-prompts` - application prompts
- `/workspace/my-prompts` - personal prompts
- `/workspace/passwords` - encrypted password vault
- `/workspace/files` - personal files
- `/workspace/commands` - favorite commands
- `/workspace/settings` - user settings

## Development Guidelines

Project standards are documented in:

- `AGENTS.md`
- `CLAUDE.md`

These cover UI consistency, security rules, module boundaries, and delivery expectations.
