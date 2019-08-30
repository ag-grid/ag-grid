<?php
$pageTitle = "Charting: Pivot Chart";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Pivot Chart</h1>

    <p class="lead">
        This section introduces charting with pivots and groups from inside the grid using Pivot Chart.
    </p>

    <p>
        Pivot Chart allow users to chart all grouped and pivoted data from inside the grid. When pivot mode is active
        in the grid, the pivot chart menu item will appear in the grids context menu.
    </p>

    <h2>Using Pivot Chart</h2>

    <p>
        Try it out on our <a href="../example.php">demo page</a> by doing the following:
    </p>

    <ul>
        <li>
            Enter <a href="../javascript-grid-pivoting/#pivot-mode-1">Pivot Mode</a> and select a combination of group,
            pivot and value columns.
        </li>
        <li>
            Bring up the <a href="../javascript-grid-context-menu">Context Menu</a> and select the desired chart type
            from the 'Pivot Chart' sub menu.
        </li>
    </ul>

    <p>
        <img alt="Pivot Chart" src="pivot-chart.gif" style="width: 100%; height: 100%">
    </p>

    <p>
        Notice from the demonstration above that all data is charted when using the Pivot Chart. Also note
        that the category axis will update to reflect the expanded group categories.
    </p>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn about the: <a href="../javascript-grid-charts-chart-toolbar/">Chart Toolbar</a>.
    </p>
<?php include '../documentation-main/documentation_footer.php'; ?>
