<?php
$pageTitle = "Chart Themes";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Themes</h1>

<p class="lead">
    Themes allow you customise the appearance of your charts. They provide defaults for different properties of the
    chart that will be used unless overridden by the chart options.
</p>

<h2>Using Stock Themes</h2>

<p>
    Every chart uses the <code>'ag-default'</code> theme unless configured otherwise:
</p>

<?= createSnippet(<<<SNIPPET
AgChart.create({
    theme: 'ag-default', // optional, implied
    ...
});
SNIPPET
) ?>

<p>The following themes are provided out-of-the-box:</p>

<?= createSnippet(<<<SNIPPET
type AgChartThemeName = 'ag-default' | 'ag-default-dark'
    | 'ag-material' | 'ag-material-dark'
    | 'ag-pastel' | 'ag-pastel-dark'
    | 'ag-solar' | 'ag-solar-dark'
    | 'ag-vivid' | 'ag-vivid-dark';
SNIPPET
, 'ts') ?>

<h3>Example: Stock Themes</h3>

<p>
    In the example below, you can click the buttons to change the theme used in the chart. Notice how changing from
    one theme to another is a simple matter of changing the <code>theme</code> property on the original
    <code>options</code> object and passing it to <code>AgChart.update(chart, options)</code>
    along with the chart instance.
</p>

<?= chart_example('Stock Themes', 'stock-themes', 'generated') ?>

<h2>Making Custom Themes</h2>

<p>
    You can create your own theme, which builds upon an existing theme and allows you to change as many or as few
    properties as you like. A custom theme is an object with the following properties:
</p>

<ul>
    <li><code>baseTheme</code> - the name of the theme to base this theme upon (optional; if not specified, the <code>'ag-default'</code> theme is used)</li>
    <li><code>defaults</code> - the object to be merged with the base theme's defaults and override them (optional)</li>
    <li><code>palette</code> - the palette to use, replaces the palette of the base theme (optional)</li>
</ul>

<p>
    The <code>defaults</code> object is similar in its structure to the chart's options, with two noteworthy exceptions:
</p>

<ul>
    <li>the <code>series</code> config is an object that maps each series type to its config</li>
    <li>the <code>axes</code> config is an object that maps each axis type to its config</li>
</ul>

<p>
    For example, the following snippet demonstrates a custom theme that uses the <code>'ag-default-dark'</code> theme as
    the base to inherit the dark background and bright strokes, but substitutes the palette and changes some fonts, as
    well as a few other options.
</p>

<?= createSnippet(<<<SNIPPET
var myTheme = {
    baseTheme: 'ag-default-dark',
    palette: {
        fills: [
            '#5C2983',
            '#0076C5',
            '#21B372',
            '#FDDE02',
            '#F76700',
            '#D30018'
        ],
        strokes: ['black']
    },
    defaults: {
        cartesian: {
            title: {
                fontSize: 24
            },
            series: {
                column: {
                    label: {
                        enabled: true,
                        color: 'black'
                    }
                }
            }
        }
    }
};
SNIPPET
) ?>

<h3>Example: Custom Theme</h3>

<p>The theme shown in the above snippet is applied to the chart in the example below:</p>

<?= chart_example('Custom Theme', 'custom-theme', 'generated') ?>

<h3>Example: Advanced Theme</h3>

<p>This example demonstrates a more advanced theme, providing different settings for different series and axis types.

<?= chart_example('Advanced Theme', 'advanced-theme', 'generated') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn more about the <a href="../javascript-charts-navigator/">navigator</a> component.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
