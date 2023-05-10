---
title: "SSRM Row Height"
enterprise: true
---

Learn how to set Row Height when using the Server-Side Row Model.

## Dynamic Row Height

To enable [Dynamic Row Height](/row-height/) when using the Server-Side Row Model you need to provide an implementation for the `getRowHeight` Grid Options property. This is demonstrated in the example below:

<api-documentation source='grid-options/properties.json' section='styling' names='["getRowHeight"]' ></api-documentation>

<grid-example title='Dynamic Row Height Example' name='dynamic-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 630, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| Ensure `maxBlocksInCache` is not set when using dynamic row height.

## Auto Row Height

To have the grid calculate the row height based on the cell contents, set `autoHeight=true` on columns that require
variable height. The grid will calculate the height once when the data is loaded into the grid.

This is different to the [Client-Side Row Model](/client-side-model/) where the grid height can be changed. For
Server-Side Row Model the row height cannot be changed once it is set.

In the example below, Column A & B have `autoHeight=true` and `wrapText=true`. See [Row Height](/row-height/) for
details on these properties.

<grid-example title='Auto Row Height Example' name='auto-row-height' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| Ensure `maxBlocksInCache` is not set when using auto row height.

## Next Up

Continue to the next section to learn how to combine [Master Detail](/server-side-model-master-detail/) with the SSRM.

