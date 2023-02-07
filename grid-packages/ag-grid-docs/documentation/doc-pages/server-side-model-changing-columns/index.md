---
title: "SSRM Changing Columns"
enterprise: true
---

It is possible to add and remove columns to the Server-Side Row Model without having the row model reset.

[Changing columns](/column-updating-definitions/) allows you to specify new column definitions to the grid and
the grid will work out which columns are new and which are old, keeping the state of the old columns.

For the Server-Side Row Model, this means a refresh will occur in the event of one of the following:
 - A row group column is added, removed or changed
 - A pivot column is added, removed or changed
 - While row grouping is active, a new column has an aggregation applied or changed.
 - Any change is applied to a columns sort direction

## Example Changing Columns

The example below demonstrates how changing columns impacts the server side row model. The following can be noted:

- Adding or removing Athlete, Age or Sport will not reload the data as they have no row group, pivot, value, sort or filter set.
- Adding or removing Country or Year will reload the data as they are part of the grouping.
- Adding or removing Gold, Silver or Bronze will reload the data as they are selected as values.
- If you apply a sort or filter (on Athlete) and then remove the column the data will reload.

<grid-example title='Changing Columns' name='changing-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 605, "extras": ["alasql"], "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn how to [Update Data](/server-side-model-updating/) with the SSRM.

