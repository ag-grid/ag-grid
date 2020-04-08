<?php
$pageTitle = "Charts - Histogram Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Histogram Series</h1>

<p class="lead">
    Histograms show data summarised and grouped into regular or irregular bins. They
    are a good choice for when the data is larger than could be plotted on a bar chart and
    can be used to find underlying trends in continuous data.
</p>

<p>
    The chart expects the (<code>chart.data</code> property) to be an array of objects, where each object
    is a table row or a database record and each key is a column. To plot a histogram we need at least
    one numeric attribute in the data to be specified using the the <code>xKey</code> property.
    Data will be distributed into bins according to their <code>xKey</code> values.
    Additionally, an optional <code>yKey</code> property is usually also given and
    specifies which attribute should be aggregated and plotted on the y-axis.
</p>

<h2>Frequency histogram</h2>

<p>
    The simplest histogram series config requires only one property:
    an <code>xKey</code> to define the key to bin the data by.
    With no <code>yKey</code> is given, the population size of each histogram bin is
    plotted on the y axis:
</p>
<?= createSnippet(<<<SNIPPET
series: [{
    type: 'histogram'
    xKey: 'age'
}]
SNIPPET
) ?>

<?= chart_example('Frequency Histogram', 'frequency-histogram', 'generated'); ?>

<h2>Total values</h2>

<p>
    Often a histogram is used to show the summing of one column or attribute for each of the bins.
    When a <code>yKey</code> is given the default behaviour is to plot a total of the <code>yKey</code> values.
    The kind of aggregation to use is controlled by the <code>series.aggregation</code>
    property but since <code>'sum'</code> is the default you can usually leave this out:
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    type: 'histogram'
    xKey: 'age',
    yKey: 'winnings'
}]
SNIPPET
) ?>

<?= chart_example('Sum aggregation histogram', 'sum-histogram', 'generated'); ?>

<h2>Mean bins</h2>

<p>
    Aggregating a bin by adding up the y-values is the most common use of a histogram but isn't
    always the best way to show your data.

    For data that is not evenly distributed in x, but is even in y, a sum plot histogram tends
    to be dominated by the populations of the x-bins. In the above example you may notice that
    the prize money distribution very closely follows the age distribution, so that while potentially
    useful, the chart does not reveal any new trends in the data.

    In many cases, plotting the mean of a bin on the y-axis better illustrates an underlying trend in the data:
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    type: 'histogram'
    xKey: 'age',
    yKey: 'time',
    yName: 'Average Time',
    aggregation: 'total'
}]
SNIPPET
) ?>

<?= chart_example('Mean values histogram', 'mean-histogram', 'generated'); ?>

<h2>Specified bin counts</h2>

<p>
    By default the histogram will split the x domain of the data into around ten
    regular-width bins, although the exact number generated will vary so that the
    chart can find round values for the bin boundaries. This is similar to how giving
    a number of ticks to an axis does not guarantee that exact number of ticks.

    The number of bins to aim for can be overridden by setting the <code>binCount</code>
    property on a histogram series.
</p>
<p>
    Given enough data, charts with more bins are able to more precisely illustrate
    underlying trends, but are also more sensitive to random noise.
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    type: 'histogram'
    xKey: 'age',
    binCount: 100
}]
SNIPPET
) ?>

<?= chart_example('More bins', 'more-bins-histogram', 'generated'); ?>

<h2>Irregular intervals</h2>

<p>
    Rather than specify the number of bins, for cases where you know exactly which bins
    you wish to split your x-axis values into, it is possible to explicitly give the
    start and end values for each bin.

    This is given using the <code>bins</code> property, and the value should be an array
    of arrays where each inner array contains the start and end value of a bin.

    In the example below, the data from the race is split into irregular age categories.
</p>

<p>
    For histogram charts with irregular bins it is usual for the area of the bar,
    rather than its height, to visually represent the value of each bin.

    In this way the shape of the underlying curve is maintained over irregular intervals.

    The <code>areaPlot</code> property should be set to <code>true</code>
    to enable this mode.
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    type: 'histogram'
    xKey: 'age',
    areaPlot: true,
    bins: [[16, 18], [18, 21], [21, 25], [25, 40]]
}]
SNIPPET
) ?>

<p>
    Note that if you give the <code>bins</code> property you should not also give
    <code>binCount</code>, but if both are present <code>bins</code> takes precedence.
</p>

<?= chart_example('Irregular intervals histogram', 'irregular-histogram', 'generated'); ?>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-layout/">layout</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
