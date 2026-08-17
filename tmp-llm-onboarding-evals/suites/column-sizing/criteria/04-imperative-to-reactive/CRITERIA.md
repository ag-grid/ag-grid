# Prompt

The columns fill the width when the page first loads, but when I resize the browser window they keep their old widths and I'm left with either a gap on the right or a horizontal scrollbar. They should always fill the width.

# Expected

The `onFirstDataRendered` handler is removed and `flex: 1` is set on `defaultColDef`.

This is the only correct answer. `sizeColumnsToFit` documents that it should not be called rapidly in response to resize, because the scrollbar flickers, and names column flex as the remedy.

Wrong, specifically including the near-misses: re-invoking `api.sizeColumnsToFit()` from `onGridSizeChanged`, which fires continuously while the window is dragged and is the documented anti-pattern — as is the same call behind a debounce or throttle, which treats the symptom rather than the cause; `window.addEventListener('resize')`; `ResizeObserver`; storing the container width in React state; re-rendering the grid on resize.
