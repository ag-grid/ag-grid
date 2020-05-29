<?php
$pageTitle = "Export: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is CSV Export which is used to take data out of the grid and into another application for further processing such as Excel. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Data Export Javascript CSV";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Export</h1>

<p class="lead">
    This page covers the export options that are common to both CSV and Excel.
</p>

<p>
    The grid provides APIs to export data to CSV and Excel. You can download a file to the
    user's computer or generate a string to be uploaded to a server. For more detail on the specific
    options for each format see:
</p>

<ul>
    <li><a href="../javascript-grid-csv/">CSV Export</a></li>
    <li><a href="../javascript-grid-excel/">Excel Export</a><span class="enterprise-icon">e</span></li>
</ul>

<h2>Selecting Data to Export</h2>

<p>
    Data can be exported using one of the following API methods:
</p>

<?php createDocumentationFromFile('../javascript-grid-api/api.json', 'export') ?>

<p>
    Each of these methods takes an optional <code>params</code> object, which has the following properties for all exports:
</p>

<?php createDocumentationFromFile('export.json', 'properties') ?>

<p>
    Additional properties are included depending on the export type; please see the pages specific to each export type
    for more details.
</p>

<h2>Example: Selecting Data to Export</h2>

<p>
    This example demonstrates the options that control what data to export. Note that:
</p>

<ul class="content">
    <li>Filtered rows are not included in the export.</li>
    <li>The sort order is maintained in the export.</li>
    <li>The order of the columns is maintained in the export.</li>
    <li>Only visible columns are export.</li>
    <li>Value getters are used to work out the value to export (the 'Name Length' col in the
        example below uses a value getter return the number of characters in the name)</li>
    <li>Aggregated values are exported.</li>
    <li>For groups, the first exported value (column) will always have the group key.</li>
    <li>Heading groups are exported as part of the csv.</li>
</ul>

<?= grid_example('Selecting data to export', 'data-selection', 'generated', ['enterprise' => true, 'exampleHeight' => '80vh']) ?>

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
    <li>Cell styles are not exported by default. CSV does not allow styling. For details on styling the
        Excel export, see <a href="../javascript-grid-excel/">Excel Export</a>.</li>
    <li>If row grouping:
        <ul>
            <li>all data will be exported regardless of whether groups are open in the UI.</li>
            <li>by default, group names will be in the format "-> Parent Name -> Child Name" (use <code>processRowGroupCallback</code> to change this)</li>
            <li>row group footers (groupIncludeFooter=true) will NOT be exported -
                this is a GUI addition that happens for displaying the data in the grid.</li>
        </ul>
    </li>
</ul>

<note>
    If you want to disable export, you can set the properties <code>suppressCsvExport = true</code> and
    <code>suppressExcelExport = true</code> in your <code>gridOptions</code>.
</note>

<h2>Example: Formatting Exported Data</h2>

<p>
    This example demonstrates the options that modify the exported data:
</p>

<ul class="content">
    <li>Aggregated values are exported.</li>
    <li>For groups, the first exported value (column) will always have the group key.</li>
    <li>Heading groups are exported as part of the csv.</li>
</ul>

<?= grid_example('Formatting exported data', 'formatting', 'generated', ['enterprise' => true, 'exampleHeight' => '60vh']) ?>

<h2>Custom Headers and Footers</h2>

<p><code>customHeader</code> and <code>customFooter</code> both take a 2D array of ExcelCell objects:</p>

<?= createSnippet(<<<SNIPPET
interface ExcelCell {
    data: ExcelData;
    // Optional style to apply
    styleId?: string;
    // Optional The number of _additional_ cells to span across, so
    // 1 means that the cell will span 2 columns
    mergeAcross?: number;
}

interface ExcelData {
    // Excel data type. Case sensitive.
    type: 'String' | 'Number' | 'Boolean' | 'DateTime' | 'Error';
    value: string | null;
}
SNIPPET
, 'ts') ?>

<p>See the styles section of the <a href="../javascript-grid-excel/">Excel Export</a> page for
more information how the <code>styleId</code> property is interpreted. The CSV exporter will
ignore style information.</p>

<p>The CSV exporter can accept a multi-line string for <code>customHeader</code> and <code>customFooter</code>,
see the <a href="../javascript-grid-csv/">CSV Export</a> page for more information.</p>

<h2>Export on an iPad</h2>

<p>
    It is not possible to download files directly from JavaScript to an iPad. This is a restriction
    of iOS and not something wrong with ag-Grid. For this reason, the download links in the context
    menu are removed when running on iPad. If you do want to download on iPad, then it is recommended
    you use the api function <code>getDataAsCsv()</code> to get the export data and then send this
    to the server to allow building an endpoint for doing the download.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
