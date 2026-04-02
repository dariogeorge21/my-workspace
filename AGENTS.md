# AGENTS.md

## Purpose

Define how AI agents (Claude, Copilot, etc.) should operate while building the Workspace Manager.

Agents must:
- Work modularly
- Avoid breaking existing features
- Maintain design consistency
- Prioritize security and performance

---

## Agent Roles

### 1. UI Agent
Responsible for:
- Layouts
- Components
- Responsiveness
- Animations

Rules:
- Use Shadcn UI
- Follow CLAUDE.md design system strictly
- Keep UI minimal and clean

---

### 2. Backend Agent
Responsible for:
- API routes
- Server actions
- Authentication
- Encryption

Rules:
- NEVER expose sensitive logic to client
- Use `.env` for secrets
- Use AES-256-GCM for passwords

---

### 3. Database Agent
Responsible for:
- Schema design
- Queries
- Migrations

Rules:
- Follow naming conventions
- Ensure indexing for search-heavy fields
- Maintain timestamps everywhere

---

### 4. Logic Agent
Responsible for:
- Business logic
- State handling
- Feature workflows

Examples:
- Writing time tracker
- Password session cache
- Filters & search

---

## Execution Strategy

### Step-by-Step Development

1. Foundation
2. Auth
3. Layout
4. Dashboard
5. Prompts
6. Passwords
7. Files
8. Commands
9. Settings

Agents must NOT skip steps.

---

## Task Rules

- One feature at a time
- Fully complete before moving forward
- Test mentally for edge cases

---

## Code Generation Rules

- Do NOT generate huge files
- Break into:
  - components/
  - lib/
  - db/
  - actions/

---

## UI Consistency Rules

Before adding UI:
- Check existing components
- Reuse patterns

---

## Error Handling

Agents must always:
- Handle empty states
- Handle loading states
- Handle failures gracefully

---

## Performance Rules

- Avoid unnecessary API calls
- Use server-side fetching when possible
- Debounce search inputs

---

## Security Protocol

STRICT:
- Passwords → encrypted
- Auth → server-side
- No secrets in frontend
- Validate all inputs

---

## Collaboration Rule

If multiple agents are involved:
- Do NOT overwrite each other's work
- Extend, don’t replace

---

## Definition of Done

A feature is complete ONLY if:
- UI is polished
- Logic is correct
- Edge cases handled
- Responsive design works
- No console errors

---

## Red Flags (Avoid These)

- Overcomplicated UI
- Unnecessary animations
- Inconsistent spacing/colors
- Client-side security logic
- Large unstructured files

---

## Final Goal

Build a system that feels:
- Fast
- Clean
- Reliable
- Premium

Not just functional — but enjoyable to use.