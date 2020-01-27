<?php
$pageTitle = "Chart Legend";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Legend</h1>

<p class="lead">
    This section explains what components a chart is composed of and how they are laid out inside a chart.
</p>

<h2>Size Changes</h2>

<p>
    Whenever the size of a chart changes, the legend layout is triggered.
    If the legend is vertical (positioned to the <code>right</code> or <code>left</code> of a chart),
    the layout algorithm tries to use the minimum number of columns possible to render all legend items
    using current constraints.
</p>

<p>
    <img alt="Legend Vertical Layout Size" src="layout-vertical-size.gif" style="margin-bottom: 0px; height: 250px; max-width: 100%">
</p>

<p>
    If the legend is horizontal (positioned to the <code>bottom</code> or <code>top</code> of a chart),
    the layout algorithm tries to use the minimum possible number of rows.
</p>

<p>
    <img alt="Legend Horizontal Layout Size" src="layout-horizontal-size.gif" style="margin-bottom: 0px; width: 100%">
</p>

<h2>Constraints</h2>

<p>
    <img alt="Legend Horizontal Spacing Size" src="layout-horizontal-spacing.gif" style="margin-bottom: 0px; width: 300px; max-width: 100%">
</p>

<p>
    <img alt="Legend Vertical Spacing Size" src="layout-vertical-spacing.gif" style="margin-bottom: 0px; height: 250px; max-width: 100%">
</p>

<p>
    <img alt="Legend Item Spacing Size" src="layout-item-spacing.gif" style="margin-bottom: 0px; width: 300px; max-width: 100%">
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about the: <a href="../javascript-grid-charts-standalone-gallery/">Legend Layout</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
