---
title: "Sparklines - Data"
enterprise: true
---

This section covers the types of data supported by the sparklines

## Sparklines Data

By default, the `agSparklineCellRenderer` sets the sparkline data to the row data for the specific column. The data array can consist of numbers, tuples or complex objects.

Array of numbers

<grid-example title='Sparkline Data' name='sparkline-data-number-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

Array of tuples
<grid-example title='Sparkline Data' name='sparkline-data-tuple-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

Array of objects

- This requires xKey and yKey to be specified in the options.

<grid-example title='Sparkline Data' name='sparkline-data-object-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Next Up

Continue to the next section to learn about the: [Tooltips](/sparklines-tooltips/).
