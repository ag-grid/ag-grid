<?php
$pageTitle = "Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Tool Panel</h1>

    <p class="lead">
        The tool panel is a side panel that provides functions for managing different areas of the grid.
        The tool panel has tabs for displaying different 'tool panel items'. The grid provides
        two tool panel items out of the box as follows: 1) to
        <a href="../javascript-grid-tool-panel-columns/">manage columns</a> and 2) to
        <a href="../javascript-grid-tool-panel-filters/">manage filters</a>.
        You can also create your own <a href="../javascript-grid-tool-panel-filters/">custom tool panel items</a>.
    </p>

    <note>
        <p>
            Version 19 of ag-Grid received a major overhaul of the tool panel. It did not make sense to keep
            with the older configuration options. The old property <code>showToolPanel</code> is no longer
            used. The tool panel is also not included by default - if the tool panel is not configured, no
            tool panel is shown.
        </p>
        <p>
            If moving from an earlier version, set <code>toolPanel='columns'</code> to receive similar behaviour.
        </p>
    </note>

    <h2>Configuring the Tool Panel</h2>

    <p>
        The tool panel is configured using the grid property <code>toolPanel</code>. The property takes multiple
        forms to allow easy configuration to more detailed (and more complex) configuration. The different forms
        for the <code>toolPanel</code> property are as follows:
    </p>

    <table class="table reference">
        <tr>
            <th>Type</th>
            <th>Description</th>
        </tr>
        <tr>
            <td>undefined</td>
            <td>No tool panel provided.</td>
        </tr>
        <tr>
            <td>boolean</td>
            <td>Set to true to display the tool panel with default configuration.</td>
        </tr>
        <tr>
            <td>string</td>
            <td>Set to 'columns' or 'filters' to display tool panel with just one of
                Columns or Filters item.</td>
        </tr>
        <tr>
            <td>ToolPanelDef</td>
            <td>An object of type ToolPanelDef (explained below) to allow detailed configuration
            of the tool panel, including providing custom components.</td>
        </tr>
    </table>

    <h2>Boolean Configuration</h2>

    <p>
        The default tool panel contains tool panel items Columns and Filters. To use the default tool panel,
        set the grid property <code>toolPanel=true</code>. The Columns item will be open by default
    </p>

    <p>
        The default configuration doesn't allow customisation of the tool panel. More detailed configurations
        are explained below.
    </p>

    <p>
        In the example below, note the following:
        <ul>
            <li>The grid property <code>toolPanel</code> is set to true.</li>
            <li>The tool panel is displayed with tool panel items Columns and Filters.</li>
            <li>The Columns item is displayed by default.</li>
        </ul>
    </p>

    <?= example('Tool Panel Simple', 'simple', 'generated', array("enterprise" => 1)) ?>

    <h2>String Configuration</h2>

    <p>
        To display just one of the provided tool panel items, set either <code>toolPanel='columns'</code>
        or <code>toolPanel='filters'</code>. This will display the desired item with default configuration.
    </p>

    <p>
        The example below demonstrates using the string configuration. Note the following:
        <ul>
            <li>The grid property <code>toolPanel</code> is set to 'filters'.</li>
            <li>The tool panel is displayed showing only the Filters item.</li>
        </ul>
    </p>

    <?= example('Tool Panel - Only filters', 'onlyFilters', 'generated', array("enterprise" => 1)) ?>

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
