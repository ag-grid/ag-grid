# Prompt

Add a 'Reset columns' button that sets column widths and anything else the user has done to the column e.g order, back to the how it was the first time the app is used

# Expected

A button that calls `api.resetColumnState()`

Clearing the saved `localStorage` entry is not required (resetting column state will trigger onStateUpdated) but is not wrong.

Wrong: `location.reload()`; remounting the grid with a changed `key`; a hardcoded array of default
widths duplicated from the column definitions; leaving the pre-reset widths in storage so a reload
undoes the reset.

Wrong: `api.applyColumnState()`
