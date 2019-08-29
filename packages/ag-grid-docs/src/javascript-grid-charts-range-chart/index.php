<?php
$pageTitle = "Charting: Range Chart";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Range Chart</h1>

    <p class="lead">
        This section covers how charts can be created directly from a range of selected cells.
    </p>

    <p>
        Range charts provide a quick and easy way for users to create charts from inside the grid. Once users have
        selected a range of cells in the grid, a chart can be created from the context menu, as shown below:
    </p>

    <p>
        <img alt="Pivot Chart" src="range-chart.gif" style="margin-bottom: 0px; width: 100%">
    </p>

    <p>
        Notice that Chart Ranges appear in the grid after a chart is created. These provide useful visual feedback for
        users by highlighting the charted category and series data in the grid.
    </p>

    <p>
        Note that developers can also programmatically create range charts through the <a href="../javascript-grid-charts-chart-range-api/">Chart API</a>.
    </p>

    <h2>Creating Chart Ranges</h2>

    <p>
        When a chart is created from a selected range of cells in the grid, or via the charting API, the underlying cell
        range is replaced by a chart range.
    </p>

    <p>
        To see how chart ranges are created from a cell range, using our <a href="../example.php">demo page</a> do the following:
    </p>

    <ul>
        <li>
            Select a <a href="../javascript-grid-range-selection/">Cell Range</a> of numeric values in the grid by dragging
            the mouse over a range of cells.
        </li>
        <li>
            Bring up the <a href="../javascript-grid-context-menu">Context Menu</a> and select the desired chart type
            from the 'Chart Range' sub menu.
        </li>
    </ul>

    <p>
        <img alt="Charting Ranges" src="charting-ranges.gif" style="margin-bottom: 0px; width: 100%">
    </p>

    <p>
        As illustrated above, the resulting chart range can subsequently be modified by dragging on the chart range handle,
        located at the bottom right corner of the chart range.
    </p>

    <h2>Hiding Chart Ranges</h2>

    <p>
        In some cases it may be desirable to hide the chart ranges in the grid, like in this
        <a href="../javascript-grid-charts-overview/#example-application-created-charts">example</a>.
    </p>

    <p>
        To hide the chart ranges simply enable <code>suppressChartRanges=true</code> on the <code>ChartRangeParams</code>.
    </p>
    <p>
        For more details refer to <a href="../javascript-grid-charts-chart-range-api/#charting-api">Chart Range API</a>.
    </p>

    <h2>Category and Series Ranges</h2>

    <p>
        There are two types of charting ranges: a category range that is highlighted in green and a series range that
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

    <!--    <p>-->
    <!--        <img alt="Charting Ranges" src="contiguous-range.gif" style="margin-bottom: 0px; width: 100%">-->
    <!--    </p>-->

    <h2>Defining categories and series</h2>

    <p>
        There are several ways for columns to be classified as chart categories or series. Columns can be explicitly
        configured or left for the grid to infer the type based on the data contained in the cells.
    </p>

    <p>
        The different approaches will be presented in the order of precedence used by the grid.
    </p>

    <h3>ColDef.chartDataType</h3>

    <p>
        When defining column definitions the <code>ColDef.chartDataType</code> property can be used to define how the column
        should be considered within the context of charting. The allowed values are shown below:
    </p>

    <snippet>
        ColDef.chartDataType = 'category' | 'series' | 'excluded' | undefined
    </snippet>

    <p>
        Columns defined as <code>excluded</code> will not be included in charts or charting ranges.
    </p>

    <p>
        The following column definitions show how the different <code>ColDef.chartDataType</code> values are applied:
    </p>

    <snippet>
        // 'category' columns
        {field: "athlete", chartDataType: 'category'},
        {field: "age", chartDataType: 'category'}, // despite containing numbers
        {field: "country"}, // contains strings

        // 'excluded' from charts
        {field: "date", chartDataType: 'excluded'},

        // 'series' columns
        {field: "gold", chartDataType: 'series'},
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
        <li><b>Age</b>: defined as a 'category' as <code>chartType='category'</code>.</li>
        <li><b>Sport</b>: considered a 'category' as data is a <code>string</code>.</li>
        <li><b>Year</b>: defined 'excluded' from charting as data is of type <code>chartType='excluded'</code>.</li>
        <li><b>Gold</b>: defined as 'series' as <code>chartType='series'</code>.</li>
        <li><b>Silver</b>: defined as 'series' as <code>chartType='series'</code>.</li>
        <li><b>Bronze</b>: considered a 'series' as data is a <code>number</code>.</li>
    </ul>

<?= example('Defining categories and series', 'defining-categories-and-series', 'generated', array("exampleHeight" => 610, "enterprise" => true)) ?>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn about the: <a href="../javascript-grid-charts-pivot-chart/">Pivot Chart</a>.
    </p>
<?php include '../documentation-main/documentation_footer.php'; ?>