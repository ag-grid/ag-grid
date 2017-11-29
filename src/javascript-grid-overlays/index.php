<?php
$key = "Overlays";
$pageTitle = "ag-Grid Overlays";
$pageDescription = "Overlays are placed on top of the grid when loading rows, or when no rows showing. These overlays can be customised to what you want the user to see.";
$pageKeyboards = "ag-Grid Overlays";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="overlays">Overlays</h1>

    <p>
        At present, there are two overlays for the grid:
        <ul>
        <li><b>Loading</b>: Gets displayed when the grid is loading data.</li>
        <li><b>No Rows</b>: Gets displayed when loading has complete but no rows to show.</li>
        </ul>
    </p>

    <p>
        The grid manages showing and hiding of the overlays for you, so you may not ever need to call
        the above API methods. When the table is first initialised, the loading panel is displayed if rowData is set to null or undefined.
        When the api function setRowData is called, the loading panel is hidden.
    </p>

    <h3 id="overlay-api">Overlay API</h3>

    <p>
        At any point, you can show or hide any of the overlays using the methods below.
        You may never use these methods, as the grid manages the overlays for you. However
        you may find some edge cases where you need complete control (such as showing 'loading'
        if an option outside the grid is changed).
    </p>

    <snippet>
// show 'loading' overlay
gridOptions.api.showLoadingOverlay()

// show 'no rows' overlay
gridOptions.api.showNoRowsOverlay()

// clear all overlays
gridOptions.api.hideOverlay()</snippet>

    <p>
        The overlays are mutually exclusive, you cannot show more than one overlay at any given time.
    </p>

    <h3 id="custom-templates">Custom Templates</h3>

    <p>
        If you're not happy with the provided overlay templates, you can provide your own. This is done with
        the grid properties <i>overlayLoadingTemplate</i> and <i>overlayNoRowsTemplate</i>. These templates
        should be plain HTML.
    </p>

    <h3 id="example">Example</h3>

    <p>
        In the example below, the table is not provided with rows on initialisation, hence the loading icon is shown.
        When the rows are read back, onNewRows is called, which automatically removes the loading panel. The example
        below also waits for two seconds before loading the rows, to help demonstrate the loading page.
    </p>

    <p>
        The example also shows the api methods in action, so you can show / hide the panels at your will.
    </p>

    <?= example('Overlays', 'overlays', 'generated') ?>

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
    </p>

    <?= example('Custom Overlays', 'custom-overlays', 'generated', array('enterprise' => false, 'extras' => array('fontawesome')) ) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>