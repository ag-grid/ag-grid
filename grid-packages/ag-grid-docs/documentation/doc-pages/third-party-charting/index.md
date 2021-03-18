---
title: "Third-Party Charting"
---

This section goes through examples of integrating the grid with [D3](https://d3js.org/) (for charting outside of the grid) and [Sparklines](https://omnipotent.net/jquery.sparkline/) (for charting inside the grid).

[[note]]
| This section pre-dates [Integrated Charts](/integrated-charts/). It is our plan to add support to our charting library to achieve the below, but for now we will leave these examples using D3 and Sparklines.

## External Graphs using D3

D3 is a powerful Graphing Library. In this example we provide an example that displays a simple AG Grid table of stock
data that when clicked on provides a simple time-series chart of the corresponding data. Multiple rows (or stocks) can be
selected to provide a comparison between stocks.

<grid-example title='External Graphs using D3' name='stocks-master-detail' type='vanilla' options='{ "enterprise": true, "exampleHeight": 820 }'></grid-example>

## Inline Graphs using jQuery Sparklines

jQuery Sparklines is a great library that offers small but rich graphs - ideal for use within AG Grid.

In this example we demonstrate the following:

- Close Trend: Inline summary trend graph. If clicked on the full time-series will be displayed below.
- Average Volume: The average volume per year in a Bar Graph.
- Target Expenditure: Illustrates how a graph can be used within a cell editor. If double clicked (or <kbd>Enter</kbd> pressed) a popup editor in the form of a Pie Chart will be shown - when a segment is clicked on the value will be saved down to the grid.
- Expenditure: Expenditure shown in a Pie Chart.

<grid-example title='Inline Graphs' name='inline-graphs' type='vanilla' options='{ "enterprise": true, "exampleHeight": 850, "extras": ["lodash", "d3", "jquery", "sparkline"] }'></grid-example>

