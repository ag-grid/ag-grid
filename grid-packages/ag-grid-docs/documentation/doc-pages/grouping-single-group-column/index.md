---
title: "Row Grouping - Single Group Column"
enterprise: true
---

This section covers the Single Group Column display type, where a single group column is automatically added by the grid
containing all row groups under a single row group hierarchy.

<image-caption src="grouping-single-group-column/resources/single-group-column.png" alt="Single Group Column" maxWidth="80%" constrained="true" centered="true"></image-caption>

## Enabling Single Group Column

By default, a Single Group Column is used, but it can be explicitly set using `groupDisplayType = 'singleColumn'` as shown below:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'total' }
    ],
    // optional as 'singleColumn' is the default group display type
    groupDisplayType: 'singleColumn',
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.

The example below demonstrates the default row grouping behaviour. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- A group column is added to the left-hand side of the grid as there are active row groups.

- The `country` and `year` columns are not shown in the grid as `hide=true` is set on their column definitions.

<grid-example title='Enabling Single Group Column' name='enabling-single-group-column' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Group Column Configuration  

The Single Group Column display type adds a single Auto Group Column to the grid. To change the default configuration
of this group column, use the `autoGroupColumnDef` grid option as shown below:

<snippet>
const gridOptions = {
    autoGroupColumnDef: {
        headerName: 'My Group',
        minWidth: 220,
        cellRendererParams: {
            suppressCount: true,
            checkbox: true,
        }
    },
}
</snippet>

Note how in the snippet above that the `autoGroupColumnDef` can be used to override any [Column Property](/column-definitions/). 

The Auto Group Column uses the [Group Cell Renderer](/group-cell-renderer/) to render group cells, and are configured via the `cellRendererParams` property.

The following example demonstrates some of the available `autoGroupColumnDef` configurations. Note that:

- The group column name is changed by setting `headerName = 'My Group'`.

- The min width of the group column is changed via `minWidth = 220`.  

- The count of each row group is removed by setting `cellRendererParams.suppressCount = true`.

- Checkboxes are displayed beside each row group by setting `cellRendererParams.checkbox = true`.

<grid-example title='Single Group Column Configuration' name='single-group-column-configuration' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

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
- **Remove Single Children:** Removes single children using the property `groupRemoveSingleChildren=true`. All groups with just one child are removed.
- **Remove Lowest Single Children:** Removes single children using the property `groupRemoveLowestSingleChildren=true`. All groups for the 'City' column with just one child are removed. The 'City' column is the lowest level group, so it's the only group candidate to be removed when it only has one child.

<grid-example title='Removing Single Children' name='remove-single-children' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules":["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

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

## Next Up

Continue to the next section to learn about the [Multiple Group Columns](../grouping-multiple-group-columns/) display type.