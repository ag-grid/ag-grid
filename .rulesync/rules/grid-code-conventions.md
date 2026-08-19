---
targets: ['*']
description: 'AG Grid-specific source code conventions (layered on the shared code-quality guide)'
globs: ['packages/*/src/**/*.ts', 'community-modules/*/src/**/*.ts', 'enterprise-modules/*/src/**/*.ts']
---

# AG Grid Source Conventions

Grid-specific rules for runtime source, layered on top of the shared [Code Quality Guide](code-quality.md). Scoped to `src` so it loads only when editing grid source, not into the always-on project context.

## Coding style

Enforced by ESLint plus team preferences.

- Always use braces for `if/else/for/while/do`.
- Cache repeated field access in a local — performance requirement.
- Canonical array loop: `for (let i = 0, len = a.length; i < len; ++i)`. No `Array.forEach`. `Map.forEach` is fine.
- No lonely `if` — use guard returns, `if/else if`, or ternaries. Applies to loops too.
- No nested ternaries — extract to a named variable.
- No short-circuit side effects (`cond && fn()`). No assignments in expressions.
- No `for...in`. Use `Object.keys()` + index loops; prefer `Object.keys()` over `Object.entries()` when values aren't needed.
- No static class properties — use module-level constants.
- Explicit access modifiers on every class member; `readonly` when not reassigned.
- Destructure only for 2+ fields; single field uses dot access.
- `import type` for compile-time-only imports; separate `import type { Foo }` statements, no inline `{ type Foo, Bar }`.

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

## Guard deferred work against teardown

When a `setTimeout` / `requestAnimationFrame` / promise callback runs later than the code that scheduled it, the component may have been destroyed in the meantime. If the callback touches component state, dispatches events, or drives grid behaviour (e.g. `stopEditing`, focus, navigation), guard the body:

```ts
setTimeout(() => {
    if (!this.isAlive()) {
        return;
    }
    // ...deferred work
});
```

Only needed when the callback reaches back into the component or grid — self-contained deferred work does not need the guard.
