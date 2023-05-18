---
title: "Side Bar"
enterprise: true
---

This section covers how to configure the Side Bar which contains Tool Panels.

## Configuring the Side Bar

The Side Bar is configured using the grid property `sideBar`. The property takes multiple forms to allow easy configuration or more advanced configuration. The different forms for the `sideBar` property are as follows:

| Type                         | Description                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `undefined` / `null`         | No Side Bar provided.                                                                              |
| `boolean`                    | Set to `true` to display the Side Bar with default configuration.                       |
| `string` / `string[]`        | Set to `'columns'` or `'filters'` to display the Side Bar with just one of [Columns](/tool-panel-columns/) or [Filters](/tool-panel-filters/) Tool Panels or an array of one or both of these values. |
| `SideBarDef`<br/>(long form) | An object of type `SideBarDef` (explained below) to allow detailed configuration of the Side Bar. Use this to configure the provided Tool Panels (e.g. pass parameters to the columns or filters panel) or to include custom Tool Panels. |


### Boolean Configuration

The default Side Bar contains the Columns and Filters Tool Panels. To use the default Side Bar, set the grid property `sideBar=true`. The Columns panel will be open by default.

The default configuration doesn't allow customisation of the Tool Panels. More detailed configuration are explained below.

In the following example note the following:

- The grid property `sideBar` is set to `true`.
- The Side Bar is displayed with Tool Panels Columns and Filters.
- The Columns panel is displayed by default.

<grid-example title='Boolean Configuration' name='boolean-configuration' type='generated' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

### String Configuration

To display just one of the provided Tool Panels, set either `sideBar='columns'` or `sideBar='filters'`. This will display the desired item with default configuration. Alternatively pass one or both as a `string[]`, i.e `sideBar=['columns','filters']`.

The example below demonstrates using the string configuration. Note the following:

- The grid property `sideBar` is set to `'filters'`.
- The Side Bar is displayed showing only the Filters panel.

<grid-example title='Side Bar - Only Filters' name='only-filters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter"]  }'></grid-example>

### SideBarDef Configuration

The previous configurations are shortcuts for the full fledged configuration using a `SideBarDef` object. For full control over the configuration, you must provide a `SideBarDef` object.

<interface-documentation interfaceName='SideBarDef' overridesrc='side-bar/resources/sideBar.json'></interface-documentation>

The `toolPanels` property follows the `ToolPanelDef` interface:

<interface-documentation interfaceName='ToolPanelDef' overridesrc='side-bar/resources/sideBar.json'></interface-documentation>

The following snippet shows configuring the Tool Panel using a `SideBarDef` object:

<snippet>
const gridOptions = {
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                minWidth: 225,
                maxWidth: 225,
                width: 225
            },
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
                minWidth: 180,
                maxWidth: 400,
                width: 250
            }
        ],
        position: 'left',
        defaultToolPanel: 'filters'
    }
}
</snippet>

The snippet above is demonstrated in the following example:

<grid-example title='SideBarDef' name='sideBarDef' type='generated' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter"], "exampleHeight": 600 }'></grid-example>

## Configuration Shortcuts

The `boolean` and `string` configurations are shortcuts for more detailed configurations. When you use a shortcut the grid replaces it with the equivalent long form of the configuration by building the equivalent `SideBarDef`.

The following code snippets show an example of the `boolean` shortcut and the equivalent `SideBarDef` long form.

<snippet>
const gridOptions = {
    // shortcut
    sideBar: true,
}
</snippet>

<snippet>
const gridOptions = {
    // equivalent detailed long form
    sideBar: {
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
        defaultToolPanel: 'columns',
    }
}
</snippet>

The following code snippets show an example of the `string` shortcut and the equivalent `SideBarDef` long form.

<snippet>
const gridOptions = {
    // shortcut
    sideBar: 'filters',
}
</snippet>

<snippet>
const gridOptions = {
    // equivalent detailed long form
    sideBar: {
        toolPanels: [
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            }
        ],
        defaultToolPanel: 'filters',
    }
}
</snippet>

You can also use shortcuts inside the `toolPanel.items` array for specifying the Columns and Filters items.

<snippet>
const gridOptions = {
    // shortcut
    sideBar: {
        toolPanels: ['columns', 'filters']
    }
}
</snippet>

<snippet>
const gridOptions = {
    // equivalent detailed long form
    sideBar: {
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
}
</snippet>

## Side Bar Customisation

If you are using the long form (providing a `SideBarDef` object) then it is possible to customise. The example below shows changing the label and icon for the columns and filters tab.

<grid-example title='Side Bar Fine Tuning' name='fine-tuning' type='generated' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter"]  }'></grid-example>

## Providing Parameters to Tool Panels

Parameters are passed to Tool Panels via the `toolPanelParams` object. For example, the following code snippet sets `suppressRowGroups: true` and `suppressValues: true` for the [Columns Tool Panel](/tool-panel-columns/).

<snippet>
const gridOptions = {
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    suppressRowGroups: true,
                    suppressValues: true,
                }
            }
        ]
    }
}
</snippet>

This example configures the Columns Tool Panel. See the [Columns Tool Panel](/tool-panel-columns/) documentation for the full list of possible parameters to this Tool Panel.

## Side Bar API

The list below details all the API methods relevant to the Tool Panel.

<api-documentation source='grid-api/api.json' section='accessories' names='["setSideBar","getSideBar","setSideBarVisible","isSideBarVisible","setSideBarPosition","openToolPanel","closeToolPanel","getOpenedToolPanel","isToolPanelShowing","refreshToolPanel", "getToolPanelInstance"]'></api-documentation>

The example below demonstrates different usages of the Tool Panel API methods. The following can be noted:

- Initially the Side Bar is not visible as `sideBar.hiddenByDefault=true`.
- **Visibility Buttons:** These toggle visibility of the Tool Panel. Note that when you make `visible=false`, the entire Tool Panel is hidden including the tabs. Make sure the Tool Panel is left visible before testing the other API features so you can see the impact.
- **Open / Close Buttons:** These open and close different Tool Panel items.
- **Reset Buttons:** These reset the Tool Panel to a new configuration. Notice that [shortcuts](#configuration-shortcuts) are provided as configuration however `getSideBar()` returns back the long form.
- **Position Buttons:** These change the position of the Side Bar relative to the grid.


<grid-example title='Side Bar API' name='api' type='generated' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter"], "exampleHeight": 630 }'></grid-example>

## Next Up

Now that we covered the Side Bar, continue to the next section to learn about the [Columns Tool Panel](/tool-panel-columns/).
