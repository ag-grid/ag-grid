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

    <h2>ToolPanelDef Configuration</h2>

    <p>
        The previous configurations are shortcuts for the full fledged configuration using a ToolPanelDef object.
        The properties of ToolPanelDef are as follows:
    <table class="table reference">

        <?php include './toolPanelProperties.php' ?>
        <?php printPropertiesRows($toolPanelProperties) ?>

    </table>
    </p>

    <p>
    Each item has the following properties
    <table class="table reference">

            <?php include './toolPanelProperties.php' ?>
            <?php printPropertiesRows($toolPanelComponentProperties) ?>

        </table>
    </p>

    <p>
        The following snippet shows configuring the tool panel using a ToolPanelDef object:
    </p>

<snippet>
toolPanel = {
    items: [
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
    defaultTab: 'filters'
}
</snippet>

    <p>
        The snippet above is demonstrated in the following example:
    </p>

<div style="padding: 20px; background: yellow; border: 2px solid green;">PUT IN EXAMPLE FOR ToolPanelDef</div>

<h2>Configuration Shortcuts</h2>

    <p>
        The boolean and string configurations are actually shortcuts for the more details configuration.
        When you use a shortcut, the grid replaces it with the equivalent long form of the configuration
        using <code>ToolPanelDef</code>.
    </p>

    <p>
        The following code snippet shows and example of the boolean shortcut and the equivalent
        <code>ToolPanelDef</code> long form.
    </p>

    <snippet>
// shortcut
toolPanel = true;

// equivalent detailed long form
toolPanel = {
    items: [
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
}
</snippet>

<p>
    The following code snippet shows and example of the string shortcut and the equivalent
    <code>ToolPanelDef</code> long form.
</p>

<snippet>
// shortcut
toolPanel = 'filters';

// equivalent detailed long form
toolPanel = {
    items: [
        {
            key: 'filters',
            buttonLabel: 'Filters',
            iconKey: 'filter',
            component: 'agFiltersToolPanel',
        }
    ],
    defaultTab: 'filters'
    }
}
</snippet>

<p>
    You can also use shortcuts inside the <code>toolPanel.items</code> array for specifying the Columns and Filters items.
</p>

<snippet>
// shortcut
toolPanel = {
    items: ['columns','filters']
};

// equivalent detailed long form
toolPanel = {
    items: [
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
}
</snippet>

<p>
    The example below shows how fine tuning can be used to change the label or icon for the columns or filters tab.
    In this example, note how the filters tab has been configured to have a slightly different look & feel (label & icon)
</p>

<?= example('Tool Panel - Fine tuning', 'fineTuning', 'generated', array("enterprise" => 1)) ?>

<h2>Custom tabs</h2>

<p>
    You can now create even your own items, or overwrite the default columns and filters tabs. You can see the details for this on the
    component doc page for tool panel link TBC
</p>

<h2>API</h2>

<table class="table reference">

    <?php include './toolPanelApi.php' ?>
    <?php printPropertiesRows($toolPanelApi) ?>

</table>

<?= example('Tool Panel - API', 'api', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
