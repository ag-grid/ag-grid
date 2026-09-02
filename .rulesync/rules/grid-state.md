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

## The docs page is part of the change

`GridState` is public API, and its sections are enumerated by hand in the "State Contents" list on
`documentation/ag-grid-docs/src/content/docs/grid-state/index.mdoc`. Nothing generates that list and
nothing fails when it drifts, so adding, removing or renaming a state section — a top-level
`GridState` property or a field of one of its sub-states — is not finished until the list matches.

- Adding a section: add a bullet, linking the feature's own docs page where one exists, and say so
  when the section only applies to some row models.
- Removing or deprecating one: delete its bullet. Deprecated sections stay out of the list, as
  `rangeSelection` does.
- Changing what a section carries: re-read its bullet. A bullet that describes the old contents is
  worse than a missing one.

The interface documentation below the list is generated from `gridState.ts`, so JSDoc on the new
member is what a reader sees there — write it for them, not for the diff.
