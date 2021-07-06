[[only-vue]]
|## Header Component Interface
|
|The interface for a custom header component is as follows:
|
|```ts
|interface IHeaderReactComp {
|    // gets called when a new Column Definition has been set for this header
|    refresh?(params: IHeaderParams): HTMLElement;
|}
|```
|
|### Custom Header Parameters
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell & 
|row values available to you via `this.params` - the interface for what is provided is documented below.  
|
|If the user provides params via the `colDef.headerComponentParams` attribute, these
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
