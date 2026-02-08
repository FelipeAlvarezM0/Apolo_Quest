# API Client Pro

A professional, production-ready HTTP API client built with React, TypeScript, and modern web technologies. Think Postman/Insomnia, but implemented with clean architecture and best practices.

## Features

### Core Functionality
- **Request Builder**: Build and send HTTP requests with full control over methods, headers, query params, body, and authentication
- **Real HTTP Requests**: Uses native `fetch` API with proper error handling, timeout management, and request cancellation
- **Response Viewer**: Beautiful response display with color-coded status badges, timing metrics, size calculation, formatted JSON, download and copy functions
- **Collections**: Organize and persist your requests for reuse
- **History with Search & Filters**: Automatic tracking with powerful search by URL, method, or status. Sort by date, duration, or status code
- **Environments**: Variable system with `{{variableName}}` syntax for managing different configurations (dev, staging, prod)
- **Runner**: Execute entire collections sequentially with detailed results
- **Import/Export**: Share collections via JSON files with Zod validation
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
- **Copy to Clipboard**:
  - Copy URLs directly from the Request Builder with visual confirmation
  - Copy response bodies with one-click action
- **Download Responses**: Save response bodies as files
- **Comprehensive Tooltips**: All action buttons have descriptive tooltips and ARIA labels for accessibility
- **Keyboard Shortcuts**:
  - Ctrl+Enter: Send request
  - Ctrl+S: Save request to collection
  - Ctrl+F: Focus search field
  - Ctrl+Shift+[B/C/H/E/R]: Navigate to Builder/Collections/History/Environments/Runner
- **Light/Dark Theme**: Full theme support with instant switching, accessible text on all backgrounds
- **Smooth Animations**: Fade-in and slide-in animations for better visual feedback
- **Improved Cards**: Enhanced card designs with hover effects and better spacing
- **Variable Search**: Search and filter environment variables within each environment by key or value
- **Runner Progress**: Visual progress bar showing current request and completion percentage
- **Import/Export Enhancements**:
  - Import Postman Collection v2.x format with automatic conversion
  - Export collections with associated environment references
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
- **Separate stores** for each domain: requests, collections, history, environments, settings, runner
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
│   ├── runner/
│   ├── import-export/
│   ├── curl-generator/
│   └── settings/
├── shared/                       # Shared code
│   ├── http/                     # HTTP client
│   │   ├── HttpClient.ts         # Core HTTP functionality
│   │   └── requestExecutor.ts    # Variable substitution
│   ├── storage/                  # Database
│   │   ├── db.ts                 # Dexie configuration
│   │   └── repositories/         # Data access layer
│   ├── models/                   # TypeScript types
│   ├── validation/               # Zod schemas
│   ├── utils/                    # Utility functions
│   └── ui/                       # Shared UI components
└── main.tsx                      # Entry point
```

## How It Works

### Request Execution Flow

1. User builds request in Request Builder
2. User selects environment (optional)
3. `requestExecutor` replaces variables like `{{baseUrl}}` with environment values
4. `HttpClient.execute()` sends the request:
   - Creates AbortController for cancellation
   - Sets up timeout
   - Builds URL with query params
   - Applies headers and auth
   - Measures timing
   - Parses response
   - Calculates size
5. Response displayed in Response Viewer
6. Request/response pair saved to History automatically

### Environment Variables

Variables use the format `{{variableName}}` and are replaced in:
- URL
- Query parameters
- Headers
- Request body
- Authentication tokens

### Data Persistence

All data is stored in IndexedDB via Dexie:
- **Collections**: Organized groups of requests
- **History**: Automatic log of all executions with environment tracking
- **Environments**: Variable configurations
- **Settings**: User preferences

Data is validated with Zod schemas on read to ensure type safety.

### History Execution Fix

When re-executing requests from History:
1. The complete request configuration is loaded including method, URL, headers, body, and authentication
2. The environment ID used during the original request is stored in `HistoryEntry.environmentId`
3. When loading from history, the `loadRequest` function restores both the request and its environment
4. This ensures variables like `{{baseUrl}}` are resolved correctly on re-execution

### Toast Notification System

A global toast notification system provides real-time feedback:
- Success notifications (green) for completed actions
- Error notifications (red) for failures
- Warning notifications (yellow) for cautions
- Info notifications (blue) for general information

Toasts auto-dismiss after 5 seconds and can be manually closed. They slide in from the top-right with smooth animations.

### HTTP Client Design

The custom `HttpClient` class provides:

```typescript
class HttpClient {
  async execute(request: HttpRequest, options?: ExecuteOptions): Promise<HttpResponse>
  abort(): void
}
```

Features:
- Timeout handling via `setTimeout`
- Request cancellation via `AbortController`
- Precise timing with `performance.now()`
- Automatic JSON/text detection
- Size calculation with `Blob`
- Comprehensive error handling

## Tech Stack

- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Zustand**: Lightweight state management
- **Zod**: Schema validation and parsing
- **Dexie**: IndexedDB wrapper
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

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

#### Microinteractions
- **Button Press**: Scale down effect on active buttons (0.98)
- **Card Hover**: Subtle lift animation with increased shadow
- **Tab Transitions**: Smooth fade between tab content
- **Divider Feedback**: Handle highlights on hover with accent color

#### Typography & Spacing
- **Professional Scale**: Consistent 4px/8px/16px/24px/32px spacing grid
- **Refined Labels**: Uppercase section headers with wider tracking
- **Font Hierarchy**: Proper weight distribution - semibold titles, medium labels, regular body
- **Code Consistency**: JetBrains Mono at consistent sizes throughout

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

#### Enhanced Components
- **Method Pills**: Color-coded badges for each HTTP method (GET=green, POST=blue, PUT=orange, DELETE=red, etc.)
- **Response Panel**: Professional header with status badge, timing, size, and content-type display
- **Headers Table**: DevTools-style table for response headers with zebra striping
- **Status Badges**: Refined design using design system colors
- **Ghost Buttons**: Subtle action buttons that appear on hover

#### Visual Polish
- **No Purple**: Clean, professional color scheme without violet hues
- **Consistent Inputs**: All inputs and selects use elevated panel style
- **Hover States**: Subtle transitions on all interactive elements
- **Loading States**: Refined spinner with accent color
- **Toast Notifications**: Bottom-right placement with backdrop blur

## What's New in v1.5.0

### Professional-Grade Authentication
ApoloQuest 1.5.0 brings enterprise-level authentication options matching Postman's capabilities:

#### Extended Authentication Types
- **API Key Authentication**: Send API keys via headers, query parameters, or cookies. Support for multiple key/value pairs with individual enable/disable toggles
- **OAuth 2.0**: Full Bearer Token support with access token, refresh token, and scope fields. Manual refresh token UI provided
- **Digest Authentication**: Username/password authentication with better security than Basic Auth
- **Enhanced UI**: All auth types include helpful tooltips explaining usage and requirements

#### Advanced Request Body Types
- **Raw Body with Multiple Formats**: Choose from JSON, XML, HTML, Plain Text, JavaScript, GraphQL, or YAML with format-specific placeholders
- **Form Data (multipart/form-data)**: Upload files and text fields together. Supports multiple files with proper MIME type detection
- **x-www-form-urlencoded**: Standard form encoding with key/value pairs
- **Binary Upload**: Direct file upload with automatic Content-Type detection based on file MIME type

#### Pre-Request and Post-Request Scripts
- **Pre-Request Scripts**: Execute JavaScript before sending requests to set variables, modify headers, or prepare data
- **Post-Request Scripts (Tests)**: Run validation scripts after receiving responses to extract data, validate status codes, or save tokens
- **Rich Script Context**: Access to `request`, `environment`, `response`, `setEnv()`, `getEnv()`, and `console` methods
- **Error Handling**: Scripts execute in a sandboxed environment with comprehensive error catching and console logging
- **Persistent Variables**: Set environment variables dynamically from scripts that persist across requests

### Example Script Usage

Pre-Request Script:
```javascript
// Set a timestamp
setEnv('timestamp', Date.now());

// Add custom header
request.headers.push({
  key: 'X-Request-Time',
  value: new Date().toISOString()
});
```

Post-Request Script:
```javascript
// Validate response
if (response.status === 200) {
  console.log('✓ Request successful');

  // Extract and save token
  const data = JSON.parse(response.body);
  if (data.token) {
    setEnv('authToken', data.token);
  }
}
```

## What's New in v1.4.0

### Enhanced Organization and Management
ApoloQuest 1.4.0 introduces powerful organization features that streamline your workflow:

#### Variables and Environments
- **Reorder Variables**: Use up/down arrow buttons to organize variables within environments
- **Reorder Environments**: Move environments up or down in the list for better organization
- **Inline Key Editing**: Edit variable keys directly without any special mode
- **Visual Indicators**: Clear buttons and icons for all actions

#### Collections and Requests
- **Reorder Collections**: Move entire collections up or down with arrow buttons
- **Move Requests Between Collections**: Transfer requests from one collection to another with a visual selector dialog
- **Reorder Requests**: Use up/down buttons to organize requests within collections
- **Better Mobile Support**: All actions work seamlessly on mobile devices

#### Improved Toast System
- **Unified Durations**: Success toasts (3s), errors and warnings (4s) for consistent UX
- **Color-Coded Icons**: Each toast type has distinctive icons and colors
- **Auto-Dismiss**: All toasts auto-dismiss with appropriate timing

#### UI/UX Enhancements
- **Postman-Style Method Selector**: Clean bordered design with colored text matching HTTP methods
- **100% Responsive**: All components adapt perfectly to mobile, tablet, and desktop screens
- **Better Spacing**: Improved padding and margins across all screen sizes
- **Touch-Friendly**: Larger touch targets on mobile devices

## Recent Improvements

### URL Input Visibility Fix
The URL input field now correctly displays text in both light and dark themes. The Input and Select shared components have been updated to automatically adapt their styling based on the active theme, ensuring consistent visibility and readability across the entire application.

### Duplicate Request Functionality
The duplicate button in the Request Builder now correctly creates a copy of the current request with:
- A new unique ID
- A modified name (adds "(Copy)" suffix)
- All original properties preserved (method, URL, headers, body, auth, query params)
- Toast notification confirming the duplication

### Variable Management
Variables can now be:
- **Duplicated**: Each variable can be cloned with a single click (new variable gets "_copy" suffix)
- **Searched**: Filter variables by key or value in real-time
- **Renamed**: Both key and value fields are editable directly in the UI

### Advanced Filtering
History now includes:
- **Status Code Filtering**: Filter by 2xx (Success), 3xx (Redirect), 4xx (Client Error), or 5xx (Server Error)
- **Multiple Sort Options**: Sort by date, duration, or status code
- **Sort Order Toggle**: Ascending or descending order for all sort options

### Postman Import Support
Import Postman Collection v2.x files with automatic conversion:
- Converts Postman requests to native format
- Preserves headers, query parameters, body, and authentication
- Handles Bearer and Basic auth types
- Supports both raw and URL-encoded body types

### cURL Generator Improvements
The cURL generator now offers:
- **Include/Exclude Headers**: Toggle to show or hide all headers
- **Include/Exclude Body**: Toggle to show or hide request body
- **Multiline Format**: Switch between single-line and formatted multiline with backslashes for better readability

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
| `Enter` | Confirm inline edit |
| `Escape` | Cancel inline edit |

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

## MVP Scope vs Future Enhancements

### Current MVP Includes
- **Request Building**: Full HTTP request builder with save and duplicate buttons, tooltips, and keyboard shortcuts
- **Collections Management**: Full CRUD with inline editing, renaming, and request organization
- **Duplicate Functionality**: Clone requests, environments, and individual variables with one click
- **Advanced History**: Search and filter by method, status code range (2xx/3xx/4xx/5xx), URL, or name. Sort by date, duration, or status in ascending/descending order
- **Environment Management**: Create, rename, duplicate environments. Add, edit, duplicate, search, and filter variables
- **Collection Runner**: Execute entire collections sequentially with visual progress bar
- **Import/Export**:
  - Native format with Zod validation
  - Postman Collection v2.x import with automatic conversion
  - Environment association with collections
- **cURL Generator**: Generate cURL commands with options to include/exclude headers and body, toggle multiline format
- **Settings Management**: Theme switching (light/dark mode) with proper text visibility across all backgrounds
- **Toast Notifications**: Real-time feedback for all actions with color-coded status
- **Status Badges**: Color-coded HTTP status badges (green 2xx, blue 3xx, orange 4xx, red 5xx)
- **Copy to Clipboard**: URLs, responses, and commands with visual confirmation
- **Response Download**: Save response bodies as files
- **Smooth UI Animations**: Fade-in and slide-in transitions
- **Accessibility**: Comprehensive tooltips, ARIA labels, keyboard navigation
- **Comprehensive Keyboard Shortcuts**: See table above

### Future V2 Features
- Drag-and-drop reordering for variables, requests, and collections
- Variable preview tooltip showing applied variables in request builder
- Global search modal (Ctrl+Shift+F) across all collections, history, and environments
- Authentication flows (OAuth2, API Key, etc.)
- WebSocket support
- GraphQL support
- Request/response transformers and scripts
- Mock servers
- Team collaboration and cloud sync
- Request chaining and dependencies
- Pre-request scripts
- Tests and assertions with runner integration
- API documentation generation
- Bulk operations (delete, move, duplicate multiple items)
- Request history persistence across sessions
- Variable import/export separately from collections

## Performance Considerations

- **Lazy loading**: Features loaded on demand
- **Efficient re-renders**: Zustand selectors prevent unnecessary updates
- **IndexedDB**: Non-blocking data operations
- **Virtual scrolling**: For large history/collections (future enhancement)

## Browser Support

Modern browsers with support for:
- ES2020+
- Fetch API
- AbortController
- IndexedDB
- Web Workers (future)

## License

MIT

## Contributing

This is a portfolio project demonstrating professional development practices. Feel free to fork and build upon it.
