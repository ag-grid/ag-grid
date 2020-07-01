<?php
$pageTitle = "Chart Themes";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Themes</h1>

<p class="lead">
    Chart themes allow to ...
</p>

<h2>Basic usage</h2>

<p>
    All charts are using the default theme, if not explicitly configured to use a specific theme:
</p>

<?= createSnippet(<<<SNIPPET
const chartOptions = {
    theme: 'default' // also the same as 'light'
}
SNIPPET
) ?>

<h3>Example: Using stock themes</h3>

<?= chart_example('Using Stock Themes', 'stock-themes', 'generated') ?>

<?= chart_example('Custom Chart Theme', 'custom-theme', 'generated') ?>

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
    enabled: true,
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
    enabled: true,
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

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'generalConfig.navigator') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn more about <a href="../javascript-charts-markers/">markers</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
