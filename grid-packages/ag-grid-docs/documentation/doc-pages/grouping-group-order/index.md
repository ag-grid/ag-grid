---
title: "Row Grouping - Group Order"
enterprise: true
---

This section provides details on how to control the 'Group By' order and the default ordering of groups.

## Row 'Group By' Order

By default, the grid will group rows based on the order of the supplied column definitions. To explicitly define the
row 'Group By' order, use `rowGroupIndex` with / without `rowGroup = true` as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        // index = 1, gets grouped second
        { field: "country", hide: true, rowGroupIndex: 1 },
        // index = 0, gets grouped first
        { field: "year", hide: true, rowGroupIndex: 0 },
    ]
}
</snippet>

In the snippet above, `year` has a lower `rowGroupIndex` than `country` which means it will be grouped first. The
`rowGroupIndex` values can be any number that is either positive or zero and gaps are permitted. 

The following example shows how the `rowGroupIndex` can be used to ensure rows are grouped by 'year' first and then
`country` even though the `country` column definition is supplied to the grid first.

<grid-example title='Row Group Order' name='row-group-order' type='generated' options='{ "enterprise": true, "exampleHeight": 500, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Initial Group Order

The grid does not attempt to order the groups. The groups are presented on a 'first come, first served' basis. For example
if grouping by country, and the first row is for country 'Ireland', then the first displayed group will be 'Ireland'.

For most scenarios, this will not be a problem as the user can sort the grouping column. However, this will be a problem
in one of the following cases:

- The grid is using the [Group Rows Display Type](/grouping-group-rows), which means there are no columns associated with
  the groups to order.

- The groups have an implied order that should not require column sorting to achieve. For example grouping by month 
  (January, February...) or other groups which have business meaning that require order e.g. ["Severe", "Medium", "Low"]
  or ["Today", "Yesterday", "Older than 1 day"].

To provide a group order, you should supply `initialGroupOrderComparator` callback to the grid. The callback is a standard
JavaScript Array comparator that takes two values and compares them.

The example below shows providing an initial group order. From the example the following can be noted:

- Groups are displayed using the [Group Rows Display Type](/grouping-group-rows), i.e. there is no column to click to sort the groups.
- Groups are ordered alphabetically using a `initialGroupOrderComparator`.

<grid-example title='Initial Group Order' name='default-group-order' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn about the [Sticky Groups](../grouping-sticky-groups/).