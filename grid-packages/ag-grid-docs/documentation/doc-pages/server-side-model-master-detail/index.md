---
title: "SSRM Master Detail"
enterprise: true
---

This section shows how the Server-Side Row Model can be configured with a Master / Detail view.

The ability to nest grids within grids is commonly referred to as Master / Detail.
Here the top-level grid is referred to as the 'master grid' and the nested grid is referred to as the 'detail grid'.

Master / Details is configured the same way for the Server-Side Row Model and the Client-Side Row Model.
For a comprehensive look at Master / Detail configurations, see: [Client-Side Master / Detail](/master-detail/).

Because the configuation is already discussed in [Client-Side Master / Detail](/master-detail/),
this pages focuses on areas that are of particular interest to this Server-Side version.

## Enabling Master / Detail

To enable Master / Detail, you should set the following grid options:

- **masterDetail:** Set to `true` to inform the grid you want to allow expanding of rows to reveal detail grids.
- **detailGridOptions:** The grid options to set for the detail grid. The detail grid is a fully featured instance of AG Grid, so any configuration can be set on the detail grid that you would set any other grid.
- **getDetailRowData:** A function you implement to provide the grid with rows for display in the detail grids.

These grid options are illustrated below:


<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    // master grid columns
|    columnDefs: [],
|
|    // use the server-side row model
|    rowModelType: 'serverSide',
|
|    // enable master detail
|    masterDetail: true,
|
|    detailCellRendererParams: {
|        detailGridOptions: {
|            // detail grid columns
|            columnDefs: [],
|        },
|        getDetailRowData: params => {
|            // supply data to the detail grid
|            params.successCallback(params.data);
|        }
|    },
|}
</snippet>

[[note]]
| Note that the nested detail grid can be configured to use any Row Model.

## Example: Infinite Scrolling with Master / Detail

This example shows a simple Master / Detail with the Server-Side Row Model. From this example notice the following:

- **masterDetail** - is set to `true` in the master grid options.
- **detailCellRendererParams** - specifies the `detailGridOptions` to use and `getDetailRowData` extracts the data for the detail row.
- **cellRenderer: 'agGroupCellRenderer'** - is used to provide expand / collapse icons on the master rows.

<grid-example title='Infinite Scrolling with Master / Detail' name='infinite-scrolling' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["serverside", "clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Combining Row Grouping with Master Detail

It is possible to combine [Server-Side Grouping](/server-side-model-grouping/) with Master Detail.

The following snippet shows row grouping on the 'country' column by setting `rowGroup = true`:

<snippet suppressFrameworkContext="true">
|const gridOptions = {
|    columnDefs: [
|        { field: 'country', rowGroup: true },
|
|        // more column definitions
|    ]
|}
</snippet>

## Example: Row Grouping with Master Detail

Below shows Row Grouping combined with Master / Detail. From the example you can notice the following:

- **rowGroup** - is set to `true` on the 'country' column definition.
- **masterDetail** - is set to `true` to enable Master / Detail.
- **detailCellRendererParams** - specifies the `detailGridOptions` to use and `getDetailRowData` extracts the data for the detail row.
- **autoGroupColumnDef** - is used to specify which column in the master row should be included in the group hierarchy.

<grid-example title='Row Grouping with Master Detail' name='row-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "clientside", "masterdetail", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

### Expanding Master Rows

Normally parent rows (groups) can be expanded and child rows cannot be expanded (unless they are themselves parents). This means that normally only parent rows have expand / collapse icons.

For Master / Detail, expand and collapse icons are also needed at the master level. When doing Master / Detail, expand and collapse icons are also needed to expand the child rows where those rows are also master rows.

Rather than use the `autoGroupColumnDef` for the master rows as shown in the example above, simply specify a group cell renderer on the column that should show the expand / collapse icons.

This is shown in the code snippet below:

<snippet suppressFrameworkContext="true">
|const gridOptions = {
|    columnDefs: [
|        { field: 'country', rowGroup: true },
|        { field: 'accountId', maxWidth: 200, cellRenderer: 'agGroupCellRenderer' },
|
|        // more column definitions
|    ]
|}
</snippet>

## Detail Row Height

The height of detail rows can be configured in one of the following ways:

1. Using the `detailRowHeight` grid option property to set a fixed height for each detail row.
1. Using the `getRowHeight()` grid option callback to explicitly set height for each row individually. This callback will need to work out the pixel height of each detail row.
1. Using the `detailRowAutoHeight=true` property to let the grid automatically size the detail rows / grids to fit their rows.

The following snippets compares these approaches:

Option 1 - fixed detail row height, sets height for all details rows
<snippet>
const gridOptions = {
    detailRowHeight: 500,
}
</snippet>

Option 2 - dynamic detail row height, dynamically sets height for all rows
<snippet>
|const gridOptions = {
|    getRowHeight: params => {
|        const isDetailRow = params.node.detail;
|
|        // not that this callback gets called for all rows, not just the detail row
|        if (isDetailRow) {
|            // dynamically calculate detail row height
|            return params.data.children.length * 50;
|        }
|        // for all non-detail rows, return 25, the default row height
|        return 25;
|    }
|}
</snippet>

Option 3 - use autoHeight
<snippet>
|const gridOptions = {
|    detailCellRendererParams: {
|        autoHeight: true,
|    }
|}
</snippet>

[[note]]
| Purging the cache and dynamic row heights do not work together for the Server-Side Row Model.
| If you are using dynamic row height, ensure `maxBlocksInCache` is not set.

### Example Using Callback getRowHeight()

The following example explicitly sets detail row heights based on the number of detail rows. Note the following:

- **getRowHeight()** - is implemented to size detail rows according to the number of records.
- **node.detail** - is used to identify 'detail' row nodes.


<grid-example title='Dynamic Detail Row Height' name='dynamic-detail-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

See [Master Detail Dynamic Height](/master-detail-height/#dynamic-height) for more details.

### Example Using Property autoHeight

The following example gets the grid to auto-size all details sections to fit their rows. This is done by setting `masterGridOptions.detailRowAutoHeight = true`.


<grid-example title='Auto Detail Row Height' name='auto-detail-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

See [Master Detail Auto Height](/master-detail-height/#auto-height) for more details.


## Lazy Loading Detail Rows

In the examples above, the data for the detail grid was returned with the master row. However it is also possible to lazy-load data for the detail row, see: [Providing Rows](/master-detail-grids/#providing-rows).

However note that detail rows will be purged once the master row is closed, or if the detail row leaves the viewport through scrolling. In both cases data will need to be fetched again.

## Next Up

Continue to the next section to learn how to work with [Tree Data](/server-side-model-tree-data/).

