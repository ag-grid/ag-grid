<framework-specific-section frameworks="javascript">
|## Overlay Component Interfaces
|
|### Loading Overlay
|
|Implement this interface to provide a custom overlay when data is being loaded.
|
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
|### No Rows Overlay
|
|Implement this interface to provide a custom overlay when no rows loaded.
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



