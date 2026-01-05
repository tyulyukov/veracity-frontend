# Veracity Frontend - AI Agent Guidelines

Follow these rules strictly when working on this codebase.

## Project Structure

```
src/
├── api/           # API client and endpoint modules
├── stores/        # Zustand stores for client state
├── types/         # Shared TypeScript types
├── hooks/         # Custom React hooks (including TanStack Query hooks)
├── routes/        # React Router configuration and route guards
├── layouts/       # Layout components (e.g., platform shell)
├── pages/         # Page components organized by feature
│   ├── auth/      # Authentication pages
│   └── platform/  # Platform pages (requires active user)
├── components/
│   └── ui/        # shadcn/ui components
└── lib/           # Utility functions
```

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Routing**: React Router v7 (data router pattern with `createBrowserRouter`)
- **Server State**: TanStack Query v5 (`@tanstack/react-query`)
- **Client State**: Zustand (no persist - auth uses httpOnly cookies)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix-based)
- **Icons**: Lucide React

## Design System

### Colors (CSS Variables)

All colors use OKLCH color space. Key variables:

- `--background`: Deep charcoal (`oklch(0.04 0.005 250)`)
- `--foreground`: Near-white (`oklch(0.98 0.005 250)`)
- `--primary`: Warm gold/amber (`oklch(0.78 0.12 75)`)
- `--primary-foreground`: Dark contrast for primary (`oklch(0.15 0.02 75)`)
- `--card`: Slightly lighter than background (`oklch(0.08 0.008 250)`)
- `--muted-foreground`: Subdued text (`oklch(0.65 0.02 250)`)
- `--border`: 10% white opacity (`oklch(1 0 0 / 10%)`)
- `--destructive`: Red for errors (`oklch(0.60 0.20 25)`)

### Typography

- **Headers**: `font-display` (Instrument Sans Variable) - bold, sharp, impactful
- **Body**: `font-sans` (Inter Variable) - clean, readable
- Use `font-display` class for all headings (`<h1>`, `<h2>`, etc.)

### Spacing & Radius

- Border radius: `--radius: 0.5rem` with variants (`--radius-sm`, `--radius-lg`, etc.)
- Consistent padding: 4, 6, 8 for small, medium, large containers

## Component Patterns

### Use shadcn/ui Components

Import from `@/components/ui/*`. Available components:
- `Button`, `Input`, `Label`, `Textarea`
- `Card`, `Badge`, `Separator`
- `DropdownMenu`, `Select`, `Combobox`
- `AlertDialog`, `Field`, `InputGroup`

### Component Guidelines

1. **No inline styles** - Use Tailwind classes exclusively
2. **Composition over configuration** - Build complex UI from simple primitives
3. **Consistent loading states** - Use `<Loader2 className="animate-spin" />` from lucide-react
4. **Error handling** - Display errors in styled boxes with `bg-destructive/10 border-destructive/20`

### Page Structure

```tsx
export function ExamplePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      {/* Content */}
    </div>
  );
}
```

## State Management

### Zustand (Client State)

- Store in `src/stores/*.store.ts`
- Use for UI state, auth user cache
- Keep stores minimal - prefer TanStack Query for server data

```ts
import { create } from 'zustand';

interface ExampleState {
  value: string;
  setValue: (value: string) => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

### TanStack Query (Server State)

- Query hooks in `src/hooks/use-*.ts`
- Use `queryKey` arrays for cache management
- Mutations with `useMutation` for POST/PATCH/DELETE

```ts
export function useExample() {
  return useQuery({
    queryKey: ['example'],
    queryFn: () => exampleApi.get(),
  });
}
```

## API Layer

### Structure

- `src/api/client.ts` - Base fetch wrapper with credentials
- `src/api/*.api.ts` - Endpoint modules (auth, users, interests)

### Conventions

1. All requests include `credentials: 'include'` for cookie auth
2. Base URL: `http://localhost:7007/api/v1`
3. Use typed functions, no `any`
4. Throw `ApiClientError` for non-OK responses

```ts
export async function getExample(): Promise<Example> {
  return apiGet<Example>('/example');
}
```

## Routing

### Route Guards

- `PublicOnlyRoute` - Redirects authenticated users away
- `ProtectedRoute` - Requires any authenticated user
- `ActiveUserRoute` - Requires active (approved) user status

### Protected Route Pattern

```tsx
{
  element: <ActiveUserRoute />,
  children: [
    {
      element: <PlatformLayout />,
      children: [
        { path: 'feature', element: <FeaturePage /> },
      ],
    },
  ],
}
```

## TypeScript Rules

1. **No `any`** - Use proper types or `unknown` with type guards
2. **Types match backend DTOs** - Keep `src/types/index.ts` in sync with backend
3. **Prefer interfaces** for object shapes, types for unions

## Styling Guidelines

### Tailwind Best Practices

1. **Dark mode first** - The app is dark mode only (class on `<html>`)
2. **Use CSS variables** - `bg-background`, `text-foreground`, `border-border`
3. **Responsive** - Mobile-first with `sm:`, `md:`, `lg:` breakpoints
4. **Hover/Focus states** - Always include `hover:`, `focus:` variants

### Common Patterns

```tsx
// Card with hover effect
<div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">

// Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Muted text
<p className="text-muted-foreground">
```

## Animation Guidelines

1. **Prefer CSS transitions** - `transition-colors`, `transition-transform`
2. **Use Tailwind animate classes** - `animate-pulse`, `animate-spin`
3. **Staggered reveals** - Use `animate-in` with `animation-delay` for page loads
4. **Keep animations subtle** - 200-300ms duration, ease-out timing

```tsx
// Staggered animation
<div className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: '100ms' }}>
```

## Code Style

1. **No comments unless requested** - Code should be self-documenting
2. **Concise components** - Extract reusable parts, avoid prop drilling
3. **SOLID/DRY principles** - Single responsibility, don't repeat yourself
4. **Named exports** - Prefer `export function X()` over default exports
5. **File naming** - kebab-case for files (`edit-profile.tsx`)

## Adding New Features

1. Create types in `src/types/index.ts`
2. Add API functions in `src/api/*.api.ts`
3. Create query hooks in `src/hooks/`
4. Build page in `src/pages/`
5. Add route in `src/routes/router.tsx`

## Testing Locally

```bash
npm run dev    # Start dev server
npm run build  # Type check + production build
npm run lint   # ESLint check
```

Backend API must be running at `localhost:7007` for auth and data to work.

