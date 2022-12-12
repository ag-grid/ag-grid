---
title: "SSRM Client-Side Operations"
enterprise: true
---

This section covers Row Grouping in the Server-Side Row Model (SSRM).

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
is [Refreshed](/server-side-model-refresh/) or b) Infinite Scrolling is used (as each block load will get the opportunity to add info data).

The example below shows Group Level Info in action.

<grid-example title='Group Info' name='group-info' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Next Up

Continue to the next section to learn about [SSRM Sorting](/server-side-model-sorting/).
