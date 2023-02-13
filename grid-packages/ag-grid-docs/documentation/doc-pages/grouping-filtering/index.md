---
title: "Row Grouping - Filtering Groups"
enterprise: true
---

This section provides details on how to configure and customise how row groups are filtered.

The simplest way is to use the Group Filter, which allows you to use [Provided Filters](/filter-provided/) or [Custom Filters](/component-filter/) defined on underlying columns directly in the group column(s).

Where there are multiple underlying columns in the group column, a dropdown is provided to allow you to switch between the different column filters.

<image-caption src="grouping-filtering/resources/group-filter.png" alt="Group Filter" width="28rem" centered="true"></image-caption>

## Enabling Group Filtering

To use Group Filter, specify the following in your [Group Column Configuration](/grouping-single-group-column/#group-column-configuration):

<snippet>
const gridOptions = {
    autoGroupColumnDef: [
        // group column(s) configured to use the Group Filter
        { filter: 'agGroupColumnFilter' },
    ]
}
</snippet>

You must also have filters defined on the underlying columns which are being used in the grouping. If none of the columns in the grouping have filters defined, the Group Filter will not be displayed.

## Single Group Column Example

The following example shows the Group Filter with a [Single Group Column](/grouping-single-group-column/).

- `autoGroupColumnDef.filter = 'agGroupColumnFilter'` is set to enable the Group Filter for the **Group** column.
- In the Group Filter for the **Group** column:
    - A dropdown is displayed to allow you to change which underlying filter is displayed.
    - The **Athlete** column is not shown in the dropdown as it does not have a filter defined.
- The floating filter for the **Group** column is read-only. If you set a value against both the **Country** and **Year** filters, the floating filter will display the filter value for the field selected in the Group Filter dropdown.
- The other columns demonstrate the different provided filters, and can be added to the group column by dragging them into the [Row Group Panel](/grouping-group-panel/) at the top.
- If you remove all of the columns from the grouping except for the **Athlete** column, the option to show the filter in the **Group** column will be hidden as there is no valid filter to display.

<grid-example title='Group Filter with Single Group Column' name='group-filter-single' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "rowgrouping", "menu", "filterpanel"] }'></grid-example>

## Multiple Group Column Example

The following example shows the Group Filter with [Multiple Group Columns](/grouping-multiple-group-columns/).

- `autoGroupColumnDef.filter = 'agGroupColumnFilter'` is set to enable the Group Filter.
- The **Country** and **Year** columns are both group columns and are therefore using the Group Filter.
- The Group Filters for **Country** and **Year** don't show the field dropdown as there is only one underlying column per group column.
- The floating filters for **Country** and **Year** are using the floating filters from the underlying columns.

<grid-example title='Group Filter with Multiple Group Columns' name='group-filter-multiple' type='generated' options='{ "enterprise": true, "exampleHeight": 565, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Group Floating Filter

The floating filter for the Group Filter can display in one of two ways depending on how the group columns are configured. It will either show a read-only value, or use the floating filter from the underlying column.

When using a single group column, the floating filter will always be read-only. It will display the value for the currently selected field in the Group Filter dropdown.

For multiple group columns, the floating filter will show the underlying filter if the underlying column is hidden, or the read-only value if the underlying column is visible.

If you are using [Custom Filters](/component-filter/), your filter will need to implement `getModelAsString()` for the read-only group floating filter to be able to display a value.

## Filter Dropdown Behaviour

The dropdown to select the underlying filter will behave slightly differently depending on the columns in the grouping:
- Columns without filters defined will never be shown in the dropdown.
- If there is only one column in the group, the dropdown will not be shown.
- If there are multiple columns in the group, but only one has a filter defined, the dropdown will be displayed but disabled, and will show the column with the filter.

You can see this behaviour by changing which columns are in the grouping using the [Single Group Column Example](#single-group-column-example) above.

## Filter Model and API

As the Group Filter uses the filters from the underlying columns, the filter model will be shown against the underlying columns and not the group column(s).

If you wish to access the filter instance(s) via the [Filter API](/filter-api/#accessing-individual-filter-component-instances), you should use the underlying column fields, and not the group column(s).

## Custom Group Filtering

If you want to have a different filter on the group column(s) than on the underlying columns, you can also define any filter type directly on the group column(s).

### Custom Group Filtering with Single Group Column

To filter across all levels of the grouping in a single filter, you can use the [Set Filter Tree List](/filter-set-tree-list/).

Otherwise, in order to know what values to use in the group column filter, a `filterValueGetter` should be supplied to the `autoGroupColumnDef` as shown below:

<api-documentation source='column-properties/properties.json' section='filtering' names='["filterValueGetter"]'></api-documentation>

<snippet>
const gridOptions = {  
    columnDefs: [
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ], 
    autoGroupColumnDef: { 
        // enables filtering on the group column with desired filter type
        filter: 'agTextColumnFilter',
        // supplies 'sport' values to the filter 
        filterValueGetter: params => params.data.sport,                          
    }, 
    groupDisplayType: 'singleColumn',
}
</snippet>

In the snippet above the rows are grouped by `sport` and `country`, however there is only a single group column. This is why a `filterValueGetter` is required to supply the filter values. In this case, reading the `sport` property from the row.

Note that [Adding Values to Leaf Nodes](/grouping-single-group-column/#adding-values-to-leaf-nodes) using a `valueGetter` or a `field` will also allow filtering once the `filter` column property is enabled. However, filtering will be performed using the leaf values in this case.

When applying a filter directly on the group column instead of using the Group Filter, the filter model is tied to the group column instead of the underlying columns. To set the filter via the Grid API on a single group column (`setFilterModel`), it needs to be referenced using the name `ag-Grid-AutoColumn`.

<snippet>
gridOptions.api.setFilterModel({
    'ag-Grid-AutoColumn': {
        filterType: 'text',
        type: 'contains',
        filter: 'Skiing'
    },
});
</snippet>

The following example demonstrates filtering with a single group column. Note the following:

- Rows are grouped by `sport` and `country` under a [Single Group Column](/grouping-single-group-column/).
- A `filterValueGetter` is supplied to the group column which returns `sport` values to the filter.
- Clicking the `Filter Skiing Sports` button at the top will set the filter using the Grid API `setFilterModel`. Note that the reference name `ag-Grid-AutoColumn` is used.


<grid-example title='Custom Group Filtering with Single Group Column' name='custom-group-filtering-single-group-column' type='generated' options='{ "enterprise": true, "exampleHeight": 510, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

### Custom Group Filtering with Multiple Group Columns

Filtering with [Multiple Group Columns](/grouping-multiple-group-columns/) uses the same approach as described above in [Custom Group Filtering with Single Group Column](#custom-group-filtering-with-single-group-column), however the `filterValueGetter` must return different filter values for each group column, as shown below:

<snippet>
const gridOptions = {  
    columnDefs: [
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ], 
    autoGroupColumnDef: { 
        // enables filtering on the group column with desired filter type
        filter: 'agTextColumnFilter',
        // supplies filter values to the column filters based on the colId
        filterValueGetter: params => {      
            const colId = params.column.getColId();        
            if (colId.includes('sport')) {
                return params.data.sport;      
            } else if (colId.includes('country')) {
                return params.data.country;      
            }            
        },                        
    }, 
    groupDisplayType: 'multipleColumns',
}
</snippet>

Note in the snippet above that the `filterValueGetter` uses the `colId` value to determine which filter value to return, although different strategies may be required for different column configurations.

Similar to when using a single group column, the filter model is tied to the group columns instead of the underlying columns. To set the filter via the Grid API against each of the group columns, `ag-Grid-AutoColumn-[colId]` is used, where `[colId]` is the column id.

<snippet>
gridOptions.api.setFilterModel({
    'ag-Grid-AutoColumn-sport': {
        filterType: 'text',
        type: 'contains',
        filter: 'Skiing'
    },
});
</snippet>

The following example demonstrates filtering with multiple group columns. Note the following:

- Rows are grouped by `sport` and `country` across [Multiple Group Columns](/grouping-multiple-group-columns/).
- A `filterValueGetter` is supplied to extract the correct filter value for each group column.
- Clicking the `Filter Skiing Sports` button at the top will set the filter using the Grid API `setFilterModel`. Note that the reference name `ag-Grid-AutoColumn-sport` is used, as `sport` is the column id for the column where the filter is changing.


<grid-example title='Custom Group Filtering with Multiple Group Columns' name='custom-group-filtering-multiple-group-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 510, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Group Footers](../grouping-footers/).