<?php
$key = "Loading Overlay";
$pageTitle = "Loading Overlay";
$pageDescription = "When loading rows, a loading overlay can be displayed over Angular Grid. This page explains how to configure the overlay.";
$pageKeyboards = "Angular Grid Loading Overlay";
include '../documentation_header.php';
?>

<div>

    <h2>Loading Overlay</h2>

    <p>
        At any point, you can show the loading overlay on top of Angular Grid. To show or hide the overlay, call
        the api function showLoading:
    </p>

    <pre><code>gridOptions.api.showLoading(show)</code></pre>

    <p>
        When the table is first initialised, the loading panel is displayed if rowData is set to null or undefined.
    </p>

    <p>
        When the api function onNewRows is called, the loading panel is hidden.
    </p>

    <p>
        In the example below, the table is not provided with rows on initialisation, hence the loading icon is shown.
        When the rows are read back, onNewRows is called, which automatically removes the loading panel. The example
        below also waits for two seconds before loading the rows, to help demonstrate the loading page.
    </p>

    <p>
        If loading rows remotely after the initial load, it is advised to call 'showLoading(false)' to show
        the loading panel while your application fetches the new data from the server.
    </p>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>