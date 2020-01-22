<?php
$pageTitle = "Charts Standalone: Overview";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
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
        Let's say you want to visualize how much is spent on coffee, milk and tea in your company each quarter and in total.
        Your data might look something like this:
    </p>

    <snippet language="ts">
const data = [
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

    <p>To plot this data we can use the following chart factory config:</p>

    <snippet language="ts">
const chart = AgChart.create({
    data: data,
    container: document.body,
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
    }]
});
    </snippet>

    <p>
        Here we specify
        <ul>
            <li>the data we want to use by passing it to the <code>data</code> property</li>
            <li>the <code>container</code> element for the chart (the chart won't be attached to the DOM without it)</li>
            <li>and the series <code>type</code> to use to render the data</li>
        </ul>
    </p>

    <p>
        The <code>series</code> property is an array because
        it's possible to put multiple series of different kind into a single chart, but let's not
        go there just now.
    </p>

    <p>
        Each series should specify the keys it uses to fetch the data it renders.
        In this case, we want to have three stacked columns, one per beverage, so we use the <code>xKey</code>
        to fetch the beverage type and the <code>yKeys</code> to fetch the amount per quarter.
        The <code>xKey</code> will determine how many stacked columns to create, the <code>yKeys</code> the hight
        of individual components in each column.
    </p>

    <p>This config produces the following chart:</p>

    <p>
        <img alt="Column Chart" src="beverage-expenses-no-captions.png" style="margin-bottom: 0px; width: 100%">
    </p>

    <p>If we then want to add title and subtitle captions to the chart, we can simply add this to our config:</p>

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

    <h2>Next Up</h2>

    <p>
        Continue to the next section to see the: <a href="../javascript-grid-charts-standalone-gallery/">Standalone Charts Gallery</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>
