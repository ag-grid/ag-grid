<?php
$key = "Excel Export";
$pageTitle = "ag-Grid Excel Data Export";
$pageDescription = "Data in the grid can be exported to csv. This page explains how to do exports along with properties you can set to get the exports done.";
$pageKeyboards = "ag-Grid Data Export Javascript CSV";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Excel Export</h2>

    <p>
        The data can be exported to Excel with an API call.
    </p>

    <p>
        The API methods are as follows:
    </p>
    <ul>
        <li><b>exportExcel(params)</b>: Does the full export.</li>
    </ul>

    <p>
        Each of these methods takes a an optional params object that can take the following:
    </p>
    <ul>
        <li><b>skipHeader</b>: Set to true if you don't want to first line to be the column header names.</li>
        <li><b>skipGroups</b>: Set to true to skip headers and footers if grouping. No impact if not grouping.</li>
        <li><b>skipFooters</b>: Set to true to skip footers only if grouping. No impact if not grouping or if not using footers in grouping.</li>
        <li><b>suppressQuotes</b>: Set to true to not use double quotes between values.</li>
        <li><b>fileName</b>: String to use as the file name. If missing, the file name 'export.csv' will be used.</li>
        <li><b>customHeader</b>: If you want to put some text at the top of the csv file, stick it here.
            You will need to include '\n' at the end, or many '\n' if you want the header to span lines.</li>
        <li><b>customFooter</b>: Same as customHeader, but for the end of the file.</li>
        <li><b>allColumns</b>: If true, all columns will be exported in the order they appear in columnDefs.
            Otherwise only the columns currently showing the in grid, and in that order, are exported.</li>
        <li><b>onlySelected</b>: Only export selected rows.</li>
        <li><b>onlySelectedAllPages</b>: Only export selected rows including other pages (only makes sense when using pagination).</li>
        <li><b>columnSeparator</b>: The column separator. Defaults to comma.</li>
        <li><b>columnKeys</b>: Provide a list (an array) of column keys if you want to export specific columns.</li>
        <li><b>processCellCallback</b>: Allows you to process (typically format) cells for the CSV.</li>
        <li><b>processHeaderCallback</b>: Allows you to create custom header values for the export.</li>
    </ul>


    <h3>
        Example
    </h3>
    <p>
        The example below shows the export in action. Notice the following:
    </p>
    <ul>
        <li>Filtered rows are not included in the export.</li>
        <li>The sort order is maintained in the export.</li>
        <li>The order of the columns is maintained in the export.</li>
        <li>Only visible columns are export.</li>
        <li>Value getters are used to work out the value to export (the 'Group' col in the example below uses a value getter to take the first letter of the country name)</li>
        <li>Aggregated values are exported.</li>
        <li>For groups, the first exported value (column) will always have the group key.</li>
    </ul>

    <show-example example="exampleExcel"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>