# ApoloQuest

HTTP API client with visual workflow automation. Built with React, TypeScript, and a lot of caffeine.

Started as an experiment to build a Postman alternative with modern web tech. Ended up with something that can automate complex API workflows using a visual node editor.

## Core Features

**Request Builder** — Standard HTTP client stuff. Methods, headers, auth, body types, query params. Pre/post-request scripts. Response viewer with syntax highlighting and timing. Everything saves to collections.

**Collections** — Organize requests into groups. Inline editing, drag-to-reorder, duplicate, move between collections. All stored in IndexedDB.

**History** — Auto-tracks every request. Search by URL, filter by method/status, sort by date/duration. Restores the active environment when you reload old requests.

**Environments** — Variable management with `{{variableName}}` syntax. Switch between dev/staging/prod configs instantly.

**Flows** — Visual automation editor. Drag nodes, connect them, build workflows. Loop over arrays, run requests in parallel, transform data with JavaScript, handle errors, add conditional logic. No code required (unless you want to write scripts).

**Runner** — Batch execute entire collections with progress tracking.

**Import/Export** — Native format + Postman Collection v2.x support.

## v2.3.0 — Advanced Flow Nodes

Added five node types for real automation:

**Loop** — Iterate over arrays. Set variable names for items and index, connect child nodes, done.

**Parallel** — Run multiple branches with `Promise.all`. Configure branch count, connect paths, wait for all to complete.

**Map** — Transform data with JavaScript expressions. Input variable → code → output variable.

**Script** — Execute arbitrary JavaScript with `flowVars` access. Use `setVar()`/`getVar()`, `console.log()` outputs to timeline.

**Error Handler** — Catch failures from previous nodes. Implement retries, fallbacks, or just log and continue.

Node palette split into Basic (Request, Extract, Condition, SetVar, Delay, Log) and Advanced categories. All nodes support custom labels. Request nodes have per-node pre/post scripts.

Variables can have descriptions now:
```typescript
{ value: "https://api.example.com", description: "Production API base URL" }
```

Execution context tracks timing, requests, responses, errors, and data snapshots for debugging. Variable resolution: flow vars first, environment vars as fallback.

## Flow Examples

**Bulk Processing with Rate Limiting**
```
GET /api/invoices → Extract items → Loop over each →
  POST /api/process → Delay 100ms
```

**Parallel Data Fetching**
```
POST /auth/login → Parallel(3):
  Branch 1: GET /api/users
  Branch 2: GET /api/products
  Branch 3: GET /api/analytics
→ Script: Combine into dashboard
```

**Transform & Filter Pipeline**
```
GET /api/raw-data → Extract records → Map (clean data) →
Script (filter valid) → POST /api/import
```

**Retry on Failure**
```
GET /api/unstable → Error Handler:
  Log failure → Delay 2s → Retry request → Check success
```

## Technical Details

**Runtime:** Recursive execution with stack management. `AbortController` for cancellation. Context preserved across async ops.

**Script Sandbox:** Function constructor for isolation. No DOM/global access. Console output captured to timeline. Zod validation on inputs.

**Performance:** Map-based status tracking, Zustand selectors for minimal re-renders, efficient edge traversal.

## Architecture

Feature-based structure. Each feature has its components, stores, and services in one folder. No global "components" dump.

**State:** Zustand. One store per domain. No prop drilling.

**Storage:** Dexie (IndexedDB wrapper). Local-first, no backend. Repository pattern + Zod validation.

**HTTP:** Custom fetch-based client. `AbortController` for cancellation, `performance.now()` for timing, automatic JSON detection, variable substitution.

**Types:** TypeScript strict mode. Zod for runtime validation. Discriminated unions for complex types. Zero `any`.

Stack choices:
- Zustand > Redux (less boilerplate, better DX)
- Dexie > LocalStorage (actual storage capacity, indexing, queries)
- Custom HTTP > Axios (learning + control + smaller bundle)
- ReactFlow for visual editor (best-in-class, TS support, customizable)

## Structure

```
src/
├── features/          # request-builder, collections, history, environments,
│   └── flows/         # flows (models, repo, runtime, store, ui), runner,
│                      # import-export, curl-generator, settings
└── shared/            # http, storage, models, validation, utils, ui
```

## Setup

```bash
npm install
npm run dev
```

Production:
```bash
npm run build && npm run typecheck && npm run lint
```

## Shortcuts

| Action | Keys |
|--------|------|
| Send request | `Ctrl+Enter` |
| Save to collection | `Ctrl+S` |
| Focus search | `Ctrl+F` |
| Navigation | `Ctrl+Shift+[B/C/H/E/R/F]` |

Replace `Ctrl` with `Cmd` on macOS.

## Stack

React 18 · TypeScript · Vite · Zustand · Zod · Dexie · Tailwind · Lucide React · ReactFlow

## Changelog

**v2.2.0** — Initial Flows system with basic nodes and visual editor
**v2.1.0** — Visual polish and microinteractions
**v2.0.0** — Complete design system overhaul

## License

MIT. Fork it, learn from it, build on it.
