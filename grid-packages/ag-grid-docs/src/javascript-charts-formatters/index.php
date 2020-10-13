<?php
$pageTitle = "Charts - Formatters";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Formatters</h1>

<p class="lead">
    This section explores customization of individual series items and markers based on data
    they represent.
</p>

<p>
    When it comes to formatters, all series can be divided into two categories:
    <ul>
        <li>
            <i>series with markers</i>, such as <code>line</code>, <code>scatter</code> and <code>area</code>,
            where each data point is represented by a marker that can be of any shape
        </li>
        <li>
            <i>series without markers</i>, such as <code>bar</code> and <code>pie</code>, where each data point
            is represented by a series item with a fixed shape, for example a rectangle or a pie sector
        </li>
    </ul>
</p>

<h2>Marker formatter example</h2>

<p>
    If we take a stacked area series where we want the markers of the second subseries to be larger
    than default size, we could use the following formatter function:
</p>

<?= createSnippet(<<<SNIPPET
type: 'area',
xKey: 'quarter',
yKeys: ['petrol', 'electric'],
marker: {
    formatter: params => ({
        size: params.yKey === 'electric' ? 12 : params.size
    })
}
SNIPPET
) ?>

<?= chart_example('Marker Formatter', 'marker-formatter', 'generated'); ?>

<h2>Series item formatter example</h2>

<p>
    If we have a list of values by country presented via bar series and want the bar
    for a particular country to stand out, we could use the following formatter function:
</p>

<?= createSnippet(<<<SNIPPET
type: 'column',
xKey: 'country',
yKeys: ['gdp'],
formatter: params => ({
    fill: params.datum[params.xKey] === 'UK' ? 'red' : params.fill
    // we can also use `params.datum.country`, but the formatter
    // would have to be updated whenever the `xKey` is changed
})
SNIPPET
) ?>

<?= chart_example('Series Formatter', 'series-formatter', 'generated'); ?>

<p>
    Please use <a href="../javascript-charts-api/">API reference</a> to learn more about the marker and series
    formatters, the inputs they receive and the attributes they allow to customize.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-tooltips/">tooltips</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
