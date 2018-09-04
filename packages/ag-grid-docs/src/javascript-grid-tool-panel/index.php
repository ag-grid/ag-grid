<?php
$pageTitle = "Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Tool Panels</h1>

    <p class="lead">
        <b>Tool panels</b> are panels that sit in the <b>side bar</b> to the right of the grid.
        The side bar allows access to the tool panels via buttons that work like tabs.
    </p>
    <p>
        The grid provides two tool panels out of the box to 1)
        <a href="../javascript-grid-tool-panel-columns/">manage columns</a> and 2)
        <a href="../javascript-grid-tool-panel-filters/">manage filters</a>.
        You can also create your own <a href="../javascript-grid-tool-panel-custom/">custom tool panels</a>
        that will sit alongside the provided ones.
    </p>

    <p>
        The tool panels sit inside the side bar. For ease of reading, the tool panels are simply called
        'panels' below.
    </p>

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


<?php include '../documentation-main/documentation_footer.php';?>
