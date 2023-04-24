---
title: "Load Retry"
enterprise: true
---

When a datasource load fails, it is possible to retry loading the rows again at a later time.


When loading fails, the datasource informs the grid of such using the `fail()` callback instead of using the `success()` callback. Calling `fail()` puts the loading rows into a Loading Failed state which hides the loading spinner. No data is shown in these rows as they are not loaded.


Failed loads can be retried by using the grid API `retryServerSideLoads()`. This will retry all loads that have previously failed.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["retryServerSideLoads"]'  ></api-documentation>

### Examples

The following example demonstrates load retrying. Note the following:

- When the checkbox 'Make Loads Fail' is checked, all subsequent loads will fail, i.e. the Datasource will call `fail()` instead of `success()`. Try checking the checkbox and expand a few groups to observe failed loading.

- When the button 'Retry Failed Loads' is pressed, any loads which were marked as failed are retried.

- When the button 'Reset Entire Grid' is pressed, the grid will reset. This allows you to have 'Make Loads Fail' checked while starting from scratch, thus failing loading of the top level of rows.

<grid-example title='Load Retry' name='retry-infinite' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>


## Next Up

Continue to the next section to learn how to set [Row Height](/server-side-model-row-height/).

