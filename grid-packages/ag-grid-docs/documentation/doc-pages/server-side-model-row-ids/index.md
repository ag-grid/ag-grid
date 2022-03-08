---
title: "Server-Side Row ID"
enterprise: true
---

Each Row in the grid has a unique [Row ID](/row-ids/). These ID's are used by the grid to identify Rows, e.g. for identifying what Rows are selected.

The application can assign Row IDs using `getRowId()`, or you can have Grid Assigned Row IDs.

### Grid Assigned IDs

When not [Row Grouping](/server-side-model-grouping/), the grid will assign Row ID's using a sequence starting at zero, e.g. `0`, `1`, `2`.

When [Row Grouping](/server-side-model-grouping/), the grid will assign IDs for each level using a sequence starting at zero. For the top level, the sequence will be `0`, `1`, `2`. For Rows inside Groups, the Group Name will be used to prefix the sequence e.g. `Ireland-0`, `Ireland-1`, `Ireland-2` for Rows under Ireland. When there are multiple levels of Row Grouping, then the Rows will use the names for all parent groups, e.g. `Ireland-Swimming-0`, `Ireland-Swimming-1`, `Ireland-Swimming-2`. This ensures all Row IDs are unique, even across groups.

Note that if using Grid Provided IDs, the grid will not be able to keep track of Row Selection between refreshes of data. This is because a refresh will load the data in again, and the same row will get a different ID if the order of rows has changed. For this reason it's good for the application to provide Custom Row IDs if refreshing data with selected Rows.

### Application Assigned IDs

When providing custom IDs, you can assign any ID that you like, once it's unique. Using an ID that is provided by the data, e.g. a Database Primary Key, is advised.

<snippet suppressFrameworkContext=true>
const gridOptions = {
    getRowId: p => data.id
}
</snippet>

If grouping, then there may not an easy to get ID from the data for group levels, as a group doesn't always correspond to one row in the store. You may wish to use the `parentKeys` and `level` attributes of the provided params to the callback.

<snippet suppressFrameworkContext=true>
const gridOptions = {
    getRowId: params => {
        //
        // if leaf level, we have ID
        if (params.data.id!=null) {
            return params.data.id;
        }
        //
        // this array will contain items that will compose the unique key
        var parts = [];
        // if parent groups, add the value for the parent group
        if (params.parentKeys){
            parts.push(...params.parentKeys);
        }
        //
        // it we are a group, add the value for this level's group
        var rowGroupCols = params.columnApi.getRowGroupColumns();
        var thisGroupCol = rowGroupCols[params.level];
        if (thisGroupCol) {
            parts.push(params.data[thisGroupCol.getColDef().field]);
        }
        //
        const res = parts.join('-');
        return res;
    }
}
</snippet>

The example below uses this snippet. Note the column Row ID displays what the Row ID is. Also note that the Row IDs are deterministic regardless of position, i.e. sorting the data by Gold moves the rows, but each row maintains it's unique Row ID.

<grid-example title='Row Grouping' name='row-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>
