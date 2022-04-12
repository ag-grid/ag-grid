---
title: "Aggregation - Filtering"
enterprise: true
---

This section covers some of the unique behaviours and features which emerge when mixing [Aggregation](/aggregation/) and [Filtering](/filtering/).

## Default Filtering

While using [Filters](/filtering-overview/) and [Aggregations](/aggregation/) together the filters will only apply only to the leaf level values, not the group values, however the aggregated values are updated to reflect the filtered rows.

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

## Suppressing Filtered Aggregation

To prevent the [Default Behaviour](/aggregation-filtering/#default-filtering) of [Aggregated](/aggregation/) values being calculated from the [Filtered](/filtering-overview/) results, and instead calculate them from the pre-filtered data, enable the `suppressAggFilteredOnly` option.

<snippet>
const gridOptions = {
    suppressAggFilteredOnly: true,
}
</snippet>

The below example demonstrates the behaviour of filters in the grid with filtered aggregation suppressed.

The example below demonstrates how aggregated values ignore updates in the applied filters. Note the following:
- Apply a filter for the **year** column with the value **2008**
- Note how the values in the **total** column *do not* update to reflect the filtered data.

<grid-example title='Suppress Filtered Only' name='suppress-filtered-only' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>


## Filtering Group Aggregations

The [Default Behaviour](/aggregation-filtering/#default-filtering) of [Filtering](/filtering-overview/) only applies to leaf level rows, ignoring [Group Rows](/grouping/), this can become an issue when using [Aggregation](/aggregation/) as filters cannot then be used to search for groups.

### Enabling Group Aggregation Filtering

When [Filtering](/filtering-overview/) in the grid, filters will not be applied to [Group Rows](/grouping/) as they do not usually 
have any unique data of their own. However when using [Aggregation](/aggregation/) it is possible that row groups will contain unique data,
in which case you may wish to apply filters to row groups as well.

To enable this behaviour provide the grid with the `groupAggFiltering` grid option.

<snippet>
const gridOptions = {
    groupAggFiltering: true,
}
</snippet>

The example below demonstrates the different behaviours of filtering for rows. Note the following:
- Using the **total** column apply a filter for the value **6**
- Observe how the row leaf row **Natalie Coughlin** is preserved with all of its parents.
- Using the **total** column, now apply a filter for the value **38**
- Observe how the group row **United States** passes this filter due to its aggregated value, and as such preserves all of its children too.

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-all' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>

[[note]]
| Take note of the following while using `groupAggFiltering`:
| - [Set Filters](/filter-set/) are not fully supported in conjunction with this feature.
| - When `groupAggFiltering` is enabled, [Suppressing Filtered Aggregation](/aggregation-filtering/#suppressing-aggregation) is enabled by default.

### Custom Group Aggregation Filtering

Where the default behaviour of [Filtering Group Aggregations](/aggregation-filtering/#filtering-group-aggregations) does not meet the necessary requirements, a custom callback can be provided to the `groupAggFiltering` property to dictate which row levels the filters should be applied to.

<snippet>
const gridOptions = {
    groupAggFiltering: (params) => !!params.node.group,
}
</snippet>

The snippet above demonstrates how the callback can be used to selectively apply filters, in the case of this example, 
exclusively to group level rows.

The example below demonstrates how a callback has been used to provide custom row targeting for filters. Note the following:
- Using the **total** column apply a filter for the value **6**
- Observe how, despite some rows containing the value **6**, nothing has matched.
- Using the **total** column now apply a filter for the value **38**
- Observe how the group row **United States** passes this filter due to its aggregated value, and also preserves all of its children.

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-group' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter"] }'></grid-example>

The following properties of the [Row Node](/row-object/) provided by the callback parameters may be of use, and can be 
utilised to create a highly customised behaviour for row group filtering.

<api-documentation source='resources/reference.json' section="rowNodeAttributes"></api-documentation>

Continue to the next section to learn about [Other Aggregation Topics](/aggregation-filtering/).