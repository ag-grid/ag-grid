---
title: "Aggregation - Filtering"
enterprise: true
---

This section covers aggregation filtering. 

## Default Filtering

The grid calculates aggregated values for a [Group Row](/grouping/) after rows which do not match your [Filters](/filtering-overview/) have been removed. This means that any filters you apply will affect the resulting aggregation value.

<snippet>
|const gridOptions = {
|  columnDefs: [
|    { field: 'country', rowGroup: true },
|    { field: 'athlete' },
|    { field: 'year', filter: 'agNumberColumnFilter' },
|    { field: 'total', aggFunc: 'sum' },
|  ],
|}
</snippet>

In the snippet above, note how we're enabling a filter on the **year** column, grouping on the **country** column and aggregating on the **total** column.

The example below demonstrates how aggregated values update to reflect the applied filters:
1. Take a note of the values in the **total** column for the **United States** row
2. Apply a filter for the **year** column with the value **2008**
3. Take note of how the values in the **total** column update to match the rows new subset of children.

<grid-example title='Aggregation and Filters' name='filters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Suppressing Aggregation

It is possible to instruct the grid to instead calculate aggregations from the full set of a [Row Groups](/grouping/) children, regardless of any applied [Filters](/filtering-overview/).

<snippet>
|const gridOptions = {
|  columnDefs: [
|    { field: 'country', rowGroup: true },
|    { field: 'athlete' },
|    { field: 'year', filter: 'agNumberColumnFilter' },
|    { field: 'total', aggFunc: 'sum' },
|  ],
|  suppressAggFilteredOnly: true,
|}
</snippet>

In the snippet above, we have prevented filter changes from affecting the row aggregation by enabling the `suppressAggFilteredOnly` option.

The example below demonstrates how aggregated values ignore updates in the applied filters:
1. Take a note of the values in the **total** column for the **United States** row
2. Apply a filter for the **year** column with the value **2008**
3. Take note of how the values in the **total** column *do not* update to match the rows new subset of children.

<grid-example title='Suppress Filtered Only' name='suppress-filtered-only' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Filtering Row Groups

When [Filtering](/filtering-overview/) in the grid your filters will not be applied to group rows, as they do not usually have any unique data of their own. However, when using aggregation, it is possible to have unique data assigned to your row groups as well, in which case you may wish to apply your filters to your row groups as well.

<snippet>
|const gridOptions = {
|   columnDefs: [
|       { field: 'country', rowGroup: true },
|       { field: 'athlete' },
|       { field: 'year' },
|       { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
|   ],
|   groupAggFiltering: true,
|}
</snippet>

In the snippet above, we have enabled the `groupAggFiltering` option to allow filters to be applied to row groups, as well as leaf rows.

The example below demonstrates the behaviour when filtering for a leaf row:
1. Using the **total** column apply a filter for the value **6**
2. Observe how the row **Natalie Coughlin** is preserved with all of its parents.

The example below also demonstrates the behaviour when filtering for a group row:
1. Using the **total** column now apply a filter for the value **38**
2. Observe how the group row **United States** passes this filter due to its aggregated value, and as such preserves all of its children too.

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-all' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

[[note]]
| Take note of the following while using `groupAggFiltering`:
| - [Set Filters](/filter-set/) are not fully supported in conjunction with this feature.
| - When `groupAggFiltering` is enabled, [suppressing aggregation](/aggregation-filtering/#suppressing-aggregation) is enabled by default.

## Custom row group filtering

If you need fine grain control over the specific row groups which filters will be applied to, you can also provide a callback function to the `groupAggFiltering` option.

<snippet>
|const gridOptions = {
|  columnDefs: [
|    { field: 'country', rowGroup: true },
|    { field: 'athlete' },
|    { field: 'year', filter: 'agNumberColumnFilter' },
|    { field: 'total', aggFunc: 'sum' },
|  ],
|   groupAggFiltering: (params) => !!params.node.group,
|}
</snippet>

The snippet above demonstrates how the callback can be used to selectively apply filters, in the case of this example, exclusively to group level rows.

The example below demonstrates how a callback has been used to provide custom row targeting for filters:
1. Using the **total** column apply a filter for the value **6**
2. Observe how, despite some rows containing the value **6**, nothing has matched.
3. Using the **total** column now apply a filter for the value **38**
4. Observe how the group row **United States** passes this filter due to its aggregated value, and also preserves all of its children.

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-group' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

The following properties of the [Row Node](/row-object/) provided by the callback parameters may be of use, and can be utilised to create a highly customised behaviour for row group filtering.

<api-documentation source='resources/reference.json' section="rowNodeAttributes"></api-documentation>

Continue to the next section to learn about [Other Aggregation Topics](/aggregation-filtering/).