# Architectural Guidelines for Agents & Developers

## Project Mission
Frontend web application for a university Alumni Community platform connecting students, alumni, and faculty for community discussions, career opportunities, mentorship, and administrative operations.

---

## Architecture Rules
1. **Feature-Oriented Layering**: Business logic, presentation, and data management are segregated by domain boundaries.
2. **Decoupled API Integration**: The UI must be completely decoupled from API mechanics. Backend contract changes should only affect the service and type layers.
3. **No Direct Page Side Effects**: Pages must serve only as top-level view orchestrators. Do not write business logic, inline data fetching, or heavy styling directly in page components.
4. **Layout Segregation**: All route trees must reside under their designated layouts (`AuthLayout`, `UserLayout`, `AdminLayout`).

---

## Folder Rules
- **`src/app/`**: Application-level bootstrapping, routing tree, global providers, and environment configuration.
- **`src/layouts/`**: Shell components governing layout anatomy (e.g., headers, navigation sidebars, content regions).
- **`src/pages/`**: Thin route entry points that compose feature components. Never embed direct network requests or domain business logic here.
- **`src/features/`**: Domain modules. Each feature owns its domain-specific components, custom query hooks, and internal logic.
- **`src/components/ui/`**: Base design system components (shadcn/ui primitives).
- **`src/components/common/`**: Shared components across multiple domains (modals, empty states, search bars).
- **`src/components/layout/`**: Structural layout pieces (navbars, sidebars, topbars).
- **`src/components/<domain>/`**: Reusable presentation components specific to a domain without coupled side effects.
- **`src/services/`**: API clients and endpoint definitions. `src/services/api/` handles HTTP abstractions; `src/services/<domain>/` handles feature endpoints.
- **`src/stores/`**: Client-only Zustand stores (`authStore`, `uiStore`, `notificationStore`).
- **`src/types/`**: Shared TypeScript definitions, request/response models, and domain types.
- **`src/constants/`**: Centralized routes, enum representations, role permissions, and system constants.
- **`src/lib/`**: General cross-cutting utilities (class merging `cn`, date formatters, error normalization, validation).
- **`src/styles/`**: Global stylesheet and Tailwind CSS theme definitions.

---

## API Rules
1. **Never Make Raw Fetch or Axios Calls in Components**: All network requests must flow through the bounded service layer (`src/services/*`) using the pre-configured `apiClient`.
2. **Consume Services via TanStack Query**: Feature components consume service methods through TanStack Query custom hooks (`useQuery`, `useMutation`), ensuring consistent caching, background invalidation, and loading states.
3. **Normalize Errors**: All API errors must be transformed through `normalizeError` (`src/lib/errorHandler.ts`) to avoid leaking raw Axios exceptions into the UI layer.
4. **Environment Base URL**: Never hardcode API hostnames or endpoints. Always leverage `env.apiBaseUrl` via `src/app/config/env.ts`.

---

## State Rules
1. **Server State vs Client State Separation**:
   - **TanStack Query** manages all server-originated state (profiles, posts, job listings, community feeds). Do NOT copy query data into Zustand stores.
   - **Zustand** manages purely transient client-only state (sidebar collapsed status, modal visibility, client session tokens).
2. **Keep Stores Minimal**: Stores should remain concise, well-typed, and avoid bloated cross-domain dependencies.

---

## UI Rules
1. **Component Reusability**: Prefer creating and composing reusable UI components in `src/components/` over copy-pasting JSX across views.
2. **Atomic Design & shadcn/ui**: Use `src/components/ui/` for primitive building blocks.
3. **Responsive Design**: Ensure layouts and components gracefully handle desktop, tablet, and mobile screen sizes using Tailwind CSS utilities.
4. **Accessible Semantics**: Utilize proper semantic HTML tags (`header`, `nav`, `main`, `aside`, `section`) and ARIA attributes where appropriate.

---

## Coding Rules
1. **TypeScript Strict Mode**: Strictly adhere to TypeScript strict mode. Never use `any`; use `unknown` with type guards or precise interfaces.
2. **Path Aliases**: Always use configured aliases (`@/...`, `@/components/...`, `@/features/...`, `@/services/...`, `@/types/...`, etc.) instead of relative `../../` imports.
3. **Naming Conventions**:
   - PascalCase for React components and layouts (`UserLayout.tsx`, `PostCard.tsx`).
   - camelCase for utility functions, hooks, and services (`useAuth.ts`, `formatDate.ts`, `postsService.ts`).
   - UPPER_SNAKE_CASE for constant objects and enums (`ROUTES`, `ROLES`).
4. **No Giant Files**: Keep files focused and modular. Extract reusable logic into dedicated sub-components, hooks, or helpers.
5. **Clean Imports**: Remove unused imports and maintain consistent ordering.

---

## Restrictions
1. **Do Not Introduce Unnecessary Dependencies**: Do not install external packages without explicit justification.
2. **No Mock Data in Foundation**: Never introduce hardcoded mock databases or fake network delay timers in production service layers.
3. **No Direct DOM Manipulation**: Always leverage React state management and declarative component lifecycles.
4. **Do Not Bypass the Layered Architecture**: Strictly follow folder boundaries and import hierarchies.
