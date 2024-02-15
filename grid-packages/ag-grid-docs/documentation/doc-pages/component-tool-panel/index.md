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
<note>Enabling `reactiveCustomComponents` affects all custom components. If you have custom components built in an imperative way instead of setting the `reactiveCustomComponents` option, they may need to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents).</note>
</framework-specific-section>

## Registering Tool Panel Components

Registering a Tool Panel component follows the same approach as any other custom components in the grid. For more details see: [Registering Custom Components](/components/#registering-custom-components).

Once the Tool Panel Component is registered with the grid it needs to be included into the Side Bar. The following snippet illustrates this:
 
md-include:configure-javascript.md
md-include:configure-angular.md
md-include:configure-react.md
md-include:configure-vue.md

For more details on the configuration properties above, refer to the [Side Bar Configuration](/side-bar/#sidebardef-configuration) section.

