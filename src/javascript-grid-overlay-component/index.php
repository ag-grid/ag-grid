<?php
$key = "Overlay Component";
$pageTitle = "JavaScript Overlay Component";
$pageDescription = "Describes how to implement custom overlay components for ag-Grid";
$pageKeyboards = "JavaScript Grid Overlay Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1" id="filter-component">Overlay Component</h1>

<h2 id="custom-overlays">Custom Overlay Renderer's</h2>

<p>
    In addition to providing custom template it is also possible to supply custom renderer components for the loading
    and no rows overlays. These custom overlays are implementations of
    <a href="../javascript-grid-cell-rendering-components/">Cell Renderer Components</a>.
</p>

<p>
    The example below demonstrate how to provide custom overlay renderer components to the grid. Notice the following:
<ul>
    <li><b>Custom Loading Overlay Renderer</b> is supplied via <code>gridOptions.loadingOverlayRenderer</code>.</li>
    <li><b>Custom No Rows Overlay Renderer</b> is supplied via <code>gridOptions.noRowsOverlayRenderer</code>.</li>
</ul>

<?= example('Custom Overlay Components', 'custom-overlay-components', 'generated', array('enterprise' => false, 'extras' => array('fontawesome')) ) ?>
</p>

<?php include '../documentation-main/documentation_footer.php';?>

