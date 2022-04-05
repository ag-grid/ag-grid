---
title: "Options Reference"
---

This page documents the AG Charts API. You can find more details about getting started with AG Charts in the [Getting Started](/charts-getting-started/) section. You can also explore the API and see in real-time how different options affect charts using the [API Explorer](/charts-api-explorer/).

## Options by Chart Type

AG Charts is primarily configured by an instance of the `AgChartOptions` option, and there are three main variations depending on the chart/series type to be rendered:

<tabs>
    <expandable-snippet label="Cartesian" interfaceName='AgCartesianChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]'></expandable-snippet>
    <expandable-snippet label="Polar" interfaceName='AgPolarChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]'></expandable-snippet>
    <expandable-snippet label="Hierarchy" interfaceName='AgHierarchyChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]'></expandable-snippet>
</tabs>

## Creating and Updating Charts Using Options

`AgChartOptions` option objects are used for both create and update cases of a chart instance.

[[only-javascript]]
| `AgChart` exposes both a `create()` and `update()` static method to perform chart initialisation and update respectively.
| Mutations to the previously used `options` object are not automatically picked up by the chart implementation,
| `AgChart.update()` should be called for changes to be applied.
|
| [[note]]
| | NOTE: We expect the options supplied to `AgChart.update()` to be the full configuration to update
| | to, not a delta. If properties or nested objects are missing compared with an earlier `create()`/
| | `update()` call, features maybe disabled or defaults assumed as the target configuration.

[[only-frameworks]]
| Options are supplied to the AG Charts component, and mutations of the options trigger an update of the chart configuration.

The following example demonstrates both create and update cases:
- Definition of an `options` object used to create the initial chart state.
- Buttons that invoke mutations of the `options` and trigger update of the chart state.

<chart-example title='Create and Update with AgChartOptions' name='create-update' type='generated'></chart-example>
