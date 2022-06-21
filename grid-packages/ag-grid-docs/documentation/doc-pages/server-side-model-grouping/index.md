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

The actual grouping of rows is performed on the server when using the SSRM.
When the grid needs more rows it makes a request via `getRows(params)` on
the [Server-Side Datasource](/server-side-model-datasource/#datasource-interface) with
metadata containing grouping details.

The properties relevant to row grouping in the request are shown below:

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

- [Infinite Scrolling](/server-side-model-row-stores/) is active via grid property `serverSideInfiniteScroll=true`.
- The infinite block size is set to 5 by setting the grid property `cacheBlockSize = 5`. It can then be observed that rows are loaded in blocks at all levels. For example if you expand United States row, the children rows are loaded in blocks using [Infinite Scrolling](/server-side-model-row-stores/).
- Country and Sport columns have `rowGroup=true` defined on their column definitions. This tells the grid there is two levels of grouping, one for Country and one for Sport.
- The `rowGroupCols` and `groupKeys` properties in the request are used by the server to perform grouping.
- Open the browser's dev console to view the request supplied to the datasource.

<grid-example title='Row Grouping' name='row-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Configuring Group Levels

Some applications may require Infinite Scrolling at certain group levels only. It may be that some levels have large numbers of rows making Infinite Scrolling a better choice, while levels with fewer rows don't require Infinite Scrolling.

This is done by implementing the grid callback `getServerSideGroupLevelParams(params)`.

<api-documentation source='grid-options/properties.json' section='serverSideRowModel' names='["getServerSideGroupLevelParams"]' ></api-documentation>

The example below demonstrates the `getServerSideGroupLevelParams(params)` callback. Note the following:

- The grid is configured differently depending on whether grouping is active or not by implementing
the `getServerSideGroupLevelParams(params)` callback. The callback logs its results to the dev console.

- When grouping is active, the group levels are configured as follows:
    - Group Level 0 - No Infinite Scrolling
    - Group Level 1 - Infinite Scrolling with block size of 5
    - Group Level 2 - Infinite Scrolling with block size of 2

    To observe, expand different levels of the data and notice when rows are read back in blocks.

- When no grouping is active, the top most (and only) group level is configured to use Infinite Scroll and only keeps two blocks of rows. To observe this, remove all grouping and scroll down to load more blocks. Then scroll back up to observe the initial blocks getting reloaded.

<grid-example title='Dynamic Params' name='dynamic-params' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside","rowgrouping"] }'></grid-example>

## Debugging Group Levels

The grid API `getServerSideGroupLevelState()` returns info on all existing levels. Levels do not exist if their parent groups have not been opened. Using this you can see details about the group level such as it's route and whether Infinite Scroll is on.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["getServerSideGroupLevelState"]' ></api-documentation>

Inspecting the Group Level State can be useful, for example when wanting to know what Route to use when
providing [Transactions](/server-side-model-transactions/) or doing a [Level Refresh](/server-side-model-refresh/).


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
    - [Zimbabwe]
    - [Zimbabwe, Swimming]
    - [United States, Swimming]
- Note [Zimbabwe] and [Zimbabwe, Swimming] are visibly open by default.
- Note [United States, Swimming] is not visibly open by default, as the parent group 'United States' is not open. However open 'United States' is open, it's 'Swimming' group is open.
- Selecting a row and clicking 'Route of Selected' will print the route to the selected node.
- The grid is configured with both Infinite Scroll on (top level) and Infinite Scroll off (all other levels) to demonstrate the feature working with both.

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

## Group Level Info

It is also possible to attach info to each Group Level as data is loaded. This is done through the `success()` callback
when rows are fetched.

```js
const createDatasource = server => {
    return {
        // called by the grid when more rows are required
        getRows: params => {
            // get data for request from server
            const rows = server.getData(params.request);

            // pass rows back along with any additional group info
            params.success({
                rowData: rows,
                groupLevelInfo: {a: 22, b: 55}
            });
        }
    }
}
```

The `groupLevelInfo` object is merged into the Group Level Info (which is initially an empty object) and then available through the `getServerSideGroupLevelState()` API.

If rows are loaded multiple times, then the `groupLevelInfo` values will over write existing values
as they are merged on top of the existing values. Rows can be loaded multiple times if a) the level
is [Refreshed](/server-side-model-refresh/) or b) [Infinite Scrolling](/server-side-model-row-stores/) is used (as each block load will get the opportunity to add info data).

The example below shows Group Level Info in action.

<grid-example title='Group Info' name='group-info' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Next Up

Continue to the next section to learn about [SSRM Sorting](/server-side-model-sorting/).
