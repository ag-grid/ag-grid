<?php
$pageTitle = "Tool Panel: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Tool Panel. The Tool Panel allows the user to manipulate the list of columns, such as show and hide, or drag columns to group or pivot. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Show Hide Column Tool Panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Side Bar</h1>

    <p class="lead">
        This section covers how to configure the Side Bar which contains Tool Panels.
    </p>

    <h2>Configuring the Side Bar</h2>

    <p>
        The side bar is configured using the grid property <code>sideBar</code>. The property takes multiple
        forms to allow easy configuration or more advanced configuration. The different forms
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
                Columns or Filters tool panels.</td>
        </tr>
        <tr>
            <td>SideBarDef<br/>(long form)</td>
            <td>An object of type SideBarDef (explained below) to allow detailed configuration
            of the side bar. Use this to configure the provided tool panels (eg pass parameters to the
                columns or filters panel) or to include custom tool panels.</td>
        </tr>
    </table>

    <h3>Boolean Configuration</h3>

    <p>
        The default side bar contains the Columns and Filters tool panels. To use the default side bar,
        set the grid property <code>sideBar=true</code>. The Columns panel will be open by default
    </p>

    <p>
        The default configuration doesn't allow customisation of the tool panels. More detailed configurations
        are explained below.
    </p>

    <p>
        In the following example note the following:
        <ul>
            <li>The grid property <code>sideBar</code> is set to true.</li>
            <li>The side bar is displayed with tool panels Columns and Filters.</li>
            <li>The Columns panel is displayed by default.</li>
        </ul>
    </p>

    <?= example('Boolean Configuration', 'booleanConfiguration', 'generated', array("enterprise" => 1)) ?>

    <h3>String Configuration</h3>

    <p>
        To display just one of the provided tool panels, set either <code>sideBar='columns'</code>
        or <code>sideBar='filters'</code>. This will display the desired item with default configuration.
    </p>

    <p>
        The example below demonstrates using the string configuration. Note the following:
        <ul>
            <li>The grid property <code>sideBar</code> is set to 'filters'.</li>
            <li>The side bar is displayed showing only the Filters panel.</li>
        </ul>
    </p>

    <?= example('Side Bar - Only filters', 'onlyFilters', 'generated', array("enterprise" => 1)) ?>

    <h3>SideBarDef Configuration</h3>

    <p>
        The previous configurations are shortcuts for the full fledged configuration using a SideBarDef object.
        For full control over the configuration, you must provide a <code>SideBarDef</code> object.
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
        The following snippet shows configuring the tool panel using a <code>SideBarDef</code> object:
    </p>

<snippet>
sideBar = {
    toolPanels: [
        {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
        },
        {
            id: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
        }
    ],
    defaultToolPanel: 'filters'
}
</snippet>

    <p>
        The snippet above is demonstrated in the following example:
    </p>

<?= example('SideBarDef', 'sideBarDef', 'generated', array("enterprise" => 1)) ?>

<h2 id="shortcuts">Configuration Shortcuts</h2>

    <p>
        The boolean and string configurations are shortcuts for more detailed configurations.
        When you use a shortcut the grid replaces it with the equivalent long form of the configuration
        by building the equivalent <code>SideBarDef</code>.
    </p>

    <p>
        The following code snippet shows an example of the <code>boolean</code> shortcut and the equivalent
        <code>SideBarDef</code> long form.
    </p>

    <snippet>
// shortcut
sideBar = true;

// equivalent detailed long form
sideBar = {
    toolPanels: [
        {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
        },
        {
            id: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
        }
    ],
    defaultToolPanel: 'columns'
    }
}
</snippet>

<p>
    The following code snippet shows and example of the <code>string</code> shortcut and the equivalent
    <code>SideBarDef</code> long form.
</p>

<snippet>
// shortcut
sideBar = 'filters';

// equivalent detailed long form
sideBar = {
    toolPanels: [
        {
            id: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
        }
    ],
    defaultToolPanel: 'filters'
    }
}
</snippet>

<p>
    You can also use shortcuts inside the <code>toolPanel.items</code> array for specifying the Columns and Filters items.
</p>

<snippet>
// shortcut
sideBar = {
    toolPanels: ['columns','filters']
};

// equivalent detailed long form
sideBar = {
    toolPanels: [
        {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
        },
        {
            id: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
        }
    ]
}
</snippet>

<h2>Side Bar Customisation</h2>

<p>
    If you are using the long form (providing a <code>SideBarDef</code> object) then it is possible to customise.
    The example below shows changing the label and icon for the columns and filters tab.
</p>

<?= example('Side Bar Fine tuning', 'fineTuning', 'generated', array("enterprise" => 1)) ?>

<h2>Providing Parameters to Tool Panels</h2>

<p>
    Parameters are passed to tool panels via the <code>componentParams</code> object.
    For example, the following code snippet sets <code>suppressRowGroups: true</code>
    and <code>suppressValues: true</code> for the
    <a href="../javascript-grid-tool-panel-columns/">columns tool panel</a>.
</p>

<snippet>
sideBar = {
    toolPanels: [{
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
        }
    }]
}
</snippet>

<p>
    This example configures the columns tool panel. See the
    <a href="../javascript-grid-tool-panel-columns/">columns tool panel</a>
    documentation for the full list of possible parameters to this tool panel.
</p>

<h2>Side Bar API</h2>

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

<?= example('Side Bar API', 'api', 'generated', array("enterprise" => 1)) ?>

<h2>Next Up</h2>

<p>
    Now that we covered the Side bar, continue to the next section to learn about the <a href="../javascript-grid-tool-panel-columns/">Columns Tool Panel</a>.
</p>


<?php include '../documentation-main/documentation_footer.php';?>
