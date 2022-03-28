---
title: "Row Pagination"
---

Pagination allows the grid to paginate rows, removing the need for a vertical scroll to view more data.

To enable pagination set the grid property `pagination=true`.

<grid-example title='Client Paging' name='client-paging' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

## Supported Row Models

Pagination in AG Grid is supported in [all the different row models](/row-models/). The [Client-Side Row Model](/client-side-model/) (the default row model) is used for the examples on this page.


To see the specifics of pagination on the other row models check the relevant documentation for [Infinite Row Model](/infinite-scrolling/#pagination), [Viewport Row Model](/viewport/#example-viewport-with-pagination) and [Server-Side Row Model](/server-side-model-pagination/).

## Features While Using Pagination

Pagination does not reduce the feature set of the grid, as long as the underlying row model supports it. In other words, if you are paging over the Client-Side Row Model, all features of the Client-Side Row Model (grouping, filtering etc) are still available. Likewise for the other row models, if the row model supports it, it's available through pagination and that row model.

## Number Formats

The numbers within the Paging Toolbar can be formatted by replacing the thousand and decimal separators. This can be achieved by customising localisation, for more info see [Localisation](/localisation/).

## Example: Auto Page Size

If you set `paginationAutoPageSize=true` the grid will automatically show as many rows in each page as it can fit. This is demonstrated below. Note if you resize the display area of the grid, the page size automatically changes. To view this, open the example up in a new tab and resize your browser.


<grid-example title='Auto Page Size' name='auto-page-size' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

[[note]]
| Each pagination page must have the same number of rows. If you use `paginationAutoPageSize` with
| [getRowHeight()](/row-height/#getrowheight-callback) callback (to have different
| rows with different heights) then the page height will be calculated using the default row height and not
| the actual row heights. Therefore the rows will not fit perfectly into the page if these features are mixed.

## Example: Customising Pagination

In this example the default pagination settings are changed. Note the following:

- `paginationPageSize` is set to 10
- `api.paginationGoToPage(4)` is called to go to page 4 (0 based, so the 5th page)
- A dropdown to change the page size dynamically is available. This makes a call to `paginationSetPageSize(newPageSize)`
- The numbers in the pagination panel are formatted differently using the grid callback `paginationNumberFormatter` and putting the numbers into square brackets i.e. [x].

<grid-example title='Custom Paging' name='custom-paging' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

## Example: Custom Pagination Controls

If you set `suppressPaginationPanel=true`, the grid will not show the standard navigation controls for pagination. This is useful is you want to provide your own navigation controls.

In the example below you can see how this works. Note that we are listening to `onPaginationChanged` to update the information about the current pagination status. We also call methods on the pagination API to change the pagination state.

A summary of the API methods and events can be found at the top of this documentation page.

The example also sets property `suppressScrollOnNewData=true`, which tells the grid to NOT scroll to the top when the page changes.

<grid-example title='Custom Controls' name='custom-controls' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

## Pagination & Child Rows

Both [Row Grouping](/grouping/) and [Master Detail](/master-detail/) have rows that expand. When this happens, consideration needs to be given as to how this impacts the number of rows on the page. There are two modes of operation that can be used depending on what your application requirements.

### Mode 1: Paginate Only Top Level Rows

The first mode is the default. The rows are split according to the top level rows. For example if row grouping with a page size of 10, then each page will contain 10 top level groups. When expanding a group with this mode, all children for that group, along with the 10 original groups for that page, will get display in one page. This will result in a page size greater than the initial page size of 10 rows.


This mode is typically best suited for Row Grouping as children are always displayed alongside the parent group. It is also typically best for Master Detail, as detail rows (that typically contain detail tables) will always appear below their master rows.

In the example below, note the following:

- Each page will always contain exactly 10 groups.
- Expanding a group will not push rows to the next page.

<grid-example title='Grouping Normal' name='grouping-normal' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

### Mode 2: Paginate All Rows, Including Children

The second mode paginates all rows, including child rows when Row Grouping and detail rows with Master Detail. For example if row grouping with a page size of 10, then each page will always contain exactly 10 rows, even if it means having children appear on a page after the page containing the parent. This can be particularly confusing if the last row of a page is expanded, as the children will appear on the next page (not visible to the user unless they navigate to the next page).

This modes is typically best if the application never wants to exceed the maximum number of rows in a page past the page size. This can be helpful if designing for touch devices (eg tablets) where UX requirements state no scrolls should be visible in the application - paging to a strict page size can guarantee no vertical scrolls will appear.

To enable pagination on all rows, including children, set grid property `paginateChildRows=true`.

In the example below, note the following:

- Each page will always contain exactly 10 rows (not groups).
- Expanding a group will push rows to the next page to limit the total number of rows to 10.

<grid-example title='Grouping Paginate Child Rows' name='grouping-paginate-child-rows' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ] }'></grid-example>

### Fallback to Mode 2

If using either of the following features, the grid will be forced to use the second mode:

- [Hide Open Parents](/grouping/#hide-open-parents)
- [Group Remove Single Children](/grouping/#removing-single-children)

This is because both of these features remove top level rows (group rows and master rows) from the displayed rows, making it impossible to paginate based on the top level rows only.

## Pagination Properties

<api-documentation source='grid-properties/properties.json' section='pagination'></api-documentation>

The following methods compose the pagination API are all available from `gridOptions.api`

## Pagination API

<api-documentation source='grid-api/api.json' section='pagination'></api-documentation>


## Pagination Callbacks

<api-documentation source='grid-properties/properties.json' section='pagination' names='["paginationNumberFormatter"]'></api-documentation>

## Pagination Events

<api-documentation source='grid-events/events.json' section='pagination' names='["paginationChanged"]'></api-documentation>


