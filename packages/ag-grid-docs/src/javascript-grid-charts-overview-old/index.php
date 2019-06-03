<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Charts - BETA</h1>

    <p class="lead">
        Charting is a major component inside the grid. As well as having a standalone charting library that
        you can use, the grid comes with charting integration allowing users to chart data directly
        from the grid without requiring additional developer coding.
    </p>

    <? enterprise_feature("Charting"); ?>

    <note>
        <b>Charting in ag-Grid is currently in beta.</b> If you are an ag-Grid Enterprise customer then you are
        encouraged to try out the charts in ag-Grid as described here and give feedback to the ag-Grid team
        via
        <a href="https://ag-grid.zendesk.com/">Zendesk</a>
        or
        <a href="https://github.com/ag-grid/ag-grid/">Github</a>.
        We do not expect to drop features of the charting integration, however we do foresee
        changes to the API. If you plan on going into production with grid charting, just be aware breaking changes
        will probably come in future grid releases.
    </note>

    <h2>Enable Charting</h2>

    <p>
        Charting is enabled in the grid with the following two steps:
    </p>

    <ul>
        <li>
            Include the grid charting module.
        </li>
        <li>
            Enable charting with the grid option <code>enableCharts=true</code>.
        </li>
    </ul>

    <h3>Charting Module</h3>

    <p>
        To minimise bundle sizes for applications that do not require charting, the charting integration is contained
        within a module. The module is automatically included in bundled versions of ag-Grid (eg if you are including
        <code>ag-grid-community.js</code> or <code>ag-grid-enterprise.js</code>).
    </p>

    <p>
        Include the charting module by referencing it in your module imports as follows:
    </p>

    <snippet>
// import the charting module
import 'ag-grid-enterprise/chartsModule';
    </snippet>

    <note>
        If you are using a bundled version of ag-Grid (eg if you are including
        <code>ag-grid-enterprise.js</code>) then you do not need to reference
        the module as it is included in the bundled version.
    </note>

    <h2>
        Charting Components
    </h2>

    <p>
        There are two major components of the grid's charting strategy as follows:
    </p>

    <ol>
        <li>
            Charting Library
        </li>
        <li>
            Charting Integration:
        </li>
    </ol>

    <h3>Charting Library</h3>

    <p>
        The charting library is a stand alone charting library capable of creating complex charts.
        This will be similar (but better obviously) to the many libraries already existing such
        as Highcharts. The interface of the charting library is still in flux hence the
        charting library is not available as a standalone component right now. However future releases
        of ag-Grid will have the charting library available.
    </p>

    <p>
        Future releases will see the charting library and include charts such as pie, stack, bar and line charts.
        The charts will be completely reactive, resolution independent, canvas based. The library will enable
        building beautiful visualisations of your data.
    </p>

    <h3>Charting Integration</h3>

    <p>
        The grid combines features of the grid and the charting library to give
        a seamless charting experience to application users with minimal configuration of coding required
        by application developers. For example, the grid allows you to chart ranges from inside the grid via the
        context menu. No other datagrid we are aware of allows this - all the competitors provide a grid
        library and / or a charting library, but it's up to the developer to tie the two together.
        The vision of ag-Grid is to provide an Excel style data visualisation experience out of the box.
    </p>

    <p>
        Charting integration allows charts to be created from the grid in the following ways:
    </p>

    <ul>
        <li>
            User Created Charts: The user selects a range and then selects to create a chart from the context menu.
        </li>
        <li>
            Charting API: The application requests the grid to create a chart.
        </li>
    </ul>

    <h2>User Created Charts</h2>

    <p>
        Once charting is enabled, users can create charts as follows:
    </p>

    <ul>
        <li>
            Select a <a href="../javascript-grid-range-selection/">Cell Range</a> in the grid by dragging
            the mouse over a range of cells.
        </li>
        <li>
            Bring up the <a href="../javascript-grid-context-menu">Context Menu</a> and from the Chart Range
            sub menu, select the chart type you want to display.
        </li>
    </ul>

    <p>
        The best place to play with creating charts is on the main grid <a href="../example.php">demo page</a>.
        Select a range of cells in the month columns (where there is a lot of numeric data) and choose chart
        from the context menu.
    </p>

    <img alt="User Created Chart" src="./UserCreatedChart.gif" style="margin-bottom: 20px; width: 100%;">

    <p>
        User created charts are displayed inside the grid's own popup windows. The windows can be moved (by mouse
        dragging the windows title bar) and resized (by mouse dragging the windows borders).
    </p>

    <note>
        If using the grid's own popup window, you will probably want to se the grid option
        <code>popupParent</code> so that the popup windows are not constrained to the bounds of the grid.
        Typically users set <code>popupParent=document.body</code> to achieve this.
    </note>


    <h3>Provided Chart Container</h3>

    <p>
        Displaying the generated chart within the grid provided popup window will suit most needs. However
        you may wish to display the chart in a different location. For example
        your application may already have popup windows and you wish use the same library for consistency.
    </p>

    <p>
        To provide an alternative container for popup windows use the grid callback
        <code>createChartContainer(chartRef)</code>. The interface is as follows:
    </p>

    <snippet>
        // grid callback to implement to place chart in an alternative container
        function createChartContainer(chartRef: ChartRef): void;

        // function gets a Chart Reference
        interface ChartRef {
            // the chart DOM element, application responsible for placing into the DOM
            chartElement: HTMLElement;
            // application responsible for calling destroyChart when chart is no longer needed
            destroyChart: () => void;
        }
    </snippet>

    <p>
        The callback is called each time the user elects to create a chart via the grid UI. The callback
        is provided with a <code>ChartRef</code> containing the following:
    </p>
    <ul>
        <li>
            <code>chartElement</code>: The chart DOM element, application responsible for placing into the DOM.
        </li>
        <li>
            <code>destroyChart</code>: The application is responsible for calling destroyChart() when the
            chart is no longer needed.
        </li>
    </ul>

    <p>
        The example below demonstrates the <code>createChartContainer()</code> callback. The example does not
        use an alternative popup window, instead it just places the charts into the DOM below the grid. This
        crude approach is on purpose to minimise the complexity of the example and focus on just the callback
        and the interactions of the grid.
    </p>

    <p>
        From the example, the following can be noted:
    </p>
    <ul>
        <li>
            Select a range of numbers (medal columns) and create a chart from the context menu.
        </li>
        <li>
            The chart appears below the grid rather than in a popup window. This is because the
            <code>createChartContainer()</code> is implemented.
        </li>
        <li>
            Each chart is displayed alongside a 'Destroy' button. The logic behind the destroy
            button calls <code>destroyChart()</code> to destroy the chart instance.
        </li>
    </ul>

    <?= example('Provided Container', 'provided-container', 'generated', array("enterprise" => true)) ?>

    <h2>Charting API</h2>

    <p>
        Charts can be created programmatically via the grid's <code>chartRange()</code> API. The interface is
        as follows:
    </p>

    <snippet>
        function chartRange(params: ChartRangeParams): ChartRef | undefined;

        interface ChartRangeParams {
            cellRange: CellRangeParams;
            chartType: string;
            chartContainer?: HTMLElement;
            aggFunc?: string | IAggFunc;
        }

        export interface CellRangeParams {

            // start row
            rowStartIndex?: number;
            rowStartPinned?: string;

            // end row
            rowEndIndex?: number;
            rowEndPinned?: string;

            // columns
            columnStart?: string | Column;
            columnEnd?: string | Column;
            columns?: (string | Column)[];
        }
    </snippet>

    <p>
        The provided params contains the following attributes:
    </p>

    <ul>
        <li>
            <code>cellRange</code>: Defines the range of cells to be charted.
            See <a href="./javascript-grid-range-selection/#api-addcellrange-rangeselection">Add Cell Range</a>
            for details on <code>CellRangeParams</code>.
        </li>
        <li>
            <code>chartType</code>: The type of chart to create. Choose one of 'groupedBar', 'stackedBar', 'pie'
            and 'line'.
        </li>
        <li>
            <code>chartContainer</code>: If the chart is to be displayed outside of the grid then provide a chart
            container. If the chart is to be displayed using the grid's popup window mechanism then leave undefined.
        </li>
        <li>
            <code>aggFunc</code>: <span style="background: yellow;">Rob to advise</span>
        </li>
    </ul>

    <p>
        The API can return back a <code>ChartRef</code> object, the same structure that is provided to the
        <code>createChartContainer()</code> callback (see above). The <code>ChartRef</code> is returned when
        the <code>chartContainer</code> is provided. This provides the application with the <code>destroyChart()</code>
        method that is required when the application wants to dispose the chart.
    </p>

    <h3>API Example 1 - Chart Range in Grid Window</h3>

    <p>
        This example gets the grid to chart data in the grid provided popup window. The following can be noted:
    </p>

    <ul>
        <li>
            Clicking 'Apples & Oranges, 5 Rows' will chart the first five rows of apples and oranges in
            a grid popup window.
        </li>
        <li>
            Clicking 'Bananas, All Rows' will chart bananas and all rows (the provided cell range does not specify rows).
        </li>
    </ul>

    <?= example('Chart API', 'chart-api', 'generated', array("enterprise" => true)) ?>


    <h3>API Example 2 - Charts in Dashboard</h3>

    <p>
        This example passes a <code>chartContainer</code> to the API to place the chart in a location other
        than the grid's popup window. The following can be noted:
    </p>

    <ul>
        <li>The charts are placed in div elements outside of the grid.</li>
        <li>The two pie charts are showing aggregations rather than charting individual rows.</li>
        <li>Clicking on a chart highlights the range in the grid for which the chart is based.</li>
        <li>
            The bar chart is sensitive to changes in the rows. For example if you sort, the chart updates to
            always chart the first five rows.
        </li>
        <li>All data is editable in the grid. Changes to the grid data is reflected in the charts.</li>
    </ul>

    <?= example('Dashboard', 'dashboard', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
