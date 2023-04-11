---
title: "SSRM Row Grouping"
enterprise: true
---

This section covers Row Grouping in the Server-Side Row Model (SSRM).

## Enabling Row Grouping

Row Grouping is enabled in the grid via the `rowGroup` column definition attribute.
The example below shows how to group rows by 'country':

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'sport' },
        { field: 'year' },
    ]
}
</snippet>

For more configuration details see the section on [Row Grouping](/grouping/).

## Server Side Row Grouping

The actual grouping of rows is performed on the server when using the SSRM. When the grid needs more rows it makes a 
request via `getRows(params)` on the [Server-Side Datasource](/server-side-model-datasource) with metadata containing 
grouping details.

The properties relevant to Row Grouping in the request are shown below:

```ts
// IServerSideGetRowsRequest
{
    // row group columns
    rowGroupCols: ColumnVO[];

    // what groups the user is viewing
    groupKeys: string[];

    ... // other params
}
```

Note in the snippet above the property `rowGroupCols` contains all the columns (dimensions) the grid is
grouping on, e.g. 'Country', 'Year'. The property `groupKeys` contains the list of group keys selected,
e.g. `['Argentina', '2012']`.

The example below demonstrates server-side Row Grouping. Note the following:

- <b>Country</b> and <b>Sport</b> columns have `rowGroup=true` defined on their column definitions. This tells the grid there are two levels of grouping, one for Country and one for Sport.
- The `rowGroupCols` and `groupKeys` properties in the request are used by the server to perform grouping.
- Open the browser's dev console to view the request supplied to the datasource.

<grid-example title='Row Grouping' name='row-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Open by Default

It is possible to have rows open as soon as they are loaded. To do this implement the grid callback `isServerSideGroupOpenByDefault`.

<api-documentation source='grid-options/properties.json' section='serverSideRowModel' names='["isServerSideGroupOpenByDefault"]' ></api-documentation>

```js
// Example implementation
function isServerSideGroupOpenByDefault(params) {
    var rowNode = params.rowNode;
    var isZimbabwe = rowNode.field == 'country' && rowNode.key == 'Zimbabwe';
    return isZimbabwe;
}
```

It may also be helpful to use the [Row Node](/row-object/) API `getRoute()` to inspect the route of a row node.

<api-documentation source='row-object/resources/methods.json' section='rowNodeMethods' names='["getRoute"]' ></api-documentation>

Below shows `isServerSideGroupOpenByDefault()` and `getRoute` in action. Note the following:

- The callback opens the following routes as soon as those routes are loaded:
    - **[Zimbabwe]**
    - **[Zimbabwe, Swimming]**
    - **[United States, Swimming]**
- Note **[Zimbabwe]** and **[Zimbabwe, Swimming]** are visibly open by default.
- Note **[United States, Swimming]** is not visibly open by default, as the parent group 'United States' is not open. However open 'United States' is open, it's 'Swimming' group is open.
- Selecting a row and clicking 'Route of Selected' will print the route to the selected node.

<grid-example title='Open by Default' name='open-by-default' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Expand All / Collapse All

It is possible to expand and collapse all group rows using the `expandAll()` and `collapseAll()` grid API's.

<snippet>
// Expand all group rows
gridOptions.api.expandAll();
// Collapse all group rows
gridOptions.api.collapseAll();
</snippet>

Calling `expandAll()` and `collapseAll()` will impact **all loaded group nodes**, including those not visible due to their containing group been closed. This means there could potentially be a huge number of groups expanded, so this method should be used very wisely to not create massive amount of server requests and loading a large amount of data.

Calling `expandAll()` and `collapseAll()` will have no impact on rows yet to be loaded.

To open only specific groups, e.g. only groups at the top level, then use the `forEachNode()` callback and open / close the row using `setExpanded()` as follows:

<snippet>
// Expand all top level row nodes
gridOptions.api.forEachNode(node => {
    if (node.group && node.level == 0) {
        node.setExpanded(true);
    }
});
</snippet>

The example below demonstrates these techniques. Note the following:

- Clicking 'Expand All' will expand all loaded group rows. Doing this when the grid initially loads will expand all Year groups. Clicking it a second time (after Year groups have loaded) will cause all Year groups as well as their children Country groups to be expanded - this is a heaver operation with 100's of rows to expand.

- Clicking 'Collapse All' will collapse all rows.
- Clicking 'Expand Top Level Only' will expand Years only, even if more group rows are loaded..

<grid-example title='Expand All' name='expand-all' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Providing Child Counts

By default, the grid will not show row counts beside the group names. If you do want row counts, you need to implement the `getChildCount(dataItem)` callback for the grid. The callback provides you with the row data; it is your application's responsibility to know what the child row count is. The suggestion is you set this information into the row data item you provide to the grid.

<api-documentation source='grid-options/properties.json' section='serverSideRowModel' names='["getChildCount"]' ></api-documentation>

<snippet>
const gridOptions = {
    getChildCount: data => {
        // here child count is stored in the 'childCount' property
        return data.childCount;
    }
}
</snippet>

<grid-example title='Child Counts' name='child-counts' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>


## Group via Value Getter

It is possible the data provided has composite objects, in which case it's more difficult for the grid to extract group names. This can be worked with using value getters or embedded fields (i.e. the field attribute has dot notation).

In the example below, all rows are modified so that the rows look something like this:

```js
// sample contents of row data
{
    // country field is complex object
    country: {
        name: 'Ireland',
        code: 'IRE'
    },

    // year field is complex object
    year: {
        name: '2012',
        shortName: "'12"
    },

    // other fields as normal
    ...
}
```

Then the columns are set up so that country uses a `valueGetter` that uses the field with dot notation, i.e. `data.country.name`

<grid-example title='Complex Objects' name='complex-objects' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Filtering

By default the grid will attempt to only refresh the groups which are directly impacted by the change in filters. Be aware, this can mean your grid may have empty group rows. This is because the grid will not refresh the groups above the groups it deems impacted by the filter. This behaviour can be disabled, instead favouring purging the entire grid by enabling the grid property `serverSideRefreshAllLevels`.

In the example below, note the following:
- Filtering by `Gold`, `Silver` or `Bronze` fully purges the grid, this is because they have aggregations applied.
- Applying a filter to the `Year` column does not purge the entire grid, and instead only refreshes the `Year` group rows.

<grid-example title='Filtering' name='filtering' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn about [SSRM Pivoting](/server-side-model-pivoting/).
