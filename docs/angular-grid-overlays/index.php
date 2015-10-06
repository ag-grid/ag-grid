<?php
$key = "Overlays";
$pageTitle = "ag-Grid Overlays";
$pageDescription = "When loading rows, or when no rows to show, overlays are placed on top of the grid to inform the user. These overlays can be customised to what you want the user to see.";
$pageKeyboards = "ag-Grid Overlays";
include '../documentation_header.php';
?>

<div>

    <h2>Overlays</h2>

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

    <h4>Overlay API</h4>

    <p>
        At any point, you can show or hide any of the overlays using the methods below.
        You may never use these methods, as the grid manages the overlays for you. However
        you may find some edge cases where you need complete control (such as showing 'loading'
        if an option outside the grid is changed).
    </p>

    <pre><code>// show 'loading' overlay
gridOptions.api.showLoadingOverlay()

// show 'no rows' overlay
gridOptions.api.showNoRowsOverlay()

// clear all overlays
gridOptions.api.hideOverlay()</code></pre>

    <p>
        The overlays are mutually exclusive, you cannot show more than one overlay at any given time.
    </p>

    <h4>Custom Templates</h4>

    <p>
        If your not happy with the provided overlay templates, you can provide your own. This is done with
        the grid properties <i>overlayLoadingTemplate</i> and <i>overlayNoRowsTemplate</i>. These templates
        should be plain HTML.
    </p>

    <h4>Example</h4>

    <p>
        In the example below, the table is not provided with rows on initialisation, hence the loading icon is shown.
        When the rows are read back, onNewRows is called, which automatically removes the loading panel. The example
        below also waits for two seconds before loading the rows, to help demonstrate the loading page.
    </p>

    <p>
        The example also shows the api methods in action, so you can show / hide the panels at your will.
    </p>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>