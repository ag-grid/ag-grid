<framework-specific-section frameworks="angular">
|## Overlay Components Interfaces
|
|### Loading Overlay 
|
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
|### No Rows Overlay 
|
|Implement this interface to provide a custom overlay when no rows loaded.
|
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
