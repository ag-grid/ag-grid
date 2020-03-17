<?php
$pageTitle = "Charts: Overview";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Integrated Charts</h1>

    <p class="lead">
       This section introduces the grid's integrated charting functionality, which allows users to chart directly inside
        the grid and supports applications that want to create pre-defined charts.
    </p>

    <p>
        The charting functionality is deeply integrated with the grid. This integration gives users
        a seamless charting experience while keeping the coding required by developers to a minimum.
    </p>

    <p>
        We are not aware of any other datagrid that provides such integration. Other companies may provide
        a grid library and / or a charting library, but it's up to the developer to tie the two together.
    </p>

    <p>
        This section introduces the two ways charts can be created from the data contained in the grid:
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-charts-integrated-overview/#user-created-charts">User Created Charts</a>: A user creates a
            chart using the grid's UI by selecting a range of cells or entering pivot mode and then creating a chart
            via the context menu.
        </li>
        <li>
            <a href="../javascript-grid-charts-integrated-overview/#application-created-charts">Application Created Charts</a>:
            The application requests the grid to create a chart through the grid's charting API.
        </li>
    </ul>
    </p>

    <h2>Charts Module</h2>

    <p>
        To minimise bundle sizes for applications that do not require charting, charts are contained in a separate
        <a href="../javascript-grid-modules/">module</a>, which can be imported as follows:
    </p>

    <snippet language="ts">
// import all Enterprise modules
import { ModuleRegistry, AllModules } from '@ag-grid-enterprise/all-modules';

ModuleRegistry.registerModules(AllModules);

// or only import minimal modules required for charts
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ChartsModule } from "@ag-grid-enterprise/charts";

ModuleRegistry.registerModules([ClientSideRowModelModule, ChartsModule]);
    </snippet>

    <p>
        The charts module has been built from the ground up with zero dependencies on any third party libraries.
    </p>

    <note>
        If you are not using ES6 Modules and are instead using the bundled version of ag-Grid Enterprise, note that
        <code>ag-grid-enterprise.js</code> already contains the charting module.
    </note>

    <h2>Enabling Charts</h2>
    <p>
        To enable charting in the grid set the following grid option:
    </p>

<snippet language="ts">
gridOptions = {
    enableCharts: true
}
</snippet>

    <p>
        To allow users to create charts from a
        <a href="../javascript-grid-range-selection/">Range Selection</a> and / or display the
        <a href="../javascript-grid-charts-integrated-range-chart/">Chart Ranges</a> in the grid, then set the following grid
        option:
    </p>

<snippet language="ts">
gridOptions = {
    enableRangeSelection: true
}
</snippet>

    <h2>User Created Charts</h2>
    <p>
        User created charts are designed to provide an out-of-the box charting experience, similar to that found in
        spreadsheet applications such as Excel, but more compellingly it will be integrated inside your applications.
    </p>

    <p>
        All that is required for users to create charts, from the data already contained in the grid,
        is to import the <a href="../javascript-grid-charts-integrated-overview/#charts-module">charts module</a>
        and <a href="../javascript-grid-charts-integrated-overview/#enabling-charts">enable charts</a>.
    </p>

    <p>
        Try it out on our <a href="../example.php">demo page</a> by doing the following:
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

    <div class="animated-example">
        <img data-gifffer="chart-showcase.gif" data-gifffer-width="99%" />
    </div>

    <p>
        The animation above highlights a number of charting features. For more details on each feature follow the links
        provided below:
    </p>

    <div style="display: flex; margin-bottom: 25px; margin-top: 25px;">

        <div style="flex-grow: 1;">
            <ul>
                <p>
                <li><a href="../javascript-grid-charts-integrated-range-chart/#creating-chart-ranges">Chart Ranges</a>: When a chart is created, corresponding
                    chart ranges appear in the grid and can be adjusted via the chart range handle.
                </li>
                </p>
                <p>
                <li><a href="../javascript-grid-charts-integrated-range-chart/#category-and-series-ranges/">Categories and Series</a>:
                    Columns can be configured as either categories or series for charting. If not configured then the
                    grid will infer whether a column contains category or series data.
                </li>
                </p>
            </ul>
        </div>

        <img src="./category-range-fill-handle.png"/>

    </div>

    <div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px;">

        <img src="./chart-toolbar.png"/>

        <div style="flex-grow: 1;">
            <ul>
                <p>
                    <li><a href="../javascript-grid-charts-integrated-chart-toolbar/">Chart Toolbar</a>:
                    The chart toolbar is located in the top right area of the chart and allows
                    a user to:
                </p>
                    <p>
                    <ul>
                        <li style="padding-bottom: 5px">Change the chart type</li>
                        <li style="padding-bottom: 5px">Change the colour palette</li>
                        <li style="padding-bottom: 5px">Change which columns are used as categories and series</li>
                        <li style="padding-bottom: 5px">Format different aspects of the chart</li>
                        <li style="padding-bottom: 5px">Unlink the chart from the grid</li>
                        <li>Download the chart</li>
                    </ul>
                    </p>

                </li>
            </ul>
        </div>

    </div>

    <p>
        By default, user created charts are displayed inside the grid's own popup windows. The windows can be moved (by mouse
        dragging a window's title bar) and resized (by mouse dragging a window's borders).
    </p>

    <p>
        It is also possible to display user created charts in an another location or application dialog. For more details
        see the section on <a href="../javascript-grid-charts-integrated-customisation/#providing-a-chart-container/">providing a chart container</a>.
    </p>

    <note>
        If using the grid's own popup window, you will probably want to use the grid option
        <code>popupParent</code> so that the popup windows are not constrained to the bounds of the grid.
        Typically users set <code>popupParent=document.body</code> to achieve this.
    </note>

    <h2>Application-created Charts</h2>

    <p>
        Charts can be pre-defined or dynamically created from within applications, and as with
        <a href="../javascript-grid-charts-integrated-overview/#user-created-charts">user-created charts</a>, these charts also
        benefit from the integration provided with the grid.
    </p>

    <p>
        The dummy financial application below just touches on what is possible with the grid's integrated
        charting capabilities. The following should be noted:
    </p>

    <ul class="content">
        <li>
            <b>Pre-Defined Chart</b>: A pre-defined chart is shown in a separate chart container below the grid.
        </li>
        <li>
            <b>Dynamic Charts</b>: Buttons positioned above the grid dynamically create different chart types.
        </li>
        <li>
            <b>High Performance</b>: 100 rows are randomly updated 10 times a second (1,000 updates per second).
            Try updating the example via Plunker with higher update frequencies and more data.
        </li>
    </ul>

    <?= grid_example('Application Created Charts', 'application-created-charts', 'vanilla', ['exampleHeight' => 660, 'enterprise' => true]) ?>

    <p>
        To learn how to create charts in your applications see the following sections for details:
    </p>

    <ul>
        <li><a href="../javascript-grid-charts-integrated-chart-range-api/">Chart Range API</a>: Used to create charts programmatically
            inside applications.
        </li>
        <li><a href="../javascript-grid-charts-integrated-customisation/#providing-a-chart-container/">Provide a Chart Container</a>:
            Used to target chart containers inside the application instead of the popup window provided by the grid.
        </li>
    </ul>

    <h2>Chart Customisation</h2>

    <p>
        Before each chart is created, the developer can perform fine-grained
        <a href="../javascript-grid-charts-integrated-customisation/">Chart Customisation</a> to change the chart's
        appearance and behaviour. For example, you can change the thickness of the lines, or customise the
        formatting of the axis labels.
    </p>

    <p>
        The section <a href="../javascript-grid-charts-integrated-customisation/">Chart Customisation</a> outlines all
        the items that can be customised for each chart type.
    </p>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn about the: <a href="../javascript-grid-charts-integrated-range-chart/">Range Chart</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>
