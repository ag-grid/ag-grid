<?php
$pageTitle = "Charts Standalone: Overview";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Get Started with ag-Charts Standalone in Your Project</h1>

<p class="lead" id="javascript-charts">
    ag-Charts is an exciting new addition to the ag-Grid family, offering both integrated as well as standalone fully functional
    charting capabilities.
</p>

<?php
include './intro.php';
?>

<h2>Getting Started</h2>

<p>
    In this article we will walk you through the necessary steps to add ag-Charts to an existing JavaScript
    project and configure some of the essential features of it.
</p>

<h2>Your first chart</h2>

<p>
    Let's say you want to visualize how much you spend on coffee each quarter and that you have
    the following data:
</p>

<snippet language="ts">
var data = [{
    beverage: 'Coffee',
    Q1: 450,
    Q2: 560,
    Q3: 600,
    Q4: 700
}, {
    beverage: 'Tea',
    Q1: 270,
    Q2: 380,
    Q3: 450,
    Q4: 520
}, {
    beverage: 'Milk',
    Q1: 180,
    Q2: 170,
    Q3: 190,
    Q4: 200
}];
</snippet>

<p>To render it we can use this simple chart factory configuration:</p>

<snippet language="ts">
const chart = AgChart.create({
    data: data,
    container: document.querySelector('#myChart'),
    series: [{
        xKey: 'quarter',
        yKey: 'spending'
    }]
});
</snippet>

<p>Here we pass in the <code>data</code> we want to render, the <code>container</code> element for the chart
    (our chart won't be attached to the DOM without it) and the <code>series</code> to use to plot the data.</p>
<p>
    The series <code>type</code> defaults to <code>'line'</code> so the only series configuration we
    need to specify are the ones that tell the series which keys to use to fetch the data to be
    plotted along the horizontal (x) and vertical (y) axes.</p>

<p>The <code>series</code> property is an array
    because it is possible to supply multiple series (and of different kind too!) into a single chart.</p>

<p>The default <code>axes</code> configuration is a <code>category</code> axis
    on the bottom and <code>number</code> axis on the left of a chart, - both of which are exactly what we need so we
    dont need to supply these here.</p>

<p>The chart also features a legend by default which shows the <code>yKey</code> the series is using - in our case
    the the amount spent.
</p>

<p>
    <img alt="Line Chart" src="line-chart.png" style="margin-bottom: 0; width: 100%">
</p>

<h2>Customsing the Legend</h2>
<p>
    If we don't want the legend to show the value of the <code>yKey</code> itself we can give it a name - for example <code>'Coffee Spending'</code>.</p>

<p>This name is more descriptive but it's also longer, so let's position the legend on the bottom of the chart to make more space for the series:</p>

<snippet language="diff">
const chart = AgChart.create({
    data: coffeeSpending,
    container: document.querySelector('#myChart'),
    series: [{
        xKey: 'quarter',
        yKey: 'spending',
+       yName: 'Coffee Spending'
    }],
    legend: {
        position: 'bottom'
    }
});
</snippet>

<p>
    <img alt="Line Chart" src="line-chart-legend.png" style="margin-bottom: 0; width: 100%">
</p>

<h2>Basic Column Chart</h2>

<p>
    Now let's try something more interesting.
    Let us say you want to visualize how much is spent on coffee, milk and tea in your company each quarter and in total.
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
    Here's the chart factory configuration we can use to do that:
</p>

<snippet language="ts">
const chart = AgChart.create({
    data: beverageSpending,
    container: document.querySelector('#myChart'),
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
    }]
});
</snippet>

<p>
    Unlike <code>'line'</code> series charts, <code>'column'</code> series can have multiple <code>yKeys</code> which allow for stacking - in our case one block per quarter.</p>

<p>Chart tooltips are enabled by default so you can hover a block to see its value.</p>

<p>
    <img alt="Column Chart" src="beverage-expenses-no-captions.png" style="margin-bottom: 0px; width: 100%">
</p>

<h2>Labels & Titles</h2>

<p>We can enhance our chart by providing a label for each block segment. We can a label's <code>fontSize</code>, <code>fontFamily</code> and other properties,
    but for now we'll just accept the default values:
</p>

<snippet language="diff">
const chart = AgChart.create({
    data: beverageSpending,
    container: document.querySelector('#myChart'),
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
+       label: {}
    }]
});
</snippet>

<p>
    <img alt="Column Chart" src="beverage-expenses-labels.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>If we then want to add title and subtitle captions to the chart, we can simply add this to our chart config:</p>

<snippet language="diff">
const chart = AgChart.create({
    data: beverageSpending,
    container: document.querySelector('#myChart'),
+   title: {
+       text: 'Beverage Expenses'
+   },
+   subtitle: {
+       text: 'per quarter'
+   },
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
        label: {}
    }]
});
</snippet>


<p>
    <img alt="Column Chart" src="beverage-expenses-with-captions.png" style="margin-bottom: 0px; width: 100%">
</p>

<p>
Now that you've had a taste of what it's like to use AgCharts, we encourage you to explore our documentation
for specific chart types to learn more.
</p>

        <h2>Next Up</h2>

<p>
    Continue to the next section to see the: <a href="../javascript-charts-gallery/">Standalone Charts Gallery</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
