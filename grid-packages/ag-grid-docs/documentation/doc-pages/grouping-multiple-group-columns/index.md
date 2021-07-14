---
title: "Row Grouping - Multiple Group Columns"
enterprise: true
---
This section explains how to present row groups using multiple group columns.

<image-caption src="grouping-multiple-group-columns/resources/multiple-group-columns.png" alt="Multiple Group Columns" centered="true"></image-caption>

## Enabling Multiple Group Columns

It is also possible to have a group column per row group by setting `groupDisplayType = 'multipleColumns'` as shown below:

<snippet spaceBetweenProperties="true" inlineReactProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'sport' },
        { field: 'total' }
    ],
    // display each row grouping in a separate column
    groupDisplayType: 'multipleColumns',
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true`
declared, and a group column displayed for each column that we are grouping by.

This is demonstrated in the following example, note the following:

- Separate group columns are displayed for `country` and `year` as `groupDisplayType = 'multipleColumns'`.

- The `country` and `year` columns used for grouping are hidden, by enabling the `hide` column property, as they are redundant.

<grid-example title='Multiple Group Columns' name='multiple-group-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

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

The example below demonstrates hiding open parents using auto group columns. To help demonstrate, the grid is configured to shade the rows different colors for the different group levels, so when you open a group, you can see the background change indicating that the group row is no longer display, instead the children are in it's place.

Filter is achieved for each column by providing a `filterValueGetter` for the `autoGroupColumnDef`. The filterValueGetter returns the value of the grouped column - eg for Country, it will filter on Country.

<grid-example title='Hide Open Parents' name='hide-open-parents' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>
