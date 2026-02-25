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

## Self-Review Before Committing

-   Read through your changes as if you were the reviewer
-   Check for consistency with similar existing code patterns
-   For test changes, verify completeness by comparing with related tests in the same file
-   Ensure naming clearly conveys intent (especially for boolean/flag variables)

