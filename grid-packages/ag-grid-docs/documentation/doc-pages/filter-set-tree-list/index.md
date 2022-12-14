---
title: "Set Filter - Tree List"
enterprise: true
---

This section describes the behaviour of the Set Filter Tree List and shows how it can be configured.

The Tree List allows the user to display the values in the Filter List grouped in a tree structure.

<image-caption src="filter-set-tree-list/resources/set-filter-tree-list.png" alt="Filter Tree List" constrained="true" centered="true"></image-caption>

## Enabling Tree List

Tree List is enabled by setting `filterParams.treeList = true`. There are four different ways the tree structure can be created:
- The column values are of type `Date`, in which case the tree will be year -> month -> day.
- Tree Data mode is enabled and the column is a group column. The Filter List will match the tree structure. A Key Creator must be supplied to convert the array of keys.
- Grouping is enabled and the column is the group column. The Filter List will match the group structure. A Key Creator must be supplied to convert the array of keys.
- A `filterParams.treeListPathGetter` is provided to get a custom tree path for the column values.

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

## Formatting Values

The values can be formatted in the Filter List via `filterParams.treeListFormatter`. This allows a different format to be used for each level of the tree (compared to the Value Formatter which is applied equally to every value).

<interface-documentation interfaceName='ISetFilterParams' names='["treeListFormatter"]' config='{"description":""}'></interface-documentation>

## Mini Filter Behaviour

 When searching in the Mini Filter, all children will be included when a parent matches the search value. A parent will be included if it has any children that match the search value, or it matches itself.

## Tree List Example

The following example demonstrates some different types of Tree List in the Set Filter. Note the following:

1. The **Group**, **Date** and **Gold** columns all have `filterParams.treeList = true`
2. The **Group** column Filter List matches the format of the Row Grouping. A Key Creator is specified to convert the path into a string.
3. The **Date** column is grouped by year -> month -> date. `filterParams.treeListFormatter` is provided which formats the numerical month value to display as the name of the month.
4. The **Gold** column has `filterParams.treeListPathGetter` provided which groups the values into a tree of >2 and <=2.

<grid-example title='Filter Tree List' name='filter-tree-list' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Next Up

Continue to the next section: [Mini Filter](/filter-set-mini-filter/).
