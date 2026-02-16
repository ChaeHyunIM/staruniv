# Project Guidelines

## SolidJS / SolidStart Reference Priority

When writing code related to Solid or SolidStart, always follow this reference priority:

1. **First**: Trigger `/solidjs` skill for quick reference on Solid core patterns (reactivity, control flow, stores, etc.)
2. **Second**: Read the docs at `../solid-docs/` — search for relevant documentation files by keyword
3. **Third**: If solid-docs lacks sufficient information, refer to the actual source code at `../solid/` (SolidJS core)
4. **Fourth**: For SolidStart-specific features, refer to `../solid-start/` for actual code references by keyword

## Bun Reference

When writing code related to Bun features (runtime, bundler, package manager, test runner, APIs, etc.), refer to `../bun-llms-full.txt` for documentation and usage details.

## Dependency Policy

Avoid installing third-party libraries as much as possible. Always prioritize solving problems within the capabilities of the following stack:

- **Bun** (runtime, built-in APIs, test runner, etc.)
- **SolidJS / SolidStart** (framework built-in features)
- **PostgreSQL** (built-in DB features, functions, extensions)

The following areas must use SolidJS / SolidStart built-in features first:

- **Data fetching / mutation**: Use SolidStart built-in primitives such as `createResource`, `createAsync`, `action`, `cache`
- **Rendering strategy**: Use SolidStart built-in rendering strategies (SSR, SSG, streaming, etc.)
- **State management**: Use Solid built-in reactivity system (`createSignal`, `createStore`, `createContext`, etc.)
- **Control flow**: Use Solid built-in control flow components (`<For>`, `<Show>`, `<Switch>`/`<Match>`, `<Index>`, `<Dynamic>`, `<Portal>`, `<Suspense>`, `<ErrorBoundary>`, etc.) for conditional and iterative rendering
- **CSS**: Do not use CSS libraries or preprocessors (Tailwind, Sass, etc.). Use vanilla CSS + CSS Modules (`.module.css`) and actively leverage modern CSS features with sufficient browser support (CSS nesting, `container queries`, `has()`, `color-mix()`, custom properties, `@layer`, `@scope`, logical properties, etc.)

When unsure if a feature is supported, search the reference paths specified above (`../solid-docs/`, `../solid/`, `../solid-start/`, `../bun-llms-full.txt`) directly. Only consider third-party libraries when the stack cannot handle the implementation.

## UI/UX Development

When building or modifying any UI/UX (components, pages, layouts, styling), always trigger the following skills:

1. `/frontend-design` — for creating distinctive, production-grade frontend interfaces with high design quality
2. `/web-design-guidelines` — for reviewing UI code against Web Interface Guidelines (accessibility, UX audit, best practices)

## Code Comments

All comments in code must be written in Korean.

## Dev Server / Build

Do not run the dev server (`vinxi dev`, `bun run dev`) or build (`vinxi build`, `bun run build`) after completing a task. The user will handle this manually.
