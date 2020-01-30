<?php
$pageTitle = "Charts Standalone: Overview";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Charts Standalone - Getting Started</h1>

<p class="lead">
    This section covers how to get started with the standalone charting library.
</p>

<h2>Your first chart</h2>

<p>
    Let's say you want to visualize how much you spend on coffee each quarter and that you have
    the following data:
</p>

<snippet language="ts">
const coffeeSpending = [
    {
        quarter: 'Q1',
        spending: 450
    },
    {
        quarter: 'Q2',
        spending: 560
    },
    {
        quarter: 'Q3',
        spending: 600
    },
    {
        quarter: 'Q4',
        spending: 700
    }
];
</snippet>

<p>To render it we can use this simple chart factory config:</p>

<snippet language="ts">
import { AgChart } from "ag-charts-community";

const chart = AgChart.create({
    data: coffeeSpending,
    container: document.body,
    series: [{
        xKey: 'quarter',
        yKey: 'spending'
    }]
});
</snippet>

<p>Here we pass in the <code>data</code> we want to render, the <code>container</code> element for the chart
    (our chart won't be attached to the DOM without it), and the <code>series</code> to use to plot the data.
    The series <code>type</code> defaults to <code>'line'</code>, so the only series configs we
    need to specify are the ones that tell the series which keys to use to fetch the data to be
    plotted along the horizontal (x) and vertical (y) axes. The <code>series</code> property is an array
    because it's possible to put multiple series (and of different kind too!) into a single chart,
    but let's not go there just now. The default <code>axes</code> configuration is <code>category</code> axis
    on the bottom and <code>number</code> axis on the left of a chart, which is exactly what we need,
    so we skip it here. The chart also features a legend by default, which shows the <code>yKey</code>
    the series is using to plot the amount spent.
</p>

<p>
    <img alt="Line Chart" src="line-chart.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>
    If we don't want the legend to show the value of the <code>yKey</code> itself, we can give it a name,
    like <code>'Coffee Spending'</code>. This name is more descriptive, but it's also longer, so let's
    position the legend on the bottom of the chart to make more space for the series:
</p>

<snippet language="ts">
const chart = AgChart.create({
    data: coffeeSpending,
    container: document.body,
    series: [{
        xKey: 'quarter',
        yKey: 'spending',
        yName: 'Coffee Spending'
    }],
    legend: {
        position: 'bottom'
    }
});
</snippet>

<p>
    <img alt="Line Chart" src="line-chart-legend.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>As you can see, it's super easy to create a good looking chart. Only a handful of configs requried.</p>

<h2>Handling More Data</h2>

<p>
    Now let's try something more interesting.
    Let's say you want to visualize how much is spent on coffee, milk and tea in your company each quarter and in total.
    Your data might look something like this:
</p>

<snippet language="ts">
const beverageSpending = [
    {
        beverage: 'Coffee',
        Q1: 450,
        Q2: 560,
        Q3: 600,
        Q4: 700
    },
    {
        beverage: 'Tea',
        Q1: 270,
        Q2: 380,
        Q3: 450,
        Q4: 520
    },
    {
        beverage: 'Milk',
        Q1: 180,
        Q2: 170,
        Q3: 190,
        Q4: 200
    },
];
</snippet>

<p>This time, let's choose another series type to plot the data: stacked columns.
    Here's the chart factory config we can use to do that:
</p>

<snippet language="ts">
const chart = AgChart.create({
    data: beverageSpending,
    container: document.body,
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
    }]
});
</snippet>

<p>
    Unlike <code>'line'</code> series, <code>'column'</code> series can have multiple <code>yKeys</code> to allow for stacking.
    In our case, one block per quarter. Chart tooltips are enabled by default, so you can hover a block to see its value.
</p>

<p>
    <img alt="Column Chart" src="beverage-expenses-no-captions.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>
    Alternatively, you can add the <code>label: {}</code> config to the series to show a label inside each block.
    It's possible to configure label's <code>fontSize</code>, <code>fontFamily</code> and other properties,
    but we'll just accept the default values:
</p>

<p>
    <img alt="Column Chart" src="beverage-expenses-labels.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>If we then want to add title and subtitle captions to the chart, we can simply add this to our chart config:</p>

<snippet language="ts">
title: {
    text: 'Beverage Expenses'
},
subtitle: {
    text: 'per quarter'
}
</snippet>

<p>
    <img alt="Column Chart" src="beverage-expenses-with-captions.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>Even with all these extra options our final config ended up being quite small:</p>

<snippet language="ts">
const chart = AgChart.create({
    data: beverageSpending,
    container: document.body,
    title: {
        text: 'Beverage Expenses'
    },
    subtitle: {
        text: 'per quarter'
    },
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
        label: {}
    }]
});
</snippet>

Now that you've had a taste of what it's like to use AgCharts, we encourage you to explore our documentation
for specific chart types to learn more.

<h2>Next Up</h2>

<p>
    Continue to the next section to see the: <a href="../javascript-grid-charts-standalone-gallery/">Standalone Charts Gallery</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
