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
    not explicitly configured by the user. Therefore themes can be used is a quick way to change a large
    number of configs that give your chart a different look and feel.
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
        <li><code>baseTheme</code> - the name of the theme to base this theme upon</li>
        <li><code>defaults</code> - the object to be merged with base theme's defaults</li>
        <li><code>palette</code> - the palette to use, replaces the palette of the base theme</li>
    </ul>
</p>

<p>Or more formally:</p>

<?= createSnippet(<<<SNIPPET
interface AgChartThemeOptions {
    baseTheme?: AgChartThemeName; // if missing 'default' is implied
    palette?: AgChartThemePalette;
    defaults?: any;
}

interface AgChartThemePalette {
    fills: string[];
    strokes: string[];
}
SNIPPET
) ?>

<p>
    The <code>defaults</code> object is similar in its structure to the chart's options with two exceptions:
    the <code>series</code> and the <code>axes</code> configs, which in case of the a theme are not arrays
    but objects that map a series or an axis type to a corresponding config. This is because a theme cannot provide
    the actual series and axes for a chart to use, it can only provide default configs for the series and axes
    set by the user, whatever they may be.
</p>

<p>
    Let's create our first theme now. We'll use the 'dark' theme as the base in order for our theme
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
