---
title: "Row Grouping - Single Group Column"
enterprise: true
---
This section explains how to use a single group column that contains a row grouping hierarchy.

<image-caption src="grouping-single-group-column/resources/single-group-column.png" alt="Single Group Column" centered="true"></image-caption>

## Enabling Single Group Column

When there is at least one active row group, a single group column containing a row grouping hierarchy will be added to
the left-hand side of the grid. To group rows by a particular column, enable the `rowGroup` column property as shown below:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'year', rowGroup: true },
        { field: 'sport' },
        { field: 'total' }
    ],
    // display each row grouping in a single group column
    treeDisplayType: 'singleColumn',
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.

The example below demonstrates the default row grouping behaviour. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- A group column is added to the left-hand side of the grid as there are active row groups.

- The `country` and `year` columns are still shown in the grid (to hide set `hide=true` on their column definitions).

- The number of grouped rows is shown in parentheses at each row group level.

<grid-example title='Single Group Column' name='single-group-column' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Row Group Order

By default, the grid will order the groups based on the order of the supplied column definitions. To explicitly set the
grouping order, use `rowGroupIndex` instead of `rowGroup` as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        // index = 1, gets grouped second
        { field: "country", rowGroupIndex: 1 },
        // index = 0, gets grouped first
        { field: "year", rowGroupIndex: 0 },
    ]
}
</snippet>

In the snippet above, `year` has a lower `rowGroupIndex` than `country` which means it will be grouped first. The
`rowGroupIndex` values can be any sortable number, and they do not need to start at zero (or one). Gaps in the sequence
is also permitted.

The following example shows how the `rowGroupIndex` can be used to ensure rows are grouped by 'year' first and then
`country` even though the `country` column definition is supplied to the grid first.

<grid-example title='Row Group Order' name='row-group-order' type='generated' options='{ "enterprise": true, "exampleHeight": 500, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Showing Open Groups

Setting the grid property `showOpenedGroup=true` will show the name of the opened group inside the group column.
This is useful when the user scrolls down through the children of the group and the row showing what group
was opened is scrolled out of view.

The example below uses `showOpenedGroup=true` with one group column. The open group is shown at the leaf level.

<grid-example title='Show Opened Groups' name='show-opened-group' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Adding Values To Leaf Nodes

You may have noticed in the examples so far that the group columns don't produce values on the leaf nodes, the cells are empty. If you want to add values you can add a [valueGetter](/value-getters/) or `field` to the colDef and it will be used to render the leaf node.

A side effect of this is that filtering will now work for the columns using the field values.

This example shows specifying `field` in the auto group column. Note the following:

- The group column shows both groups (Country and Year) as well as Athlete at the leaf level.
- The field (Athlete) is used for filtering.

<grid-example title='Adding Values To Leaf Nodes' name='adding-values-to-leaf-nodes' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Removing Single Children

If your data has groups with only one child, then it can make sense to collapse these groups as there is no benefit to the user creating groups with just one child, it's arguably waste of space.

To turn this feature on set either `groupRemoveSingleChildren=true` or `groupRemoveLowestSingleChildren=true`.

- **groupRemoveSingleChildren:** Removes groups from display if they only have one child.
- **groupRemoveLowestSingleChildren:** Removes groups from display if they only have one child and the groups is at the lowest level (ie contains leaf nodes).

The example below shows this feature. Note the following:

- **Normal:** Shows the rows as normal, nothing is removed. All groups have their children count in brackets after the group.
- **Remove Single Children:** Removes single children using the property `groupRemoveSingleChildren=true`. All groups with just one child are remove.
- **Remove Lowest Single Children:** Removes single children using the property `groupRemoveLowestSingleChildren=true`. All groups for the 'City' column with just one child are remove. The 'City' column is the lowest level group, so it's the only group candidate to be removed when one child.

<grid-example title='Removing Single Children' name='remove-single-children' type='vanilla' options='{ "enterprise": true, "exampleHeight": 540, "modules":["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

[[note]]
| Filtering does not impact what groups get removed. For example if you have a group with two
| children, the group is not removed, even if you apply a filter that removes one of the children.
| This is because AG Grid does grouping first and then applies filters second. If you change the filter,
| only the filter is reapplied, the grouping is not reapplied.

[[note]]
| The properties `groupRemoveSingleChildren`, `groupRemoveLowestSingleChildren`
| and `groupHideOpenParents` are mutually exclusive, you can only pick one.
| Technically it doesn't make sense to mix these. They don't work together as the logic for removing single
| children clashes with the logic for hiding open parents. Both want to remove parents at different times
| and for different reasons.