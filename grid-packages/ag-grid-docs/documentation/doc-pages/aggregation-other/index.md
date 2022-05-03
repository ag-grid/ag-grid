---
title: "Aggregation - Other"
enterprise: true
---

This section covers areas of aggregation that don't fit within the other sections of the documentation.

## Configuring Aggregation Functions
### Restricting Functions

By default, all functions are available to all value columns. To restrict the aggregation functions available on a value column, use the `allowedAggFuncs` column property.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'gold',
            // allow gui to set aggregations for this column
            enableValue: true,
            // restrict aggregations to sum, min and max
            allowedAggFuncs: ['sum', 'min', 'max'],
        }
    ]
}
</snippet>

### Default Aggregation Function

When aggregation is enabled for a column via the GUI, it is initially set to the default aggregation function for that column, which if unspecified is the `sum` function. You can configure the default aggregation function for a column using the `defaultAggFunc` column property.

The following example demonstrates restricting the aggregation functions and setting a default:

- The Gold column has the available agg funcs restricted using `allowedAggFuncs` so if you try to change the function via the GUI, you will see that only `sum` `min` and `max` are available for this column.
- The default column definition has the `defaultAggFunc` set to `avg`, so if you enable aggregation for the Silver or Bronze columns, you'll see they are initially aggregated using the `avg` function.

<grid-example title='Configuring Aggregation Functions' name='configuring-aggregation-functions' type='generated' options='{ "enterprise": true, "exampleHeight": 655, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Aggregation API

After the grid is initialised an aggregation can be applied to a column using the following:

1. Add the columns to the list of value columns via `columnApi.addValueColumn(colKey)` - the 'sum' `aggFunc` is used by default.
1. (Optional) Modify the aggregation function on the column via `columnApi.setColumnAggFunc(colKey, aggFunc)`.

When the grid initialises, any column definitions that have `aggFunc` set will be automatically added as a value column.

## Column Headers

When aggregating, the column headers will include the aggregation function for the column. For example the header `'Bank Balance'` will become `'sum(Bank Balance)'` if you have the sum aggregation active on the column. To turn this off and display simply `'Bank Balance'` then set the grid property `suppressAggFuncInHeader`.

## Empty Aggregation Calls

When providing either [Custom Aggregation Functions](#custom-aggregation-functions) or [Custom Full Row Aggregation](#custom-full-row-aggregation) then you will see strange calls to these functions where empty lists are provided.

The empty aggregation calls happen in the following two scenarios:

1. The grid has no data (usually the case when the gird is initially displayed before the application has set data). Aggregating at the root level will request an aggregation of an empty set.
1. The grid has groups and a filter, such that groups are empty.

## Recomputing Aggregates

If the data changes after the aggregation is done, you can tell the grid to recompute the aggregates through the API method `refreshClientSideRowModel('aggregate')`.
