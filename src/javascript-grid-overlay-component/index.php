<?php
$pageTitle ="ag-Grid: Styling & Appearance - Overlay Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This covers how you can use the standard Overlays or use your own.";
$pageKeyboards = "JavaScript Grid Overlay Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Overlay Component</h1>

<p class="lead">
    Overlay components allow you to add your own overlays to ag-Grid. Use these when the provided overlay's do not meet
    your requirements.
</p>

<h2>Loading Rows Overlay Interface</h2>

<p> Implement this interface to provide a custom overlay when loading rows.  </p>

<snippet>
interface ILoadingOverlayComp {

    // mandatory methods

    // The init(params) method is called on the overlay once. See below for details on the parameters.
    init(params: ILoadingOverlayParams): void;

    // Returns the GUI for this overlay. The GUI can be a) a string of html or b) a DOM element or node.
    getGui(): any;
}
</snippet>

<snippet>
interface ILoadingOverlayCompParams {

    // an optional template for the loading rows overlay
    loadingRowsTemplate?: string

    // The grid API
    api: any;
}
</snippet>

<h2>No Rows Overlay Interface</h2>

<p>
    Implement this interface to provide a custom overlay when no rows loaded.
</p>

<snippet>
interface INoRowsOverlayComp {

    // mandatory methods

    // The init(params) method is called on the overlay once. See below for details on the parameters.
    init(params: INoRowsOverlayParams): void;

    // Returns the GUI for this overlay. The GUI can be a) a string of html or b) a DOM element or node.
    getGui(): any;
}
</snippet>

<snippet>
interface INoRowsOverlayParams {

    // an optional template for the no rows overlay
    noRowsTemplate?: string

    // The grid API
    api: any;
}
</snippet>


<h2>Registering Overlay Components</h2>

<p>
    See the section <a href="../javascript-grid-components/#registering-custom-components">registering custom components</a>
    for details on registering and using custom overlays.
</p>

<h2>Example: Custom Overlay Components</h2>

<p>
    The example below demonstrates how to provide custom overlay components to the grid. Notice the following:
</p>

<ul class="content">
    <li><b>Custom Loading Overlay Renderer</b> is supplied by name via <code>gridOptions.loadingOverlayComponent</code>.</li>
    <li><b>Custom Loading Overlay Renderer Parameters</b> are supplied using <code>gridOptions.loadingOverlayComponentParams</code>.</li>

    <li><b>Custom No Rows Overlay Renderer</b> is supplied by name via <code>gridOptions.noRowsOverlayComponent</code>.</li>
    <li><b>Custom No Rows Overlay Renderer Parameters</b> are supplied using <code>gridOptions.noRowsOverlayComponentParams</code>.</li>
</ul>

<?= example('Custom Overlay Components', 'custom-overlay-components', 'generated', array('enterprise' => false, 'extras' => array('fontawesome')) ) ?>

<?php include '../documentation-main/documentation_footer.php';?>