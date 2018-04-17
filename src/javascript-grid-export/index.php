<?php
$pageTitle = "Excel Export: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is CSV Export which is used to take data out of the grid and into another application for further processing such as Excel. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Data Export Javascript CSV";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>CSV Export</h1>

    <p class="lead">
        The data can be exported to CSV with an API call. You have two options, let the grid do the export if the
        browser is modern and it is allowed, or you get the grid to return you the CSV string and your application
        is responsible for the export (some older browsers will require you to send the data to the server and do
        an old school 'file download' from the server).
    </p>

    <note>
        If you are looking to export your data formatted for Excel use the ag-Grid Enterprise feature
        <a href="../javascript-grid-excel/">Excel Export</a>.
    </note>


    <note>If you want to disable CSV export, you can set the property <code>suppressCsvExport = true</code> in your
        <code>gridOptions</code></note>

    <p>
        The API methods are as follows:
    </p>

    <ul class="content">
        <li><code>exportDataAsCsv(params)</code>: Does the full export.</li>
        <li><code>getDataAsCsv(params)</code>: Returns the CSV data for export.</li>
    </ul>

    <p>
        Each of these methods takes a an optional params object that can take the following:
    </p>

    <ul class="content">
        <li><code>skipHeader</code>: Set to true if you don't want to first line to be the column header names.</li>
        <li><code>columnGroups</code>: Set to true to include header column groupings.</li>
        <li><code>skipGroups</code>: Set to true to skip row group headers and footers if grouping rows. No impact if not grouping rows.</li>
        <li><code>skipFooters</code>: Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping.</li>
        <li><code>suppressQuotes</code>: Set to true to not use double quotes between values.</li>
        <li><code>fileName</code>: String to use as the file name. If missing, the file name 'export.csv' will be used.</li>
        <li><code>customHeader</code>: If you want to put some text at the top of the csv file, stick it here.
            You will need to include '\n' at the end, or many '\n' if you want the header to span lines.</li>
        <li><code>customFooter</code>: Same as customHeader, but for the end of the file.</li>
        <li><code>allColumns</code>: If true, all columns will be exported in the order they appear in columnDefs.
            Otherwise only the columns currently showing the in grid, and in that order, are exported.</li>
        <li><code>onlySelected</code>: Only export selected rows.</li>
        <li><code>onlySelectedAllPages</code>: Only export selected rows including other pages (only makes sense when using pagination).</li>
        <li><code>columnSeparator</code>: The column separator. Defaults to comma.</li>
        <li><code>columnKeys</code>: Provide a list (an array) of column keys if you want to export specific columns.</li>
        <li><code>shouldRowBeSkipped</code>: Allows you to skip entire rows from the export.</li>
        <li><code>processCellCallback</code>: Allows you to process (typically format) cells for the CSV.</li>
        <li><code>processHeaderCallback</code>: Allows you to create custom header values for the export.</li>
    </ul>


    <h2>shouldRowBeSkipped()</h2>

    <p>This callback allows you to entirely skip a row to be exported. The example below has an option 'Skip Group R'
        which will entirely skip all the rows which Group=R.</p>

    <p>
        The callback params has the following attributes: node, api, context.
    </p>

    <h2>processCellCallback()</h2>

    <p>This callback allows you to format the cells for the export. The example below has an option 'Use Cell Callback'
    which puts all the items into upper case. This can be useful if, for example, you need to format date cells
    to be read by Excel.</p>

    <p>
        The callback params has the following attributes: value, node, column, api, columnApi, context.
    </p>

    <h2>processHeaderCallback()</h2>

    <p>If you don't like the header names the grid provides, then you can provide your own header names. Maybe you
        have grouped columns and you want to include the columns parent groups.</p>

    <p>
        The callback params has the following attributes: column, api, columnApi, context.
    </p>

    <h2>
        What Gets Exported
    </h2>

    <p>
        The same data that is in the grid gets exported, but none of the GUI representation of the data will be.
        What this means is:
    </p>
        <ul class="content">
            <li>The raw values, and not the result of cell renderer, will get used, meaning:
                <ul class="content">
                    <li>Cell Renderers will NOT be used.</li>
                    <li>Value Getters will be used.</li>
                    <li>Cell Formatters will NOT be used (use <code>processCellCallback</code> instead).</li>
                </ul>
            </li>
            <li>If row grouping, all data will be exported regardless of groups open or closed.</li>
            <li>If row grouping with footers (groupIncludeFooter=true) the footers will NOT be used -
                this is a GUI addition that happens for displaying the data in the grid.</li>
        </ul>

    <h2> Example </h2>

    <p>
        The example below shows the export in action. Notice the following:
    </p>

    <ul class="content">
        <li>Filtered rows are not included in the export.</li>
        <li>The sort order is maintained in the export.</li>
        <li>The order of the columns is maintained in the export.</li>
        <li>Only visible columns are export.</li>
        <li>Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name)</li>
        <li>Aggregated values are exported.</li>
        <li>For groups, the first exported value (column) will always have the group key.</li>
        <li>Heading groups are exported as part of the csv.</li>
    </ul>

    <?= example('CSV Export', 'csv-export', 'generated', array("enterprise" => 1)) ?>

    <h2>Export to CSV with iPad</h2>

    <p>
        It is not possible to download files directly from JavaScript to an iPad. This is a restriction
        of iOS and not something wrong with ag-Grid. For this reason, the download links in the context
        menu are removed when running on iPad. If you do want to download on iPad, then it is recommended
        you use the api function <code>getDataAsCsv()</code> to get the export data and then send this
        to the server to allow building an endpoint for doing the download.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>