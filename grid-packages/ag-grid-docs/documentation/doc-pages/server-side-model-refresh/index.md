---
title: "SSRM Refresh"
enterprise: true
---

It is possible to get the grid to refresh its rows. In other words reload previously loaded rows.
This is useful when the data has changed at the source (typically on the server) and the UI needs refresh.

## Refresh API

The grid has the following API's to assist with refreshing:

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["refreshServerSide"]' config='{"overrideBottomMargin":"0rem"}' ></api-documentation>
<api-documentation source='grid-api/api.json' section='infiniteScrolling' names='["getCacheBlockState"]'  ></api-documentation>


The following example demonstrates the refresh API. The following can be noted:

- Button **Refresh Top Level** refreshes the top level. Note the Version column has changed its value.

- Button **Refresh [Canada]** refreshes the Canada cache only. To see this in action, make sure you have Canada expanded. Note the Version column has changed it's value.

- Button **Refresh [Canada,2002]** refreshes the 2002 cache under Canada only. To see this in action, make sure you have Canada and then 2002 expanded. Note the Version column has changed it's value.

- Button **Print Block State** prints the state of the blocks in the cache to the console.

- Toggle **Purge** to change whether loading rows are shown or not during the refresh.

<grid-example title='Refresh Group' name='refresh-group' type='generated' options='{ "enterprise": true, "exampleHeight":  615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Purge vs Refresh

When a purge is executed (`params.purge=true`) then the data is replaced with loading rows
while the data is refreshed. There are a few more subtle differences between purging and
refreshing which are as follows:

- While purging, the loading icons prevent the user from interacting with the data while the rows are re-fetched.<br/><br/>

- When purging, all open groups will always get closed and children destroyed. This is explained in more detail
  in the section Maintaining Open Groups below.<br/><br/>

- When Infinite Scroll is used (i.e. data is loaded in blocks), purging will destroy all blocks
  and remove them from the cache and only re-create blocks needed to show data the user is looking at. <br/><br/>
  For example if the user had scrolled down and 5 blocks are in the cache, after a purge it could
  be only 1 block exists in the cache after purging. This means only one block request is sent to the server.<br/><br/>
  Refreshing however will refresh all existing blocks. Thus if 5 blocks exist in the cache, all blocks
  will get refreshed resulting in 5 requests sent to the server.


## Maintaining Open Groups

It is possible to have open groups remain open during a refresh, thus maintaining the context
of open groups.

Maintaining open groups is achieved when all of the following are configured:

- Refreshing (`params.purge=false`). When using a purge, groups and children will be lost.

- Row IDs are provided (`getRowId()` implemented, see [Row IDs](/row-ids/)). If not providing Row IDs, groups and children will be lost

When all the above is true, when a refresh is done, open groups will remain open and children will be kept.

The example below shows refreshing and keeping group state. The example is similar to the
previous example with the addition `getRowId()` is implemented. Note the following:

- When 'Purge' is not checked, refreshing using any refresh button will maintain any open groups and children at that level.<br/><br/>
  For example expand 'United States' and hit 'Refresh Top Level' - note that the
  top level countries are refreshed (the version column changes once the load is
  complete) and the open 'United States' group is left open and the child rows
  (displaying year groups) are left intact.<br/><br/>

- When 'Purge' is checked, refreshing using any refresh button will close all open groups and destroy all children at that level.<br/><br/>
  For example expand 'United States' and hit 'Refresh Top Level' - note that the
  list of countries is reset, including closing 'United States' and losing
  all child rows to 'United States'. When 'United States' is expanded again, the
  child rows are loaded again from scratch.

Because the grid is getting provided ID's with via `getRowId()` it allows the grid to update rows rather than
replace rows. This also means when grid property `enableCellChangeFlash = true` the cells will flash when their data
changes. If `getRowId()` is not implemented, rows are replaced and cells are re-created from scratch, no flashing
is possible.

### Example 1: Keeping Group State

<grid-example title='Keep Group State' name='keep-group-state' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

### Example 2: Keeping Group State with Infinite Scrolling

<grid-example title='Keep Group State with Infinite Scroll' name='keep-group-state-infinite' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn how to perform [Pivoting](/server-side-model-pivoting/).

