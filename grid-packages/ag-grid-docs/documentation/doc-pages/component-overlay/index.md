---
title: "Overlay Component"
---

Overlay components allow you to add your own overlays to AG Grid. Use these when the provided overlays do not meet your requirements.

## Simple Loading Overlay Component

md-include:simple-loading-overlay-javascript.md
md-include:simple-loading-overlay-angular.md
md-include:simple-loading-overlay-react.md
md-include:simple-loading-overlay-vue.md
 
## Simple No-Rows Overlay Component
md-include:simple-no-rows-overlay-javascript.md
md-include:simple-no-rows-overlay-angular.md
md-include:simple-no-rows-overlay-react.md
md-include:simple-no-rows-overlay-vue.md

## Example: Custom Overlay Components

The example below demonstrates how to provide custom overlay components to the grid. Notice the following:

- **Custom Loading Overlay Renderer** is supplied by name via `gridOptions.loadingOverlayComponent`.
- **Custom Loading Overlay Renderer Parameters** are supplied using `gridOptions loadingOverlayComponentParams`.
- **Custom No Rows Overlay Renderer** is supplied by name via `gridOptions.noRowsOverlayComponent`.
- **Custom No Rows Overlay Renderer Parameters** are supplied using `gridOptions.noRowsOverlayComponentParams`.

<grid-example title='Custom Overlay Components' name='custom-overlay-components' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>
  
md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md
 
<interface-documentation interfaceName='ILoadingOverlayParams' config='{"hideHeader":false, "headerLevel":3}' ></interface-documentation>
<interface-documentation interfaceName='INoRowsOverlayParams' config='{"hideHeader":false, "headerLevel":3}' ></interface-documentation>

## Registering Overlay Components

See the section [registering custom components](/components/#registering-custom-components) for details on registering and using custom overlays.

