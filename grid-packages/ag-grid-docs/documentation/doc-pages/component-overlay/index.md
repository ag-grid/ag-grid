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

<grid-example title='Custom Overlay Components' name='custom-overlay-components' type='mixed' options='{ "extras": ["fontawesome"] }'></grid-example>

## Implementing a Loading Overlay Component

<framework-specific-section frameworks="javascript,angular">
|Implement this interface to provide a custom overlay when data is being loaded.
</framework-specific-section>
<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface extends ILoadingOverlayAngularComp {
|   // The agInit(params) method is called on the overlay once.
|   agInit(params: ILoadingOverlayParams);
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface ILoadingOverlayComp {
|    // mandatory methods
|
|    // The init(params) method is called on the overlay once. See below for details on the parameters.
|    init(params: ILoadingOverlayParams): void;
|
|    // Returns the DOM element for this overlay
|    getGui(): HTMLElement;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="javascript">
|The interface for the overlay parameters is as follows:
</framework-specific-section>
<framework-specific-section frameworks="react">
|When a loading overlay component is instantiated within the grid, the following will be made available on  `props`:
</framework-specific-section>
<framework-specific-section frameworks="vue">
|Any valid Vue component can be a loading overlay component. When a custom loading overlay is instantiated, the following will be made available on `this.params`:
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='ILoadingOverlayParams'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomLoadingOverlayProps'></interface-documentation>
</framework-specific-section>

## Implementing a No Rows Overlay Component

<framework-specific-section frameworks="javascript,angular">
|Implement this interface to provide a custom overlay when no rows loaded.
</framework-specific-section>
<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface extends INowRowsOverlayAngularComp {
|   // The agInit(params) method is called on the overlay once.
|   agInit(params: INoRowsOverlayParams);
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface INoRowsOverlayComp {
|    // mandatory methods
|
|    // The init(params) method is called on the overlay once. See below for details on the parameters.
|    init(params: INoRowsOverlayParams): void;
|
|    // Returns the DOM element for this overlay
|    getGui(): HTMLElement;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="javascript">
|The interface for the overlay parameters is as follows:
</framework-specific-section>
<framework-specific-section frameworks="react">
|When a no rows overlay component is instantiated within the grid, the following will be made available on  `props`:
</framework-specific-section>
<framework-specific-section frameworks="vue">
|Any valid Vue component can be a now rows overlay component. When a custom no rows overlay is instantiated, the following will be made available on `this.params`:
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='INoRowsOverlayParams'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomNoRowsOverlayProps'></interface-documentation>
</framework-specific-section>

## Registering Overlay Components

See [Registering Custom Components](/components/#registering-custom-components) for details on registering and using custom overlays.
