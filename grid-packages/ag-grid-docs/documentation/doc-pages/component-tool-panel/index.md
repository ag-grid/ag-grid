---
title: "Tool Panel Component"
enterprise: true
---

Custom Tool Panel Components can be included into the grid's Side Bar. Implement these when you require more Tool Panels to meet your application requirements.

## Simple Tool Panel Component

md-include:simple-tool-panel-javascript.md
md-include:simple-tool-panel-angular.md
md-include:simple-tool-panel-react.md
md-include:simple-tool-panel-vue.md

## Example: 'Custom Stats' Tool Panel Component 

The example below provides a 'Custom Stats' Tool Panel to demonstrates how to create and register a Custom Tool Panel Component with the grid and include it the Side Bar:
 
<grid-example title='Custom Stats' name='custom-stats' type='generated' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter" ], "extras": ["fontawesome"] }'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='IToolPanelParams' ></interface-documentation>

## Registering Tool Panel Components

Registering a Tool Panel component follows the same approach as any other custom components in the grid. For more details see: [Registering Custom Components](/components/#registering-custom-components).

Once the Tool Panel Component is registered with the grid it needs to be included into the Side Bar. The following snippet illustrates this:
 
md-include:configure-javascript.md
md-include:configure-angular.md
md-include:configure-react.md
md-include:configure-vue.md

For more details on the configuration properties above, refer to the [Side Bar Configuration](/side-bar/#sidebardef-configuration) section.

