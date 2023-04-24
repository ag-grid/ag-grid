[[only-angular]]
|## Loading Cell Renderer Component
|
|The interface for the loading cell renderer component is as follows:
|
|```ts
|interface ILoadingCellRendererAngularComp {
|
|    // Mandatory - The agInit(params) method is called on the loading cell renderer once.
|    agInit(params: ILoadingCellRendererParams): void;
|}
|```
|
|The `agInit(params)` method takes a params object with the items listed below:
|

