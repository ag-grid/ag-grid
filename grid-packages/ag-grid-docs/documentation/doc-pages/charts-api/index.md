---
title: "Options Reference"
---

This page documents the AG Charts API. You can find more details about getting started with AG Charts in the [Getting Started](/charts-getting-started/) section. You can also explore the API and see in real-time how different options affect charts using the [API Explorer](/charts-api-explorer/).

## Options by Chart Type

AgCharts is primarily configured by an instance of the `AgChartOptions` options - there are three main variations depending on the chart/series type to be rendered:

<tabs>
    <expandable-snippet label="Cartesian" interfaceName='AgCartesianChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]'></expandable-snippet>
    <expandable-snippet label="Polar" interfaceName='AgPolarChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]'></expandable-snippet>
    <expandable-snippet label="Hierarchy" interfaceName='AgHierarchyChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]'></expandable-snippet>
</tabs>

## Creating and updating using options

The `AgChartOptions` options object can be used for both create and update cases.

[[only-javascript]]
| [[warning]]
| | NOTE: We expect the options supplied to `AgChart.update()` to be the full configuration to update
| | to, not a delta. If properties or nested objects are missing compared with an earlier `create()`/
| | `update()` call, features maybe disabled or defaults assumed as the target configuration.

<chart-example title='Create and Update with AgChartOptions' name='create-update' type='generated'></chart-example>
