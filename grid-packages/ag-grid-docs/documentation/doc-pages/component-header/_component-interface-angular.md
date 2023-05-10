[[only-angular]]
|## Header Component Interface
|
|The interface for a custom header component is as follows:
|
|```ts
|interface IHeaderAngularComp {
|    // The agInit(params) method is called on the header component once.
|    // See below for details on the parameters.
|    agInit(params: IHeaderParams): void;
|
|    // Gets called when a new Column Definition has been set for this header.
|    // If you handle the refresh of your header return true otherwise return false and the grid will re-create your header from scratch.
|    refresh(params: IHeaderParams): boolean;
|}
|```
|
|### Custom Header Parameters
|
|The `agInit(params)` method takes a params object with the items listed below. If custom params are provided via the `colDef.headerComponentParams` property, these
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
