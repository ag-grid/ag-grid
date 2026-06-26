---
targets: ['*']
name: technology-stack
description: 'Technology choices and architectural constraints for AG Grid. Use when choosing technologies, adding dependencies, or understanding zero-dependency requirements.'
---

# Technology Stack

This document outlines the technology choices and constraints for the AG Grid codebase.

## Core Principles

### Zero Runtime Dependencies

The main AG Grid libraries (`ag-grid-community`, `ag-grid-enterprise`) must have **ZERO third-party runtime dependencies**. This ensures:

- Minimal bundle size for end users
- No dependency conflicts
- Complete control over behaviour
- Predictable performance characteristics

### Framework Agnostic Core

The core grid logic is framework-agnostic. Framework-specific wrappers (`ag-grid-react`, `ag-grid-angular`, `ag-grid-vue3`) provide integrations while the core remains pure TypeScript.

## Build System

- **Nx**: Monorepo orchestration and build caching
- **Yarn**: Package management (v1.x)
- **TypeScript**: Strict mode enabled across all packages
- **ESBuild/Rollup**: Bundle generation

## Runtime Technologies

### Rendering

- **Virtual DOM**: Custom high-performance rendering engine
- **CSS-in-JS**: Avoided - use CSS modules and traditional stylesheets
- **Canvas**: Used only for specific features (e.g., sparklines)

### State Management

- Custom internal state management - no external libraries

## Testing Technologies

- **Vitest**: Unit, integration, and behavioural testing (`testing/angular-tests` still uses Jest)
- **Playwright**: E2E testing, and the default engine for behavioural benchmarks (`./benches.sh`)
- **jsdom**: DOM simulation for unit tests

## Code Style

- **ESLint**: Linting with custom rules
- **Prettier**: Code formatting (via `yarn nx format --sort-root-tsconfig-paths=false`)
- **TypeScript Strict Mode**: Enforced across all packages

## Browser Support

- Modern browsers only (ES2020 target)
- No IE11 support
- See browserslist configuration for specifics

## Documentation

- **Astro**: Static site generation for documentation
- **MDX/Markdoc**: Documentation content format
