---
title: "Scrolling Scenarios"
---

Here we show examples of some unusual use cases of scrolling and the grid.

## Make scrollbars always visible

It is possible to show scrollbars even when there is not enough data to need scrolling. This voids visual table 'jumps' when toggling short and long data sets. To make that work, override the `overflow` of the `.ag-body-viewport` to `scroll !important`. The `!important` is necessary to override the inline styling.

<grid-example title='Always visible scrollbars' name='scrollbars' type='generated'></grid-example>


## Auto Height, Full Width & Pagination

Shows the autoHeight feature working with fullWidth and pagination.

- The fullWidth rows are embedded. This means:
    - Embedded rows are chopped into the pinned sections.
    - Embedded rows scroll horizontally with the other rows.
- There are 15 rows and pagination page size is 10, so as you go from one page to the other, the grid re-sizes to fit the page (10 rows on the first page, 5 rows on the second page).

<grid-example title='Auto Height & Full Width' name='auto-height-full-width' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ], "noStyle": 1 }'></grid-example>

## Expanding Groups & Vertical Scroll Location

Depending on your scroll position the last item's group data may not be visible when clicking on the expand icon.

You can resolve this by using the function `api.ensureIndexVisible()`. This ensures the index is visible, scrolling the table if needed.

In the example below, if you expand a group at the bottom, the grid will scroll so all the children of the group are visible.

<grid-example title='Row Group Scroll' name='row-group-scroll' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>
