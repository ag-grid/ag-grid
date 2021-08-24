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
            sparklineOptions: {
                type: 'column',
                strokeWidth: 1,
                paddingInner: 0.7,
                paddingOuter: 0.2,
                formatter: function (params) {
                    return {
                        fill: !params.highlighted 
                        ? params.yValue < 0 
                        ? 'rgb(207,191,212)' 
                        : 'rgb(196,212,191)' 
                        : params.yValue < 0 
                        ? 'rgb(224,158,245)' 
                        : 'rgb(183,237,166)',
                        stroke: params.highlighted 
                        ? params.yValue < 0 
                        ? 'rgb(136,99,147)' 
                        : 'rgb(110,147,99)' 
                        : params.stroke,
                    }
                },
                highlightStyle: {
                    strokeWidth: 1,
                }
            }
        }, 
        // other column definitions ...
    ],
}
</snippet>

<interface-documentation interfaces='["SparklineOptions"]' ></interface-documentation>


<grid-example title='Column Sparkline' name='column-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>


## Next Up

Continue to the next section to learn about the: [Data Updates](/sparklines-data-updates/).
