<?php
$pageTitle = "Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Tool Panels</h1>

    <p class="lead">
        This section covers Tool Panels, available via the grids Side Bar, which allows for easy access to powerful grid
        operations such as grouping, pivoting, and filtering. Custom Tool Panels can also be provided to the grid.
    </p>

    <h2>Overview</h2>

    <p>
        Tool Panels are panels that sit in the Side Bar to the right of the grid. The Side Bar allows access to the tool
        panels via buttons that work like tabs. The Side Bar and a Tool Panel are highlighted in the screen shot below.
    </p>

    <p><img src="sideBar.png" width="90%" /></p>

    <note>
        <p>
            Version 19 of ag-Grid received a major overhaul of the tool panels. It did not make sense to keep
            with the older configuration options. The old property <code>showToolPanel</code> is no longer
            used. The tool panel is also not included by default - if the tool panel is not configured, no
            tool panel is shown.
        </p>
        <p>
            If moving from an earlier version, set <code>sideBar='columns'</code> to receive similar behaviour.
        </p>
    </note>

    <h2>Provided Tool Panels</h2>

    <p>
        The grid provides the following Tool Panels:
    </p>

    <ul class="content">
        <li><a href="../javascript-grid-tool-panel-columns/">Columns Tool Panel</a> - to control aggregations,
            grouping and pivoting.</li>
        <li><a href="../javascript-grid-tool-panel-filters/">Filters Tool Panel</a> - to perform multiple column filters.
        </li>
    </ul>

    <h2>Custom Tool Panel Components</h2>

    <p>
        In addition to the provided Tool Panels, it is also possible to provide custom Tool Panels.
    </p>

    <p>
        For more details refer to the section: <a href="../javascript-grid-tool-panel-component/">Custom Tool Panel Components</a>.
    </p>

    <h2>Next Up</h2>

    <p>
        Before covering the Tool Panels in detail, continue to the next section to learn about the <a href="../javascript-grid-side-bar/">Side Bar</a>.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
