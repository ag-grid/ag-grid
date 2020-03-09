<?php
$pageTitle = "Charts - Markers";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Markers</h1>

<p class="lead">
    This section explores the markers used by line, area and scatter series.
</p>

<p>
    The shape of the markers can be changed by using the <code>shape</code> config.
    The <code>size</code>, <code>fill</code> and <code>stroke</code> are also valid configs:
</p>

<?= createSnippet(<<<SNIPPET
marker: {
    shape: 'square', // defaults to 'circle'
    size: 20,
    fill: 'red',
    stroke: 'maroon'
}
SNIPPET
) ?>

<p>
    Please see the <a href="#api-reference">API reference</a> for the list of all available options.
</p>

<h3>Example: Marker Shape, Size and Colour</h3>

<p>
    Notice how the shape and colour of the legend markers match the shape and colour of
    the markers used by the series, but the size of the markers in the legend is always
    the same.
</p>

<?= chart_example('Marker Shape, Size and Colour', 'marker-shape', 'generated'); ?>

<h2>Custom Marker Shapes</h2>

<p>
    It's possible to define custom marker shapes with relative ease. All you have to do is extend the
    <code>Marker</code> class and define a single method called <code>updatePath</code>, for example to draw a heart:
</p>

<?= createSnippet(<<<SNIPPET
import { Marker } from "./marker";

export class Heart extends Marker {
    toRadians(degrees) {
        return degrees / 180 * Math.PI;
    }

    updatePath() {
        const { x, path, size, toRadians } = this;
        const r = size / 4;
        const y = this.y + r / 2;

        path.clear();
        path.cubicArc(x - r, y - r, r, r, 0, toRadians(130), toRadians(330), 0);
        path.cubicArc(x + r, y - r, r, r, 0, toRadians(220), toRadians(50), 0);
        path.lineTo(x, y + r);
        path.closePath();
    }
}
SNIPPET
) ?>

<p>
    Inside the marker object, you have access to the <code>size</code> of the marker,
    the <code>x</code> and <code>y</code> coordinates of the data point and the <code>path</code>
    instance, which you can use to issue draw commands. If you are familiar with the standard Canvas
    API, you'll feel right at home here. The <code>path</code> API is very similar to that of
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D">CanvasRenderingContext2D</a>.
</p>

<p>
    All we do is render two partial circles with the <code>cubicArc</code> command and
    then two straight lines using the <code>lineTo</code> and <code>closePath</code> commands
    to get the shape of a heart.
</p>

<p>
    Inside the marker config of a series we then use the marker's constructor function
    itself rather than using one of the predefined shape names:
</p>

<?= createSnippet(<<<SNIPPET
marker: {
    shape: Heart,
    size: 16
}
SNIPPET
) ?>

<p>
    The final result is shown in the example below.
</p>

<h3>Example: Custom Marker Shape</h2>

<?= chart_example('Custom Marker Shape', 'custom-marker', 'generated'); ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile("../javascript-charts-api-explorer/config.json", "lineSeriesConfig.marker") ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-tooltips/">tooltips</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
