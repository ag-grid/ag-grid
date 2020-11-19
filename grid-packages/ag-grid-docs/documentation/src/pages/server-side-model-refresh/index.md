---
title: "SSRM Refresh"
enterprise: true
---

It is possible to get the grid to refresh any grouping level. This is useful if the data has changed and 
you want to do a complete refresh.

## Refresh API

The grid has the following API's to assist with refreshing:

| Method | Description |
| ------ | ----------- |
| refreshServerSideStore(params) | Refresh part of the grid's data. If you pass no parameters, then the top level cache is purged. To purge a child cache, pass in the string of keys to get to the child cache. For example, to purge the cache two levels down under 'Canada' and then '2002', pass in the string array `['Canada','2002']`. If you purge a cache, then all row nodes for that cache will be reset to the closed state, and all child caches will be destroyed. |
| getCacheBlockState() | Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working. |

The `params` for `refreshServerSideStore` is as follows:

```ts
interface RefreshStoreParams {
    // List of group keys, pointing to the store to refresh.
    // For example, to purge the cache two levels down under 'Canada'
    // and then '2002', pass in the string array ['Canada','2002'].
    // If no route is passed, or an empty array, then the top level store is refreshed.
    route?: string[];

    // If true, then all rows at the level getting refreshed are destroyed, including
    // their child rows, and 'loading' rows appear, to signal to the user that loading
    // is taking place.
    //
    // If false, then loading will happen in the background and data will be updated
    // immediatly once loading has complete without showing any loading rows.
    purge?: boolean;
}
```

The following example demonstrates the refresh API. The following can be noted:

- Button **Refresh Everything** refreshes the top level store. Note the Version column has changed it's value.

- Button **Refresh [Canada]** refreshes the Canada cache only. To see this in action, make sure you have Canada expanded. Note the Version column has changed it's value.

- Button **Refresh [Canada,2002]** refreshes the 2002 cache under Canada only. To see this in action, make sure you have Canada and then 2002 expanded. Note the Version column has changed it's value.

- Button **Print Block State** prints the state of the blocks in the cache to the console.

- Toggle **Purge** to change whether loading rows are shown or not during the refresh.

<grid-example title='Refresh Store' name='refresh-store' type='generated' options='{ "enterprise": true, "exampleHeight":  615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Group State

When a refresh is done, all open groups at the refreshed level along with their children may be destroyed depending on the store type and whether the probided `params.purge=true`.


### Group State - Full Store

The Full Store can keep the state of open groups during a refresh. To do this the grid needs to be 
provided with [Row ID's](../row-object/#application-assigned-ids) by the application implementing `getRowNodeId()`. 
This is required to allow the grid to match newly loaded rows with previously loaded rows.

When using the Full Store, if Row ID's are provided and rows are not purged, then refreshing rows will keep open 
groups open and not destroy child rows.

| Purge | ID's Provided | Open Groups | Child Rows |
| ----- | ------------- | ----------- | ---------- |
| No    | Yes           | Kept Open   | Kept       |
| No    | No            | Closed      | Destroyed  |
| Yes   | Yes           | Closed      | Destroyed  |
| Yes   | No            | Closed      | Destroyed  |

The example below shows refreshing using the Full Store and keeping group state. The example is similar to the 
previous example with the addition `getRowNodeId()` is implemented. Note the following:

- When 'Purge' is not checked, refreshing using any refresh button will maintain any open groups and children at that level.<br/><br/>
    For example expand 'United States' and hit 'Refresh Everything' - note that the
    top level countries are refreshed (the version column changes once the load is
    complete) and the open 'United States' group is left open and the child rows
    (displaying year groups) are left intact.<br/><br/>
- When 'Purge' is checked, refreshing using any refresh button will close all open groups and destroy all children at that level.<br/><br/>
    For example expand 'United States' and hit 'Refresh Everything' - note that the
    list of countries is reset, including closing 'United States' and loosing
    all child rows to 'United States'. When 'United States' is expanded again, the
    child rows are loaded again from scratch.

Because the grid is getting provided ID's with via `getRowNodeId()` it allows the grid to update rows rather than
replace rows. This also means when grid property `enableCellChangeFlash = true` the cells will flash when their data 
changes. If `getRowNodeId()` is not implemented, rows are replaced and cells are re-created from scratch, no flashing 
is possible.


<grid-example title='Keep Group State' name='keep-group-state' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

### Group State - Partial Store

If using the Partial Store, the grid does not provide for keeping open groups. Refreshing a Partial Store will always 
reset groups and destroy children.

This is because the Partial Store loads rows in blocks, so it's unreliable to expect rows that existed before to 
exist in the new load, as the row could appear in a different block.

If you are using the Partial Store and need to restore groups to their previously open state, then this logic can 
be implemented in your application using the [Open by Default](../server-side-model-grouping/#open-by-default) API.


## Next Up

Continue to the next section to learn how to perform [Pivoting](../server-side-model-pivoting/).

