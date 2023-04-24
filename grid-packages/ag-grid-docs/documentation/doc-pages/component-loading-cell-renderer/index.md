---
title: "Loading Cell Renderer"
---

Loading cell renderers allow you to add your own loading renderers to AG Grid. Use these when the provided loading renderers do not meet your requirements.

## Simple Loading Cell Renderer Component

md-include:simple-renderer-javascript.md
md-include:simple-renderer-angular.md
md-include:simple-renderer-react.md
md-include:simple-renderer-vue.md
 
## Example: Custom Loading Cell Renderer

The example below demonstrates how to provide custom loading cell renderer component to the grid. Notice the following:
 
- **Custom Loading Cell Renderer** is supplied by name via `gridOptions.loadingCellRenderer`.
- **Custom Loading Cell Renderer Parameters** are supplied using `gridOptions.loadingCellRendererParams`.
- Example simulates a long delay to display the spinner clearly. 
- Scrolling the grid will request more rows and again display the loading cell renderer.

<grid-example title='Custom Loading Cell Renderer' name='custom-loading-cell-renderer' type='generated' options='{ "enterprise": true, "modules": ["serverside"], "extras": ["fontawesome"] }'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='ILoadingCellRendererParams' names='["api", "columnApi", "context", "node"]' config='{"hideHeader":false, "headerLevel":3}' ></interface-documentation>

## Dynamic Cell Loading Renderer

It's possible to determine what Loading Cell Renderer to use dynamically - i.e. at runtime. For this you'll make use of the

[[only-angular-or-react]]
md-include:component-dynamic-angular-react-js.md
[[only-javascript]]
md-include:component-dynamic-angular-react-js.md
md-include:component-dynamic-vue.md

## Registering Loading Cell Renderer Components

See the section [registering custom components](/components/#registering-custom-components) for details on registering and using custom loading cell renderers.

