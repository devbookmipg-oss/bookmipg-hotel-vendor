# Bookmipg Hotel Vendor Portal - AI Coding Guidelines

## Architecture Overview

**Tech Stack**: Next.js 15 (App Router) + React 19 + Material-UI (MUI) + SWR for data fetching

**Key Pattern**: Multi-tenant hotel vendor management system with JWT-based authentication and hotel-scoped data queries.

### Core Data Flow

1. **Auth**: JWT tokens stored in cookies (via `nookies`), validated in middleware and context
2. **State**: Global auth context (`context/index.js`) with reducer pattern, auto-logout on token expiry
3. **API**: Strapi backend at `NEXT_PUBLIC_API_URL` with bearer token auth
4. **Data**: SWR hooks in `utils/ApiFunctions.js` auto-filter by `hotel_id` from user context

## Critical Patterns & Conventions

### 1. Authentication & Authorization

- **Middleware** (`middleware.js`): Protects routes, redirects unauthenticated users to `/`, auto-logout expired tokens
- **Global Context** (`context/index.js`): `useAuth()` hook provides `{ token, user, loading, error }`
- **User Object**: Always includes `hotel_id` to scope all API queries to that hotel
- **Token Validation**: JWT expiry checked via `isTokenExpired()` helper; decode with `atob(token.split('.')[1])`

### 2. Data Fetching & SWR

**Key functions** in `utils/ApiFunctions.js`:

- `GetDataList({ auth, endPoint })` - Fetches paginated lists with auto-filtering by `hotel_id`
- `GetSingleData({ auth, endPoint, id })` - Single resource fetch
- Query format: `$and` filters for hotel_id + `populate=*` for relations + `sort=id:DESC`
- **Refresh interval**: 500ms (aggressive) - consider adjusting for performance

### 3. Component Structure

- **Client Components**: Use `'use client'` for all interactive pages/components
- **Centralized Exports**: Each component folder has `index.js` exporting components (e.g., `bookingComp/index.js`)
- **MUI Styling**: Use `sx` prop + `styled()` for custom styles; layout uses flexbox with `margin-left: 240px` offset for sidebar
- **Status Config Pattern**: For enum-based UI (booking statuses, payment states), use a lookup function like `getStatusConfig(status)` returning `{ icon, color, label }`

### 3a. Theme System

- **Theme File**: `lib/theme.js` - Material-UI ThemeProvider with brand color #c20f12 (primary red)
- **Color Palette**: Primary (#c20f12), Secondary (#f77f88), Success (#27ae60), Warning (#f39c12), Error (#e74c3c), Info (#3498db)
- **Compact Design**: Font sizes reduced (body: 0.875rem, captions: 0.75rem), minimal padding (6-8px), compact table rows
- **Typography**: h1-h6 with scaled font sizes; buttons, inputs use theme defaults
- **Table Styling**: Headers use primary color background, cells have 6px padding, rows have 32px height, hover effect with primary color tint
- **Auto-Applied**: ThemeProvider in `app/layout.js` with `CssBaseline` - no manual setup needed per component

### 3b. Action Button Color Standardization

- **Delete Button**: `color="error"` (red) - use for destructive actions
- **Edit Button**: `color="warning"` (orange/yellow) - use for modify/update actions
- **Create/Add Button**: `color="success"` (green) - use for new item creation
- Applied consistently across all data listing pages via IconButton and Button components
- Examples: `<IconButton color="warning" onClick={handleEdit}>`, `<IconButton color="error" onClick={handleDelete}>`, `<Button color="success" startIcon={<AddIcon />}>`

### 4. Layout & Navigation

- **Root Layout** (`app/layout.js`): Wraps app in `ThemeProvider` → `GlobalProvider` → `ToastContainer` (react-toastify)
- **Pages Layout** (`app/(pages)/layout.js`): Dashboard wrapper with Sidebar + Header; dynamically loads `menuLinks`
- **Responsive**: Desktop sidebar fixed, mobile collapses to top header (use media query `max-width: 996px`)

### 5. UI Notifications

- **Toast Functions** (`utils/GenerateToast.js`):
  - `SuccessToast(message)`, `WarningToast(message)`, `ErrorToast(message)`, `InfoToast(message)`
  - Config: `position: 'top-right'`, `autoClose: 1500ms`, `transition: Slide`
- Always provide user feedback for API actions (create, update, delete)

### 6. Dialog/Modal Pattern

- Use MUI Dialog for confirmations (`CancelBookingDialog.js`, `CheckinDialog.js`)
- Pass `open`, `handleClose`, `onConfirm` as props with loading states
- Button order: Cancel (tertiary) → Action (primary); primary button disabled during loading

### 7. Form Handling

- **react-hook-form** integration for validation
- `UpdateBookingForm.js` shows multi-step wizard pattern with step validation
- Use `useContext(GlobalContext)` to access `auth` for API calls within forms

## Development Workflow

### Build & Run

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build (test before deploy)
npm run lint         # Run ESLint (config: `eslint.config.mjs`)
npm start            # Serve production build
```

### Environment Setup

Required `.env.local` variables:

- `NEXT_PUBLIC_API_URL` - Strapi backend base URL
- `NEXT_PUBLIC_API_TOKEN` - Static API token (check with team for auth strategy)

### Image Handling

- Next.js Image optimization disabled (`next.config.mjs`): images use `unoptimized: true`
- Rationale: Likely for dynamic hotel images; use standard `<img>` or `<Image unoptimized />`

### Export/Print Functionality

- Print components in `component/printables/` (e.g., `RoomInvoicePrint.js`, `RoomBookingReportPrint.js`)
- Pattern: Export data as Excel via `utils/exportToExcel.js` or use `react-to-print` for print preview
- Common reports: Room bookings, invoices, DOB/DOA, income/expense statements

## File Organization by Feature

```
app/(pages)/
├── dashboard/               # Overview dashboard
├── front-office/           # Guest & booking mgmt
│   ├── online-booking/
│   ├── room-booking/
│   ├── room-invoice/
│   └── reviews/
├── house-keeping/          # Housekeeping tasks
├── inventory/              # Stock & purchases
├── master/                 # Hotel/restaurant setup
└── restaurant/             # POS & orders

component/
├── bookingComp/           # All booking-related UI
├── tableOrderComp/        # Restaurant ordering
├── dashboardComp/         # Dashboard widgets
├── updateForms/           # Master data edit forms
└── printables/            # Report templates
```

## Common Gotchas & Best Practices

1. **Always scope to hotel_id**: All API queries auto-filter by `auth.user.hotel_id` - don't hardcode IDs
2. **Token expiry**: Frontend checks JWT expiry; backend may also reject expired tokens → handle in catch blocks
3. **Slow refresh (500ms)**: If adding new features, verify SWR refresh rate doesn't cause UI jank; consider `refreshInterval: 0` for static data
4. **MUI imports**: Prefer `@mui/material` (e.g., `Box`, `Paper`) over manual divs; icons from `@mui/icons-material`
5. **Print pages**: Use `display: none` or CSS media queries to hide UI elements not needed in print views
6. **Responsive design**: Test on mobile (996px breakpoint); sidebar hides, nav moves to top

## Commands for Common Tasks

- **Add new page**: Create in `app/(pages)/[feature]/page.js`, add to `menuLinks` in `app/(pages)/layout.js`
- **Add new booking dialog**: Create in `component/bookingComp/`, export from `index.js`, import in target page
- **Create API endpoint call**: Use `GetDataList()` or `GetSingleData()` in a component; pass `auth` context
- **Generate report**: Add template to `component/printables/`, use `react-to-print` or Excel export utility
