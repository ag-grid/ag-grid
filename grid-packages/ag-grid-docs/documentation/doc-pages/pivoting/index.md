---
title: "Pivoting"
enterprise: true
---

Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country to make columns for Ireland, United Kingdom, USA etc.

Pivoting only makes sense when mixed with aggregation. If you turn a column into a pivot column, you must have at least one aggregation (value) active for the configuration to make sense. For example, if pivoting by country, you must provide something you are measuring such as 'gold medals per country'.

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

When in pivot mode and pivoting, then the columns displayed in the grid are pivot result columns (explained below) and not the grid options supplied columns. The pivot result columns are a product of the pivot and value columns. To have a column included in the calculation of the pivot result columns, it should be added as either a pivot or a value column. As with 'pivot mode and not pivoting', checking a column in the toolPanel while in pivot mode will add the column as a row group or an aggregated value. You must drag the column to a pivot drop zone in order to add it as a pivot column. As before, setting visibility on the column will have no effect when in pivot mode.

## Columns vs Pivot Result Columns

When Pivot Mode is off, the Columns in the grid correspond to the Column Definitions provided to the grid by the application. When Pivot Mode is on and Pivot is active, the Columns in the grid are Pivot Result Columns, which are the combinatorial product of Pivot Column values and the aggregated Value Columns.

For example, consider the Columns from the examples `Year` and `Gold`. If a Pivot is placed on Year and an Aggregation of `sum` is placed on Gold, then the Pivot Result Columns that get displayed in the grid would be: `2002 sum(Gold)`, `2004 sum(Gold)`, `2006 sum(Gold)`, `2008 sum(Gold)`, `2010 sum(Gold)` and `2012 sum(Gold)`.

The Pivot Result Columns do not behave the same as the initial Columns in the following scenarios:
- **Tool Panel**: The Tool Panel shows initial Columns, never Pivot Result Columns.
- **Filtering**: Filtering on Pivot Result Columns is slightly different, [See below](/pivoting/#filtering) for details.

## Looking up Pivot Result Columns

As mentioned above, the Pivot Result Columns in the grid are created by the grid by cross referencing Pivot Columns with Value Columns. The result of which are new Pivot Result Columns that have Column ID's generated by the grid. If you want to use the Column API to manage the Pivot Result Columns (e.g. to set width, apply sort etc) you look up the column using the Columns API `getPivotResultColumn(pivotCols, valueCol)`.

<api-documentation source='column-api/api.json' section='Pivoting' names='["getPivotResultColumn"]'></api-documentation>

<snippet>
|// look up the Column that pivots on country Ireland and aggregates Gold
|const irelandGoldColumn = gridOptions.columnApi.getPivotResultColumn(['Ireland'],'gold');
|
|// change the width of the Pivot Result Column
|gridOptions.columnApi.setColumnWidth(irelandGoldColumn, newWidth);
|
|// look up the Column that pivots on country SausageKingdom and year 2002 and aggregates silver
|const sausageKingdomColumn = gridOptions.columnApi.getPivotResultColumn(['SausageKingdom','2002'],'silver');
|
|console.log('found column with id ' + sausageKingdomColumn.getId());
</snippet>

## Pivot Result Column Definitions

It is possible to manipulate the [Column Definition](/column-definitions/) of the Pivot Result Columns using the `processPivotResultColDef` callback (or `processPivotResultColGroupDef` callback for Column Groups).

[[note]]
| The `field` and `colId` properties of the Pivot Result Column definitions should not be overwritten.

<snippet>
|const gridOptions = {
|    processPivotResultColDef: (colDef) => {
|        if (colDef.pivotValueColumn.getId() === 'gold') {
|            colDef.headerName = colDef.headerName.toUpperCase();
|        }
|    },
|    processPivotResultColGroupDef: (colGroupDef) => {
|        if (colGroupDef.pivotKeys.length && colGroupDef.pivotKeys[0] === '2010') {
|            colGroupDef.headerClass = 'color-background'
|        }
|        colGroupDef.headerName = 'Year ' + colGroupDef.headerName
|    },
|}
</snippet>

In the example below, notice how applying these functions can be used to manipulate the headers
- The Group Headers have had `Year` prefixed onto each value
- The Group `Year 2010` has been coloured yellow
- The Columns pivoted from the `Gold` Column have been uppercased

<grid-example title='Pivot Result Columns' name='secondary-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 650, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Filtering

It is possible to filter on both grid options supplied columns and pivot result columns when pivoting is active in the grid. However, there are 
some differences in how users can filter on both column types. These differences are described in sections below:

### Filtering on Regular Columns

When pivoting is active in the grid,  [Filtering](/filtering-overview/) on columns supplied in the grid options is possible through the 
[Filters Tool Panel](/tool-panel-filters/) and the [Filter API](/grid-api/#reference-filter).

[[note]]
| When pivoting is active, it is not possible to filter on regular columns using [Column Filters](/filtering/) as the grid only displays group and pivot result columns.

These filters are applied to the data before it is pivoted, as such a change in these filters can effect not only the resulting
values and rows, but also the columns generated from the pivot.

<snippet>
|const gridOptions = {
|   columnDefs: [
|       { field: 'country', rowGroup: true, filter: true },
|       { field: 'year', pivot: true, filter: true },
|       { field: 'sport', filter: true },
|       { field: 'gold', aggFunc: 'sum' },
|       { field: 'silver', aggFunc: 'sum' },
|       { field: 'bronze', aggFunc: 'sum' },
|   ],
|   pivotMode: true,
|   sideBar: 'filters',
|}
</snippet>

The snippet above has been used to construct the example below, demonstrating the effects of applying filters to the columns in the grid options while pivot mode is enabled.

Filtering on a grouped column:
- Using the filters tool panel, deselect **United States** using the **Country** column filters
- Observe how the row has disappeared from the pivot grid
- Make note of the column group for the year **2002**
- Now, using the filters tool panel, deselect **Norway**, again using the **Country** column filters
- Observe now, how not only the row has disappeared, but so has the **2002** year column group

Filtering on a pivoted column:
- Using the filters tool panel, deselect **2002** using the **Year** column filters
- Observe how, rather than reducing the number of rows, the **2002** column group and the columns belonging to it are now gone.

Filtering on any other column:
- Using the filters tool panel, deselect **Swimming** using the **Sport** column filters
- Observe how in this case, some rows are hidden, and some pivot values change.

<grid-example title='Filtering With Pivot' name='filter' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "rowgrouping", "filterpanel", "menu", "setfilter"] }'></grid-example>

### Filtering on Pivot Result Columns

When pivot mode is enabled, you may also [Filter](/filtering-overview/) on the generated pivot result columns using the column menu, or [Floating Filters](/floating-filters/). As pivot values are all aggregates, filtering pivot result columns shares the same behaviour as [Filtering Group Aggregations](/aggregation-filtering/#filtering-group-aggregations). This means that when filtering pivoting result columns, the aggregated values on any level will not change because of child rows being filtered out.

<snippet>
|const gridOptions = {
|   columnDefs: [
|       { field: 'country', rowGroup: true },
|       { field: 'year', pivot: true },
|       { field: 'sport' },
|       { field: 'gold', aggFunc: 'sum', filter: true },
|       { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
|       { field: 'bronze', aggFunc: 'sum' },
|   ],
|   pivotMode: true,
|}
</snippet>

As shown in the snippet above, filters are enabled on pivot result columns by inheriting properties from the underlying value column. The below example demonstrates this behaviour.

[[note]]
| While pivot result columns inherit the properties of the value column from which they are generated, setting `filter: true` will instead
| default to a [Number Filter](/filter-number/) in the case of a pivot result column.
| You can use [Text Filter](/filter-text/) or [Date Filter](/filter-date/). However, [Set Filter](/filter-set/) cannot
| be used for filtering pivot result columns.

Filtering on a pivot result column:
- Using the floating filters, apply the filter **Not Blank** to the **2000, gold** column
- Observe how in this case, all rows which did not have a value for the **2000, gold** column have been hidden.
- Using the floating filters, apply the filter **Equals 2** to the **2000, gold** column
- Observe how the group values do not reaggregate after this filter has been applied

<grid-example title='Filtering Pivot Result Columns' name='secondary-columns-filter' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "rowgrouping", "filterpanel", "menu", "setfilter"] }'></grid-example>

### Filtering using the API

When pivot mode is enabled, you may also [Filter](/filtering-overview/) on both the pivot result columns, and the regular columns using the [Filter API](/filter-api/).

<snippet>
|const filterNotBlank2000Silvers = () => {
|  const targetCol = gridOptions.columnApi.getPivotResultColumn(['2000'], 'silver');
|  if (targetCol) {
|    gridOptions.api.setFilterModel({
|      [targetCol.getId()]: {
|        filterType: 'number',
|        type: 'notBlank'
|      },
|    })
|  }
|}
</snippet>

As shown in the snippet above, you can also set filters on pivot result columns using the API.

<grid-example title='Filtering using the API' name='filter-api' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "rowgrouping", "filterpanel", "menu", "setfilter"] }'></grid-example>

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

## Hiding Repeated Value Column Labels

When pivoting with only one value column, it can appear redundant to have the value column label repeated for each pivot 
key. To address this, you can enable the grid option `removePivotHeaderRowWhenSingleValueColumn`, when set to `true` it
will cause the value column labels to be skipped, instead using the pivot keys for the column label.

The example below demonstrates hiding repeated column labels. Note the following:

- The `removePivotHeaderRowWhenSingleValueColumn` grid option is enabled.
- As <b>Gold</b> is the only value column, the `'sum(Gold)'` columns labels are hidden.
- If more than one value column is used, the option is disabled and the row showing all the value column labels is displayed.

<grid-example title='Hiding Repeated Column Labels' name='hidden-single-value-column-header' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Saving & Restoring Column State with Pivot

Saving and restoring column state is also possible when pivoting. The generated pivot result columns have IDs dependant on the pivot setup, so assuming the row data is the same, the same pivot result columns will be created and it will be possible to apply saved states to the columns.

Below shows some examples of saving and restoring state with pivot in mind. Note that `pivotMode` is not stored as part of the column state. If `pivotMode` is important to your columns state, it needs to be stored separately.

<grid-example title='Saving & Restoring Column State' name='state' type='generated' options='{ "enterprise": true, "exampleHeight": 630, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel", "filterpanel"] }'></grid-example>

## Pivot API

Below shows examples of using the pivot API directly. Use this is you want to build out your own toolPanel.

The example also demonstrates exporting to CSV while using Pivot. Basically what you see inside the grid is what will be exported.

<grid-example title='Pivot API' name='api' type='generated' options='{ "enterprise": true, "exampleHeight": 620, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel", "filterpanel", "csv"] }'></grid-example>

## Ordering Pivot Columns

The user is free to drag columns to reorder them and you are able to reorder columns via the columnApi in the normal way. However you may want to change the default order of the pivot columns.

**Order of Pivot Value Column Groups**<br />
Pivot value columns are the column groups created by the pivot values - eg if 'Country' is a pivot column, then the Pivot Value Column Groups are 'Ireland', 'UK', etc. These columns are ordered alphabetically by default. To override this, provide `pivotComparator(a,b)` function in the column definition.

<api-documentation source='column-properties/properties.json' section='pivoting' names='["pivotComparator"]'></api-documentation>

In the example below, note the following:
- A `pivotComparator` has been supplied to the `year` column.
- The pivot column groups have been reversed, to instead display from highest to lowest.

<grid-example title='Ordering Pivot Groups' name='order-pivot-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 650, "modules": ["clientside", "rowgrouping"] }'></grid-example>

**Order of Pivot Value Columns**<br/>
Pivot value columns are the lowest level column and correspond to the values selected in your pivot. For example, if value columns are the months of the year, then the values will be 'Jan', 'Feb', 'Mar' etc, one for each value column added. The order of these will either be a) the order the value columns appear in the original column definitions if you provide 'aggFunc' as part of the columns or b) the order you add the columns as value columns.

## Hide Open Parents

The example below shows mixing in different options for the row group column. For more info on these properties, see [Grouping Rows](/grouping/).

- `groupHideOpenParents=true: ` So that when the row group is expanded, the parent row is not shown.
- `groupDisplayType: 'multipleColumns':` So that one group column is created for each row group column (country and athlete).
- `groupDefaultExpanded=2: ` So that all the groups are opened by default.

<grid-example title='Hide Open Parents' name='hide-open-parents' type='generated' options='{ "enterprise": true, "exampleHeight": 650, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Change Detection and Pivot

While pivoting, you can do delta changes to your data and have the grid reflect this delta changes with animations.

This is demonstrated in the section on [Change Detection and Pivot](/change-detection/#change-detection-and-pivot), so rather than repeat that, check out the example there.
