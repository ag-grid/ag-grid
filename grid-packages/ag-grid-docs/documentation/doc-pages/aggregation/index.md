---
title: "Aggregation"
enterprise: true
---

When [Row Grouping](/grouping/), aggregation functions can be applied to any column to populate the group row with values.

## Enabling Aggregation

The simplest way to enable aggregations is with the built-in aggregation functions: `sum`, `min`, `max`, `count`, `avg`, `first`, `last`.

To allow users to select any of the agg functions from the Column menu under `Value Aggregation`, the `colDef.enableValue` can be set to `true`. The list of agg functions available to the user can then be restricted with `colDef.allowedAggFuncs`.

The following snippet shows how these agg functions can be applied to columns via `colDef.aggFunc`, `colDef.enableValue` and `colDef.allowedAggFuncs`:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true }, 
        {
            field: 'gold',
            aggFunc: 'sum',
            enableValue: true,
        },
        {
            field: 'silver',
            aggFunc: 'max',
            enableValue: true,
            allowedAggFuncs: ['sum', 'max', 'avg'],
        },
        { field: 'bronze', aggFunc: 'avg' },
    ],
}
</snippet>

The example below uses the same built-in aggregation functions shown in the snippet above. Note the following:

- Rows are grouped by the **Country** and **Year** columns by enabling the `rowGroup` column definition property.

- The **Gold** column has a default agg function of `sum`, and can be be changed in the Column menu under `Value Aggregation`.

- The **Silver** column has a default agg function of `max`, and can be be changed in the Column menu under `Value Aggregation`. Only `sum`, `max` and `avg` are available in the list as it is restricted with `colDef.allowedAggFuncs`.

- The **Bronze** column has `avg` as the agg function and cannot be changed by the user.

<grid-example title='Enabling Aggregation' name='enabling-aggregation' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

<note>
| The built-in functions will support `bigint` values if you have them in your data, but the `avg`
| function will lose precision as it can only use integer arithmetic if `bigint` is used.
</note>

## Customisations

The previous example demonstrated how the built-in agg functions can be used, however extensive Aggregation customisations
are also possible as summarised below:

- **[Custom Functions](/aggregation-custom-functions/)** - provide custom aggregations to the grid.
- **[Aggregation Filtering](/aggregation-filtering/)** - configure and customise how aggregations are filtered.

## Suppressing Top Level Aggregations

When aggregations are present, the grid also aggregates all the top level rows into one parent row. This total aggregation is not shown in the grid so a speed increase can be produced by turning this top level aggregation off by setting `suppressAggAtRootLevel=true`. It is the intention that a future release of the grid will allow exposing the top level aggregation hence why this feature is left in.

## API Reference

Aggregations can be configured using the following column property:

<api-documentation source='column-properties/properties.json' section='grouping' names='["aggFunc"]'></api-documentation>

Aggregation functions can be registered with the grid using the following grid option:

<api-documentation source='grid-options/properties.json' section='rowPivoting' names='["aggFuncs"]'></api-documentation>

## Next Up

Continue to the next section to learn about [Custom Functions](/aggregation-custom-functions/).
