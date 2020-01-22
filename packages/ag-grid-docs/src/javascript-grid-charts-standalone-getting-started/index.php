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

    <h2>What makes a chart?</h2>

    <p>
        <img alt="Chart Layout" src="cartesian-chart-layout.png" style="margin-bottom: 0px; width: 100%">
    </p>

    <p>Each chart is composed of a single or multiple series and (optionally) a legend, axes, and captions, such as title and subtitle. All these components are managed by the chart's layout engine and are sized and positioned appropriately based on chart's dimensions, the nature of the data and the user's config.</p>

    <p>It helps to understand the way layout works to configure presentation to one's liking and to get expected results on chart size or data changes.</p>

    <p>For example, given the data:</p>

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

    <p>we can create the chart pictured above using the following chart factory config:</p>

    <snippet language="ts">
const chart = AgChart.create({
    data,
    container: document.body,
    title: {
        text: 'Beverage Expenses'
    },
    subtitle: {
        text: 'per quarter'
    },
    padding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
    },
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
    }],
    legend: {
        spacing: 40
    }
});
    </snippet>

    <?= example('Basic Column Chart', 'basic-column', 'generated', array("enterprise" => true)) ?>

    <p>By default, the chart's padding is set to 20 on all sides of the chart and the legend's spacing is set to 20 as well.</p>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to see the: <a href="../javascript-grid-charts-standalone-gallery/">Standalone Charts Gallery</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>
