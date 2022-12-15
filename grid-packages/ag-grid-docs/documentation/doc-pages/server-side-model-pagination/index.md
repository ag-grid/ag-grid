---
title: "SSRM Pagination"
enterprise: true
---

If you are dealing with large amounts of data, your applications may decide to use pagination to help
the user navigate through the data.

## Enabling Pagination

Pagination is enabled in the grid via the `pagination` grid option. The pagination page size is
typically set alongside this using the `paginationPageSize` option. These options are shown below:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    // enables pagination in the grid
    pagination: true,
    // sets 10 rows per page (default is 100)
    paginationPageSize: 10,
}
</snippet>

For more configuration details see the section on [Pagination](/row-pagination/).

## Server-Side Pagination

The actual pagination of rows is performed on the server when using the Server-Side Row Model. When the grid needs more
rows it makes a request via `getRows(params)` on the [Server-Side Datasource](/server-side-model-datasource/) with 
metadata containing pagination details.

The properties relevant to pagination in the request are shown below:

```js
// IServerSideGetRowsRequest
{
    // first row requested
    startRow: number,

    // last row requested
    endRow: number,

... // other params
}
```

The `endRow` requested by the grid may not actually exist in the data so the correct `lastRowIndex` should be supplied
in the response to the grid. See [Server-Side Datasource](/server-side-model-datasource/) for more details.

## Example: Server-Side Pagination

The example below demonstrates server-side Pagination. Note the following:

- Pagination is enabled using the grid option `pagination=true`.
- A pagination page size of 10 (default is 100) is set using the grid option `paginationPageSize=10`.
- The number of rows returned per request is set to 10 (default is 100) using `cacheBlockSize=10`.
- Use the arrows in the pagination panel to traverse the data. Note the last page arrow is greyed
out as the last row index is only supplied to the grid when the last row has been reached.
- Open the browser's dev console to view the request supplied to the datasource.

<grid-example title='Server-Side Pagination' name='pagination' type='generated' options='{ "enterprise": true, "exampleHeight": 551, "extras": ["alasql"], "modules": ["serverside", "menu", "columnpanel"] }'></grid-example>

## Pagination with Groups

When grouping, pagination splits rows according to top-level groups only. This has the following implications:

- The number of pages is determined by the number of top-level rows and not children
- When groups are expanded, the number of pagination pages does not change.
- When groups are expanded, all children rows appear on the same page as the parent row.

The example below demonstrates pagination with grouping. Note the following:

- No block size is specified so 100 rows per block is used.
- Grid property `paginationAutoPageSize=true` is set. This means the number of displayed rows is automatically set to the number of rows that fit the vertical scroll, so no vertical scroll is present.
- As rows are expanded, the number of visible rows in a page grows. The children appear on the same row as the parent and no rows are pushed to the next page.
- For example, expand 'Australia' which will result in a large list for which vertical scrolling will be needed to view all children.

<grid-example title='Pagination with Groups' name='pagination-with-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 551, "extras": ["alasql"], "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Pagination with Child Rows

If it is desired to keep the row count exactly at the page size, then set grid property `paginateChildRows=true`.

This will have the effect that child rows will get included in the pagination calculation. This will mean if a group is expanded, the pagination will split the child rows across pages and also possibly push later groups into later pages.

The example below demonstrates pagination with grouping and `paginateChildRows=true`. Note the following:

- No block size is specified thus 100 rows per block is used.

- Grid property `paginationAutoPageSize=true` is set. This means the number of displayed rows is automatically set to the number of rows that fit the vertical scroll.

- As rows are expanded, the number of visible rows in each page is fixed. This means expanding groups will push rows to the next page. This includes later group rows and also its own child rows (if the child rows don't fit on the current page).

- If the last visible row is expanded, the grid gives a confusing user experience, as the rows appear on the next page. So the user will have to click 'expand' and then click 'next page' to see the child rows. This is the desired behaviour as the grid keeps the number of rows on one page consistent. If this behaviour is not desired, then do not use `paginationAutoPageSize=true`.

<grid-example title='Pagination with Child Rows' name='paginate-child-rows' type='generated' options='{ "enterprise": true, "exampleHeight": 551, "extras": ["alasql"], "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Row Selection](/server-side-model-selection/).

