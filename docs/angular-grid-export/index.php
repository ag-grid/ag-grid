<?php
$key = "Data Export";
$pageTitle = "ag-Grid Data Export";
$pageDescription = "Data in the grid can be exported to csv. This page explains how to do exports along with properties you can set to get the exports done.";
$pageKeyboards = "ag-Grid Data Export Javascript CSV";
include '../documentation_header.php';
?>

<div>

    <h2>Data Export</h2>

    <p>
        The data can be exported to CSV with on API call. You have two options, let the grid to the export if the
        browser is modern and it is allowed, or you get the grid to return you the CSV string and your application
        is responsible for the export (some older browsers will require you to send the data to the server and do
        an old school 'file download' from the server).
    </p>

    <p>
        The API methods are as follows:
    </p>
    <ul>
        <li><b>exportDataAsCsv(params)</b>: Does the full export.</li>
        <li><b>getDataAsCsv(params)</b>: Returns the CSV data for export.</li>
    </ul>

    <p>
        Each of these methods takes a an optional params object that can take the following:
    </p>
    <ul>
        <li><b>skipHeader</b>: Set to true if you don't want to first line to be the column header names.</li>
        <li><b>skipGroups</b>: Set to true to skip headers and footers if grouping. No impact if not grouping.</li>
        <li><b>skipFooters</b>: Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping.</li>
        <li><b>fileName</b>: String to use as the file name. If missing, the file name 'export.csv' will be used.</li>
    </ul>

    <p>
        The example below shows the export in action. Notice the following:
    </p>
    <ul>
        <li>Filtered rows are not included in the export.</li>
        <li>The sort order is maintained in the export.</li>
        <li>The order of the columns is maintained in the export.</li>
        <li>Only visible columns are export.</li>
        <li>Value getters are export with their values (the 'Group' col uses a value getter to take the first letter of the country name)</li>
        <li>Aggregated values are export.</li>
        <li>For groups, the first cell will always have the group key.</li>
    </ul>

    <show-example example="exampleExport"></show-example>

</div>

<?php include '../documentation_footer.php';?>