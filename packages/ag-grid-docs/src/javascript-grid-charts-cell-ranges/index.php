<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Charting Cell Ranges</h1>

    <p class="lead">
        This section details how charting cell ranges are initially determined along with the different ways they can
        be modified.
    </p>

    <p>
        When creating charts off a cell range selection via the context menu, a charting range is created which corresponds
        to the initial cell range selection.
    </p>

    <p>
        The resulting charting range can then be modified by dragging on the charting range handle, located at the bottom right
        corner of the charting range, as illustrated below:
    </p>

    <p>
        <img alt="Charting Ranges" src="charting-ranges.gif" style="margin-bottom: 0px; width: 100%">
    </p>

    <h2>Anatomy of a Charting Range</h2>
    <p>
        Charting ranges can contain a single column range of category values along with a series range comprised of one
        or more columns.
    </p>

    <p>
        <b>TODO</b>
    </p>

    <h2>Defining category and series columns</h2>
    <p>
        It is possible to explicitly define a column as a category or series, or simply let the grid determine the type
        based on the data type. Each method is explained below in the order of precedence used by the grid:
    </p>

    <p>
        When defining column definitions the <code>ColDef.chartType</code> property can be used to define how the column
        should be considered within the context of charting. The allowed values are should below:
    </p>

    <snippet>
        ColDef.chartType = 'category' | 'series' | 'excluded' | undefined
    </snippet>

    <p>
        Columns defined as <code>excluded</code> will not be included in charts or charting ranges.
    </p>

    <p>
        The following column definitions show how the different <code>ColDef.chartType</code> values are applied:
    </p>

    <snippet>
        // 'category' columns
        {field: "athlete", chartType: 'category'},
        {field: "age", chartType: 'category'}, // despite containing numbers
        {field: "country"}, // contains strings

        // 'excluded' from charts
        {field: "date", chartType: 'excluded'},

        // 'series' columns
        {field: "gold", chartType: 'series'},
        {field: "silver", width: 100} // contains numbers
    </snippet>

    <p>
        When <code>ColDef.chartType</code> not set or <code>undefined</code> the grid will then consider the following properties:
    </p>



<?php include '../documentation-main/documentation_footer.php'; ?>