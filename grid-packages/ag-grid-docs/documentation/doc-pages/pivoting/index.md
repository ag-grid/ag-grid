---
title: "Pivoting"
enterprise: true
---

Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country to make columns for Ireland, United Kingdom, USA etc.

Pivoting only makes sense when mixed with aggregation. If you turn a column into a pivot column, you must have at least one aggregation (value) active for the configuration to make sense. For example, if pivoting by country, you must provide something you are measuring such as 'gold medals per country'.

As with all features, pivoting works with all frameworks the grid supports.

## Pivot Mode

Pivot mode is required to be turned on for pivoting to work. When the grid is in pivot mode, the following will happen:

- Only columns with Group, Pivot or Value active will be included in the grid.
- Only aggregated rows will be shown, the lowest level `rowData` will not be displayed.

If pivot mode is off, then adding or removing pivot columns will have no effect.

[[note]]
| To allow a column to be used as pivot column via the [Tool Panel](/tool-panel/),
| set `enablePivot=true` on the required columns. Otherwise you won't be able to drag
| and drop the columns to the pivot drop zone from the Tool Panel.

## Specifying Pivot Columns

To pivot rows by a particular column, mark the column you want to group with `pivot=true`. There is no limit on the number of columns that the grid can pivot by. For example, the following will pivot the rows in the grid by country and then sport:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: "country", pivot: true },
        { field: "sport", pivot: true }
    ]
}
</snippet>

## Example: Simple Pivot

The example below shows a simple pivot on the Sport column using the Gold, Silver and Bronze columns for values.

Columns Date and Year, although defined as columns, are not displayed in the grid as they have no group, pivot or value associated with them.

<grid-example title='Simple Example' name='simple' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Pivot Mode vs Pivot Active

It is possible to have pivot mode turned on even though there is no pivot active on the grid. In this scenario, the grid will display the data as normal but will strip out columns that have no grouping or value active.

The example below demonstrates the difference between pivot mode and having a column with pivot active. The example has three modes of operation that can be switched between using the top buttons. The modes are as follows:

- **1 - Grouping Active:** This is normal grouping. The grid groups with aggregations over Gold, Silver and Bronze. The user can drill down to the lowest level row data and columns without aggregation or group (eg Country, Year, Date and Sport) are shown.

- **2 - Grouping Active with Pivot Mode:** This is grouping with pivotMode=true, but without any pivot active. The data shown is identical to the first option except the grid removes access to the lowest level row data and columns without aggregation or group are not shown.

- **3 - Grouping Active with Pivot Mode and Pivot Active:** This is grouping with pivotMode=true and pivot active. Although it appears similar to the second option, there is no pivot active in the second option.

<grid-example title='Pivot Mode Vs Pivot Active' name='pivot-mode' type='generated' options='{ "enterprise": true, "exampleHeight": 630, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

Note that a pivot can only be active if pivot mode is on. If pivot mode is off, all pivot columns are ignored.

## Pivot Mode & Visible Columns

When not in pivot mode, only columns that are visible are shown in the grid. To remove a column from the grid, use `columnApi.setColumnVisible(colKey, visible)`. Checking a column in the toolPanel will set the visibility on the column.

When in pivot mode and not pivoting, only columns that have row group or aggregation active are included in the grid. To add a column to the grid you either add it as a row group column or a value column. Setting visibility on a column has no impact when in pivot mode. Checking a column in the toolPanel will either add the column as a row group (if the column is configured as a dimension) or as an aggregated value (if the columns is configured as a value).

When in pivot mode and pivoting, then the columns displayed in the grid are secondary columns (explained below) and not the primary columns. The secondary columns are composed of the pivot and value columns. To have a column included in the calculation of the secondary columns, it should be added as either a pivot or a value column. As with 'pivot mode and not pivoting', checking a column in the toolPanel while in pivot mode will add the column as a row group or an aggregated value. You must drag the column to a pivot drop zone in order to add it as a pivot column. As before, setting visibility on the column will have no effect when in pivot mode.

## Primary vs Secondary Columns

When pivot mode is off, the columns in the grid correspond to the column definitions provided in the grid configuration. When pivot mode is on and pivot is active, the columns in the grid are composed by a matrix of the pivot columns and the aggregated value columns.

For example, consider the columns from the examples `{ Year and Gold }`. If a pivot is placed on Year and an aggregation of `sum` is placed on gold, then the secondary columns that actually get displayed in the grid will be: `{ 2002 sum(Gold), 2004 sum(Gold), 2006 sum(Gold), 2008 sum(Gold), 2010 sum(Gold), 2012 sum(Gold) }`.

The primary and secondary columns behave in different ways in the following scenarios:


- **Tool Panel**: The toolPanel always displays primary columns.

- **Filtering**: Filters are always set on primary columns.

- **Sorting**:  Sorting can be on primary or secondary columns, depending on what is displayed inside the grid.
-  **Column State**:  Storing and restoring column state view the `columnApi.getColumnState()` and `columnApi.applyColumnState(params)` methods work solely on primary columns.

## Looking up Secondary Columns

As mentioned above, the secondary columns in the grid are created by the grid by cross referencing pivot columns with value columns. The result of which are new columns that have column ID's generated by the grid. If you want to use the column API to manage the generated columns (eg to set their width, apply a sort etc) you need to look up the column. The grid provides a utility function to look up such columns called `getSecondaryPivotColumn(pivotCols, valueCol)`

<api-documentation source='column-api/api.json' section='Pivoting' names='["getSecondaryPivotColumn"]'></api-documentation>

<snippet>
|// look up the column that pivots on country Ireland and aggregates gold
|const irelandGoldColumn = gridOptions.columnApi.getSecondaryPivotColumn(['Ireland'],'gold');
|
|// change the width of the secondary column
|gridOptions.columnApi.setColumnWidth(irelandGoldColumn, newWidth);
|
|// look up the column that pivots on country SausageKingdom and year 2002 and aggregates silver
|const sausageKingdomColumn = gridOptions.columnApi.getSecondaryPivotColumn(['SausageKingdom','2002'],'silver');
|
|console.log('found column with id ' + sausageKingdomColumn.getId());
</snippet>

## Filtering with Pivot

Filtering is always on primary columns. It is not possible, nor would it make sense, to set a filter on a secondary column.


If pivoting and a filter changes then the set of secondary columns is recalculated based on the newly available columns and aggregation is recalculated.

You can change the filter on primary columns using the API at all times, regardless of what columns (primary or secondary) are displayed in the grid.

Below demonstrates the impact of changing filter on pivoting. The pivot is executed on rowData after the filter is complete.

Filters always belong to primary columns. When in pivot mode, filters are not accessible through the column menu (as secondary columns are used), however filters can always be accessed through the filters tool panel.

<grid-example title='Filtering With Pivot' name='filter' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "rowgrouping", "columnpanel", "filterpanel", "setfilter", "menu"] }'></grid-example>

## Pivot Column Groups

Multiple group columns will be shown in the grid when there is more than one active pivot column. These columns can be collapsed, expanded or fixed as described in the sections below:

### Expandable Pivot Column Groups

When there is more than one active pivot column, multiple group columns will appear in a collapsed state by default. Each value column will be aggregated based on the configured `colDef.aggFunc` at each column group level.

<api-documentation source='column-properties/properties.json' section='grouping' names='["aggFunc"]'></api-documentation>

<grid-example title='Expandable Pivot Column Groups' name='expandable-pivot-column-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

### Fixed Pivot Column Groups

To fix the pivot column groups without the ability to expand and collapse the column groups, enable the following grid option property: `suppressExpandablePivotGroups=true`.

<grid-example title='Fixed Pivot Column Groups' name='fixed-pivot-column-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Pivot Row Totals

When in pivot mode you can also include automatically calculated Row Total Columns. These total columns will use the provided aggregation function on the value columns to 'roll-up' each group level.

To enable Pivot Row Totals, declare the following property: `gridOption.pivotRowTotals = 'before' | 'after'`. The values `before` and `after` are used to control the position of the row total columns relative to the other pivot columns.

The example below demonstrates Pivot Row Totals as follows:

- Pivot Row Totals are positioned before the other pivot group columns using: `gridOption.pivotRowTotals = 'before'`.
- Pivot Row Totals are added for each of the value columns: 'gold', 'silver' and 'bronze'.

<grid-example title='Pivot Row Totals' name='row-totals' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Pivot Column Group Totals

When in pivot mode you can also include automatically calculated total pivot columns. These total columns will use the provided aggregation function on the value columns to 'roll-up' each group level.


Pivot column groups that contain more than one child will have a total column included. Expanding this group will reveal the columns that make up this total value.

To enable total columns set `gridOptions.pivotColumnGroupTotals = 'before' | 'after'`. The values `before` and `after` are used to control the relative position of the total column when the group is expanded.

All value columns must use the same aggregation function for the total column to make sense, otherwise the total column will not be included.


The example below demonstrates Pivot Column Group Totals as follows:

- Pivot Column Group Totals added on ['sport', 'year'] columns.
- Expanding pivot groups reveals columns that make up totals.

<grid-example title='Pivot Column Group Totals' name='totals' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Saving & Restoring Column State with Pivot

Saving and restoring column state is also possible when pivoting. The secondary columns generated by pivoting have IDs dependant on the pivot setup, so assuming the row data is the same, the same secondary columns will result and it will be possible to apply saved states to the columns.

Below shows some examples of saving and restoring state with pivot in mind. Note that `pivotMode` is not stored as part of the column state. If `pivotMode` is important to your columns state, it needs to be stored separately.

<grid-example title='Saving & Restoring Column State' name='state' type='generated' options='{ "enterprise": true, "exampleHeight": 630, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel", "filterpanel"] }'></grid-example>

## Pivot API

Below shows examples of using the pivot API directly. Use this is you want to build out your own toolPanel.

The example also demonstrates exporting to CSV while using Pivot. Basically what you see inside the grid is what will be exported.

<grid-example title='Pivot API' name='api' type='generated' options='{ "enterprise": true, "exampleHeight": 620, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel", "filterpanel", "csv"] }'></grid-example>

## Ordering Pivot Columns

The user is free to drag columns to reorder them and you are able to reorder columns via the columnApi in the normal way. However you may want to change the default order of the pivot columns.

**Order of Pivot Value Column Groups**<br />
Pivot value columns are the column groups created by the pivot values - eg if 'Country' is a pivot column, thn the Pivot Value Column Groups are 'Ireland', 'UK', etc. These columns are ordered alphabetically by default. To override this, provide `pivotComparator(a,b)` function in the column definition. See the example below for a demonstration.

<api-documentation source='column-properties/properties.json' section='pivoting' names='["pivotComparator"]'></api-documentation>

**Order of Pivot Value Columns**<br/>
Pivot value columns are the lowest level column and correspond to the values selected in your pivot. For example, if value columns are the months of the year, then the values will be 'Jan', 'Feb', 'Mar' etc, one for each value column added. The order of these will either be a) the order the value columns appear in the original column definitions if you provide 'aggFunc' as part of the columns or b) the order you add the columns as value columns.

## Manipulating Secondary Columns

If you are not happy with the secondary columns provided by the grid, you have the opportunity to change any detail inside them. This is done by providing callbacks `postProcessSecondaryColDef` and `postProcessSecondaryColGroupDef`. The example below shows using these callbacks to modify the labels for the headers. You are free to change any of the items you can define on a column except `field` as the field attribute is needed by the grid to pull out the value.

<grid-example title='Secondary Columns' name='secondary-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 650, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Hide Open Parents

The example below shows mixing in different options for the row group column. For more info on these properties, see [Grouping Rows](/grouping/).

- `groupHideOpenParents=true: ` So that when the row group is expanded, the parent row is not shown.
- `groupMultiAutoColumn=true: ` So that one group column is created for each row group column (country and athlete).
- `groupDefaultExpanded=2: ` So that all the groups are opened by default.

<grid-example title='Hide Open Parents' name='hide-open-parents' type='generated' options='{ "enterprise": true, "exampleHeight": 650, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Change Detection and Pivot

While pivoting, you can do delta changes to your data and have the grid reflect this delta changes with animations.

This is demonstrated in the section on [Change Detection and Pivot](/change-detection/#change-detection-and-pivot), so rather than repeat that, check out the example there.
