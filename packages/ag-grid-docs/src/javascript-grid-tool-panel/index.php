<?php
$pageTitle = "Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Tool Panel</h1>

    <p class="lead">
        The tool panel is a side panel that provides functions for managing different areas of the grid. Out of the box
        the grid provides with two side panels to manage the columns and the filters, but this can be customised with your
        own components
    </p>

    <h2>Simple Example - Columns and Filters</h2>
    <p>
    The default tool panel provided in ag-grid contains two tabs, one to mange columns (provide doc link TBC) and one to manage
    filters (provide doc link TBC)
    </p>

    <p>
    If you are happy to just show your tool panel like this, the minimum configuration needed is <code>gridOptions.toolPanel = true</code>
    As shown in the example below.
    </p>

<snippet>toolPanel: true</snippet>


    <?= example('Tool Panel Simple', 'simple', 'generated', array("enterprise" => 1)) ?>

    <note>
        <p>
            LANGUAGE IS SHIT!
         As of v19, we are deprecating showing the tool panel by default. What this means is that only temporarily if your
         <code>gridOptions.toolPanel === undefined</code> you will see the tool panel exactly the same as if you had <code>gridOptions.toolPanel = true</code>
     </p>

        <p>
         We are doing this to alleviate our customers having breaking changes in their code. If you were in the past showing the
         tool panel because you were not specifying any configuration explicitly, and you want to keep showing the tool panel as you
         upgrade your ag-grid version, then you must change your configuration to <code>gridOptions.toolPanel = true</code>
         </p>

         Note that you will see a warning in the console if  <code>gridOptions.toolPanel === undefined</code>
    </note>

    <note>
        <p>
             As of v19, we are also deprecating <code>gridOptions.showToolPanel = true</code> and <code>gridOptions.showToolPanel = false</code>
         </p>

        <p>
             We encourage to change this respectively into <code>gridOptions.toolPanel = true</code> and <code>gridOptions.toolPanel = false</code>
         </p>

         Note that you will see a warning in the console if  you still use showToolPanel
    </note>


    <h2>Columns and Filters - Shortcuts</h2>

    <p>
        There are several ways to fine tune exactly how you want you filters and columns tab to show.
        <ul>
                    <li>You can just show one tab by providing one of the two following keys: 'filters' and 'columns'. ie <code>gridOptions.toolPanel === 'filters'</code>
                    or <code>gridOptions.toolPanel = 'columns'</code>. Note that the example below only shows filters</li>

<?= example('Tool Panel - Only filters', 'onlyFilters', 'generated', array("enterprise" => 1)) ?>
                    <li>
                        You can also provide with an array of strings using the same keys a above: 'filters' and 'columns'. This is useful
                        if you want to change the order of the tabs, the following example is showing first filters then columns: <code>gridOptions.toolPanel = ['filters','columns']</code>
                    </li>
<?= example('Tool Panel - Filters then Columns', 'filtersThenColumns', 'generated', array("enterprise" => 1)) ?>
                </ul>
    </p>

    <h2>Columns and Filters - Fine tuning</h2>

    <p>
    The previous configurations are shortcuts for the full fledge configuration supported by the tool panel. With the tool panel you can configure:
    <table class="table reference">

        <?php include './toolPanelProperties.php' ?>
        <?php printPropertiesRows($toolPanelProperties) ?>

    </table>
    </p>

    <p>
    Each component has itself the following properties
    <table class="table reference">

            <?php include './toolPanelProperties.php' ?>
            <?php printPropertiesRows($toolPanelComponentProperties) ?>

        </table>
    </p>

    <p>
    For instance <code>gridOptions.toolPanel = true</code> is the shortcut for:
    </p>

<snippet>gridOptions.toolPanel = {
 components: [
     {
         key: 'columns',
         buttonLabel: 'Columns',
         iconKey: 'columns',
         component: 'agColumnsToolPanel',
     },
     {
         key: 'filters',
         buttonLabel: 'Filters',
         iconKey: 'filters',
         component: 'agFiltersToolPanel',
     }
 ],
 defaultTab: 'columns'
}
</snippet>

<p>
    You can even use shortcuts inside the <code>toolPanel.conponents</code> array, you can use the strings 'columns' and 'filters'
    to be used instead of the configuration described above. Below you can see the equivalent using shortcuts in <code>toolPanel.conponents</code>
</p>

<snippet>gridOptions.toolPanel = {
 components: ['columns','filters'],
 defaultTab: 'columns'
}
</snippet>

<p>
    The example below shows how fine tuning can be used to change the label or icon for the columns or filters tab. In this example, note
    how the filters tab has been configured to have a slightly different look & feel (label & icon)
</p>

<?= example('Tool Panel - Fine tuning', 'fineTuning', 'generated', array("enterprise" => 1)) ?>

<h2>Custom tabs</h2>

<p>
    You can now create even your own components, or overwrite the default columns and filters tabs. You can see the details for this on the
    component doc page for tool panel link TBC
</p>

<h2>API</h2>

<table class="table reference">

    <?php include './toolPanelApi.php' ?>
    <?php printPropertiesRows($toolPanelApi) ?>

</table>

<?= example('Tool Panel - API', 'api', 'generated', array("enterprise" => 1)) ?>

    <h1>BELOW HERE IS TO BE REVIEWED!!!</h1>


    <h2>Simple Example</h2>

    <p>
        Below shows a simple example of the tool panel is action. The following should be noted:
        <ul>
            <li>Grid property <code>showToolPanel=true</code> which shows the tool panel by default.</li>
            <li>
                Grid property <code>defaultColDef</code> has <code>enableValue</code>, <code>enableRowGroup</code>
                and <code>enablePivot</code> set. This means all columns can be dragged to any of the
                Row Groups, Vales and Column sections. Although each column can be dragged to these sections,
                it does not make sense. For example, it does not make sense to aggregate the country column,
                but it does make sense to row group by country.
            </li>
        </ul>
    </p>
    <p>
        Things to try:
        <ul>
            <li>
                Checking / Unchecking columns will show / hide the columns.
            </li>
            <li>
                Drag a column (eg Country) to Row Groups to row group.
            </li>
            <li>
                Drag a column (eg Gold) to Values to aggregate.
            </li>
            <li>
                Reset (refresh) the demo and do the following:
                <ul>
                    <li>Click 'Pivot Mode'.</li>
                    <li>Drag 'Country' to 'Row Groups'.</li>
                    <li>Drag 'Year' to 'Column Labels'.</li>
                    <li>Drag 'Gold' to 'Values'.</li>
                </ul>
                You will now have a pivot grid showing total gold medals for each country (rows showing countries)
                by year (columns showing years).
            </li>
        </ul>
    </p>



    <note>
        Remember to mark the column definitions with <code>enableRowGroup</code> for grouping, <code>enablePivot</code>
        for pivoting and <code>enableValue</code> for aggregation. Otherwise you won't be able to drag and drop the
        columns to the desired sections from the Tool Panel.
    </note>

    <h2>Selection Action</h2>

    <p>
        Selecting columns means different things depending on whether the grid is on pivot mode or not
        as follows:
    </p>

    <h4>Selection - </h4>

    <ul>
        <li><b>Pivot Mode Off</b>:
            When pivot mode is off, selecting a column toggles the visibility of the column. A selected column
            is visible and a non selected column is hidden. If you drag a column from the tool panel onto
            the grid it will make it visible.
        </li>
        <li><b>Pivot Mode On</b>:
            When pivot mode is on, selecting a column will trigger the column to be either aggregated, grouped
            or pivoted depending on what is allowed for that column.
        </li>
    </ul>

    <h2>Tool Panel Sections</h2>

    <p>
        The tool panel is split into difference sections which are follows:

        <ul>
            <li>
                <b>Pivot Mode Section</b>: Check the 'Pivot Mode' checkbox to turn the grid into
                <a href="../javascript-grid-pivoting/">Pivot Mode</a>. Uncheck to take the grid out
                of pivot mode.
            </li>
            <li>
                <b>Expand / Collapse All</b>: Toggle to expand or collapse all column groups.
            </li>
            <li>
                <b>Columns Section</b>: Display all columns, grouped by column groups, that are
                available to be displayed in the grid. The order of the columns is the order
                in which columns were provided to the grid and do not change even if the user
                changes the column order inside the grid.
            </li>
            <li>
                <b>Select / Un-select All</b>: Toggle to select or un-select all columns
                 in the columns section.
            </li>
            <li>
                <b>Side Button</b>: Shows and hides the tool panel.
            </li>
            <li>
                <b>Select / Un-Select Column (or Group)</b>: Each column can be individually selected.
                What selection means depends on pivot mode and is explained below*.
            </li>
            <li>
                <b>Drag Handle</b>: Each column can be dragged either with the mouse or via touch on touch devices.
                The column can then be dragged to one of the following:
                <ol>
                    <li>Row Groups Section</li>
                    <li>Values (Pivot) Section</li>
                    <li>Column Labels Section</li>
                    <li>Onto the grid.</li>
                </ol>
            </li>
            <li>
                <b>Row Groups Section</b>: Columns here will form the grids
                <a href="../javascript-grid-grouping/">Row Grouping</a>.
            </li>
            <li>
                <b>Values Section</b>: Columns here will form the grids
                <a href="../javascript-grid-aggregation/">Aggregations</a>. The grid calls this function 'Aggregations',
                however for the UI we follow Excel naming convention and call it 'Values'.
            </li>
            <li>
                <b>Column Labels (Pivot) Section</b>: Columns here will form the grids
                <a href="../javascript-grid-pivoting/">Pivot</a>. The grid calls this function
                'Pivot', however for the UI we follow Excel naming convention and call it 'Column Labels'.
            </li>
        </ul>
    </p>

    <p>
        <img src="./screenshot.png" alt="ag-Grid Tool Panel Section" />
    </p>

    <h2>Suppress Sections</h2>

    <p>
        It is possible to remove items from the tool panel. Items are suppressed by setting one or more of the
        following grid properties to true:
    </p>

    <ul class="content">
        <li><code>toolPanelSuppressRowGroups</code>: to suppress Row Groups section.</li>
        <li><code>toolPanelSuppressValues</code>: to suppress Values section.</li>
        <li><code>toolPanelSuppressPivots</code>: to suppress Column Labels (Pivot) section.</li>
        <li><code>toolPanelSuppressPivotMode</code>: to suppress Pivot Mode section.</li>

        <li><code>toolPanelSuppressSideButtons</code>: To suppress Side Buttons section.</li>
        <li><code>toolPanelSuppressColumnFilter</code>: To suppress Column Filter section.</li>
        <li><code>toolPanelSuppressColumnSelectAll</code>: To suppress Select / Un-select all widget.</li>
        <li><code>toolPanelSuppressColumnExpandAll</code>: To suppress Expand / Collapse all widget.</li>
    </ul>

    <p>
        To remove a particular column from the tool panel, set the column property <code>suppressToolPanel</code> to true.
        This is useful when you have a column working in the background, eg a column you want to group by,
        but not present to the user.
    </p>

    <p>
        The example below shows the tool panel demonstrating the suppress options above. The following can
        be noted:
        <ul>
            <li>
                The following sections are not present in the tool panel: Row Groups, Values, Column Labels,
                Pivot Mode, Side Buttons, Column Filter, Select / Un-select All, Expand / Collapse All.
            </li>
            <li>
                The columns Athlete and Age are also not present in the tool panel.
            </li>
        </ul>
    </p>

    <?= example('Suppress Panels', 'suppress', 'generated', array("enterprise" => 1)) ?>


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

<h2>Fixing Tool Panel Contents Height </h2>

<p> By default, the tool panel panels stretch to fit the height of the grid, with maximum height set to <code>100vh</code>. To tweak the height of them, you can tweak the <code>.ag-column-panel-center</code> selector: </p>

    <snippet language="css">
    .ag-column-panel-center {
        /* increase the total max height of tool panel contents */
        max-height: 2000px;
    }
    </snippet>

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

    <?= example('Tool Panel Styling', 'styling', 'generated', array("enterprise" => 1)) ?>

    <h2>Read Only Functions</h2>

    <p>
        By setting the property <code>functionsReadOnly=true</code>, the grid will prevent changes to group, pivot or
        values through the GUI. This is useful if you want to show the user the group, pivot and values panel,
        so they can see what columns are used, but prevent them from making changes to the selection.
    </p>

    <?= example('Read Only Example', 'read-only', 'generated', array("enterprise" => 1)) ?>



<?php include '../documentation-main/documentation_footer.php';?>
