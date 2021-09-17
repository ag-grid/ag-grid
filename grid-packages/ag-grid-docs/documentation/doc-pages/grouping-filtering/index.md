---
title: "Row Grouping - Filtering Groups"
enterprise: true
---

This section provides details on how to configure and customise how row groups are filtered.

## Enabling Group Filtering

In order to filter on row group columns, filtering must be enabled on the group column and a `filterValueGetter` should
be supplied to the `autoGroupColumnDef` as shown below:

<api-documentation source='column-properties/properties.json' section='filtering' names='["filterValueGetter"]'></api-documentation>

<snippet>
const gridOptions = {  
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ], 
    autoGroupColumnDef: { 
        // enables filtering on the group column
        filter: true,
        // supplies 'country' values to the filter 
        filterValueGetter: params => params.data.country,                          
    }, 
    groupDisplayType: 'singleColumn',
}
</snippet>

In the snippet above that rows are grouped by `country` and `year`, however there is only a single group column.
This is why a `filterValueGetter` is required to supply the filter values, in this case `country` values.   

Note that [Adding Values to Leaf Nodes](/grouping-single-group-column/#adding-values-to-leaf-nodes) using a `valueGetter`
or a `field` will also allow filtering once the `filter = true` column property is enabled. However, filtering will be
performed using the leaf values in this case.

The following example demonstrates filtering with a group column. Note the following:

- Rows are grouped by `country` and `year` under a [Single Group Column](/grouping-single-group-column/).
- A `filterValueGetter` is supplied to the group column which returns `country` values to the filter.  

<grid-example title='Enabling Group Filtering' name='enabling-group-filtering' type='generated' options='{ "enterprise": true, "exampleHeight": 510, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Filtering with Multiple Group Columns

Filtering with [Multiple Group Columns](/grouping-multiple-group-columns/) uses the same approach as described above in
[Enabling Group Filtering](/grouping-filtering/#enabling-group-filtering), however the `filterValueGetter` must return
different filter values for each group column, as shown below:


<snippet>
const gridOptions = {  
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ], 
    autoGroupColumnDef: { 
        // enables filtering on the group column
        filter: true,
        // supplies filter values to the column filters based on the colId
        filterValueGetter: params => {      
            const colId = params.column.colId;        
            if (colId.includes('country')) {
                return params.data.country;      
            }
            if (colId.includes('year') > -1) {
                return params.data.year;      
            }            
        },                        
    }, 
    groupDisplayType: 'multipleColumns',
}
</snippet>

Note in the snippet above that the `filterValueGetter` uses the `colId` to determine which filter value to return, 
although different strategies may be required for different column configurations.

The following example demonstrates filtering with multiple group columns. Note the following:

- Rows are grouped by `country` and `year` across [Multiple Group Columns](/grouping-multiple-group-columns/).
- A `filterValueGetter` is supplied to extract the correct filter value for each group column.  

<grid-example title='Filtering with Multiple Group Columns' name='filtering-multiple-group-columns' type='generated' options='{ "enterprise": true, "exampleHeight": 510, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Group Footers](../grouping-footers/).