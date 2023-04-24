---
title: "Set Filter - Tree List"
enterprise: true
---

This section describes the behaviour of the Set Filter Tree List and shows how it can be configured.

The Tree List allows the user to display the values in the Filter List grouped in a tree structure.

<image-caption src="filter-set-tree-list/resources/set-filter-tree-list.png" alt="Filter Tree List" constrained="true" centered="true"></image-caption>

## Enabling Tree Lists

Tree List is enabled by setting `filterParams.treeList = true`. There are four different ways the tree structure can be created:
- The column values are of type `Date`, in which case the tree will be year -> month -> day.
- Tree Data mode is enabled and the column is a group column. The Filter List will match the tree structure. A Key Creator must be supplied to convert the array of keys.
- Grouping is enabled and the column is the group column. The Filter List will match the group structure. A Key Creator must be supplied to convert the array of keys.
- A `filterParams.treeListPathGetter` is provided to get a custom tree path for the column values. If the column values are [Complex Objects](/filter-set-filter-list/#complex-objects), a Key Creator will also be required.

<interface-documentation interfaceName='ISetFilterParams' names='["treeListPathGetter","keyCreator"]' config='{"description":""}'></interface-documentation>

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'date',
            filter: 'agSetColumnFilter',
            filterParams: {
                treeList: true,
            }
        }
    ],
    autoGroupColumnDef: {
        field: 'athlete',
        filter: 'agSetColumnFilter',
        filterParams: {
            treeList: true,
            keyCreator: params => params.value.join('#')
        },
    },
}
</snippet>

The following example demonstrates enabling different types of Tree List in the Set Filter. Note the following:

- The **Group**, **Date** and **Gold** columns all have `filterParams.treeList = true`.
- The **Group** column Filter List matches the format of the Row Grouping. A Key Creator is specified to convert the path into a string.
- The **Date** column is grouped by year -> month -> day.
- The **Gold** column has `filterParams.treeListPathGetter` provided which groups the values into a tree of >2 and <=2.

<grid-example title='Filter Tree List' name='filter-tree-list' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Sorting Tree Lists

Sorting values for Tree Lists is similar to [Sorting Filter Lists](/filter-set-filter-list/#sorting-filter-lists), with the exception that if the column values are of type `Date`, they will instead be sorted based on the raw date values.

A Comparator can be used to change the sort order of Tree Lists just like with [Sorting Filter Lists](/filter-set-filter-list/#sorting-filter-lists), with the same conditions applying. For Tree Lists, the Comparator is applied to the child values, sorting the entire tree in one pass rather than for each level. The Comparator will be provided the following:
- The column value for `Date` objects and custom tree paths.
- The tree path (`string[]` or `null`) for Tree Data and Grouping.

The following example demonstrates changing the sorting of the Tree List. Note the following:

- Tree Data is turned on via `treeData = true`.
- The **Employee** column has `filterParams.treeList = true` and the Filter List matches the format of the Tree Data. A Key Creator is specified to convert the path into a string.
- The **Employee** column has a `filterParams.comparator` supplied which displays the Filter List in reverse alphabetical order.
- The **Date** column has `filterParams.treeList = true`. It also has a `filterParams.comparator` supplied which displays the Filter List in reverse date order.

<grid-example title='Sorting Tree Lists' name='sorting-tree-lists' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Formatting Values

The values can be formatted in the Filter List via `filterParams.treeListFormatter`. This allows a different format to be used for each level of the tree.

<interface-documentation interfaceName='ISetFilterParams' names='["treeListFormatter"]' config='{"description":""}'></interface-documentation>

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'date',
            filter: 'agSetColumnFilter',
            filterParams: {
                treeList: true,
                treeListFormatter: (pathKey, level, parentPathKeys) => {
                    if (level === 0 && pathKey) {
                        return `Year ${pathKey}`;
                    }
                    return pathKey;
                }
            }
        }
    ],
}
</snippet>

If a formatter is provided, it will also need to handle [Missing Values](/filter-set-filter-list/#missing-values), which will have a `pathKey` of `null`. Without a formatter, these are displayed as `(Blanks)`.

`filterParams.valueFormatter` is not used in the Filter List when `filterParams.treeList = true`. However, it is still used to format the values displayed in the Floating Filter. The value provided to the Value Formatter is the original value, e.g. a `Date` object for dates, the path for Tree Data or Grouping, or the column value for a custom tree path.

The following example demonstrates formatting the Tree List. Note the following:

- The **Group** column has `filterParams.treeList = true`.
- The **Group** column has a `filterParams.treeListFormatter` provided which formats the country values in the Filter List to add a two letter country code. Missing values are formatted as `(Blanks)`.
- The **Date** column has `filterParams.treeList = true`.
- The **Date** column has a `filterParams.treeListFormatter` provided which formats the numerical month value to display as the name of the month. Missing values are formatted as `(Blanks)`.
- When a date is filtered in the **Date** column , `filterParams.valueFormatter` is used to format the value displayed in the Floating Filter.

<grid-example title='Formatting Tree List Values' name='formatting-tree-list-values' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Complex Objects

[Complex Objects](/filter-set-filter-list/#complex-objects) can be used with Tree List in the same way as with a normal Set Filter List.

The following example demonstrates complex objects being used with Tree Data and the Tree List. Note the following:

- Tree Data is turned on via `treeData = true`.
- The **Employee** column contains complex objects and has `filterParams.treeList = true`.
- The data path returned by `getDataPath` does not have unique IDs at each level. The **Employee** column has a `treeListFormatter` defined which uses the parent path keys to get the full route to the node, so that the correct value can be displayed in the Tree List.

<grid-example title='Tree List Complex Objects' name='tree-list-complex-objects' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Mini Filter Behaviour

 When searching in the Mini Filter, all children will be included when a parent matches the search value. A parent will be included if it has any children that match the search value, or it matches itself.

## Filter Value Tooltips

When using Tree List with a [Custom Tooltip Component](/component-tooltip/), the tooltip params will be of type `ISetFilterTreeListTooltipParams` which extends the Custom Tooltip params to include the level of the item within the tree.

Additional property available on `ISetFilterTreeListTooltipParams`:

<interface-documentation interfaceName='ISetFilterTreeListTooltipParams' names='["level"]' config='{"description":""}'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Mini Filter](/filter-set-mini-filter/).
