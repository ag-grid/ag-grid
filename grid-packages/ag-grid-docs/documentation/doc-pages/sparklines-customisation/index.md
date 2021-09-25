---
title: "Sparklines - Customisation"
enterprise: true
---

The default Sparkline options act as a good starting point for most applications, however all options can be 
customised by overriding the default sparkline options.

## Providing Sparkline Options

Sparklines are customised by supplying `sparklineOptions` to the `cellRendererParams` on the Sparkline Cell Renderer 
as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Sparkline customisation goes here.
                }
            },
        },
        // other column definitions ...
    ],
}
</snippet>

Each Sparkline type contains specific `sparklineOptions` that can be overridden and are covered in the following sections:  

- [Line Customisation](/sparklines-line-customisation/)
- [Column Customisation](/sparklines-column-customisation)
- [Area Customisation](/sparklines-area-customisation)

More advanced customisations are discussed separately on the following pages:

- [Axis](/sparklines-axis-types/) - supported x-axis types and configuration via `axis` options.
- [Tooltips](/sparklines-tooltips/) - configuration of tooltips using `tooltip` options.
- [Special Points](/sparklines-special-points/) - customisation of individual points of interest using a `formatter`.

## Next Up

Continue to the next section to learn about: [Line Sparkline Customisation](/sparklines-line-customisation/).
