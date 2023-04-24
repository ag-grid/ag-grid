[[only-javascript]]
|### Header Component Interface
|
|Header components work similar to other component types in AG Grid in which they should implement the following interface:
|
|```ts
|interface IHeaderComp {
|    // Optional method, gets called once with params
|    init?(params: IHeaderParams): void;
|    
|    // Return the DOM element of your component, this is what the grid puts into the DOM
|    // Can get called more than once
|    getGui(): HTMLElement;
|    
|    // Gets called when a new Column Definition has been set for this header.
|    // If you handle the refresh of your header return true otherwise return false and the grid will re-create your header from scratch.
|    refresh(params: IHeaderParams): boolean;
|    
|    // Gets called once by grid when the component is being removed; if your component needs to do any cleanup, do it here
|    destroy?(): void;
|}
|```
|
|### Custom Header Parameters
|
|The `init(params)` method takes a params object with the items listed below. If custom params are provided via the `colDef.headerComponentParams` property, these 
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
