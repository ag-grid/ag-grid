---
title: "Row Grouping - Multiple Group Columns"
enterprise: true
---

This section covers the Multiple Group Columns display type, where a group column is automatically added by the grid for 
each row group.

<image-caption src="grouping-multiple-group-columns/resources/multiple-group-columns.png" alt="Multiple Group Columns" maxWidth="80%" constrained="true" centered="true"></image-caption>

## Enabling Multiple Group Columns

To display each row group under a separate group column set `groupDisplayType = 'multipleColumns'` as shown below:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete' },
        { field: 'sport' },
        { field: 'total' }
    ],
    // display each row grouping in a separate group column
    groupDisplayType: 'multipleColumns',
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true`
declared, and a group column displayed for each column that we are grouping by.

This is demonstrated in the following example, note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- Separate group columns are displayed for `country` and `year` as `groupDisplayType = 'multipleColumns'`.

- The `country` and `year` columns are not shown in the grid as `hide=true` is set on their column definitions.

<grid-example title='Enabling Multiple Group Columns' name='enabling-multiple-group-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Group Column Configuration

The Multiple Group Columns display type adds an Auto Group Column for each row group to the grid. To change the default
configurations of these group columns, use the `autoGroupColumnDef` grid option as shown below:

<snippet>
const gridOptions = {
    autoGroupColumnDef: {
        headerValueGetter: params => `${params.colDef.headerName} Group Column`,
        minWidth: 220,
        cellRendererParams: {
            suppressCount: true,
            checkbox: true,
        }
    },
}
</snippet>

Note how in the snippet above that the `autoGroupColumnDef` can be used to override any [Column Property](/column-definitions/).

The Auto Group Columns use the [Group Cell Renderer](/group-cell-renderer/) to render group cells, and are configured via the `cellRendererParams` property.

The following example demonstrates some of the available `autoGroupColumnDef` configurations. Note that:

- The group column names are changed using the `headerValueGetter` to add 'Group Column' after each column name.

- The min width of the group column is changed via `minWidth = 220`.

- The count of each row group is removed by setting `cellRendererParams.suppressCount = true`.

- Checkboxes are displayed beside each row group by setting `cellRendererParams.checkbox = true`.

<grid-example title='Multiple Group Columns Configuration' name='multiple-group-columns-configuration' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Showing Open Groups

Setting the grid property `showOpenedGroup=true` will show the name of the opened group inside the group column.
This is useful when the user scrolls down through the children of the group, and the row showing what group
was opened is scrolled out of view.

The following example uses `showOpenedGroup=true` with many group columns. The open groups are shown across all
group columns where the group is open for that column.

<grid-example title='Show Opened Groups Many Columns' name='show-opened-groups-many-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Hide Open Parents

Depending on your preference, you may wish to hide parent rows when they are open. This gives the impression to the user that the children takes the place of the parent row. This feature only makes sense when groups are in different columns. To turn this feature on set `groupHideOpenParents=true`.

Below shows examples of this. Notice that each group row has [aggregated values](/aggregation/) which are explained in a documentation page of their own. When the group is closed, the group row shows the aggregated result. When the group is open, the group row is removed and in its place the child rows are displayed. To allow closing the group again, the group column knows to display the parent group in the group column only (so you can click on the icon to close the group).

The example below demonstrates hiding open parents using auto group columns. To help demonstrate, the grid is configured to shade the rows different colors for the different group levels, so when you open a group, you can see the background change indicating that the group row is no longer displayed, instead the children are in it's place.

Filter is achieved for each column by providing a `filterValueGetter` for the `autoGroupColumnDef`. The filterValueGetter returns the value of the grouped column - eg for Country, it will filter on Country.

<grid-example title='Hide Open Parents' name='hide-open-parents' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Next Up

Continue to the next section to learn about the [Group Rows](../grouping-group-rows/) display type.