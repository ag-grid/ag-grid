---
title: "Rendering API"
---

Displayed rows are rows that the grid tries to render. For example, if you have a group that is closed, the children of that group will not appear in the displayed rows. The grid renders the displayed rows onto the screen.

The displayed rows have indexes. For example, if the grid is rendering 20 rows, then will have indexes 0 to 19.

You can look up the rows by index. This is dependent on anything that changes the index. For example, if you apply a sort or filter, then the rows and corresponding indexes will change.

## Displayed Rows API

<api-documentation source='grid-api/api.json' section="displayedRows"></api-documentation>

## Accessing Displayed Rows Example

The example below demonstrates the following:

- **Get Displayed Row 0:** Returns back the first row in the grid. This is not impacted by what page you are one, eg if you navigate to the second page, this method will still return the first row on the first page. If you sort, the first row will be changed.

- **Get Displayed Row Count:** Returns back the total number of rows across all pages. If you filter, this number will change accordingly.

- **Print All Displayed Rows:** Demonstrates looping through all rows on the screen across all pages.

- **Print Page Displayed Rows:** Demonstrates looping through all rows on the screen on one page.

<grid-example title='Get Displayed Row' name='get-displayed-row' type='generated'></grid-example>

## Displayed Rows & Grouping

When grouping, displayed rows are those rows that are currently visible with regards the the open / closed state of the parent rows.

In the example below `getDisplayedRowCount()` will return back 7. This is composed of 5 top level 'Language' rows and two second level 'Country' rows. Each of the 7 displayed rows will have a row index from 0 to 6. All rows not displayed (as they are contained within closed groups) are not displayed and do not have a row index.

<image-caption src="rendering-api/resources/rowGroups.png" alt="Row Groups" width="40rem" centered="true"></image-caption>

## Displayed Rows & Loading


If using [Server-Side Row Model](/server-side-model/) or [Infinite Row Model](/infinite-scrolling/), the `getDisplayedRowCount()` will include the 'loading rows'. This is because Displayed Rows are a concern of the grid's rendering engine and not the underlying data. As far as the rendering engine is concerned, the 'loading row' is just another row to render.

For example, calling `getDisplayedRowCount()` below will return 5 as there are 4 normal rows and 1 loading row.

<image-caption src="rendering-api/resources/serverSideLoading.png" alt="Server Side Loading" width="38rem" centered="true"></image-caption>

