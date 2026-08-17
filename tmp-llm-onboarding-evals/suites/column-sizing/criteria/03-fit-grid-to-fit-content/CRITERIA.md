# Prompt

Columns are currently scaled to fill the width of the grid, which makes some of them much wider than their contents. Size each column to its own content instead.

# Expected

The existing `autoSizeStrategy.type` changes from `'fitGridWidth'` to `'fitCellContents'`, in place. Retaining or dropping `defaultMinWidth` are both fine.

Wrong: adding `flex`; adding `sizeColumnsToFit`, `autoSizeColumns` or `autoSizeAllColumns` calls alongside it; keeping both behaviours; adding `scaleUpToFitGridWidth`, which reintroduces the width-filling the prompt asked to drop.
