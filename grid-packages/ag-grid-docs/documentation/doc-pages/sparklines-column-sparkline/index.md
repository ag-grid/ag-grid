---
title: "Sparklines - Column Sparkline"
enterprise: true
---

This section introduces the Column Sparkline

## Enabling Sparklines

TODO:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'results',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    strokeWidth: 1,
                    paddingInner: 0.7,
                    paddingOuter: 0.2,
                    formatter: formatter,
                    highlightStyle: {
                        strokeWidth: 1,
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

<grid-example title='Column Sparkline' name='column-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

### ColumnSparklineOptions:

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='ColumnSparklineOptions'></api-documentation>

### SparklineAxisOptions:

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='SparklineAxisOptions'></api-documentation>

### HighlightStyle:

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='HighlightStyle'></api-documentation>

### ColumnFormat:

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='ColumnFormat'></api-documentation>


## Next Up

Continue to the next section to learn about the: [Data Updates](/sparklines-data-updates/).
