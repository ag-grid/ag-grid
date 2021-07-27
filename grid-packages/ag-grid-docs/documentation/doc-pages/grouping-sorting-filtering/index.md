---
title: "Row Grouping - Sorting / Filtering"
enterprise: true
---

This section provides details on sorting and filtering row groups.

## Custom Sorting

<grid-example title='Custom Group Sort' name='custom-group-sort' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>


## Default Group Order

The grid does not attempt to order the groups. The groups are presented on a 'first come, first served' basis. For example if grouping by country, and the first row is for country 'Ireland', then the first displayed group will be 'Ireland'.

For most scenarios, this will not be a problem as the user can sort the grouping column. However this will be a problem in one of the following cases:

- The grid is using [Full Width Group Rows](#full-width-group-rows), which means there is no columns associated with the groups to order.

- The groups have an implied order that should not require column sorting to achieve. For example grouping by month (January, February...) or other groups which have business meaning that require order e.g. ["Severe", "Medium", "Low"] or ["Today", "Yesterday", "Older than 1 day"].

To provide a group order, you should supply `defaultGroupSortComparator` callback to the grid. The callback is a standard JavaScript Array comparator that takes two values and compares them.

The example below shows providing a default group order. From the example the following can be noted:

- Groups are displayed using full width rows. There is no column to click to sort the groups.
- The grid is provided with `defaultGroupSortComparator`.
- Groups are sorted alphabetically.

<grid-example title='Default Group Order' name='default-group-order' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Filtering on Group Columns

Filter on group columns is more complex than filtering on normal columns as the data inside the column can be a mix of data from different columns. For example if grouping by Country and Year, should the filter be for Year or for Country?

For auto generated group columns, the filter will work if you specify one of `field`, `valueGetter` or `filterValueGetter`.