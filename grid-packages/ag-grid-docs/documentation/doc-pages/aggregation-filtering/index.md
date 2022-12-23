---
title: "Aggregation - Filtering"
enterprise: true
---

This section describes the different ways that aggregated values can be filtered in the grid.

## Default Filtering

By default, when using [Filters](/filtering-overview/) and [Aggregations](/aggregation/) the filtering will only apply to the cell values in leaf-level rows, and not to any of the aggregated values in the group rows. Also, when a column filter is applied, the aggregated values shown in the group rows will be updated based on the filtered rows only.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'athlete', rowGroup: true },
        { field: 'year' },
        { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    ]
}
</snippet>

In the snippet above, rows are grouped by **country** and **athlete**. The [Built-In Function](/aggregation/#enabling-aggregation) `sum` is used to aggregate the **total** values.

The example below demonstrates how aggregated values update to reflect the applied filters. Note the following:
- Apply a filter for the **total** column with the value **4**
- Note how the **United States** value in the **total** column is now **12**, reflecting the now filtered leaf rows.

<grid-example title='Aggregation and Filters' name='filters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>

## Suppressing Aggregation Updates When Filtering

To prevent the [Default Behaviour](/aggregation-filtering/#default-filtering) of [Aggregated](/aggregation/) values being calculated from the [Filtered](/filtering-overview/) results, and instead calculate them from the pre-filtered data, enable the `suppressAggFilteredOnly` option.

<snippet>
const gridOptions = {
    suppressAggFilteredOnly: true,
}
</snippet>

The example below demonstrates this behaviour - when a filter is applied, group row aggregated values remain unchanged and show their original values representing the original unfiltered data. Note the following:
- Apply a filter for the **year** column with the value **2008**
- Note how the values in the **total** column *do not* update to reflect the filtered data.

<grid-example title='Suppress Filtered Only' name='suppress-filtered-only' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>


## Filtering Group Aggregations

As the [Default Behaviour](/aggregation-filtering/#default-filtering) of [Filtering](/filtering-overview/) only applies to leaf-level rows, ignoring cell values in [Group Rows](/grouping/), this prevents filtering group rows based on [Aggregation](/aggregation/) values.

### Enabling Group Aggregation Filtering

By default, column filters are not applied to cell values shown in [Group Rows](/grouping/) as they do not usually 
have any data of their own. However when using [Aggregation](/aggregation/), the aggregated columns in the group rows will show aggregated values computed based on their child rows.

You can filter the grid based on the group row aggregated values by setting the `groupAggFiltering` grid option as shown below:

<snippet>
const gridOptions = {
    groupAggFiltering: true,
}
</snippet>

Once aggregation filtering is enabled and applied, when an aggregated value in a group row matches the filter, the matching group row will be shown as well as:

- all the parent group rows of the matching group row up to the root level
- all child and leaf-level rows of the matching group row

The example below demonstrates the behaviour when filtering aggregated values. Please go through the list of filtering scenarios below to better understand this functionality.

Note the following:
1. Using the **total** column apply a filter for the value **6**. Note in the filtered grid the leaf row **Natalie Coughlin** is displayed with all of its parent group rows.
2. Using the **total** column, now apply a filter for the value **38**. Note that as the group row **United States** aggregated value matches the filter, all of its child and leaf-level rows as shown. Specifically, note that both **United States-Swimming** and **United States-Gymnastics** row groups are displayed under the United States row group.
3. Using the **total** column, now apply a filter for the value **34**. Note that as the group row **United States-Swimming** aggregated value matches the filter, this shows the **United States-Swimming** group row and all its leaf-level rows. However, unlike the previous filtering scenario, the group row **United States-Gymnastics** is not displayed any more, because the filter match is in the **United States-Swimming** group row only.

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-all' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>

[[note]]
| Take note of the following while using `groupAggFiltering`:
| - [Set Filters](/filter-set/) are not fully supported in conjunction with this feature.
| - When `groupAggFiltering` is enabled, [Suppressing Filtered Aggregation](/aggregation-filtering/#suppressing-aggregation-updates-when-filtering) is enabled by default.
| - If Tree Data mode is enabled, the behaviour of `groupAggFiltering` will be different. See [Tree Data Filtering](/tree-data/#tree-data-filtering).

### Custom Group Aggregation Filtering

As seen above, the default behaviour of [Filtering Group Aggregations](/aggregation-filtering/#filtering-group-aggregations) is to apply the filter to all row group levels. If you’d like to change this behaviour and apply the filter only to specific group row levels, or specific grouped columns (regardless of the level these group columns appear), a callback can be provided to the `groupAggFiltering` property.

See an example implementation of this callback below.

<snippet>
const gridOptions = {
    groupAggFiltering: (params) => !!params.node.group,
}
</snippet>

The snippet above demonstrates how the callback can be used to selectively apply filters. In this example, the filter condition is applied to group level rows only. 

The example below demonstrates this specific scenario. Note the following:
- Using the **total** column apply a filter for the value **6**
- Note that no rows are displayed despite some leaf rows containing the value **6** - the row for Natalie Coughlin, for example. This is because the filter is applied to group rows only and there are no group rows with value **6**.
- Using the **total** column now apply a filter for the value **38**
- Note that the group row **United States** matches this filter due to its aggregated value, and also displays all of its child and leaf rows.

<grid-example title='Group-only Aggregate filtering' name='agg-filtering-group' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>

The properties of the [Row Node](/row-object/) provided by the `groupAggFiltering` callback parameters can be used to further customise row group filtering behaviour.

<api-documentation source='resources/reference.json' section="rowNodeAttributes"></api-documentation>

Continue to the next section to learn about [Other Aggregation Topics](/aggregation-filtering/).