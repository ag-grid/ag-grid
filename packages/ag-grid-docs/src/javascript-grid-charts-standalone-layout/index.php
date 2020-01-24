<?php
$pageTitle = "Chart Layout";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Layout</h1>

<p class="lead">
    This section explains what components a chart is composed of and how they are laid out inside a chart.
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
    }
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
        position: 'right',
        spacing: 40
    }
});
</snippet>

<?= example('Basic Column Chart', 'basic-column', 'generated', array("enterprise" => true)) ?>

<h2>Series</h2>

<p>It wouldn't be incorrect to say that the chart is the series itself, and all the other chart components such as axes, legend
    and captions just help to make sense of the data represented by the series. The series alone can fill the whole area of the
    chart (which is the case with sparklines, for example), but when you start adding all these other components to the chart,
    you need to make space for them. The series have to be padded, so that there is enough space to show axis labels on the sides,
    and you probably want to add some extra padding on top of that, so that axis labels are not flush with the edge of the chart.
    That extra padding can be set using the <code>padding</code> config, which defaults to <code>20</code> on all sides but is set
    to <code>40</code> in our example for illustration purposes. The padding required to make space for axis labels on the other
    hand is calculated automatically by the chart layout.
</p>

<h2>Legend</h2>

<p>Now, if we want to have a legend in our chart, the chart layout will add extra padding to the side of the chart that the
    legend is positioned to, to accommodate the legend. The series are already padded on each side, so there will be some empty
    space between the series and the legend. However, you probably don't want the legend to be flush with the outer edge of the chart
    either. That's what the <code>spacing</code> config is for, which defaults to <code>20</code>, but is set explicitly to
    <code>40</code> in our example. The legend <code>position</code> is also optional and defaults to <code>'right'</code>.
    In fact, the <code>legend</code> config itself is optional, the legend will be shown be default, but can be hidden using
    <code>legend: { enabled: false }</code>.
</p>

<h2>Captions</h2>

<p>Lastly, when we add captions, such as title and subtitle, the layout figures out the amount of padding to add
    to the top of the chart automatically. There is no extra action for us to take.
</p>

<h2>Size Changes</h2>

<p>When the chart's size changes, the amount of user specified padding doesn't change, the auto padding amount typically (more on that
    later) doesn't change either, so it's only the series area that grows or shrinks on size changes.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about the: <a href="../javascript-grid-charts-standalone-gallery/">Legend Layout</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
