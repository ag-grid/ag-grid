<?php
$pageTitle = "CSV Export: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is CSV Export which is used to take data out of the grid and into another application for further processing such as Excel. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Data Export Javascript CSV";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
include_once '../php-utils/printPropertiesTable.php';
?>

    <h1>CSV Export</h1>

    <p class="lead">
        The data can be exported to CSV with an API call, or using the right-click context menu on the Grid.
    </p>

    <note>
        This page covers CSV-specific features. For information on how to control what data is included in the export
        and to format/transform the data as it is exported, see the <a href="../javascript-grid-export/">Export documentation</a>.
    </note>

    <h2>
        API
    </h2>

    <ul class="content">
        <li><code>gridOptions.suppressCsvExport</code>: set this Grid Property to true to disable CSV export
        <li><code>exportDataAsCsv(params)</code>: download a CSV file to the user's computer.</li>
        <li><code>getDataAsCsv(params)</code>: return a CSV string.</li>
    </ul>

    <p>
        The params object can contain all the <a href="../javascript-grid-export/">common export options</a>, as
        well as these CSV-specific options:
    </p>

    <?php
        include_once './csvProperties.php';
        printPropertiesTable($exportProperties);    
    ?>

    <h2>Appending header and footer content</h2>

    <p>
        The recommended way to append header and footer content is by passing an array of
        ExcelCell objects to <code>customHeader</code> or <code>customFooter</code>, as described in the
        <a href="../javascript-grid-export/">Export</a> documentation. This ensures that your
        header content is correctly escaped, and if your application also exports Excel data you
        can use the same data for both exports.</p>
    <p>
        For compatibility with earlier versions of the Grid you can also pass a string, which will be
        inserted into the CSV file without any processing. You are responsible for formatting the
        string according to the CSV standard.
    </p>
    
    <h2>Example: CSV Export Options</h2>

    <ul>
        <li><code>suppressQuotes</code> and <code>columnSeparator</code> have the effects documented above. Use the "api.getTextAsCsv()" button to see their effect,
            because changing their default values will prevent the file from opening properly in Excel</li>
        <li>With <code>customHeader=ExcelCell[][]</code>, custom content will be inserted containing commas
            and quotes. These commas and quotes will be visible when opened in Excel because they have been
            escaped properly.</li>
        <li>Setting <code>customHeader=string</code> causes a string to be inserted into the CSV file without any processing, and without
            being affected by <code>suppressQuotes</code> and <code>columnSeparator</code>. It contains commas and quotes what will not be
            visible in Excel.</li>
    </ul>

    <?= grid_example('CSV Export Options', 'csv-export', 'generated', array("enterprise" => 1, "processVue" => true, "exampleHeight" => 400)) ?>


<?php include '../documentation-main/documentation_footer.php';?>
