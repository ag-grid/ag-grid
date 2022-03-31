---
title: "Aggregation - Filtering"
enterprise: true
---

This section covers aggregation filtering. 

## Default Filtering

The grid calculates aggregated values after rows not matching your filters have been removed. This means that any filters
you apply will affect the resulting aggregation value.

Note how in the example below, when you apply a filter to the year column the values in the aggregation columns change.

<grid-example title='Aggregation and Filters' name='filters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Suppressing Aggregation

You can prevent the grid from updating to reflect the filtered rows by enabling the [suppressAggFilteredOnly](/grid-properties/#reference-rowPivoting-suppressAggFilteredOnly) option.

<snippet spaceBetweenProperties="true">
|const gridOptions = {
|   suppressAggFilteredOnly: true,
|}
</snippet>

Note how in the example below, when you apply a filter to the year column the values in the aggregation columns do not change.

<grid-example title='Suppress Filtered Only' name='suppress-filtered-only' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Filtering Row Groups

When filtering in the grid your filters will not be applied to group level rows, as they do not usually have any unique data of their own. When using aggregation you may find some value in filtering for group values too, to enable this use the [groupAggFiltering](/grid-properties/#reference-rowPivoting-groupAggFiltering) option.

When `groupAggFiltering` is enabled, the `suppressAggFilteredOnly` property is also implicitly enabled by default.

[[note]]
| Set filters are not fully supported with the property `groupAggFiltering` active.

### Filtering on all group and leaf levels

To simply enable the behaviour and apply filters to all group and leaf levels, you can set the `groupAggFiltering` property to `true`. The grid will then apply filters to every row, both leaf and group to check for a match, should a group row match then all of its children will also be persisted. 

Note how in the example below, the filters can be applied to any row, no matter whether it is a leaf or a group.

<snippet>
|const gridOptions = {
|   groupAggFiltering: true,
|}
</snippet>

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-all' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

### Filtering on customised row levels

Alternatively, a callback can instead be provided, allowing for finer control over which groups the filters can be applied to.

The following properties of the Row Node may come in useful while creating a callback.

<api-documentation source='resources/reference.json'></api-documentation>

Note how in the example below, the filters can be applied to any group node, but not the leaf nodes.

<snippet>
|const gridOptions = {
|   groupAggFiltering: (params) => !!params.node.group,
|}
</snippet>

<grid-example title='Group and Leaf Aggregate Filtering' name='agg-filtering-group' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

Continue to the next section to learn about [Other Aggregation Topics](/aggregation-filtering/).