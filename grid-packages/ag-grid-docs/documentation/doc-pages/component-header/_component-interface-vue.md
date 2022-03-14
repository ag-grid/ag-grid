[[only-vue]]
|## Header Component Interface
|
|The interface for a custom header component is as follows:
|
|```ts
|interface IHeader {
|    // Gets called when a new Column Definition has been set for this header.
|    // If you handle the refresh of your header return true otherwise return false and the grid will re-create your header from scratch.
|    refresh?(params: IHeaderParams): boolean;
|}
|```
|
|### Custom Header Parameters
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell & 
|row values available to you via `this.params` - the interface for what is provided is documented below.  
|
|If custom params are provided via the `colDef.headerComponentParams` property, these
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
