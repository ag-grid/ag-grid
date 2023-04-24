---
title: "Aggregation - Other"
enterprise: true
---

This section covers areas of aggregation that don't fit within the other sections of the documentation.

## Default Aggregation Function

When columns are dragged to the <b>Values</b> section of the [Columns Tool Panel](/tool-panel-columns/) they are
assigned the `sum` aggregation function by default. The default aggregation function can be overridden on a per-column
basis using the `defaultAggFunc` column property.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'gold',
            // allows column to be dragged to the 'Values` section of the Columns Tool Panel 
            enableValue: true,
            // use 'avg' as the default agg func instead of 'sum'  
            defaultAggFunc: 'avg',
        },
    ]
}
</snippet>

The following example demonstrates overriding the default agg function. Note the following:

- The <b>Gold</b> column is configured with `defaultAggFunc` set to `avg`.
- Drag the <b>Gold</b> column to the <b>Values</b> section of the Columns Tool Panel and note that it is assigned the 'avg' function. 
- The <b>Silver</b> column is configured to use a custom aggregation function as its default. Drag the <b>Silver</b> column to the <b>Values</b> section and note that it is assigned the function `mySum`.
- Dragging the <b>Bronze</b> column will use `sum` as the default. 

<grid-example title='Default Aggregation Function' name='default-aggregation-function' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

[[note]]
| Note that unlike `aggFunc` you can't pass a custom aggregation function directly to `defaultAggFunc`,
| as demonstrated in the previous example, it must be registered first. See [Registering Custom Functions](/aggregation-custom-functions#registering-custom-functions) for how to do this.

## Restricting Aggregation Functions

By default, all functions are available to all value columns. To restrict the aggregation functions available on a value
column, use the `allowedAggFuncs` column property as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'gold', 
            aggFunc: 'sum',
            // restricts agg functions to be: `sum`, `min` and `max`
            allowedAggFuncs: ['sum', 'min', 'max'],
        }
    ]
}
</snippet>

The following example demonstrates restricting the aggregation functions. Note the following:

- The <b>Gold</b> column is configured with `allowedAggFuncs` set to `['sum', 'min', 'max']` and only displays these functions in the drop-down list in the <b>Values</b> section column to the of the Columns Tool Panel.
- The <b>Silver</b> column shows all available agg functions as it hasn't been restricted.
 
<grid-example title='Restricting Aggregation Functions' name='restricting-aggregation-functions' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Aggregation API

After the grid is initialised aggregations can be applied / retrieved / removed via the `columnApi` with the following methods:

<api-documentation source='column-api/api.json' section='valueColumns' ></api-documentation>

When the grid initialises, any column definitions that have `aggFunc` set will be automatically added as a value column.

## Column Headers

When aggregating, the column headers will include the aggregation function for the column. For example the header `'Bank Balance'` will become `'sum(Bank Balance)'` if you have the sum aggregation active on the column. To turn this off and display simply `'Bank Balance'` then set the grid property `suppressAggFuncInHeader`.

<api-documentation source='grid-options/properties.json' section='rowPivoting' names='["suppressAggFuncInHeader"]' ></api-documentation>

## Empty Aggregation Calls

When providing either [Custom Aggregation Functions](/aggregation-custom-functions#custom-aggregation-functions) or [Custom Full Row Aggregation](/aggregation-custom-functions#custom-full-row-aggregation) then you will see strange calls to these functions where empty lists are provided.

The empty aggregation calls happen in the following two scenarios:

1. The grid has no data (usually the case when the gird is initially displayed before the application has set data). Aggregating at the root level will request an aggregation of an empty set.
1. The grid has groups and a filter, such that groups are empty.

## Recomputing Aggregates

If the data changes after the aggregation is done, you can tell the grid to recompute the aggregates through the API method `refreshClientSideRowModel('aggregate')`.

<api-documentation source='grid-api/api.json' section='data' names='["refreshClientSideRowModel"]' ></api-documentation>

## Next Up

Continue to the next section to learn about [Tree Data](/tree-data/).