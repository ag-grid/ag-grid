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
    <p class="lead">
        The grid provides two tool panels out of the box to a)
        <a href="../javascript-grid-tool-panel-columns/">manage columns</a> and b)
        <a href="../javascript-grid-tool-panel-filters/">manage filters</a>.
        You can also create your own <a href="../javascript-grid-tool-panel-filters/">custom tool panels</a>
        that will sit alongside the provided ones.
    </p>

    <p>
        The tool panels that sit inside the tool bar are referred to as simply 'panels' in the documentation
        on this page.
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

    <h2>Configuring the Side Bar</h2>

    <p>
        The side bar is configured using the grid property <code>sideBar</code>. The property takes multiple
        forms to allow easy configuration or more fine tuned configuration. The different forms
        for the <code>sideBar</code> property are as follows:
    </p>

    <table class="table reference">
        <tr>
            <th>Type</th>
            <th>Description</th>
        </tr>
        <tr>
            <td>undefined</td>
            <td>No side bar provided.</td>
        </tr>
        <tr>
            <td>boolean</td>
            <td>Set to true to display the side bar with default configuration.</td>
        </tr>
        <tr>
            <td>string</td>
            <td>Set to 'columns' or 'filters' to display side bar with just one of
                Columns or Filters panels.</td>
        </tr>
        <tr>
            <td>SideBarDef<br/>(long form)</td>
            <td>An object of type SideBarDef (explained below) to allow detailed configuration
            of the side bar. Use this to configure the panels (eg pass parameters to the
                columns tool panel) or to include custom panels.</td>
        </tr>
    </table>

    <h3>Boolean Configuration</h3>

    <p>
        The default side bar contains the Columns and Filters panels. To use the default side bar,
        set the grid property <code>sideBar=true</code>. The Columns panel will be open by default
    </p>

    <p>
        The default configuration doesn't allow customisation of the panels. More detailed configurations
        are explained below.
    </p>

    <p>
        In the example below, note the following:
        <ul>
            <li>The grid property <code>sideBar</code> is set to true.</li>
            <li>The side bar is displayed with panels Columns and Filters.</li>
            <li>The Columns panel is displayed by default.</li>
        </ul>
    </p>

    <?= example('Tool Panel Simple', 'simple', 'generated', array("enterprise" => 1)) ?>

    <h3>String Configuration</h3>

    <p>
        To display just one of the provided panels, set either <code>sideBar='columns'</code>
        or <code>sideBar='filters'</code>. This will display the desired item with default configuration.
    </p>

    <p>
        The example below demonstrates using the string configuration. Note the following:
        <ul>
            <li>The grid property <code>sideBar</code> is set to 'filters'.</li>
            <li>The side bar is displayed showing only the Filters panel.</li>
        </ul>
    </p>

    <?= example('Tool Panel - Only filters', 'onlyFilters', 'generated', array("enterprise" => 1)) ?>

    <h3>SideBarDef Configuration</h3>

    <p>
        The previous configurations are shortcuts for the full fledged configuration using a SideBarDef object.
        The properties of SideBarDef are as follows:
    <table class="table reference">

        <?php include './toolPanelProperties.php' ?>
        <?php printPropertiesRows($toolPanelProperties) ?>

    </table>
    </p>

    <p>
    Each panel has the following properties
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
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            component: 'agColumnsToolPanel',
        },
        {
            key: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
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

<h2 id="shortcuts">Configuration Shortcuts</h2>

    <p>
        The boolean and string configurations are actually shortcuts for the more details configuration.
        When you use a shortcut the grid replaces it with the equivalent long form of the configuration
        using <code>ToolPanelDef</code>.
    </p>

    <p>
        The following code snippet shows and example of the <code>boolean</code> shortcut and the equivalent
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
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            component: 'agColumnsToolPanel',
        },
        {
            key: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            component: 'agFiltersToolPanel',
        }
    ],
    defaultTab: 'columns'
    }
}
</snippet>

<p>
    The following code snippet shows and example of the <code>string</code> shortcut and the equivalent
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
            labelDefault: 'Filters',
            labelKey: 'filters',
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
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            component: 'agColumnsToolPanel',
        },
        {
            key: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            component: 'agFiltersToolPanel',
        }
    ]
}
</snippet>

<h2>Customising Tool Panel Items</h2>

<p>
    If you are using the long form (providing a <code>ToolPanelDef</code> object) then it is possible to customise.
    The example below shows changing the label and icon for the columns and filters tab.
</p>

<?= example('Tool Panel - Fine tuning', 'fineTuning', 'generated', array("enterprise" => 1)) ?>

<h2>Custom tabs</h2>

<p>
    You can create and add your own tool panel items. You can see the details for this on the
    component doc page for tool panel link TBC
</p>

<h2>API</h2>

<p>
    The list below details all the API methods relevant to the tool panel.
</p>

<table class="table reference">

    <?php include './toolPanelApi.php' ?>
    <?php printPropertiesRows($toolPanelApi) ?>

</table>

<p>
    The example below demonstrates different usages of the tool panel API methods.
    The following can be noted:
</p>

<ul>
    <li>
        <b>Visibility Buttons:</b> These toggle visibility of the tool panel. Note that when you make <code>visible=false</code>,
        the entire tool panel is hidden including the tabs. Make sure the tool panel is left visible before testing
        the other API features so you can see the impact.
    </li>
    <li><b>Open / Close Buttons:</b> These open and close different tool panel items.</li>
    <li>
        <b>Reset:</b> These reset the tool panel to a new configuration. Notice that <a href="#shortcuts">shortcuts</a>
        are provided as configuration however <code>getToolPanel()</code> returns back the long form.
    </li>
</ul>

<?= example('Tool Panel - API', 'api', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
