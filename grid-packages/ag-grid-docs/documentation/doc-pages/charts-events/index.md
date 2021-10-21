---
title: "Events"
enterprise: true
---

This section explains how to listen and respond to various chart and series events.

## Series Events

### Example: nodeClick Event

This example shows how the `nodeClick` event listener can be used to listen to column clicks. Notice the following:

- Whenever a column is clicked, an alert message is shown with information about that column.
- The event listener pulls extra information from the object containing the column's value and shows it in the alert dialog as well. In this case the breakdown of sales numbers by brand name.

<chart-example title='Node Click Event' name='node-click-event' type='generated'></chart-example>

### Example: Toggling node's selected state

This example shows how the `nodeClick` event listener can be used to toggle each node's selected state.
Notice how we also provide:

- a marker formatter to make selected nodes stand out
- set the series' `cursor` property to `pointer` to indicate that a node is clickable when hovered

Also note how we call the `event.series.update()` method to redraw the series after altering one of its data points.

<chart-example title='Node Click Event' name='node-click-select' type='generated'></chart-example>

### nodeClick Event

Fired when this series' node is clicked. Depending on the type of series, a node can mean a bar or a pie slice, or a marker, such as a line or an area series marker.

A node is typically associated with a single element from the `chart.data` or `series.data` array, unless the node represents an aggregation of values, as is the case with histogram series bins.

Each series fires its own version of the `nodeClick` event, as described below. But generally speaking every `nodeClick` event contains:

- the `series` the node belongs to
- the piece of chart data or `datum`
- the specific keys in that `datum` that were used to fetch the values represented by the clicked node

Note that the `datum` object is untyped and can contain keys that are not plotted by the chart, and that you can access in the event listener when a node is clicked.

#### Bar/Column series

<api-documentation source='charts-api/api.json' section='bar.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation>

#### Line series

<api-documentation source='charts-api/api.json' section='line.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation>

#### Area series

No events yet.

<!-- <api-documentation source='charts-api/api.json' section='area.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation> -->

#### Scatter series

<api-documentation source='charts-api/api.json' section='scatter.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation>

#### Pie series

<api-documentation source='charts-api/api.json' section='pie.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation>

#### Treemap series

<api-documentation source='charts-api/api.json' section='treemap.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation>


#### Histogram series

<api-documentation source='charts-api/api.json' section='histogram.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation>

Note that the `datum` in this case is not an element from the `chart.data` or `series.data` array provided by the user. It's a histogram bin, which represents an aggregated value of one or more `datum`s, where the datums themselves can be accessed via the `datum.data` property.

For example, to get all x values used by the bin, one could so the following:

```js
for (var element of event.datum.data) {
    console.log(element[event.xKey]);
}
```

## Chart Events

### Example: seriesNodeClick Event

This example shows how to listen to `nodeClick` events of all series at once by subscribing to the chart's `seriesNodeClick` event.

In this case, instead of adding the `nodeClick` event to both line and column series individually, we listen to the `seriesNodeClick` event on the chart. Notice the following:

- Whenever a column or line marker is clicked, an alert message is shown with information about that series node.
- The ID of the series that contains the clicked node is also logged.

<chart-example title='Node Click Event' name='series-node-click-event' type='generated'></chart-example>

### seriesNodeClick Event

Fired when a node of any series in the chart is clicked. In case a chart has multiple series, it can be handy to be able to provide a single listener that will be called when a node is clicked in any of them.

In this case the contents of the event object passed to the listener will depend on the type of series the clicked node belongs to.

<!-- <api-documentation source='charts-api/api.json' section='chart.legend.listeners' config='{ "showSnippets": true, "skipHeader": true }'></api-documentation> -->