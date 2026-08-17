# Prompt

There's empty space to the right of the last column. Any columns not explicitly resized by the user should have space divided between them in proportion to their default width. This will make them larger or smaller than the default width, depending on how much available space there is. If the page is resized, then the columns without explicit width should adjust to continue to fill the available width. Don't let any column be less than 80 pixels wide.

# Expected

Columns with a saved width get that width. Columns without one get `flex` set to their default width, so the unpinned columns divide the leftover space in proportion to their defaults and re-divide when the grid is resized. `minWidth: 80` on `defaultColDef` or on each column supplies the floor. `flex` set to a default width is correct here — the defaults are proportional by intent, which is what the prompt asks for.

The resize handler must also ignore flex-driven resizes, which arrive with `finished: true` and `source: 'flex'`. Without that guard the store fills with flex-computed widths on the first grid resize and every flex column becomes permanently fixed. A source check or an `event.flexColumns` check is enough. Right column definitions but no guard is the correct approach, incomplete — say so.

Wrong: `sizeColumnsToFit` or `autoSizeStrategy` as the mechanism, including re-invoking either from `onGridSizeChanged`, a window resize listener or a `ResizeObserver`, since the prompt requires continuous re-division; `flex` on columns that have a saved width, which turns a stored pixel width into a ratio; a uniform `flex: 1`, which divides equally instead of by default width; computing the distribution by hand from container measurements; replacing the application's width store with `initialState`/`onStateUpdated`.
