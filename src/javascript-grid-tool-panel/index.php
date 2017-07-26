<?php
$key = "Tool Panel";
$pageTitle = "ag-Grid Tool Panel";
$pageDescription = "The tool panel allows you to work with the columns at run time, but showing and hiding, and grouping.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Tool Panel</h2>

    <p>
        The tool panel is where you can change the state of the columns. This includes show / hide, move and group.
    </p>

    <p>
        The tool panel panel can be shown be default by setting 'showToolPanel=true' property,
        or after the grid is initialised by calling the api function showToolPanel(show). You can query if
        the tool panel is showing with the api isToolPanelShowing().
    </p>

    <h4>Suppress Values</h4>

    <p>
        If you don't want to show the values list in the tool panel, set <i><b>toolPanelSuppressValues=true</b></i>
        property. This is useful if you don't want aggregation, or you have provided your own
        aggregation function (which would then not use the values selected here).
    </p>

    <h4>Suppress Group</h4>

    <p>
        If you don't want to show the group row, set <i><b>toolPanelSuppressRowGroups=true</b></i> property.
        This is used if you just want simple column visibility and reordering functionality
        in the tool panel. Note that hiding the group has the impact of also hiding the values, as it
        doesn't make sense to have values if you are not grouping.
    </p>

    <h3>Tool Panel Actions</h3>

    <h4>Show / Hide Columns</h4>
    <p>
        All columns are visible by default. To hide a column when first displaying the grid, mark
        the column definition with <i>hide = true</i>.
    </p>

    <p>
        To hide a column using the tool panel, click the icon beside the columns name.
    </p>

    <h4>Group by Columns</h4>
    <p>
        To group by a column, drag the column down to the group GUI. The order of the column
        in the group list can be changed by dragging, with the first value been the top most
        group.
    </p>

    <h4>Aggregate Columns</h4>
    <p>
        To mark a column as a value (for aggregation), drag the column down to the value
        GUI. From here you can select the aggregation function (sum, min or max). This
        aggregation function will only work when you are using the default aggregation
        (ie you are not providing your own aggregation function).
    </p>

    <h3 id="stylingToolPanel">Styling Columns in Tool Panel</h3>

    <p>
        You can add a CSS class to the columns in the tool panel by specifying <i>toolPanelHeaderClass</i>
        in the column definintion as follows:
        <pre>colDefs = {
    <span class="codeComment">// set as string</span>
    {headerName: "Gold", field: "gold", toolPanelClass: 'tp-gold'},

    <span class="codeComment">// set as array of strings</span>
    {headerName: "Silver", field: "silver", toolPanelClass: ['tp-silver']},

    <span class="codeComment">// set as function returning string or array of strings</span>
    {headerName: "Bronze", field: "bronze",
        toolPanelClass: function(params) {
            return 'tp-bronze';
        }},
}</pre>
    </p>

    <h3 id="toolPanelExample">Tool Panel Example</h3>

    <p>
        The example below demonstrates the tool panel. Note the following:
        <ul>
            <li><i>suppressRowGroup</i> and <i>suppressAggregation</i> are used so that the 'number of wins'
                columns cannot be grouped and the other columns cannot be aggregated (as doing
                either of these just wouldn't make sense).</li>
            <li>The gold, silver and bronze columns have style applied using <i>toolPanelClass</i></li>
            <li>The country column uses a headerValueGetter to give the column a slightly different
            name when dependent on where it appears using the <i>location</i> parameter.</li>
        </ul>
    </p>

    <show-example example="toolPanelExample"></show-example>

    <h3 id="suppressExample">Suppress Panels</h3>

    <p>
        Below shows using the suppress properties that can be used with the toolpanel as follows:
        <ul>
        <li>Grid Property <i>toolPanelSuppressRowGroups</i>: When true, the row group section does not appear in the tool panel.</li>
        <li>Grid Property <i>toolPanelSuppressValues</i>: When true, the value section does not appear in the tool panel.</li>
        <li>Grid Property <i>toolPanelSuppressPivots</i>: When true, the pivot section does not appear in the tool panel.</li>
        <li>Grid Property <i>toolPanelSuppressPivotMode</i>: When true, the pivot mode section does not appear in the tool panel.</li>
        <li>Column Property <i>suppressToolPanel</i>: When true, the column will not appear in the tool panel or in the column section of the column menu.
        This is useful when you have a column working in the background, eg a column you want to group by, but not present to the user.</li>
    </ul>
    </p>
    
    <show-example example="exampleToolPanelSuppress"></show-example>

    <h3 id="read-only-functions">Read Only Functions</h3>

    <p>
        By setting the property <i>functionsReadOnly=true</i>, the grid will prevent changes to group, pivot or
        values through the GUI. This is useful if you want to show the user the group, pivot and values panel,
        so they can see what columns are used, but prevent them from making changes to the selection.
    </p>

    <show-example example="exampleToolPanelReadOnly"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
