<?php
$pageTitle = "Charts - Markers";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Markers</h1>

<p class="lead">
    This section covers markers used by Line, Area and Scatter series.
</p>

<h2>Introduction</h2>

<p>
    If we continue with our <a href="../javascript-charts-line-series/#colors">line series example</a> and want
    to make the Diesel series markers square, we can achieve this by using the <code>shape</code> property
    inside the <code>marker</code> config.
</p>

<snippet language="ts">
marker: {
    shape: 'square'
}
</snippet>

<p>
    <img alt="Marker Shape" src="marker-shape-square.png" style="margin-bottom: 0px; height: 300px;">
</p>

<p>
    We can also configure the size of the markers like so:
</p>

<snippet language="ts">
marker: {
    size: 16
}
</snippet>

<p>
    <img alt="Marker Size" src="marker-size.png" style="margin-bottom: 0px; height: 300px;">
</p>

<h2>Custom Markers</h2>

<p>
    It's possible to define custom marker shapes with relative ease. All one has to do is
    to extend the <code>Marker</code> class and define a single method called
    <code>updatePath</code>:
</p>

<snippet language="ts">
import { Marker } from "./marker";

export class Heart extends Marker {
    rad(degree: number) {
        return degree / 180 * Math.PI;
    }

    updatePath() {
        let { x, path, size, rad } = this;
        const r = size / 4;
        const y = this.y + r / 2;

        path.clear();
        path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
        path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
        path.lineTo(x, y + r);
        path.closePath();
    }
}
</snippet>

<p>
    Inside the marker object, you have access to the <code>size</code> of the marker,
    the <code>x</code>, <code>y</code> coordinates of the data point and the <code>path</code>
    instance, which you can use to issue draw commands. If you are familiar with HTML5 Canvas
    API, you'll feel right at home here. The <code>path</code> API is very similar to that of
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D">CanvasRenderingContext2D</a>.
</p>

<p>
    All we do is render two partial circles with the <code>cubicArc</code> command and
    then two straight lines using the <code>lineTo</code> and <code>closePath</code> commands
    to get the shape of a heart.
</p>

<p>
    And then inside the marker config of a series we can use the marker's constructor function
    itself rather than using one of the predefined shape names:
</p>

<snippet language="ts">
marker: {
    shape: Heart,
    size: 16
}
</snippet>

<p>
    <img alt="Custom Marker" src="custom-marker.png" style="margin-bottom: 0px; height: 300px;">
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
