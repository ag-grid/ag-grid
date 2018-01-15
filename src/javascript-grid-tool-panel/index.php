<?php
$pageTitle = "ag-Grid Tool Panel";
$pageDescription = "The tool panel allows you to work with the columns at run time, but showing and hiding, and grouping.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Tool Panel</h1>

    <p>
        The tool panel is where you can change the state of the columns. This includes show / hide, move and group.
    </p>

    <p>
        The tool panel panel can be shown be default by setting <code>showToolPanel=true</code> property,
        or after the grid is initialised by calling the api function <code>showToolPanel(show)</code>. You can query if
        the tool panel is showing with the api <code>isToolPanelShowing()</code>.
    </p>

    <h2>Suppress Values</h2>

    <p>
        If you don't want to show the values list in the tool panel, set <code>toolPanelSuppressValues=true</code>
        property. This is useful if you don't want aggregation, or you have provided your own
        aggregation function (which would then not use the values selected here).
    </p>

    <h2>Suppress Group</h2>

    <p>
        If you don't want to show the group row, set <code>toolPanelSuppressRowGroups=true</code> property.
        This is used if you just want simple column visibility and reordering functionality
        in the tool panel. Note that hiding the group has the impact of also hiding the values, as it
        doesn't make sense to have values if you are not grouping.
    </p>

    <h2>Tool Panel Actions</h2>

    <h3>Show / Hide Columns</h3>
    <p>
        All columns are visible by default. To hide a column when first displaying the grid, mark
        the column definition with <code>hide = true</code>.
    </p>

    <p>
        To hide a column using the tool panel, click the icon beside the columns name.
    </p>

    <h3>Group by Columns</h3>
    <p>
        To group by a column, drag the column down to the group GUI. The order of the column
        in the group list can be changed by dragging, with the first value been the top most
        group.
    </p>

    <h3>Aggregate Columns</h3>
    <p>
        To mark a column as a value (for aggregation), drag the column down to the value
        GUI. From here you can select the aggregation function (sum, min or max). This
        aggregation function will only work when you are using the default aggregation
        (ie you are not providing your own aggregation function).
    </p>

    <note>
        Remember to mark the column definitions with <code>enableRowGroup</code> for grouping, <code>enablePivot</code>
        for pivoting and <code>enableValue</code> for aggregation. Otherwise you won't be able to drag and drop the
        columns to the desired sections from the Tool Panel.
    </note>

    <h2>Styling Columns in Tool Panel</h2>

    <p>
        You can add a CSS class to the columns in the tool panel by specifying <code>toolPanelHeaderClass</code>
        in the column definintion as follows:
        <snippet>
colDefs = {
    // set as string
    {headerName: "Gold", field: "gold", toolPanelClass: 'tp-gold'},

    // set as array of strings
    {headerName: "Silver", field: "silver", toolPanelClass: ['tp-silver']},

    // set as function returning string or array of strings
    {headerName: "Bronze", field: "bronze",
        toolPanelClass: function(params) {
            return 'tp-bronze';
        }},
}</snippet>
    </p>

    <h2>Tool Panel Example</h2>

    <p>
        The example below demonstrates the tool panel. Note the following:
    </p>
        <ul class="content">
            <li>
                Columns <code>country, year, date and sport</code> all have <code>enableRowGroup=true</code>
                and <code>enablePivot: true</code>. This means you can drag the columns to the group
                and pivot sections, but you cannot drag them to the values sections.
            </li>
            <li>
                The <code>gold, silver and bronze</code> all have <code>enableValue=true</code>. This means
                you can drag the columns to the values section, but you cannot drag them to the group
                or pivot sections.
            </li>
            <li>
                The <code>gold, silver and bronze</code> columns have style applied using <code>toolPanelClass</code>
            </li>
            <li>The country column uses a headerValueGetter to give the column a slightly different
            name when dependent on where it appears using the <code>location</code> parameter.</li>
        </ul>

    <?= example('Tool Panel Example', 'simple', 'generated', array("enterprise" => 1)) ?>

    <h2>Suppress Panels</h2>

    <p>
        Below shows using the suppress properties that can be used with the toolpanel as follows:
    </p>
        <ul class="content">
        <li>Grid Property <code>toolPanelSuppressRowGroups</code>: When true, the row group section does not appear in the tool panel.</li>
        <li>Grid Property <code>toolPanelSuppressValues</code>: When true, the value section does not appear in the tool panel.</li>
        <li>Grid Property <code>toolPanelSuppressPivots</code>: When true, the pivot section does not appear in the tool panel.</li>
        <li>Grid Property <code>toolPanelSuppressPivotMode</code>: When true, the pivot mode section does not appear in the tool panel.</li>
        <li>Column Property <code>suppressToolPanel</code>: When true, the column will not appear in the tool panel or in the column section of the column menu.
        This is useful when you have a column working in the background, eg a column you want to group by, but not present to the user.</li>
    </ul>

    <?= example('Suppress Panels', 'suppress', 'generated', array("enterprise" => 1)) ?>

    <h2>Read Only Functions</h2>

    <p>
        By setting the property <code>functionsReadOnly=true</code>, the grid will prevent changes to group, pivot or
        values through the GUI. This is useful if you want to show the user the group, pivot and values panel,
        so they can see what columns are used, but prevent them from making changes to the selection.
    </p>

    <?= example('Read Only Example', 'read-only', 'generated', array("enterprise" => 1)) ?>



<?php include '../documentation-main/documentation_footer.php';?>
