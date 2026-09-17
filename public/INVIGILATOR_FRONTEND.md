# Invigilator Frontend Architecture

This document describes the frontend architecture for the UNZA Invigilator Dashboard. It covers the design system foundations, theming, async UX patterns, and the reusable component library that powers the app.

## Table of Contents

- [Folder Structure](#folder-structure)
- [1. Design Tokens](#1-design-tokens)
- [2. Theming Architecture](#2-theming-architecture)
- [3. State Management & Asynchronous UX](#3-state-management--asynchronous-ux)
- [4. Component Library Spec](#4-component-library-spec)
- [5. App Shell and Screen Composition](#5-app-shell-and-screen-composition)
- [6. Recommended Documentation Rules](#6-recommended-documentation-rules)
- [7. Current API-Driven Screens](#7-current-api-driven-screens)
- [8. Backend Behavior That Shapes the UI](#8-backend-behavior-that-shapes-the-ui)

## Folder Structure

```text
Invigilator-Dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── check-in/
│   │   │   └── page.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   ├── incidents/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   └── token-refresh-keeper.tsx
│   ├── dashboard/
│   │   ├── assignment-cards.tsx
│   │   ├── quick-action-tiles.tsx
│   │   └── stats-grid.tsx
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── app-sidebar.tsx
│   │   └── app-header.tsx
│   ├── check-in/
│   │   └── check-in-workspace.tsx
│   ├── attendance/
│   │   └── attendance-workspace.tsx
│   ├── incidents/
│   │   └── incidents-workspace.tsx
│   ├── reports/
│   │   └── reports-workspace.tsx
│   └── ui/
│       ├── button.tsx
│       ├── field.tsx
│       ├── badge.tsx
│       ├── tile.tsx
│       ├── search-bar.tsx
│       └── toaster.tsx
├── hooks/
│   └── use-exam-countdown.ts
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── assignments.ts
│   │   ├── attendance.ts
│   │   ├── incidents.ts
│   │   └── reports.ts
│   ├── auth/
│   │   └── session.ts
│   ├── actions/
│   │   ├── auth.ts
│   │   └── exam.ts
│   ├── types/
│   │   └── api.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── exam-time.ts
├── public/
│   ├── INVIGILATOR_FRONTEND.md
│   └── ... (assets)
├── proxy.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Key directories:**

- `app/`: Next.js App Router routes and layouts, organized by route group (`(auth)` and `(dashboard)`).
- `components/`: Reusable React components, grouped by domain (`auth`, `dashboard`, `layout`, feature workspaces) and shared UI primitives (`ui/`).
- `hooks/`: Custom React hooks.
- `lib/`: Core business logic, API client wrappers, server actions, types, and utilities.
- `public/`: Static assets and the architecture document itself.

## 1. Design Tokens

The app uses a compact token set built on CSS variables in [`app/globals.css`](/home/enoch/Downloads/Invigilator-Dashboard/app/globals.css). These tokens are intentionally minimal and map cleanly to the UNZA visual language.

### Color Palette

Core tokens:

- `--background`: page background
- `--foreground`: global text color
- `--surface`: default surface/background for cards and layouts
- `--surface-muted`: softer background for inputs, helper surfaces, and secondary panels
- `--ink`: primary text and high-contrast UI color
- `--muted`: secondary text and metadata
- `--unza-gold`: brand accent
- `--unza-green`: success and positive state accent
- `--unza-red`: error and danger state accent

How the palette is used:

- Backgrounds and shells use `--surface` and `--background`.
- Content and emphasis use `--ink` and `--foreground`.
- Subtle contrast uses `--surface-muted`.
- Status tones use the UNZA semantic accents, especially in badges and alert-like surfaces.

### Typography

Typography is driven by the Inter font via `next/font` and exposed through Tailwind theme tokens.

Current conventions:

- Font family: Inter, with system sans-serif fallbacks
- Base body text: `text-sm` to `text-base` depending on component
- Display hierarchy:
  - Large KPI numbers use bold, tabular numerals
  - Section titles use medium or semibold weight
  - Supporting text uses muted color and smaller sizes
- Letter spacing:
  - Small uppercase labels use wider tracking for scanability
  - Numeric values use tight tracking for clean dashboards

Recommended scale:

- `h1`: page title or primary screen heading
- `h2`: section heading
- `h3`: card or panel heading
- `body`: default content
- `small`: metadata, helper copy, timestamps

### Spacing & Grid

Spacing follows a compact dashboard rhythm with Tailwind spacing utilities and consistent card padding.

Observed patterns:

- Card padding: `p-6`
- Internal control spacing: `gap-2`, `gap-3`, `space-y-1.5`
- Field spacing: label above control with a tight vertical rhythm
- Content density: moderate, optimized for fast scanning and operational work

Grid and breakpoints:

- Layouts are responsive and should be treated as:
  - mobile
  - tablet
  - desktop
  - ultra-wide
- Dashboard metrics and card grids should collapse to fewer columns on smaller viewports and expand into multi-column layouts on larger screens.

### Elevation & Motion

Elevation is subtle and used to separate interactive surfaces without overpowering the content.

Tokens and patterns:

- Shadows are light and restrained, e.g. soft card shadows
- Radius: rounded corners are consistent at about `10px`
- Z-index is handled locally where needed, especially for overlays and shell UI
- Motion:
  - transitions are short and calm
  - hover states use color and border changes more than dramatic motion
  - the existing entry animation is a lightweight `fade-up`

Practical motion guidance:

- Use quick transitions for buttons, cards, and inputs
- Reserve stronger animation only for route transitions or major state changes
- Keep animation useful, not decorative

## 2. Theming Architecture

The frontend currently uses a CSS-variable-first theming model.

### Theme Modes

The codebase is currently optimized for a single branded theme with UNZA colors, but the architecture is compatible with:

- Light mode
- Dark mode
- High-contrast mode
- Multi-tenant branding variants

Theme mapping strategy:

- Base semantic tokens remain stable
- Theme-specific values are mapped onto those tokens
- Components consume semantic tokens instead of hard-coded colors whenever possible

### Implementation Strategy

Current implementation points:

- CSS variables are declared globally in [`app/globals.css`](/home/enoch/Downloads/Invigilator-Dashboard/app/globals.css)
- Tailwind consumes those variables through `@theme inline`
- Components use semantic utility classes rather than local one-off styling

Why this approach works well here:

- It keeps the design system small and predictable
- It makes future theme changes low risk
- It avoids scattering color decisions through the component tree

### Theme Switcher Logic

The current app does not expose a user-facing theme switcher yet, but the recommended persistence pattern is:

- Read initial theme from `localStorage`
- Fall back to `prefers-color-scheme` on first load
- Persist user selection back to `localStorage`
- Apply theme at the document root before paint to avoid flicker

If a theme switcher is added later, the most compatible implementation would be:

- `ThemeProvider` or app-level context for runtime state
- CSS variables or root classes for the actual styling change
- A single source of truth for theme mode

## 3. State Management & Asynchronous UX

The app is built for operational workflows, so async states should always be visible and unambiguous.

### Loading States

#### Skeleton Loaders

Use skeletons for:

- dashboard cards
- attendance rows
- incident lists
- assignment cards

Skeletons should match the final layout so users understand what is loading.

#### Spinners & Progress Bars

Use a spinner or inline busy indicator for:

- button submissions
- short fetches
- form actions

Use a page-level progress indicator for:

- route changes
- longer dashboard refreshes
- report generation

#### Optimistic UI

Optimistic UI is appropriate when the action is low risk and reversible in the UI, for example:

- marking a check-in as pending immediately after submit
- updating a badge count before the refresh completes

For attendance and incident workflows, optimistic updates should still be validated against the server response before finalizing state.

### Empty & Edge States

Empty states should be explicit and useful.

Recommended cases:

- zero assignments: explain that no exam/venue assignment has been synced
- no attendance records: show the selected exam session and guidance to start check-in
- no incidents: reinforce that the exam session has no reported issues yet
- first-time user state: include next-step guidance instead of a blank canvas

Edge states should distinguish between:

- no data
- loading
- permission denied
- network failure
- malformed response

### Error Handling

The app should treat errors at three levels:

- global boundary screens for major failures such as 404/500
- inline validation for form inputs
- toast notifications for transient operational errors

Current backend-driven states to surface clearly:

- `401` and `403`: authentication or authorization failure
- `409`: duplicate attendance or workflow conflict
- server validation errors: field-level messaging

UX guidance:

- keep the error message human-readable
- show the failed action and the next step
- preserve user input whenever possible

## 4. Component Library Spec

The app uses a small reusable component set. Each component should document visual variants, interactive states, props, and accessibility expectations.

### Button

File: [`components/ui/button.tsx`](/home/enoch/Downloads/Invigilator-Dashboard/components/ui/button.tsx)

Variants:

- `primary`
- `secondary`
- `ghost`
- `danger`

States:

- default
- hover
- disabled
- keyboard focus

API / props:

- standard button attributes
- `variant`
- `size`
- `children`

A11y:

- native `<button>` semantics
- disabled state uses HTML disabled behavior
- focus styles should remain visible for keyboard users

### Field

File: [`components/ui/field.tsx`](/home/enoch/Downloads/Invigilator-Dashboard/components/ui/field.tsx)

Includes:

- `Input`
- `Select`
- `Textarea`
- `Label`
- `Field`

Variants:

- standard control styling only; no separate visual families yet

States:

- default
- focus
- disabled via native element behavior
- invalid state should be added by consumer as needed

API / props:

- forwards standard HTML input/select/textarea props
- `Field` composes `label`, `htmlFor`, and children

A11y:

- `Label` should be linked to the corresponding control with `htmlFor`
- focus ring is present and visible
- placeholder text should never replace a proper label

### Badge

File: [`components/ui/badge.tsx`](/home/enoch/Downloads/Invigilator-Dashboard/components/ui/badge.tsx)

Variants:

- `neutral`
- `success`
- `warning`
- `danger`
- `info`

States:

- static display component
- tone changes by semantic meaning rather than interaction

API / props:

- `tone`
- `children`

A11y:

- render as a plain semantic span unless interactive behavior is added elsewhere
- keep the text label meaningful without relying on color alone

### Tile

File: [`components/ui/tile.tsx`](/home/enoch/Downloads/Invigilator-Dashboard/components/ui/tile.tsx)

Variants:

- `default`
- `gold`
- `green`
- `red`
- `ink`

States:

- default
- hover
- clickable via link
- clickable via button

API / props:

- `title`
- `value`
- `subtitle`
- `icon`
- `href`
- `onClick`
- `accent`
- `interactive`
- `children`

A11y:

- uses `<Link>` when navigational
- uses `<button type="button">` when action-oriented
- avoid making non-interactive tiles look clickable unless they actually are

### Search Bar

File: [`components/ui/search-bar.tsx`](/home/enoch/Downloads/Invigilator-Dashboard/components/ui/search-bar.tsx)

Behavior:

- submits a query through a form
- routes numeric queries to check-in
- routes general text queries to attendance search

States:

- default
- focus-within
- submit

API / props:

- optional `className`

A11y:

- input has an accessible label
- button for voice search is present with an aria label
- form submission is keyboard accessible by default

## 5. App Shell and Screen Composition

The frontend is structured around a shell-based dashboard experience.

Primary layout pieces:

- `app-shell`
- `app-header`
- `app-sidebar`
- workspace components for each major screen

Screen-level modules:

- dashboard
- check-in
- attendance
- incidents
- reports
- auth/login

Composition guidance:

- keep navigation persistent in the shell
- keep screen-specific logic inside the workspace component
- keep reusable UI primitives in `components/ui`

## 6. Recommended Documentation Rules

When adding or changing frontend patterns, document:

- the token or component name
- where it lives in the codebase
- what states it supports
- how it behaves in loading, empty, and error conditions
- any accessibility expectations

When a new component is added, include a short spec for:

- variants
- states
- props
- accessibility
- example usage

## 7. Current API-Driven Screens

The current frontend is built around these operational views:

- Login
- Dashboard
- Check-in
- Attendance register
- Incidents
- Reports

The frontend should continue to avoid student management, venue allocation, exam creation, or staff admin workflows unless that scope is explicitly expanded later.

## 8. Backend Behavior That Shapes the UI

The UI must reflect the backend rules accurately:

- only seeded assignments should be shown
- attendance and incident actions require valid assignment context
- student lookup depends on allocated exam + venue
- duplicate attendance is a conflict condition, not a silent success
- dashboard counts should reflect real records, not inferred placeholders

