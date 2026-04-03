---
targets: ['*']
description: 'Code quality practices including avoiding bloat, comment guidelines, and review practices'
globs: ['packages/*/src/**/*.ts']
---

# Code Quality Guide

This guide covers code quality practices, including avoiding code bloat, comment guidelines, and code review practices.

## Avoid Code Bloat

-   **No redundant computed values**: Store only base data, compute derived properties via functions/getters
-   **No dead code**: Remove unused methods, parameters, or properties
-   **Extract duplication**: If the same logic appears twice, extract it to a helper function
-   **Simplify conditionals**: Consolidate repeated if/else branches, use early returns
-   **Serialize cleanly**: Add `toJSON()` methods to classes to avoid exposing internal structure in snapshots

## Comment Guidelines

-   **Explain WHY, not WHAT**: Code should be self-documenting; comments explain reasoning
-   **Keep OPTIMIZATION comments**: These explain performance trade-offs and design decisions
-   **Concise JSDoc**: Simple getters/setters don't need JSDoc; complex methods do
-   **Remove obvious comments**: Don't restate what the code clearly shows
-   **Trust good naming**: Well-named variables and methods reduce need for comments
-   **Examples in JSDoc**: Complex methods benefit from usage examples in documentation

## Code Review Guidelines

-   When reviewing a PR, don't comment on lines not changed in the PR itself; we have tech-debt but can't fix it all at once.
-   **For test changes**:
    -   Ensure tests exercise real implementations, not test-only helper functions
    -   Verify consistency: if similar tests check X, all related tests should check X
    -   Look for opportunities to improve test coverage without adding redundancy
-   **For documentation changes**:
    -   Follow documentation guidelines for structure and patterns
    -   Ensure examples are framework-compatible
    -   Verify technical accuracy against TypeScript definitions

## Design and Modularity

-   **Single responsibility**: Each function, class, and file should have one clear purpose. If you struggle to name it, it's doing too much.
-   **Small, focused functions**: Prefer short functions (under ~30 lines) that do one thing well. Extract named helpers rather than adding branches to an existing function.
-   **Composition over inheritance**: Build behaviour by composing small pieces, not deep class hierarchies.
-   **Dependency direction**: Lower-level modules must not import from higher-level modules. Follow the build dependency chain; never create circular imports.
-   **File organisation**: Group by feature or domain, not by type. A new feature's implementation, types, and tests should be co-located.
-   **Minimal public surface**: Export only what consumers need. Keep helpers and internal state private.
-   **Prefer pure functions**: Where practical, write functions that take inputs and return outputs without mutating shared state. This makes code easier to test and reason about.

## Import Hygiene

-   **No re-exports for internal APIs**: When moving code between internal packages, update every consumer to import from the new canonical location. Do not leave re-exports at the old path — they add indirection, obscure where code lives, and can hinder tree-shaking.
-   **Direct imports only**: Internal packages should import from the source package directly. Only the public types package defines the user-facing API contract.
-   **Type-only imports**: Use `import type` for types that are only needed at compile time — these are erased and have zero runtime cost.

## Refactoring Safety

-   **Grep all consumers before removing/relocating exports**: Before removing or moving an export, search the entire codebase for all import sites. Pre-existing consumers outside the files you're modifying are easy to miss.
-   **Run `build:types` before committing**: After any export relocation, run type checks across affected packages to catch broken imports before they reach CI.

## Self-Review Before Committing

-   Read through your changes as if you were the reviewer
-   Check for consistency with similar existing code patterns
-   For test changes, verify completeness by comparing with related tests in the same file
-   Ensure naming clearly conveys intent (especially for boolean/flag variables)

