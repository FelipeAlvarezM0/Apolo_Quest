# ApoloQuest

A professional, production-ready HTTP API client with visual automation workflows built with React, TypeScript, and modern web technologies. Think Postman/Insomnia, but with a powerful flow-based automation engine.

## Features

### Core Functionality
- **Request Builder**: Build and send HTTP requests with full control over methods, headers, query params, body, and authentication
- **Real HTTP Requests**: Uses native `fetch` API with proper error handling, timeout management, and request cancellation
- **Response Viewer**: Beautiful response display with color-coded status badges, timing metrics, size calculation, formatted JSON, download and copy functions
- **Collections**: Organize and persist your requests for reuse
- **History with Search & Filters**: Automatic tracking with powerful search by URL, method, or status. Sort by date, duration, or status code
- **Environments**: Variable system with `{{variableName}}` syntax for managing different configurations (dev, staging, prod)
- **Flows**: Visual automation workflows with advanced node types for complex API orchestration
- **Runner**: Execute entire collections sequentially with detailed results
- **Import/Export**: Share collections and flows via JSON files with Zod validation
- **cURL Generator**: Convert any request to cURL command for terminal use
- **Toast Notifications**: Real-time feedback for all actions with elegant slide-in toasts

### Enhanced UX Features
- **Smart Request Loading**: Load requests from History with their original environment automatically restored
- **Status Badges**: Color-coded badges for HTTP status codes (green for 2xx, blue for 3xx, orange for 4xx, red for 5xx)
- **Advanced Search & Filter**:
  - Filter History by method (GET, POST, etc.), status code range (2xx, 3xx, 4xx, 5xx), URL, or name
  - Sort by date, duration, or status code in ascending/descending order
  - Search shortcut with Ctrl+F to quickly focus search fields
- **Inline Editing**: Rename collections, requests, environments, and variables directly inline with keyboard support (Enter to save, Escape to cancel)
- **Duplicate Functionality**:
  - Clone entire environments with all their variables
  - Duplicate individual variables within an environment
  - Duplicate requests in the Request Builder with one click
  - Duplicate flows to iterate quickly
- **Copy to Clipboard**:
  - Copy URLs directly from the Request Builder with visual confirmation
  - Copy response bodies with one-click action
- **Download Responses**: Save response bodies as files
- **Comprehensive Tooltips**: All action buttons have descriptive tooltips and ARIA labels for accessibility
- **Keyboard Shortcuts**:
  - Ctrl+Enter: Send request
  - Ctrl+S: Save request to collection
  - Ctrl+F: Focus search field
  - Ctrl+Shift+[B/C/H/E/R/F]: Navigate to Builder/Collections/History/Environments/Runner/Flows
- **Light/Dark Theme**: Full theme support with instant switching, accessible text on all backgrounds
- **Smooth Animations**: Fade-in and slide-in animations for better visual feedback
- **Improved Cards**: Enhanced card designs with hover effects and better spacing
- **Variable Search**: Search and filter environment variables within each environment by key or value
- **Runner Progress**: Visual progress bar showing current request and completion percentage
- **Import/Export Enhancements**:
  - Import Postman Collection v2.x format with automatic conversion
  - Export collections with associated environment references
  - Export and import flows with full node and edge data
  - Validation with Zod schemas for data integrity
- **cURL Generator Options**:
  - Toggle headers on/off
  - Toggle body on/off
  - Switch between single-line and multiline format with backslashes

### Technical Highlights

#### Architecture
- **Feature-based organization**: Each feature is self-contained with its own components, hooks, stores, and services
- **No global components folder**: Promotes better code organization and discoverability
- **Clean separation of concerns**: UI, business logic, and data access are clearly separated

#### State Management
- **Zustand**: Lightweight, performant state management with minimal boilerplate
- **Separate stores** for each domain: requests, collections, history, environments, settings, runner, flows
- **No prop drilling**: Global state accessible anywhere in the app

#### Data Persistence
- **IndexedDB via Dexie**: Full client-side persistence without backend
- **Repository pattern**: Database access abstracted behind clean interfaces
- **Zod validation**: All data read from storage is validated for type safety

#### HTTP Client
Custom `HttpClient` implementation featuring:
- Native `fetch` API
- `AbortController` for request cancellation
- Precise timing measurement with `performance.now()`
- Response size calculation
- Automatic JSON detection
- Graceful error handling
- Environment variable substitution

#### Type Safety
- **TypeScript strict mode**: Maximum type safety
- **Zod schemas**: Runtime validation matching TypeScript types
- **Discriminated unions**: Type-safe node definitions for flows
- **No `any` types**: Every piece of data is properly typed

## Project Structure

```
src/
├── app/                          # App-level configuration
├── features/                     # Feature modules
│   ├── request-builder/
│   │   ├── components/           # UI components
│   │   ├── store/                # Zustand store
│   │   └── types/                # Feature-specific types
│   ├── collections/
│   ├── history/
│   ├── environments/
│   ├── flows/                    # Visual automation system
│   │   ├── models/               # Flow types and schemas
│   │   ├── repo/                 # Flow persistence
│   │   ├── runtime/              # Flow execution engine
│   │   ├── store/                # Flow state management
│   │   └── ui/                   # Flow editor components
│   ├── runner/
│   ├── import-export/
│   ├── curl-generator/
│   └── settings/
├── shared/                       # Shared code
│   ├── http/                     # HTTP client
│   │   ├── HttpClient.ts         # Core HTTP functionality
│   │   ├── requestExecutor.ts    # Variable substitution
│   │   └── scriptExecutor.ts     # Script execution
│   ├── storage/                  # Database
│   │   ├── db.ts                 # Dexie configuration
│   │   └── repositories/         # Data access layer
│   ├── models/                   # TypeScript types
│   ├── validation/               # Zod schemas
│   ├── utils/                    # Utility functions
│   └── ui/                       # Shared UI components
└── main.tsx                      # Entry point
```

## What's New in v2.3.0

### Advanced Flow Automation - Production Ready
ApoloQuest 2.3.0 transforms the Flows system into a production-grade API automation platform with powerful new node types and enhanced capabilities.

#### 5 New Advanced Node Types

**Loop Node** - Array Iteration
- Iterate over arrays with full control
- Customizable item variable name (e.g., `currentItem`)
- Optional index variable (e.g., `index`)
- Execute sub-flows for each element
- Perfect for batch processing, data migration, and bulk operations

```
Loop over "users" array as "user"
  → Request: POST /api/notify with body: {"email": "{{user.email}}"}
  → Log: "Notified {{user.name}}"
```

**Parallel Node** - Concurrent Execution
- Execute multiple branches simultaneously
- Wait for all branches to complete (Promise.all)
- Configure number of parallel branches
- Ideal for independent API calls, data aggregation, and performance optimization

```
Parallel (3 branches):
  Branch 1: GET /api/users
  Branch 2: GET /api/posts
  Branch 3: GET /api/comments
```

**Map Node** - Data Transformation
- Transform data using JavaScript expressions
- Input/output variable configuration
- Full access to flow variables in transformation script
- Built-in error handling with detailed messages

```javascript
// Transform API response
input.map(user => ({
  id: user.id,
  fullName: `${user.firstName} ${user.lastName}`,
  isActive: user.status === 'active'
}))
```

**Script Node** - Custom Logic
- Execute arbitrary JavaScript code
- Access all flow variables via `flowVars` object
- Use `setVar(key, value)` and `getVar(key)` helpers
- Full console support: `console.log()`, `console.error()`, `console.warn()`
- Sandboxed execution with comprehensive error handling

```javascript
// Calculate statistics
const total = flowVars.items.reduce((sum, item) => sum + item.price, 0);
setVar('totalRevenue', total);
setVar('itemCount', flowVars.items.length);
console.log(`Processed ${flowVars.items.length} items, total: $${total}`);
```

**Error Handler Node** - Graceful Error Recovery
- Catch errors from previous nodes
- Store error details in custom variable
- Implement fallback logic and retry mechanisms
- Prevent flow failures from cascading

#### Enhanced Node System

**Editable Node Labels**
- Optional custom names for all node types
- Falls back to intelligent default labels
- Double-click to edit (UI ready)
- Helps document complex flows

**Node Categories in Palette**
- **Basic Nodes**: Request, Extract, Condition, SetVar, Delay, Log
- **Advanced Nodes**: Loop, Parallel, Map, Script, Error Handler
- Organized sidebar with category headers
- Clear descriptions and icons for each type

**Request Node Enhancements**
- Pre-request scripts specific to the node
- Post-request scripts for response processing
- All existing body types supported (JSON, form-data, binary, etc.)
- Full auth and header configuration

**Visual Improvements**
- 11 total node types with distinct icons
- Color-coded node categories
- Improved descriptions in palette
- Better visual feedback during execution

#### Flow Variables 2.0

**Structured Variables**
```typescript
{
  value: "https://api.example.com",
  description: "Production API base URL"
}
```
- Optional descriptions for documentation
- Backward compatible with string-only format
- Better organization for complex flows

**Enhanced Execution Context**
- Results tracking for every node execution
- Detailed timing information (start/end times)
- Request and response storage per node
- Error messages and stack traces
- Data snapshots for debugging

**Variable Resolution**
- Flow variables take precedence
- Falls back to environment variables
- Template syntax: `{{variableName}}`
- Supports nested property access

#### Data Model & Persistence

**Flow Tags** (Schema Ready)
```typescript
{
  tags: ["api", "production", "critical"]
}
```
- Organize flows by category, environment, or team
- UI implementation ready
- Filtering and search prepared

**Version Control**
- Flow version number tracked
- Migration system for future updates
- Backward compatibility guaranteed
- Existing v2.2.0 flows work without changes

**Execution Results Storage**
```typescript
{
  nodeId: "node-123",
  status: "success",
  startTime: 1704067200000,
  endTime: 1704067201500,
  response: { /* full HTTP response */ },
  request: { /* full HTTP request */ },
  data: { /* custom node data */ }
}
```

#### Complete Node Reference

**Basic Nodes**
1. **Start**: Entry point (required)
2. **End**: Exit point (required)
3. **Request**: Execute HTTP requests
4. **Extract**: Extract JSON data with path notation
5. **Condition**: Branch based on comparisons
6. **Set Variable**: Update flow variables
7. **Delay**: Wait for specified milliseconds
8. **Log**: Output debug messages

**Advanced Nodes**
9. **Loop**: Iterate over arrays
10. **Parallel**: Concurrent branch execution
11. **Map**: Transform data with JavaScript
12. **Script**: Execute custom JavaScript
13. **Error Handler**: Catch and handle errors

#### Real-World Examples

**Example 1: User Registration Flow with Validation**
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

**Example 2: Bulk Data Processing with Loop**
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

**Example 3: Parallel API Aggregation**
```
1. Start
2. Request → POST /auth/login (save token to "authToken")
3. Parallel (3 branches)
   Branch A: Request → GET /api/users (headers: "Authorization: Bearer {{authToken}}")
   Branch B: Request → GET /api/products
   Branch C: Request → GET /api/analytics
4. Script → Combine all data
   ```javascript
   const dashboard = {
     users: flowVars.usersResponse,
     products: flowVars.productsResponse,
     analytics: flowVars.analyticsResponse
   };
   setVar('dashboardData', dashboard);
   console.log('Dashboard data ready');
   ```
5. End
```

**Example 4: Data Transformation Pipeline**
```
1. Start
2. Request → GET /api/raw-data (save as "rawData")
3. Extract → "rawData.records" to "records"
4. Map → Transform "records" to "cleanedRecords"
   ```javascript
   return input.map(record => ({
     id: record._id,
     name: record.full_name.trim().toUpperCase(),
     email: record.email_address.toLowerCase(),
     active: record.status === 1
   }))
   ```
5. Script → Filter valid records
   ```javascript
   const valid = flowVars.cleanedRecords.filter(r => r.email && r.active);
   setVar('validRecords', valid);
   ```
6. Request → POST /api/import (body: {"records": "{{validRecords}}"})
7. End
```

**Example 5: Error Handling and Retry Logic**
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

#### Technical Implementation

**Runtime Engine**
- Recursive node execution with stack management
- AbortController integration for cancellation
- Context preservation across async operations
- Detailed error reporting with node identification
- Timeline event generation for debugging

**Script Execution**
- Sandboxed JavaScript via Function constructor
- Access to flow context and helpers
- Console output captured to timeline
- Error boundaries prevent flow corruption
- Safe variable type coercion

**Performance**
- Efficient Map-based node status tracking
- Minimal re-renders with Zustand selectors
- Lazy evaluation of node properties
- Optimized edge traversal algorithms

**Security**
- Scripts run in isolated context
- No access to DOM or global state
- Input validation on all node data
- Zod schema validation on load
- Safe template variable resolution

## What's New in v2.2.0

### Flows - Visual Automation Workflows
ApoloQuest 2.2.0 introduces Flows, a powerful visual automation engine for creating complex API workflows without code:

#### Core Features
- **Visual Flow Editor**: Drag-and-drop canvas powered by ReactFlow for building automation workflows
- **Node-Based System**: Connect nodes to create execution paths with branching logic
- **Real-Time Execution**: Watch your flow execute with live node status updates and timeline
- **Variable Management**: Flow-scoped variables with template resolution using `{{variable}}` syntax
- **Request Integration**: Reuse existing requests from collections as flow nodes
- **Script Support**: Pre-request and post-request scripts execute automatically within flows

#### Flow Execution Engine
- **Sequential Execution**: Follows edges from start to end node
- **Abort Control**: Stop execution immediately with request cancellation
- **Context Preservation**: Maintains execution context across nodes
- **Error Handling**: Graceful error handling with detailed error messages
- **Timeline Events**: Real-time execution log with timestamps and node status

#### Persistence & Sharing
- **Dexie Storage**: All flows persisted locally with IndexedDB
- **Import/Export**: Share flows via JSON files with Zod validation
- **Duplicate Flows**: Clone existing flows to iterate quickly
- **Version Control**: Flow versioning for migrations

#### Example: Login + Fetch Users Flow
```
1. Start Node
2. Request Node → POST /auth/login (save response as "loginData")
3. Extract Node → Extract "loginData.token" to variable "authToken"
4. Request Node → GET /users (with header Authorization: Bearer {{authToken}})
5. Condition Node → Check status === 200
   - True → End Node (success)
   - False → Log Node → "Failed to fetch users" → End Node
```

#### Integration
- **Environment Support**: Flows can use environment variables
- **Collection Reuse**: Reference any request from your collections
- **Template Resolution**: Variables resolved from flow vars, then environment vars
- **Script Context**: Scripts access flow context via `flow.getVar()` and `flow.setVar()`

#### UI Components
- **Node Palette**: Sidebar with all available node types organized by category
- **Canvas**: Zoom, pan, and connect nodes with smooth edges
- **Node Inspector**: Context-sensitive property panel for selected nodes
- **Run Panel**: Execution controls with live timeline and logs
- **Flow List**: Browse, create, duplicate, and manage all flows

## What's New in v2.1.0

### Professional Visual Polish
ApoloQuest 2.1.0 refines the visual experience with commercial-grade polish and microinteractions:

#### Enhanced Visual Hierarchy
- **Subtle Panel Shadows**: Professional depth with layered shadows for better separation
- **Visible Resizer Handle**: IDE-style draggable divider with handle indicator between panels
- **Refined Color Palette**: Updated method colors - OPTIONS to neutral gray, HEAD to blue-gray
- **Elevated Components**: Clear visual levels with proper shadow and background elevation

#### Improved Interactive Feedback
- **Integrated Spinner**: Send button transforms to show loading state with animated spinner
- **Loading Pulse**: Subtle pulse animation on active request button
- **Redesigned Toasts**: Bottom-right placement with backdrop blur, color-coded by type
- **Toast Icons**: Success, error, warning, and info toasts with distinctive icons
- **Hover Transitions**: Consistent 120ms micro-animations on all interactive elements

#### Navigation Enhancements
- **Grouped Sidebar**: Organized sections - Core, Organization, Automation, Utilities
- **Section Headers**: Uppercase labels with proper spacing between groups
- **Enhanced Footer**: Cleaner version display with app name and release tag
- **Unified Iconography**: All icons standardized to 18px with consistent stroke width

## What's New in v2.0.0

### Professional Design System - UI Overhaul
ApoloQuest 2.0.0 transforms the application into a professional-grade tool with a complete visual redesign matching industry leaders like Postman and Insomnia:

#### Design System
- **Centralized Design Tokens**: All colors, typography, spacing, and animations defined in a single source of truth
- **Professional Color Palette**: Dark-first design with carefully selected colors for optimal readability and hierarchy
- **Inter + JetBrains Mono**: Professional typography with Inter for UI and JetBrains Mono for code
- **Consistent Spacing**: 4px base grid system for perfect alignment throughout the app
- **Smooth Animations**: 120-180ms transitions for a polished feel

#### IDE-Style Layout
- **Resizable Panels**: Draggable splitter between request editor and response viewer
- **Professional Request Line**: Browser-style URL input with method pills color-coded by HTTP method
- **Tab-Based Navigation**: IDE-style tabs for Query, Headers, Auth, Body, and Scripts with active indicators
- **Refined Sidebar**: Minimal design with vertical accent bar for active items
- **Elevated Panels**: Clear visual hierarchy with distinct background levels

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send current request |
| `Ctrl+S` | Save request to collection |
| `Ctrl+F` | Focus search field |
| `Ctrl+Shift+B` | Navigate to Request Builder |
| `Ctrl+Shift+C` | Navigate to Collections |
| `Ctrl+Shift+H` | Navigate to History |
| `Ctrl+Shift+E` | Navigate to Environments |
| `Ctrl+Shift+R` | Navigate to Runner |
| `Ctrl+Shift+F` | Navigate to Flows |
| `Enter` | Confirm inline edit |
| `Escape` | Cancel inline edit |

## Tech Stack

- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript with strict mode
- **Vite**: Fast build tool and dev server
- **Zustand**: Lightweight state management
- **Zod**: Schema validation and parsing
- **Dexie**: IndexedDB wrapper for persistence
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **ReactFlow**: Visual flow editor for automation

## Design Decisions

### Why Zustand over Redux?
- Less boilerplate
- Better TypeScript support
- Smaller bundle size
- Simpler mental model

### Why Dexie over LocalStorage?
- Much larger storage capacity
- Structured data with indexes
- Better query performance
- Transaction support

### Why Custom HTTP Client over Axios?
- No external dependency
- Full control over implementation
- Smaller bundle size
- Modern fetch API
- Learning opportunity

### Why Feature-based Architecture?
- Better code organization
- Easier to find related files
- Scales well with team size
- Clear ownership boundaries

### Why ReactFlow for Flows?
- Production-ready visual editor
- Excellent TypeScript support
- Customizable node rendering
- Built-in zoom, pan, and selection
- Active community and maintenance

## Browser Support

Modern browsers with support for:
- ES2020+
- Fetch API
- AbortController
- IndexedDB
- CSS Grid and Flexbox

## License

MIT

## Contributing

This is a portfolio project demonstrating professional development practices. Feel free to fork and build upon it.
