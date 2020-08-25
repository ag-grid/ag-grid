<?php
$pageTitle = "Chart Themes";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Themes</h1>

<p class="lead">
    A chart theme is the default configuration for the subcomponents and individual properties
    not explicitly configured by the user. Therefore themes can be used as a quick way to change a large
    number of chart's properties while keeping the user config simple.
</p>

<h2>Using stock themes</h2>

<p>
    Every chart is using the <code>'default'</code> theme unless configured otherwise:
</p>

<?= createSnippet(<<<SNIPPET
AgChart.create({
    theme: 'default', // optional, implied
    ...
});
SNIPPET
) ?>

<p>The following themes are supported:</p>

<?= createSnippet(<<<SNIPPET
type AgChartThemeName = 'default' | 'dark'
    | 'material' | 'material-dark'
    | 'pastel' | 'pastel-dark'
    | 'solar' | 'solar-dark'
    | 'vivid' | 'vivid-dark';
SNIPPET
, 'ts') ?>

<p>Let's try using the <code>'dark'</code> theme for example.</p>

<h3>Example: Dark Theme</h3>

<p>
    Notice how changing from theme to theme is a simple matter of changing the <code>theme</code> property
    on the original <code>options</code> object and passing it to the <code>AgChart.update(chart, options)</code>
    along with the chart instance.
</p>

<?= chart_example('Dark Theme', 'dark-theme', 'generated') ?>

<h2>Overriding stock themes</h2>

<p>
    One can create their own themes by providing an override for any of the stock themes.
    A theme override is an object with the following properties:
    <ul>
        <li><code>baseTheme</code> - the name of the theme to base this theme upon (optional, if not specified, the <code>'default'</code> theme is used)</li>
        <li><code>defaults</code> - the object to be merged with the base theme's defaults and override them (optional)</li>
        <li><code>palette</code> - the palette to use, replaces the palette of the base theme (optional)</li>
    </ul>
</p>

<p>
    The <code>defaults</code> object is similar in its structure to the chart's options with two noteworthy exceptions:
    <ul>
        <li>the <code>series</code> config is an object that maps each series type to its config</li>
        <li>the <code>axes</code> config is an object that maps each axis type to its config</li>
    </ul>
</p>

<p>
    Let's create our first theme now. We'll use the <code>'dark'</code> theme as the base in order for our theme
    to inherit the dark background and bright strokes but we'll substitute the pallete and change some
    fonts as well as a few other configs.
</p>

<h3>Example: Custom Theme</h3>

<?= chart_example('Custom Theme', 'custom-theme', 'generated') ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'generalConfig.theme') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn more about the <a href="../javascript-charts-navigator/">navigator</a> component.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
