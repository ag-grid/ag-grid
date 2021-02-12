---
title: "Treemap Series"
---

Treemap series is used to render hierarchical data structures or trees, where each node in the
tree is represented by a rectangle, and the value of a node by the area of its rectangle.

The bigger the value, the bigger the rectangle is relative to its siblings. Also, parent nodes
are represented by rectangles with areas that are the totals of their children.

If the nodes have no value, then their area is divided equally among siblings within their parent node.

The Ag-Charts treemap series uses a popular "squarified" tiling algorithm which tries to keep
eash node's rectangle as square as possible.

Treemap series would be a great fit for visualizing a directory structure (the original purpose of
the algorithm), components of a stock market index, shares of products within product categories,
or sales breakdown by city, state, and country. And these are just a few examples.

## Stock Market Index Example

<chart-example title='Stock Market Index' name='stock-market-index' type='generated'></chart-example>

[[note]]
| Any treemap series covers the whole series area of a chart, so it doesn't make sense to have more than
| a single treemap series in a chart, even though it's technically supported.

## Organizational Chart Example

<chart-example title='Organizational Chart' name='org-chart' type='generated'></chart-example>

## API Reference

<api-documentation source='charts-api/api.json' section='treemap' config='{ "showSnippets": true }'></api-documentation>

## Next Up

Continue to the next section to learn about [bar and column series](../charts-bar-series/).
