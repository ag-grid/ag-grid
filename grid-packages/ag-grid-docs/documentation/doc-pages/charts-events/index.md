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

## Series Event - nodeDoubleClick

Fired when this series' node is double clicked.

Every `nodeDoubleClick` event contains:

- the `series` the node belongs to
- the piece of chart data or `datum`
- the specific keys in that `datum` that were used to fetch the values represented by the clicked node

### Example: nodeDoubleClick Event

This example shows how the `nodeDoubleClick` event listener can be used to listen to column double clicks.

<chart-example title='Node Double Click Event' name='node-double-click-event' type='generated'></chart-example>

## Interaction Ranges

By default, the `nodeClick` event is only triggered when the user clicks exactly on a node. You can use the `nodeClickRange` option to instead define a range at which the event is triggered. This can be set to one of three values: `'nearest'`, `'exact'` or a number as a distance in pixels.

### Example: Interaction range variations

This example shows the three different types of interaction range that are possible.

- `'exact'` (default) will trigger the event if the user clicks exactly on a node
- `'nearest'` will trigger the event for whichever node is nearest on the whole chart
- given a number it will trigger the event when the click is made within that many pixels of a node

<chart-example title='Interaction Ranges' name='interaction-ranges' type='generated'></chart-example>

## Chart Event - seriesNodeClick

The `seriesNodeClick` event can be used to listen to `nodeClick` events of all series at once.

The contents of the event object passed to the listener will depend on the type of series the clicked node belongs to.

### Example: seriesNodeClick Event

This example demonstrates:

- Whenever a column or line marker is clicked, an alert message is shown with information about that series node.
- The ID of the series that contains the clicked node is also logged.

<chart-example title='Node Click Event' name='series-node-click-event' type='generated'></chart-example>

## Legend Event - legendItemClick and legendItemDoubleClick

The `legendItemClick` and `legendItemDoubleClick` events can be used to listen to legend item clicks and double clicks, respectively.

By default, when a legend item is clicked it hides the related series, and when double clicked it shows that series and hides all others.

### Example: legendItemClick & legendItemDoubleClick Events

This example demonstrates:

- when a legend item is clicked, a message is logged to the console with the `legendItemClick` event contents.
- when a legend item is double clicked, a message is logged to the console with the `legendItemDoubleClick` event contents.

<chart-example title='Legend Item Click Event' name='legend-item-click-event' type='generated'></chart-example>

## Chart Event - click and doubleClick

The `click` and `doubleClick` events are fired when any part of the chart is clicked or double clicked, respectively. When a user double clicks the `click` event will be fired on the first click, then both the `click` and `doubleClick` will be fired on the second click.

These events may be prevented by other clickable parts of the chart, such as series nodes and legend items.

### Example: Single & Double Click Events

This example demonstrates:

- when a blank area on a chart is clicked, a message is logged to the console
- when a blank area on a chart is double clicked, a different message is logged to the console

<chart-example title='Chart Single & Double Click Events' name='chart-click-event' type='generated'></chart-example>
