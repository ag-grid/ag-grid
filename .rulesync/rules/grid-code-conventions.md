---
targets: ['*']
description: 'AG Grid-specific source code conventions (layered on the shared code-quality guide)'
globs: ['packages/*/src/**/*.ts', 'community-modules/*/src/**/*.ts', 'enterprise-modules/*/src/**/*.ts']
---

# AG Grid Source Conventions

Grid-specific rules for runtime source, layered on top of the shared [Code Quality Guide](.rulesync/rules/code-quality.md). Scoped to `src` so it loads only when editing grid source, not into the always-on project context.

## Prefer inline null checks over `_exists` / `_missing`

Do not use `_exists` / `_missing` in new code. They wrap a cheap null check in a function call and add a `!== ''` empty-string test that is usually unwanted:

```ts
export function _exists(value: any): boolean {
    return value != null && value !== '';
}
```

Inline the check instead:

- `value != null` — the common case (the `_exists` intent).
- `value == null` — the `_missing` intent.
- Add `&& value !== ''` only when an empty string genuinely must be excluded.

Leave existing call sites alone unless you're already changing that code — this is a rule for new code, not a repo-wide sweep.
