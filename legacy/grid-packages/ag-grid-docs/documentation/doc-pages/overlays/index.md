---
title: "Overlays"
---

Overlays are for displaying messages over the grid.

When using the Client-side Data the grid uses two overlays: 

1. **Loading Overlay**: Displayed if `rowData` or `columnDefs` are set to `null` or `undefined`. 
2. **No Rows Overlay**: Displayed if `rowData` is an empty list.

You can manually show the overlays using the grid API's `showLoadingOverlay()`, `showNoRowsOverlay()` and `hideOverlay()`.

HTML templates can be provided to the overlays using grid properties `overlayLoadingTemplate` and `overlayNoRowsTemplate`.

<grid-example title='Overlays' name='overlays' type='mixed' options='{ "exampleHeight": 350 }'></grid-example>

## Custom Overlays

This example demonstrates Custom Overlay Components.

<grid-example title='Custom Overlay Components' name='custom-overlay-components' type='mixed' options='{ "extras": ["fontawesome"] }'></grid-example>

Loading Overlay Component is configured via the grid properties `loadingOverlayComponent` and `loadingOverlayComponentParams`.

<framework-specific-section frameworks="javascript,angular">
|Implement this interface to provide a custom overlay when data is being loaded.
</framework-specific-section>
<framework-specific-section frameworks="vue">
|Any valid Vue component can be a loading overlay component, however it is also possible to implement the following optional methods:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface extends ILoadingOverlayAngularComp {
|    // mandatory methods
|
|    // The agInit(params) method is called on the overlay once.
|    agInit(params: ILoadingOverlayParams);
|
|    // optional methods
|
|    // Gets called when the `loadingOverlayComponentParams` grid option is updated
|    refresh(params: ILoadingOverlayParams): void;
|
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface ILoadingOverlayComp {
|    // mandatory methods
|
|    // Returns the DOM element for this overlay
|    getGui(): HTMLElement;
|
|    // optional methods
|
|    // The init(params) method is called on the overlay once. See below for details on the parameters.
|    init(params: ILoadingOverlayParams): void;
|
|    // Gets called when the `loadingOverlayComponentParams` grid option is updated
|    refresh(params: ILoadingOverlayParams): void;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="vue">
<snippet transform={false} language="ts">
|interface ILoadingOverlay {
|    // Gets called when the `loadingOverlayComponentParams` grid option is updated
|    refresh(params: ILoadingOverlayParams): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
<framework-specific-section frameworks="javascript">
|The interface for the overlay parameters is as follows:
</framework-specific-section>
<framework-specific-section frameworks="react">
|When a loading overlay component is instantiated within the grid, the following will be made available on  `props`:
</framework-specific-section>
<framework-specific-section frameworks="vue">
|When a custom loading overlay is instantiated, the following will be made available on `this.params`:
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='ILoadingOverlayParams'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomLoadingOverlayProps'></interface-documentation>
</framework-specific-section>

No Rows Overlay Component is configured via the grid properties `noRowsOverlayComponent` and `noRowsOverlayComponentParams`.

<framework-specific-section frameworks="javascript,angular">
|Implement this interface to provide a custom overlay when no rows loaded.
</framework-specific-section>
<framework-specific-section frameworks="vue">
|Any valid Vue component can be a no rows overlay component, however it is also possible to implement the following optional methods:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface extends INowRowsOverlayAngularComp {
|    // mandatory methods
|
|    // The agInit(params) method is called on the overlay once.
|    agInit(params: INoRowsOverlayParams);
|
|    // optional methods
|
|    // Gets called when the `noRowsOverlayComponentParams` grid option is updated
|    refresh(params: INoRowsOverlayParams): void;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface INoRowsOverlayComp {
|    // mandatory methods
|
|    // Returns the DOM element for this overlay
|    getGui(): HTMLElement;
|
|    // optional methods
|
|    // The init(params) method is called on the overlay once. See below for details on the parameters.
|    init(params: INoRowsOverlayParams): void;
|
|    // Gets called when the `noRowsOverlayComponentParams` grid option is updated
|    refresh(params: INoRowsOverlayParams): void;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="vue">
<snippet transform={false} language="ts">
|interface INoRowsOverlay {
|    // Gets called when the `noRowsOverlayComponentParams` grid option is updated
|    refresh(params: INoRowsOverlayParams): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
<framework-specific-section frameworks="javascript">
|The interface for the overlay parameters is as follows:
</framework-specific-section>
<framework-specific-section frameworks="react">
|When a no rows overlay component is instantiated within the grid, the following will be made available on  `props`:
</framework-specific-section>
<framework-specific-section frameworks="vue">
|When a custom no rows overlay is instantiated, the following will be made available on `this.params`:
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='INoRowsOverlayParams'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomNoRowsOverlayProps'></interface-documentation>
</framework-specific-section>
