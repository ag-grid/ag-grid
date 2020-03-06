<?php
$pageTitle = "Chart Legend";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Legend</h1>

<p class="lead">
    A legend makes it easier to tell at a glance which series or series items correspond to which pieces of data.
    This section describes the legend options and layout behaviour.
</p>

<h2>Position and Visibility</h2>

<p>
    A legend can be positioned to any side of a chart using the <code>position</code> config:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    position: 'right' // 'bottom', 'left', 'top'
}
SNIPPET) ?>

<p>
    A legend is shown by default but can be hidden using the <code>enabled</code> config:
</p>

<snippet language="ts">
legend: {
    enabled: false
}
</snippet>

<h3>Example: Legend Position and Visibility</h2>

<p>
    Notice how when you click on one of the buttons in the example to change the position
    of the legend:

    <ul>
        <li>the layout of the legend items also changes</li>
        <li>
            the layout of the chart changes as well, with series moving around
            and growing/shrinking slightly to accommodate the legend
        </li>
    </ul>
</p>

<?= chart_example('Legend Position and Visibility', 'legend-position', 'generated') ?>

<h2>Vertical Layout</h2>

<p>
    Whenever the size of a chart changes, the legend layout is triggered.
    If the legend is vertical (positioned to the <code>'right'</code> or <code>'left'</code> of a chart),
    the layout algorithm tries to use the minimum number of columns possible to render all legend items
    using current constraints. Notice how the number of columns in a legend increases as the height of
    a chart shrinks.
</p>

<h3>Example: Vertical Legend Layout</h3>

<?= chart_example('Vertical Legend Layout', 'legend-layout-vertical', 'generated') ?>

<h2>Horizontal Layout</h2>

<p>
    If the legend is horizontal (positioned to the <code>'bottom'</code> or <code>'top'</code> of a chart),
    the layout algorithm tries to use the minimum possible number of rows. If a chart is not wide enough,
    the legend will keep subdividing its items into more rows until everything fits.
</p>

<h3>Example: Horizontal Legend Layout</h3>

<?= chart_example('Horizontal Legend Layout', 'legend-layout-horizontal', 'generated') ?>

<h2>Constraints</h2>

<p>
    In addition to the width and height of the chart, the legend's layout is also affected by the amount of spacing
    between and within the legend items. For example, <code>layoutHorizontalSpacing</code> controls the amount
    of spacing between adjacent horizontal legend items:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    layoutHorizontalSpacing: 16
}
SNIPPET) ?>

<p>
    <code>layoutVerticalSpacing</code> controls the amount of spacing between adjacent vertical legend items:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    layoutVerticalSpacing: 8
}
SNIPPET) ?>

<p>
    And the <code>itemSpacing</code> config is responsible for the amount of spacing within a legend item, between the marker
    and the label:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    itemSpacing: 8
}
SNIPPET) ?>

<h3>Example: Legend Constraints</h3>

<?= chart_example('Legend Constraints', 'legend-constraints', 'generated') ?>

<h2>Fonts</h2>

<p>
    There are a number of configs that affect the <code>fontSize</code>, <code>fontStyle</code>,
    <code>fontWeight</code>, <code>fontFamily</code>, and <code>color</code> of the legend item labels:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontFamily: 'Papyrus',
    color: 'red'
}
SNIPPET) ?>

<h2>Markers</h2>

<h3>Size and Stroke</h3>

<p>
    All legend items use the same size and stroke width, regardless of the size and stroke width
    used by the series they represent. It's possible to adjust the defaults using the following configs:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    markerSize: 20,
    strokeWidth: 3
}
SNIPPET) ?>

<h3>Shape</h3>

<p>
    Normally, the legend mirrors the marker shapes used by the series, unless the series
    in question doesn't support markers (for example <code>'column'</code> series), in
    which case the legend will use the <code>'square'</code> marker shape for that series.
</p>

<p>
    It's also possible to override the default behaviour and make the legend use
    a specified marker shape for all legend items, regardless of the shapes the series
    are using themselves:
</p>

<?= createSnippet(<<<SNIPPET
legend: {
    markerShape: 'circle' // 'square', 'diamond', 'cross', 'plus', 'triangle'
}
SNIPPET) ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'generalConfig.legend') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn more about <a href="../javascript-charts-markers/">markers</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
