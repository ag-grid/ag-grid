<?php
$pageTitle = "Overlays: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Overlays. Full control of Overlays to display messages to the user on top of the grid. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Overlays";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Overlays</h1>

    <p>
        At present, there are two overlays for the grid:
    </p>
        <ul class="content">
        <li><b>Loading</b>: Gets displayed when the grid is loading data.</li>
        <li><b>No Rows</b>: Gets displayed when loading has complete but no rows to show.</li>
        </ul>

    <p>
        The grid manages showing and hiding of the overlays for you, so you may not ever need to call
        the above API methods. When the table is first initialised, the loading panel is displayed if rowData is set to null or undefined.
        When the api function setRowData is called, the loading panel is hidden.
    </p>

    <h2>Overlay API</h2>

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

    <h2>Custom Templates</h2>

    <p>
        If you're not happy with the provided overlay templates, you can provide your own. This is done with
        the grid properties <code>overlayLoadingTemplate</code> and <code>overlayNoRowsTemplate</code>. These templates
        should be plain HTML.
    </p>

    <h2>Example</h2>

    <p>
        In the example below, the table is not provided with rows on initialisation, hence the loading icon is shown.
        When the rows are read back, onNewRows is called, which automatically removes the loading panel. The example
        below also waits for two seconds before loading the rows, to help demonstrate the loading page.
    </p>

    <p>
        The example also shows the api methods in action, so you can show / hide the panels at your will.
    </p>

    <?= example('Overlays', 'overlays', 'generated') ?>

    <note>It is also possible to provide your own custom Overlay Components - please see <a href="../javascript-grid-overlay-component">
            Overlay Component</a> for more information.</note>



<?php include '../documentation-main/documentation_footer.php';?>