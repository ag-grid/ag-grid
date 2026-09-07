---
targets: ['*']
description: 'Keeping the Grid State docs page in sync with the GridState interface'
globs:
    [
        'packages/ag-grid-community/src/interfaces/gridState.ts',
        'packages/ag-grid-community/src/misc/state/stateService.ts',
    ]
---

# Grid State

## JSDoc on `GridState` is the docs page

The "State Contents" section of `documentation/ag-grid-docs/src/content/docs/grid-state/index.mdoc`
is generated from `gridState.ts` — there is no hand-maintained list any more. Whatever you write as
JSDoc on a state member is what a user reads on the docs page, so write it for them, not for the diff.

- Adding a section: give the new member a plain-prose JSDoc line naming the feature, and say so when
  the section only applies to some row models. Do not put markdown links in the JSDoc — the docs link
  belongs in the `more` entry of
  `documentation/ag-grid-docs/src/content/interface-documentation/grid-state/grid-state.json`, which
  renders as the row's "More Details" link. Add an entry there for any new section with its own docs
  page.
- Changing what a section carries: re-read its JSDoc. A description of the old contents is worse than
  none.
- Deprecating one: mark it `@deprecated` with the version and the replacement, as `rangeSelection` is.
