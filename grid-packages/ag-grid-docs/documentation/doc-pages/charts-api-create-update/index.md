---
title: "Create/Update"
---
Learn about creating and updating charts in more detail.

## Creating and Updating Charts

[[only-javascript]]
| `AgChart` exposes `create()` and `update()` static methods to perform chart initialisation and update based upon
| the `AgChartOptions` configuration structure.
| 
| Mutations to the previously used options object are not automatically picked up by the chart implementation,
| `AgChart.update()` should be called for changes to be applied.
|
| [[note]]
| | NOTE: We expect the options supplied to `AgChart.update()` to be the full configuration state to update
| | to, not a partial configuration. Use `AgChart.updateDelta()` to apply partial updates.
|
| `AgChart` has the following API:
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["create", "update"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>

[[only-frameworks]]
| `AgChartOptions` are supplied to the AG Charts component, and mutations of the options trigger an update of the chart configuration.

See the [Options Reference](/charts-api/) for more detail about the `AgChartOptions` structure.

The following example demonstrates both create and update cases:
- Definition of an `options` object used to create the initial chart state.
- Buttons that invoke mutations of the `options` and trigger update of the chart state.

<chart-example title='Create and Update with AgChartOptions' name='create-update' type='generated'></chart-example>

[[only-javascript]]
| ## Delta Options Update
|
| `AgChart` exposes an `updateDelta()` static method to allow partial updates to a charts options.
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["updateDelta"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>
|
| To assist with state management, the complete applied options state can be retrieved by calling `getOptions()` on the
| `AgChartInstance`:
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChartInstance" names='["getOptions"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>
|
| The following example demonstrates:
| - Retrieving current Chart configuration via `getOptions()`.
| - Mutation of the Chart configuration via `updateDelta()`.
|
| <chart-example title='Update with Partial AgChartOptions' name='update-partial' type='typescript'></chart-example>
|

[[only-frameworks]]
| ## Delta Options Update
|
| `AgChart` exposes an `updateDelta()` static method to allow partial updates to an existing charts configuration:
|
| [[note]]
| | `updateDelta()` should not be normally used with the AG Charts component; framework change detection and updates
| | to the chart apply automatically after an options change.
| |
| | However when using [Integrated Charts](/integrated-charts-events/#accessing-chart-instance) it may be
| | necessary to use this API to perform chart updates in Grid callbacks.
|
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["updateDelta"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>

## Destroying Charts

[[only-javascript]]
| Charts can be destroyed by using the `AgChartInstance.destroy()` method:
| <api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChartInstance" names='["destroy"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>


[[only-frameworks]]
| Charts are automatically destroyed when the AG Charts component is removed from the DOM.
