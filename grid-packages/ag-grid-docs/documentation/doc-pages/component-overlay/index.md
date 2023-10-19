---
title: "Overlay Component"
---
 
Overlay components allow you to add your own overlays to AG Grid. Use these when the provided overlays do not meet your requirements.


There are two types of overlay components:

- **Loading Overlay**: Overlay for when the grid is loading data.
- **No Rows**: Overlay for when the grid has loaded an empty array of rows.
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

