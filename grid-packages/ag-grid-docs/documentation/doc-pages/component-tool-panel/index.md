---
title: "Tool Panel Component"
enterprise: true
---
 
Custom Tool Panel Components can be included into the grid's Side Bar. Implement these when you require more Tool Panels to meet your application requirements.

The example below provides a 'Custom Stats' Tool Panel to demonstrates how to create and register a Custom Tool Panel Component with the grid and include it the Side Bar:
 
<grid-example title='Custom Stats' name='custom-stats' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "columnpanel", "filterpanel", "setfilter" ], "extras": ["fontawesome"] }'></grid-example>

## Implementing a Tool Panel Component

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md
 
<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='IToolPanelParams' ></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomToolPanelProps' ></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>If you do not enable the grid option `reactiveCustomComponents`, it is still possible to use custom tool panel. However your tool panel will not update with prop changes, but will instead be destroyed/recreated. This behaviour is deprecated, and in v32, `reactiveCustomComponents` will default to true. Note that if you have existing custom components created without `reactiveCustomComponents`, these will need to be migrated. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents) for details.</note>
</framework-specific-section>

## Registering Tool Panel Components

Registering a Tool Panel component follows the same approach as any other custom components in the grid. For more details see: [Registering Custom Components](/components/#registering-custom-components).

Once the Tool Panel Component is registered with the grid it needs to be included into the Side Bar. The following snippet illustrates this:
 
md-include:configure-javascript.md
md-include:configure-angular.md
md-include:configure-react.md
md-include:configure-vue.md

For more details on the configuration properties above, refer to the [Side Bar Configuration](/side-bar/#sidebardef-configuration) section.

