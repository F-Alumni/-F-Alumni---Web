# University Alumni Community Platform (Frontend Foundation)

A modern, scalable web platform connecting current university students and alumni for networking, community discussions, mentorship, career opportunities, and academic engagement.

---

## 1. Project Purpose

The platform serves as the digital bridge between students, alumni, faculty, and administrators. Key future capabilities include:
- Multi-role Authentication (Students, Alumni, Admins)
- Academic Major & General Interest Communities
- Posts, Questions, and Experience Sharing
- Job, Internship, and Scholarship Boards
- Verified Alumni Directory & Mentorship
- Direct Messaging & Real-time Notifications
- AI-powered Career/Academic Assistant
- Administrative Governance & Verification Portals

This repository currently houses the **frontend architecture foundation**—completely decoupled, type-safe, and ready for incremental feature development.

---

## 2. Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Core UI library |
| **TypeScript (Strict Mode)** | Static type safety and strict compiler guarantees |
| **Vite** | Fast bundler and development server |
| **React Router v7** | Client-side declarative routing and layout hierarchies |
| **Tailwind CSS & shadcn/ui** | Design system foundation, utility-first styling, CSS variables |
| **TanStack Query v5** | Server state management, caching, and background synchronizations |
| **Axios** | HTTP client with centralized interceptors and error handling |
| **Zustand** | Lightweight client-only global state management |
| **React Hook Form & Zod** | Form validation and schema contracts |
| **Lucide React** | Consistent iconography |
| **ESLint & Prettier** | Code style consistency, unused imports detection, and formatting |

---

## 3. Architecture

The codebase follows a **Feature-Oriented Layered Architecture**:
- **Application Infrastructure (`src/app/`)**: Global provider composition, routing configurations, and environment validation.
- **Layouts (`src/layouts/`)**: Structural layouts separating Authentication, User/Student/Alumni, and Administration experiences.
- **Pages (`src/pages/`)**: Route-level components acting solely as composition view layers.
- **Features (`src/features/`)**: Self-contained domain modules containing feature-specific UI, hooks, and sub-components.
- **Components (`src/components/`)**: Shared reusable components (`ui/` for shadcn primitives, `common/` for shared cross-feature components, `layout/` for structural pieces).
- **Services (`src/services/`)**: Centralized API abstraction with bounded domain services.
- **Stores (`src/stores/`)**: Global client-only stores (Zustand).
- **Types (`src/types/`)**: Shared TypeScript domain interfaces.
- **Constants (`src/constants/`)**: Centralized route paths, roles, user types, and domain enums.
- **Utilities (`src/lib/`)**: Reusable helpers, styling utilities (`cn`), formatters, and error normalizers.

---

## 4. Folder Structure

```
src/
├── app/
│   ├── config/          # Environment configuration (env.ts)
│   ├── providers/       # Centralized provider wrappers (QueryProvider, AppProviders)
│   └── router/          # Route objects and browser router instance
├── assets/              # Static media assets
├── components/
│   ├── ui/              # shadcn/ui atomic design primitives
│   ├── common/          # Shared components across features
│   ├── layout/          # Layout-level components (navigation, header, sidebar)
│   ├── post/            # Post-related shared presentation components
│   ├── alumni/          # Alumni-related presentation components
│   ├── community/       # Community-related presentation components
│   ├── opportunity/     # Jobs/internships/scholarships presentation components
│   ├── chat/            # Messaging UI elements
│   └── ai/              # AI assistant interface widgets
├── layouts/
│   ├── AuthLayout.tsx   # Shell for authentication flows
│   ├── UserLayout.tsx   # Shell for student/alumni platform (navbar, sidebar, content, right sidebar)
│   └── AdminLayout.tsx  # Shell for admin portal (sidebar, topbar, content)
├── pages/
│   ├── auth/            # Auth pages
│   ├── user/            # Student/Alumni main platform pages
│   └── admin/           # Administrative portal pages
├── features/
│   ├── auth/            # Authentication feature logic
│   ├── users/           # User management & profile logic
│   ├── posts/           # Posts, discussions, comments logic
│   ├── communities/     # Major/Interest community logic
│   ├── alumni/          # Alumni directory & mentorship logic
│   ├── opportunities/   # Jobs, internships, scholarships logic
│   ├── chat/            # Direct messaging logic
│   ├── notifications/   # Notifications logic
│   ├── ai/              # AI assistant integration logic
│   └── admin/           # Admin verification & governance logic
├── services/
│   ├── api/             # Axios client, request/response interceptors, error handling
│   ├── auth/            # Auth API service boundary
│   ├── users/           # Users API service boundary
│   ├── posts/           # Posts API service boundary
│   ├── communities/     # Communities API service boundary
│   ├── alumni/          # Alumni API service boundary
│   ├── opportunities/   # Opportunities API service boundary
│   ├── chat/            # Chat API service boundary
│   ├── notifications/   # Notifications API service boundary
│   └── ai/              # AI API service boundary
├── stores/              # Zustand client state stores (authStore, uiStore, notificationStore)
├── hooks/               # Shared custom React hooks
├── types/               # Domain interfaces & TypeScript contracts
├── constants/           # Route constants, roles, and domain enumerations
├── lib/                 # Core utilities (cn, formatting, validation, errorHandler)
└── styles/              # Global styling and Tailwind CSS variables (globals.css)
```

---

## 5. Development Setup

### Prerequisites
- **Node.js**: `>= 20.x`
- **npm**: `>= 10.x`

### Installation
```bash
# Clone the repository and install dependencies
npm install
```

### Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Update `.env` with your backend API URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Available Scripts
```bash
# Start local development server with HMR
npm run dev

# Run TypeScript type check
npm run typecheck

# Lint the codebase using ESLint
npm run lint

# Automatically fix linting issues
npm run lint:fix

# Check formatting with Prettier
npm run format:check

# Format codebase with Prettier
npm run format

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Routing Structure

All routes are centrally defined in `src/constants/routes.ts` and managed via React Router in `src/app/router/routes.tsx`:

- **Authentication Section (`/auth/*`)**
  - `/auth/login`
  - `/auth/register`
  - `/auth/verify-email`
  - `/auth/forgot-password`
- **Main Student/Alumni Platform (`/app/*`)**
  - `/app/home`
  - `/app/communities`
  - `/app/communities/:communityId`
  - `/app/posts/create`
  - `/app/posts/:postId`
  - `/app/alumni`
  - `/app/alumni/:userId`
  - `/app/jobs`
  - `/app/jobs/:jobId`
  - `/app/internships`
  - `/app/scholarships`
  - `/app/scholarships/:scholarshipId`
  - `/app/search`
  - `/app/chat`
  - `/app/notifications`
  - `/app/ai`
  - `/app/saved`
  - `/app/profile`
  - `/app/settings`
- **Admin Portal (`/admin/*`)**
  - `/admin`
  - `/admin/users`
  - `/admin/alumni-verification`
  - `/admin/communities`
  - `/admin/posts`
  - `/admin/opportunities`
  - `/admin/reports`
  - `/admin/analytics`
  - `/admin/settings`

---

## 7. How Features Will Be Organized

Each feature within `src/features/<feature-name>/` represents a domain-driven module. Future structure:
```
src/features/posts/
├── components/       # Feature-specific components (e.g. PostCard, PostFeed)
├── hooks/            # Feature-specific TanStack Query hooks (e.g. usePostQuery)
├── types/            # Feature-internal types (if not globally in src/types)
└── index.ts          # Feature public export contract
```
Pages in `src/pages/` only compose feature modules and layouts, maintaining clean separation of concerns.

---

## 8. How API Integration Will Work

1. **Centralized Client**: All network traffic passes through `src/services/api/apiClient.ts` configured with `VITE_API_BASE_URL`.
2. **Interceptors**: 
   - Authorization headers (`Bearer <token>`) are injected automatically on outgoing requests.
   - Global responses and errors are intercepted and normalized via `src/lib/errorHandler.ts`.
3. **Bounded Services**: Feature endpoints are mapped in domain service files (e.g., `src/services/posts/index.ts`).
4. **Data Fetching via TanStack Query**: UI components **never** call `apiClient` or service methods directly inside render functions. Instead, custom query/mutation hooks consume the services and manage caching, stale-times, and optimistic updates.
