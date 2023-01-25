---
title: "Options Reference"
---

An instance of `AgChartOptions` is an essential configuration object required to create a chart with the desired data and attributes.

[[only-javascript]]
| To initialise a chart, an instance of the `AgChartOptions` is passed to the `AgChart.create()` factory method. Once the chart is initialised, it can be modified using the `AgChart.update()` and `AgChart.updateDelta()` methods.

[[only-frameworks]]
| Our framework specific tags accept JS objects following the interface contract of `AgChartOptions` as their
| means of configuration. Changes to the options object are tracked and applied automatically.

## Options by Chart Type

The main sub-variants of `AgChartOptions` interface are displayed below in expandable JSON graphs, which can be navigated to explore the object structures.

<tabs>
    <expandable-snippet label="Cartesian" interfaceName='AgCartesianChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]' config='{ "lookupRoot": "charts-api" }'></expandable-snippet>
    <expandable-snippet label="Polar" interfaceName='AgPolarChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]' config='{ "lookupRoot": "charts-api" }'></expandable-snippet>
    <expandable-snippet label="Hierarchy" interfaceName='AgHierarchyChartOptions' overrideSrc="charts-api/api.json" breadcrumbs='["options"]' config='{ "lookupRoot": "charts-api" }'></expandable-snippet>
</tabs>

## Creating and Updating Charts Using Complete Options

[[only-javascript]]
| `AgChart` exposes `create()` and `update()` static methods to perform chart initialisation and update respectively.
| Mutations to the previously used `options` object are not automatically picked up by the chart implementation,
| `AgChart.update()` should be called for changes to be applied.
|
| [[note]]
| | NOTE: We expect the options supplied to `AgChart.update()` to be the full configuration state to update
| | to, not a partial configuration. Use `AgChart.updateDelta()` to apply partial updates.

[[only-frameworks]]
| Options are supplied to the AG Charts component, and mutations of the options trigger an update of the chart configuration.

The following example demonstrates both create and update cases:
- Definition of an `options` object used to create the initial chart state.
- Buttons that invoke mutations of the `options` and trigger update of the chart state.

<chart-example title='Create and Update with AgChartOptions' name='create-update' type='generated'></chart-example>

[[only-javascript]]
| ## Updating Charts Using Partial Options
|
| `AgChart` exposes an `updateDelta()` static method to allow partial updates to an existing charts configuration.
| To assist with state management, the complete applied options state can be retrieved by calling `getOptions()` on the
| chart instance.
|
| <chart-example title='Update with Partial AgChartOptions' name='update-partial' type='typescript'></chart-example>
|

[[only-frameworks]]
| ## Updating Charts Using Partial Options
|
| `AgChart` exposes an `updateDelta()` static method to allow partial updates to an existing charts configuration.
|
| `updateDelta()` should not be normally used with framework wrappers for Angular, React or Vue, as the
| framework will perform change detection and update the chart automatically after an options mutation. 
| However when using [Integrated Charts](/integrated-charts-events/#accessing-chart-instance) it may be
| necessary to use this API to perform chart updates in Grid callbacks.
|
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["updateDelta"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>

## API

We expose APIs for performing certain actions on `AgChartInstance`s via the `AgChart` class:

[[only-javascript]]
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>
|
| Additionally `AgChartInstance` exposes API methods on a per-instance basis:
| <interface-documentation interfaceName='AgChartInstance' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartOptions"], "description": "" }'></interface-documentation>

[[only-frameworks]]
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["download"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>

 ### API Usage Example

 This example demonstrates:
 - How to obtain a reference to an `AgChartInstance`.
 - How to use `AgChart.download()` to initiate a chart image download.

 <chart-example title='Download via AgChart API' name='download' type='generated'></chart-example>