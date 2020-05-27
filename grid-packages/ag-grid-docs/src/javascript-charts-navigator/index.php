<?php
$pageTitle = "Chart Legend";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Navigator</h1>

<p class="lead">
    The navigator allows to zoom in on a portion of chart's data and then pan around the chart.
    This is useful in charts with lots of data and real-time charts where one wants to show
    a slice of time, for example sensor data for the last 20 minutes.
</p>

<h2>Showing the Navigator</h2>

<p>
    The navigator is hidden by default, to enable it add the following config to the chart:
</p>

<?= createSnippet(<<<SNIPPET
navigator: {
    enabled: true
}
SNIPPET
) ?>

<p>Or simply:</p>

<?= createSnippet(<<<SNIPPET
navigator: {}
SNIPPET
) ?>

<h2>Setting the Visible Range</h2>

<p>
    By default the navigator shows the whole range of chart's data in the horizontal direction.
    The two properties that control the range of data to show are <code>min</code> and <code>max</code>,
    which default to <code>0</code> and <code>1</code>, respectively.
</p>

<p>
    The visible range is normalized to the <code>[0, 1]</code> interval. For example, to show
    the last quarter of the chart's data by default we can use the following config:
</p>

<?= createSnippet(<<<SNIPPET
navigator: {
    min: 0.75,
    max: 1
}
SNIPPET
) ?>

<p>
    Regardless of the initial visible range, the user will be able to adjust the range as
    they see fit by dragging the range handles inside the navigator.
</p>

<h2>Styling the Navigator</h2>

<p>
    The navigator's <code>height</code> is configurable and affects chart's layout by
    leaving more or less vertical space for the series:
</p>

<?= createSnippet(<<<SNIPPET
navigator: {
    height: 50
}
SNIPPET
) ?>

<p>
    The navigator component has three subcomponents that can be styled independently:
    <ul>
        <li><code>mask</code> - the range mask</li>
        <li><code>minHandle</code> - the min drag handle</li>
        <li><code>maxHandle</code> - the max drag handle</li>
    </ul>
    The range mask shows the portion of the range selected, and the drag handles are used to adjust it.
</p>

<p>
    All subcomponent configs are optional too and have default values that make the navigator
    look good in charts with both light and dark backgrounds.
</p>

<h3>Example: Navigator Styling</h3>

<p>
    The example below uses various nagivator configs (in a deliberately exaggerated way) to change
    the following visual attributes of the navigator:
    <ul>
        <li>range mask's fill, fill opacity and stroke width</li>
        <li>fill and stroke colors of handles</li>
        <li>width, height and stroke width of the left handle</li>
        <li>the length of the left handle's grip lines and the distance between them</li>
    </ul>
</p>

<?= chart_example('Navigator Styling', 'navigator-styling', 'generated') ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'generalConfig.legend') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn more about <a href="../javascript-charts-markers/">markers</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
