---
title: "Application Created Charts"
enterprise: true
---

This section introduces Integrated Charts that are created programmatically within an application.

<grid-example title='Application Created Charts' name='application-created-charts' type='typescript' options='{ "exampleHeight": 825, "enterprise": true, "modules": ["clientside", "charts", "rowgrouping"] }'></grid-example>

The dummy financial application above shows some of the grid's integrated charting capabilities. Note the following:

- **Pre-Defined Chart**: A pre-defined chart is shown in a separate chart container below the grid.
- **Dynamic Charts**: Buttons positioned above the grid dynamically create different chart types.
- **High Performance**: 100 rows are randomly updated 10 times a second (1,000 updates per second). Try updating the example via Plunker with higher update frequencies and more data.


To learn how to create charts in your applications see the following sections for details:

- [Chart API]: Used to create charts programmatically inside applications.
- [Provide a Chart Container]: Used to target chart containers inside the application instead of the popup window provided by the grid.

## Next Up

Continue to the next section to learn about the: [Range Chart API](/integrated-charts-api-range-chart/).
