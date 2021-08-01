---
title: "Row Grouping - Filtering Groups"
enterprise: true
---

This section provides details on how to configure and customise how row groups are filtered.

## Filtering on Group Columns

Filter on group columns is more complex than filtering on normal columns as the data inside the column can be a mix of data from different columns. For example if grouping by Country and Year, should the filter be for Year or for Country?

For auto generated group columns, the filter will work if you specify one of `field`, `valueGetter` or `filterValueGetter`.

## Filtering on the auto Group Column

To enable filtering on the autoGroupColumn, you need to include a field value on the auto group column for filtering
to work. If you don't want to show the field values on the leaf nodes, then use a value formatter. 

The following example demonstrates how to configure filtering (and a floating filter) for the autoGroupColumn:

<grid-example title='Filtering on the Auto Group Column' name='filtering-on-auto-group-column' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Group Footers](../grouping-footers/).