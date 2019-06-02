<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Chart Ranges</h1>

    <p class="lead">
        This section covers chart ranges with details on how to define grid columns for charting as either categories or
        series data.
    </p>

    <p>
        When a chart is created off a selected range of cells in the grid, or via the charting api, the underlying cell
        range is replaced by a chart range.
    </p>

    <p>
        The resulting chart range can then be modified by dragging on the chart range handle, located at the bottom right
        corner of the chart range, as illustrated below:
    </p>

    <p>
        <img alt="Charting Ranges" src="charting-ranges.gif" style="margin-bottom: 0px; width: 100%">
    </p>

    <h2>Enabling Chart Ranges</h2>

    <p>
        All that is required for chart ranges to be displayed in the grid is to ensure the following <code>GridOption</code> properties are enabled:
    </p>

<snippet>
gridOptions = {
    enableCharts: true,
    enableRangeSelection: true
}
</snippet>
    <p>
        In applications where charts are not created off selected cell ranges it may be desirable to hide the chart
        ranges in the grid. In this case set <code>gridOptions.enableRangeSelection=false</code>.
    </p>

    <h2>Category and Series Ranges</h2>

    <p>
        There are two types of charting ranges; a category range that is highlighted in green and a series range that
        is highlighted in blue.
    </p>

    <p>
        A category range can only contain cells from a single column, whereas a series range can contain values from
        many columns.
    </p>

    <p>
        Chart ranges can be adjusted from within the grid by dragging on the chart range handle located at the bottom
        right of the series range. Both the category and series ranges are connected so when the chart range is dragged
        in an up or down direction they will be updated together.
    </p>

    <note>
        The chart range handle will only appear when all series columns are contiguous. However it is possible to move
        columns around in the grid to connect the series range.
    </note>

    <p>
        <img alt="Charting Ranges" src="contiguous-range.gif" style="margin-bottom: 0px; width: 100%">
    </p>

    <h2>Defining categories and series</h2>

    <p>
        There are several ways for columns to be classified as chart categories or series. Columns can be explicitly
        configured or left for the grid to infer the type based on the data contained in the cells.
    </p>

    <p>
        The different approaches will be presented in the order of precedence used by the grid.
    </p>

    <h3>ColDef.chartType</h3>

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

    <h3>Existing ColDef properties</h3>

    <p>
        When <code>ColDef.chartType</code> is <code>undefined</code> the grid will then consider then the following properties:
    </p>

    <ul>
        <li><b>enableRowGroup / enablePivot</b>: row grouping and pivoting enabled columns map to chart 'categories'.</li>
        <li><b>enableValue</b>: value columns will be considered chart 'series' columns.</li>
    </ul>

    <snippet>
        // 'category' columns
        {field: "athlete", enableRowGroup: true},
        {field: "age", enablePivot: true}, // despite containing numbers

        // 'series' columns
        {field: "gold", enableValue: true},
        {field: "silver", width: 100} // contains numbers
    </snippet>

    <h3>Inferred by the Grid</h3>

    <p>
        If none of the above <code>ColDef</code> properties are present then the grid will infer the charting column
        type based on the data contained in the cells of the first row. Columns containing <code>string</code> values
        will map to 'categories' and columns containing <code>number</code> values will map to 'series' charting columns.
    </p>

    <h2>Example - Defining categories and series</h2>

    <p>
        The example below demonstrates the different ways columns can be defined for charting:
    </p>
    <ul class="content">
        <li><b>Athlete</b>: defined as a 'category' as <code>chartType='category'</code>.</li>
        <li><b>Age</b>: defined as a 'category' as <code>enableRowGroup=true</code>.</li>
        <li><b>Sport</b>: considered a 'category' as data is a <code>string</code>.</li>
        <li><b>Year</b>: defined 'excluded' from charting as data is of type <code>chartType='excluded'</code>.</li>
        <li><b>Gold</b>: defined as 'series' as <code>enableValue=true</code>.</li>
        <li><b>Silver</b>: defined as 'series' as <code>chartType='series'</code>.</li>
        <li><b>Bronze</b>: considered a 'series' as data is a <code>number</code>.</li>
    </ul>


<?= example('Defining categories and series', 'defining-categories-and-series', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
