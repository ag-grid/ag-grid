---
title: "Scrolling Scenarios"
---

Here we show examples of some unusual use cases of scrolling and the grid.

## Make scrollbars always visible

It is possible to show scrollbars even when there is not enough data to need scrolling. This avoids visual table 'jumps' when toggling short and long data sets. To make that work, use the [alwaysShowHorizontalScroll](/grid-options/#reference-scrolling-alwaysShowHorizontalScroll) and [alwaysShowVerticalScroll](/grid-options/#reference-scrolling-alwaysShowVerticalScroll) properties of the Grid.

<note>
| Windows and Mac OS both have settings to control scrollbar visibility. Some browsers respect these operating system scrollbar settings while others don’t. This is why you may need to adjust the scrollbar settings in your OS to have the above properties take effect.
| 
| Scrollbar visibility settings can be changed as follows:
|
| For Windows 10, go to `Settings ▸ Ease of Access ▸ Display`. 
| 
| For Windows 11, go to `Settings ▸ Accessibility ▸ Visual Effect`. 
|
| For Mac OS, go to `System Settings ▸ Appearance`.
</note>

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
