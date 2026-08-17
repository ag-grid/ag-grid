# Prompt

Add a 'Reset widths' button that sets column widths back to the values they would have the first time the app is used

# Expected

A button that calls `api.applyColumnState({ state: ... })` where the state is derived from the same place as the column definition state - either from the coldefs themselves, or from a shared source of truth

Clearing the saved `localStorage` entry is not required (applying column will trigger onStateUpdated) but is not wrong.

Wrong: `location.reload()`; remounting the grid with a changed `key`; a hardcoded array of default
widths duplicated from the column definitions; leaving the pre-reset widths in storage so a reload
undoes the reset.

Wrong: `api.resetColumnState()`, also resets other column properties
