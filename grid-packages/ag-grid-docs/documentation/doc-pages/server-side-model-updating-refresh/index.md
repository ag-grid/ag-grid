---
title: "SSRM Refresh"
enterprise: true
---
This section demonstrates refreshing rows in order to reflect changes at the source while using the Server-Side Row Model (SSRM).

## Refresh API

The grid API `refreshServerSide(params)` instructs the grid to start reloading all loaded rows for a specified group.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["refreshServerSide"]' config='{"overrideBottomMargin":"0rem"}' ></api-documentation>


## Simple Example

To ensure your grid reflects the latest data on your server, you can periodically instruct the grid to refresh all of the loaded rows (known as polling) or strategically refresh based on your applications requirements.

The following example provides a simple demonstration of the different behaviours of the refresh API, note the following:
 - Using the <b>Refresh</b> button, you can request that all the rows are requested from the server again, bringing them up to date with the server version.
 - Because [Row IDs](/server-side-model-configuration/#providing-row-ids) have been implemented, the grid is able to detect which rows have been updated, and flash cells when using `enableCellChangeFlash`.
 - The `Purge` checkbox enables the purge option in the API call, this causes all rows (and all row state except row selection state) to be reset when the refresh call is made, and replaced with loading rows.
 - When a refresh is finished, note the `storeRefreshed` event is fired, and logged in the console.


<grid-example title='Simple Example' name='refreshing-the-grid' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Refreshing Groups

When using row grouping with refreshing you are required to provide a route parameter specifying the row group to refresh. When a row group is refreshed, only its direct child rows are refreshed. This means that in order to refresh the rows in a particular row group, you need to provide the parent of the rows to be refreshed as the route parameter.

The following example demonstrates how to refresh specified groups on the server, note the following:
 - Using the <b>Refresh Root Level</b> button, you can force all the rows in the root level group to refresh, this is equivalent to omitting a route parameter from the `refreshServerSide` API call.
 - The <b>Refresh ['Canada']</b> button only refreshes the direct children of the `Canada` row group.
 - The <b>Refresh ['Canada', '2002']</b> button only refreshes the direct children of the `2002` row group that belongs to the `Canada` row group.
 - Because [Row IDs](/server-side-model-configuration/#providing-row-ids) have been implemented, the grid is able to retain the state for reloaded rows, such as whether a group row was expanded. 
 - When a refresh is finished, note the `storeRefreshed` event is fired, and logged in the console.

<grid-example title='Refreshing Groups' name='refreshing-the-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn how to use [Single Row Updates](/server-side-model-updating-single-row/) with the SSRM.

