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
    The default tool panel provided in ag-grid contains two tabs, one to <a href="../javascript-grid-tool-panel-columns">manage columns</a> and one to
    <a href="../javascript-grid-tool-panel-filters">manage filters</a>
    </p>

    <p>
    If you are happy to just show your tool panel like this, the minimum configuration needed is <code>gridOptions.toolPanel = true</code>
    As shown in the example below.
    </p>

<snippet>toolPanel: true</snippet>


    <?= example('Tool Panel Simple', 'simple', 'generated', array("enterprise" => 1)) ?>

    <note>
        <p>
         As of v19, we are not showing the tool panel by default.
        </p>
        <p>
         If you were in the past showing the tool panel because you were not specifying any configuration explicitly,
         and you want to keep showing the tool panel from v19, you must change your configuration to <code>gridOptions.toolPanel = true</code>
         </p>
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
         iconKey: 'filter',
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

<?php include '../documentation-main/documentation_footer.php';?>
