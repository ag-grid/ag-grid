[[only-angular]]
|## Overlay Components Interfaces
|
|### Loading Overlay 
|
|Implement this interface to provide a custom overlay when data is being loaded.
|
|interface extends ILoadingOverlayAngularComp {
|   // The agInit(params) method is called on the overlay once. See below for details on the parameters.
|   agInit(params: ILoadingOverlayParams);
|}
|
|### No Rows Overlay 
|
|Implement this interface to provide a custom overlay when no rows loaded.
|
|interface extends INowRowsOverlayAngularComp {
|   // The agInit(params) method is called on the overlay once. See below for details on the parameters.
|   agInit(params: INoRowsOverlayParams);
|}
|
|The `agInit(params)` method takes a params object with the items listed below:
|

