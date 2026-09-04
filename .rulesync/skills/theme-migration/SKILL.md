---
targets: ['*']
name: theme-migration
description: 'Convert a legacy (v32) AG Grid theme customisation to the Theming API. Use when an application sets `--ag-*` CSS variables, imports `ag-grid-community/styles/*.css`, uses an `ag-theme-*` class or the Sass API, when grid styling silently has no effect, or when a user reports error/warning #106, #239 or #332.'
---

# Migrating a legacy theme to the Theming API

Turns a v32-style customisation (CSS variables, `ag-theme-*` classes, Sass API) into a
`themeQuartz.withParams({ ... })` call, and reports the variables that have no equivalent.

Legacy variables are **silently ignored** under the Theming API — the grid never reads them. That is
what makes this migration worth doing mechanically rather than by eye: a customisation can look
applied and do nothing.

## Source of truth

`documentation/ag-grid-docs/src/content/docs/theming-migration/index.mdoc` holds the authoritative
mapping. **Read it before converting anything** — do not migrate from memory, and do not copy its
table into this skill; it is maintained with the code and this file is not.

It splits variables into four groups, and each needs different handling:

1. **Direct replacements** — a 1:1 rename (`--ag-control-panel-background-color` →
   `chromeBackgroundColor`). Convert straight across.
2. **Key changes with different semantics** — `--ag-grid-size` → `spacing` is *not* a rename:
   grid size set element sizes, spacing sets padding around them. `spacing: 0` gives a padding-less
   grid; `--ag-grid-size: 0` gave zero-height rows. Never emit a numerically equal value here — say
   the semantics changed and let the user pick.
3. **Reworked groups** — borders, checkboxes, the sidebar, toggle buttons, icons. One legacy
   variable does not map to one parameter; link the relevant docs page instead of guessing.
4. **Removed with no replacement** — report these explicitly with "use a CSS rule", never invent a
   parameter name for them.

The runtime warning (#332) covers only the small subset of group 1/2 variables whose replacement is
unambiguous; it is not the mapping. It lives in
`packages/ag-grid-community/src/validation/rules/themeValidations.ts`.

## Procedure

1. **Collect the inputs.** The user's CSS variable declarations, any `ag-theme-*` class rules, Sass
   `@include ag-theme-*` calls, and the grid's `theme` grid option if already set.
2. **Check for the mixed-system mistake first.** If the app both imports a legacy stylesheet
   (`ag-grid-community/styles/ag-grid.css` or `ag-theme-*.css`) *and* uses the Theming API, that is
   error #106/#239 and must be fixed before anything else — remove the CSS imports, or set
   `theme: 'legacy'` to stay on the old system deliberately.
3. **Reduce Sass usage to variables before classifying it.** There is no parameter-by-parameter Sass
   mapping to work from — the migration page's Sass section says only to stop using the Sass API — so
   do not translate a mixin argument by its resemblance to a parameter name. Instead take each key of
   the `@include` parameter map and look for the legacy variable of the same name (`foreground-color`
   → `--ag-foreground-color`) **in the migration page's tables**. A key that appears there is
   classified and converted like any other variable; a key that does not is reported as
   unconverted — name it, and ask the user for the compiled CSS or the theme's rendered
   `--ag-*` values rather than inferring what it set. The Sass API's own mixins, functions and
   `$params` plumbing are then deleted, not migrated: the Theming API replaces the mechanism.
4. **Classify each variable** into the four groups above.
5. **Emit the theme.** Kebab-case CSS names become camelCase parameters
   (`--ag-tooltip-text-color` → `tooltipTextColor`). Verify every parameter name you emit exists —
   the `CoreParams` type in `packages/ag-grid-community/src/theming/core/core-css.ts` is the list;
   `withParams` is typed, so a wrong name is a compile error for the user, not a silent no-op.
6. **Report what could not be converted**, grouped: semantics changed, needs a CSS rule, needs a
   docs page. Do not quietly drop a variable the user set.
7. **Offer the CSS alternative.** Parameters can equally be set as `--ag-*` CSS variables of the
   *new* names; the JS form is only preferred because it is type-checked. Users with a build that
   cannot import the theme object should get the CSS form.

## Output shape

```js
import { themeQuartz } from 'ag-grid-community';

const myTheme = themeQuartz.withParams({
    accentColor: 'red', // was --ag-alpine-active-color
    chromeBackgroundColor: '#f8f8f8', // was --ag-control-panel-background-color
});
```

Followed by the unconvertible list, e.g.:

- `--ag-grid-size: 4px` — `spacing` is the nearest parameter, but it sets the padding around elements
  where grid size set the elements themselves, so there is no value that reproduces this. Pick a
  `spacing` from how the grid should look, starting from the theme default rather than from `4px`.
- `--ag-secondary-border-color` — removed; target the specific border with a CSS rule.

## Do not

- Guess a parameter name that is not in `CoreParams` or the migration docs page.
- Convert a group-3 variable (borders, checkboxes, sidebar, toggle buttons, icons) 1:1.
- Translate a Sass mixin argument that you cannot find as a legacy variable on the migration page.
- Leave the legacy CSS imports in place alongside the new theme.
