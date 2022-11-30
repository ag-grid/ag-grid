---
title: "Events"
enterprise: true
---

This section explains how to listen and respond to various chart and series events.

## Series Event - nodeClick

Fired when this series' node is clicked. Depending on the type of series, a node can mean a bar or a pie sector, or a marker, such as a line or an area series marker. A node is typically associated with a single element from the `data` or `series[].data` array, unless the node represents an aggregation of values (e.g. histogram series bins).

Every `nodeClick` event contains:

- the `series` the node belongs to
- the piece of chart data or `datum`
- the specific keys in that `datum` that were used to fetch the values represented by the clicked node

### Example: nodeClick Event

This example shows how the `nodeClick` event listener can be used to listen to column clicks. Notice the following:

- Whenever a column is clicked, an alert message is shown with information about that column.
- The event listener pulls extra information from the object containing the column's value and shows it in the alert dialog as well. In this case the breakdown of sales numbers by brand name.

<chart-example title='Node Click Event' name='node-click-event' type='generated'></chart-example>

### Example: Toggling node's selected state

This example shows how the `nodeClick` event listener can be used to toggle each node's selected
state in combination with a `series[].marker.formatter`:

- Clicking a series marker toggles its rendering.

<chart-example title='Node Click Event' name='node-click-select' type='generated'></chart-example>

### Interfaces

All series event options have the same interface contract.

<interface-documentation interfaceName='AgSeriesListeners' names='["nodeClick"] ' config='{ "lookupRoot": "charts-api" }'></interface-documentation>

#### Histogram series

Unlike other series, the `nodeClick` event `datum` parameter for Histogram series contains a model for the computed histogram bin:

<interface-documentation interfaceName='AgHistogramBinDatum' config='{ "lookupRoot": "charts-api" }'></interface-documentation>

## Chart Event - seriesNodeClick

The `seriesNodeClick` event can be used to listen to `nodeClick` events of all series at once.

The contents of the event object passed to the listener will depend on the type of series the clicked node belongs to.

### Example: seriesNodeClick Event

This example demonstrates:

- Whenever a column or line marker is clicked, an alert message is shown with information about that series node.
- The ID of the series that contains the clicked node is also logged.

<chart-example title='Node Click Event' name='series-node-click-event' type='generated'></chart-example>

## Legend Event - legendItemClick

The `legendItemClick` event can be used to listen to legend item clicks.

### Example: legendItemClick Event

This example demonstrates:

- when a legend item is clicked, an alert message is shown with the `legendItemClick` event contents.

<chart-example title='Legend Item Click Event' name='legend-item-click-event' type='generated'></chart-example>
