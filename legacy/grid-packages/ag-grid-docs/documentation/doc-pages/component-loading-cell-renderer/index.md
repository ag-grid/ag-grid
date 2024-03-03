---
title: "Loading Component"
---

The Loading Component is displayed for a row to show data is loading.

The example below demonstrates replacing the Provided Loading Component with a Custom Loading Component.
 
- **Custom Loading Component** is supplied by name via `gridOptions.loadingCellRenderer`.
- **Custom Loading Component Parameters** are supplied using `gridOptions.loadingCellRendererParams`.
- Example simulates a long delay to display the spinner clearly. 
- Scrolling the grid will request more rows and again display the loading cell renderer.

<grid-example title='Custom Loading Cell Renderer' name='custom-loading-cell-renderer' type='generated' options='{ "enterprise": true, "modules": ["serverside"], "extras": ["fontawesome"] }'></grid-example>

## Custom Component

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='ILoadingCellRendererParams' names='["api", "context", "node"]'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomLoadingCellRendererProps' names='["api", "context", "node"]'></interface-documentation>
</framework-specific-section>

## Dynamic Selection

It's possible to determine what Loading Cell Renderer to use dynamically - i.e. at runtime. This requires providing a `loadingCellRendererSelector`.

<framework-specific-section frameworks="javascript,angular,react">
md-include:component-dynamic-angular-react-js.md
</framework-specific-section>

md-include:component-dynamic-vue.md 
