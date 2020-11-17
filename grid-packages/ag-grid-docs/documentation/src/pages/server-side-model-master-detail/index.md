---
title: "SSRM Master Detail"
enterprise: true
---

This section shows how the Server-Side Row Model can be configured with a Master / Detail view.


The ability to nest grids within grids is commonly referred to as Master / Detail. Here the top-level grid is referred to as the 'master grid' and the nested grid is referred to as the 'detail grid'.


As this server-side version of Master / Detail is configured in the same way as its client-side counterpart, this guide will focus on areas that are of particular interest to this server-side version.

[[note]]
| For a comprehensive look at Master / Detail configurations, see: [Client-Side Master / Detail](../master-detail/).

## Enabling Master / Detail

To enable Master / Detail, you should set the following grid options:


- **masterDetail:** Set to `true` to inform the grid you want to allow expanding of rows to reveal detail grids.
- **detailGridOptions:** The grid options to set for the detail grid. The detail grid is a fully featured instance of ag-Grid, so any configuration can be set on the detail grid that you would set any other grid.
- **getDetailRowData:** A function you implement to provide the grid with rows for display in the detail grids.

These grid options are illustrated below:

```js
var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,

    // enable master detail
    masterDetail: true,

    // specify params for default detail cell renderer
    detailCellRendererParams: {
        // provide detail grid options
        detailGridOptions: detailGridOptions,

        // extract and supply row data for detail
        getDetailRowData: function(params) {
            params.successCallback(params.data.childRecords);
        }
    }
}

var detailGridOptions = {
    columnDefs: detailColumnDefs
}
```

[[note]]
| Note that the nested detail grid can be configured to use any Row Model.

## Example: Infinite Scrolling with Master / Detail

This example shows a simple Master / Detail setup which includes the infinite scrolling capabilities provided with the Server-Side Row Model. From this example notice the following:

- **masterDetail** - is set to `true` in the master grid options.
- **detailCellRendererParams** - specifies the `detailGridOptions` to use and `getDetailRowData` extracts the data for the detail row.
- **cellRenderer: 'agGroupCellRenderer'** - is used to provide expand / collapse icons on the master rows.

<grid-example title='Infinite Scrolling with Master / Detail' name='infinite-scrolling' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["lodash"], "modules": ["serverside", "clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Combining Row Grouping with Master Detail

It is possible to combine [Server-Side Grouping](../server-side-model-grouping/) with Master Detail.


The following snippet shows row grouping on the 'country' column by setting `rowGroup = true`:

```js
columnDefs = [
    { field: 'country', rowGroup: true },

    // ... more colDefs
]
```

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


```js
columnDefs = [
    { field: 'country', rowGroup: true },
    { field: 'accountId', maxWidth: 200, cellRenderer: 'agGroupCellRenderer' },
    // ... more colDefs
]
```

## Detail Row Height

The height of detail rows can be configured in one of the following ways:

1. Using the `detailRowHeight` grid option property to set a fixed height for each detail row.
1. Using the `getRowHeight()` grid option callback to explicitly set height for each row individually. This callback will need to work out the pixel height of each detail row.
1. Using the `detailCellRendererParams.autoHeight=true` property to let the grid automatically size the detail rows / grids to fit their rows.

The following snippet compares all approaches:


```js
// option 1 - fixed detail row height, sets height for all details rows
masterGridOptions.detailRowHeight = 500;

// option 2 - dynamic detail row height, dynamically sets height for all rows
masterGridOptions.getRowHeight = function(params) {
    var isDetailRow = params.node.detail;

    // not that this callback gets called for all rows, not just the detail row
    if (isDetailRow) {
        // dynamically calculate detail row height
        return params.data.children.length * 50;
    }
    // for all non-detail rows, return 25, the default row height
    return 25;
}

// option 3 - use autoHeight
masterGridOptions.detailCellRendererParams.autoHeight = true;
```

[[note]]
| Purging the cache and dynamic row heights do not work together for the Server-Side Row Model.
| If you are using dynamic row height, ensure `maxBlocksInCache` is not set.

### Example Using Callback getRowHeight()

The following example explicitly sets detail row heights based on the number of detail rows. Note the following:

- **getRowHeight()** - is implemented to size detail rows according to the number of records.
- **node.detail** - is used to identify 'detail' row nodes.


<grid-example title='Dynamic Detail Row Height' name='dynamic-detail-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

See [Master Detail Dynamic Height](../master-detail-height/#dynamic-height) for more details.

### Example Using Property `autoHeight`

The following example gets the grid to auto-size all details sections to fit their rows. This is done by setting `masterGridOptions.detailCellRendererParams.autoHeight = true`.


<grid-example title='Auto Detail Row Height' name='auto-detail-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

See [Master Detail Auto Height](../master-detail-height/#auto-height) for more details.


## Lazy Loading Detail Rows

In the examples above, the data for the detail grid was returned with the master row. However it is also possible to lazy-load data for the detail row, see: [Providing Rows](../master-detail-detail-grids/#providing-rows).


However note that detail rows will be purged once the master row is closed, or if the detail row leaves the viewport through scrolling. In both cases data will need to be fetched again.

## Next Up

Continue to the next section to learn how to work with [Tree Data](../server-side-model-tree-data/).

