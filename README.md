# ApoloQuest

ApoloQuest is a modern HTTP API client built with React and TypeScript, designed to be a complete alternative to tools like Postman and Insomnia. What makes it different is its powerful visual automation engine that lets you build complex API workflows using a node-based flow system.

The project started as a way to explore what a production-ready API testing tool would look like with modern web technologies, and it's grown into something that handles everything from simple REST calls to complex multi-step automation workflows.

## What Can You Do With It?

At its core, ApoloQuest handles all the basics you'd expect: building HTTP requests with full control over methods, headers, authentication, and request bodies. You get a proper response viewer with syntax highlighting, timing metrics, and the ability to download or copy responses. Everything is organized into collections, and there's automatic history tracking so you never lose a request.

But the interesting part is the **Flows** system. Instead of manually running requests one by one, you can visually design automation workflows. Need to authenticate, fetch data, transform it, and send it somewhere else? Build a flow. Need to loop through an array and make API calls for each item? There's a node for that. Want to run multiple API calls in parallel? Yeah, that works too.

The environment system uses `{{variableName}}` syntax for managing different configurations (dev, staging, production), and you can switch between them instantly. There's a collection runner for batch operations, import/export for sharing work, and even a cURL generator when you need to drop into the terminal.

### The Details

**Request Building** is straightforward. The interface gives you a clean URL bar with method selection, tabs for query parameters, headers, authentication, request body, and even pre/post-request scripts. Everything you set up can be saved to a collection for reuse.

**Collections** organize your requests into groups. You can rename them inline, duplicate entire collections, move requests between collections, and reorder everything with simple up/down buttons. It's all stored locally in IndexedDB, so there's no server required.

**History** automatically tracks every request you make. You can search by URL, filter by HTTP method or status code range (2xx, 3xx, 4xx, 5xx), and sort by date, duration, or status. When you load a request from history, it restores the environment that was active when you originally sent it, so variables resolve correctly.

**Environments** let you define variables and switch contexts quickly. Each environment has a list of key-value pairs, and you can search, duplicate, and reorder them. Want separate configs for local development versus production? Create two environments and toggle between them.

**Flows** is where things get interesting. It's a visual editor powered by ReactFlow where you drag nodes onto a canvas and connect them to build workflows. The system executes your flow step by step, following the connections you've drawn.

The runner can execute entire collections sequentially with a progress bar and detailed results for each request. Import/export works with both ApoloQuest's native format and Postman Collection v2.x files, with full Zod validation to ensure data integrity.

## What's New in v2.3.0

Version 2.3.0 takes the Flows system from "pretty cool" to "actually powerful" by adding five advanced node types that handle real-world automation scenarios.

### The New Nodes

**Loop Node** lets you iterate over arrays. You give it an array variable, tell it what to call each item (like `user` or `invoice`), and optionally track the index. Then you connect nodes inside the loop, and they execute for every element. This is perfect for bulk operations like notifying multiple users, processing batches of data, or migrating records.

```
Loop over "users" array as "user"
  → Request: POST /api/notify with body: {"email": "{{user.email}}"}
  → Log: "Notified {{user.name}}"
```

**Parallel Node** executes multiple branches at the same time using `Promise.all`. You configure how many branches you want, connect different paths to each branch, and the node waits for all of them to complete before moving forward. Great for fetching data from multiple APIs simultaneously or doing independent operations that don't depend on each other.

```
Parallel (3 branches):
  Branch 1: GET /api/users
  Branch 2: GET /api/posts
  Branch 3: GET /api/comments
```

**Map Node** transforms data using JavaScript. You give it an input variable and write a transformation expression. The node runs your code and stores the result in an output variable. Full access to flow variables means you can reference other data in your transformations.

```javascript
// Transform API response
input.map(user => ({
  id: user.id,
  fullName: `${user.firstName} ${user.lastName}`,
  isActive: user.status === 'active'
}))
```

**Script Node** executes arbitrary JavaScript with access to all your flow variables via the `flowVars` object. You can use `setVar()` and `getVar()` to manipulate data, and `console.log()` output shows up in the timeline. It's sandboxed but flexible enough to handle calculations, filtering, data manipulation, or any custom logic you need.

```javascript
// Calculate statistics
const total = flowVars.items.reduce((sum, item) => sum + item.price, 0);
setVar('totalRevenue', total);
setVar('itemCount', flowVars.items.length);
console.log(`Processed ${flowVars.items.length} items, total: $${total}`);
```

**Error Handler Node** catches errors from previous nodes so failures don't kill your entire flow. You can implement retry logic, fallback behavior, or just log the error and continue. The error details get stored in a variable you specify, so you can inspect what went wrong.

### Enhanced Node System

Every node type now supports optional custom labels. By default, nodes show intelligent descriptions (like "Request: GET /users"), but you can rename them to document your flow better. The node palette is organized into **Basic** (Request, Extract, Condition, SetVar, Delay, Log) and **Advanced** (Loop, Parallel, Map, Script, Error Handler) categories.

Request nodes got upgraded with pre-request and post-request scripts specific to that node, so you can have different logic for different API calls in the same flow. All the body types, auth methods, and header configurations from the main request builder work here too.

### Flow Variables 2.0

Variables now support optional descriptions for documentation:

```typescript
{
  value: "https://api.example.com",
  description: "Production API base URL"
}
```

The execution context tracks detailed results for every node, including timing, requests, responses, errors, and data snapshots. This makes debugging flows much easier because you can see exactly what happened at each step.

Variable resolution follows a hierarchy: flow variables first, then environment variables as a fallback. Template syntax (`{{variableName}}`) works everywhere, including nested property access.

### Real-World Examples

**User Registration with Validation:**
```
1. Start
2. Request → POST /api/users (save as "newUser")
3. Extract → "newUser.id" to "userId"
4. Condition → Check status === 201
   TRUE:
     5. Request → POST /api/welcome-email (body: {"userId": "{{userId}}"})
     6. Log → "User {{userId}} registered successfully"
     7. End
   FALSE:
     8. Log → "Registration failed"
     9. End
```

**Bulk Data Processing:**
```
1. Start
2. Request → GET /api/invoices (save as "invoices")
3. Extract → "invoices.items" to "invoiceList"
4. Loop over "invoiceList" as "invoice" (index as "i")
   5. Log → "Processing invoice {{i}}: {{invoice.id}}"
   6. Request → POST /api/process-invoice (body: {"invoiceId": "{{invoice.id}}"})
   7. Delay → 100ms (rate limiting)
8. Log → "Processed {{invoiceList.length}} invoices"
9. End
```

**Parallel API Aggregation:**
```
1. Start
2. Request → POST /auth/login (save token to "authToken")
3. Parallel (3 branches)
   Branch A: Request → GET /api/users (headers: "Authorization: Bearer {{authToken}}")
   Branch B: Request → GET /api/products
   Branch C: Request → GET /api/analytics
4. Script → Combine all data
   const dashboard = {
     users: flowVars.usersResponse,
     products: flowVars.productsResponse,
     analytics: flowVars.analyticsResponse
   };
   setVar('dashboardData', dashboard);
5. End
```

**Data Transformation Pipeline:**
```
1. Start
2. Request → GET /api/raw-data (save as "rawData")
3. Extract → "rawData.records" to "records"
4. Map → Transform "records" to "cleanedRecords"
   return input.map(record => ({
     id: record._id,
     name: record.full_name.trim().toUpperCase(),
     email: record.email_address.toLowerCase(),
     active: record.status === 1
   }))
5. Script → Filter valid records
   const valid = flowVars.cleanedRecords.filter(r => r.email && r.active);
   setVar('validRecords', valid);
6. Request → POST /api/import (body: {"records": "{{validRecords}}"})
7. End
```

**Error Handling with Retry:**
```
1. Start
2. Request → GET /api/unstable-endpoint (save as "apiData")
3. Error Handler (catches failures from step 2)
   4. Log → "API call failed, attempting retry"
   5. Delay → 2000ms
   6. Request → GET /api/unstable-endpoint (retry)
   7. Condition → Check if retry succeeded
      SUCCESS: Continue to step 8
      FAIL: Log error and exit
8. Extract → Process successful response
9. End
```

### Technical Implementation

The runtime engine uses recursive node execution with stack management and `AbortController` integration for cancellation. Context is preserved across async operations, and errors are reported with node identification for easy debugging.

Script execution happens in a sandboxed environment using the Function constructor. Scripts get access to the flow context and helper functions, and all console output is captured to the timeline. Input validation and type coercion keep things safe.

Performance is optimized with Map-based node status tracking, minimal re-renders through Zustand selectors, and efficient edge traversal. Security is handled by running scripts in isolated contexts with no DOM or global state access, plus Zod validation on all data.

## Architecture & Technical Decisions

The project uses a feature-based folder structure where each feature is self-contained with its components, stores, and services. There's no global "components" folder because having everything related to a feature in one place makes the codebase easier to navigate.

**State Management** is handled by Zustand, which is lightweight and has excellent TypeScript support. Each domain (requests, collections, history, environments, flows, etc.) gets its own store, and there's no prop drilling because stores are accessible anywhere.

**Persistence** uses Dexie, a wrapper around IndexedDB. Everything is stored locally with no backend required. The repository pattern abstracts database access, and all data is validated with Zod schemas when read from storage.

**HTTP Client** is custom-built using the native `fetch` API. It handles request cancellation with `AbortController`, precise timing with `performance.now()`, automatic JSON detection, response size calculation, and environment variable substitution. No external HTTP library needed.

**Type Safety** is enforced with TypeScript strict mode, Zod schemas for runtime validation, and discriminated unions for complex types like flow nodes. There are no `any` types in the codebase.

### Why These Choices?

**Zustand over Redux:** Less boilerplate, better TypeScript support, smaller bundle size, simpler mental model.

**Dexie over LocalStorage:** Much larger storage capacity, structured data with indexes, better query performance, transaction support.

**Custom HTTP Client over Axios:** No external dependency, full control, smaller bundle size, uses modern fetch API, and it's a good learning exercise.

**Feature-based Architecture:** Better code organization, easier to find related files, scales well with team size, clear ownership boundaries.

**ReactFlow for Flows:** Production-ready visual editor, excellent TypeScript support, customizable rendering, built-in zoom/pan/selection, active community.

## Project Structure

```
src/
├── features/
│   ├── request-builder/     # HTTP request building interface
│   ├── collections/          # Request organization
│   ├── history/              # Automatic request tracking
│   ├── environments/         # Variable management
│   ├── flows/                # Visual automation system
│   │   ├── models/           # Types and schemas
│   │   ├── repo/             # Persistence layer
│   │   ├── runtime/          # Execution engine
│   │   ├── store/            # State management
│   │   └── ui/               # Editor components
│   ├── runner/               # Batch execution
│   ├── import-export/        # Data transfer
│   ├── curl-generator/       # Command generation
│   └── settings/             # User preferences
├── shared/
│   ├── http/                 # HTTP client and execution
│   ├── storage/              # Database and repositories
│   ├── models/               # Shared types
│   ├── validation/           # Zod schemas
│   ├── utils/                # Helper functions
│   └── ui/                   # Reusable components
└── main.tsx
```

## Getting Started

```bash
npm install
npm run dev
```

For production builds:
```bash
npm run build
npm run typecheck
npm run lint
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send current request |
| `Ctrl+S` | Save request to collection |
| `Ctrl+F` | Focus search field |
| `Ctrl+Shift+B` | Go to Request Builder |
| `Ctrl+Shift+C` | Go to Collections |
| `Ctrl+Shift+H` | Go to History |
| `Ctrl+Shift+E` | Go to Environments |
| `Ctrl+Shift+R` | Go to Runner |
| `Ctrl+Shift+F` | Go to Flows |
| `Enter` | Confirm inline edit |
| `Escape` | Cancel inline edit |

## Tech Stack

React 18, TypeScript (strict mode), Vite, Zustand, Zod, Dexie, Tailwind CSS, Lucide React, ReactFlow

## Browser Support

Works in modern browsers with ES2020+, Fetch API, AbortController, IndexedDB, CSS Grid, and Flexbox support.

## Previous Versions

**v2.2.0** introduced the Flows system with the basic node types (Start, End, Request, Extract, Condition, SetVar, Delay, Log) and the visual editor. It included flow persistence, import/export, and the execution engine with real-time timeline updates.

**v2.1.0** focused on visual polish with subtle panel shadows, an IDE-style resizer handle, refined method colors, integrated loading spinners, redesigned toasts, grouped sidebar navigation, and consistent microinteractions throughout the UI.

**v2.0.0** was a complete design system overhaul with centralized design tokens, professional color palette, Inter + JetBrains Mono typography, resizable panels, IDE-style tabs, and a dark-first design matching industry tools like Postman and Insomnia.

## License

MIT

## Contributing

This is a portfolio project demonstrating professional development practices. Feel free to fork it, learn from it, or build something new on top of it.
