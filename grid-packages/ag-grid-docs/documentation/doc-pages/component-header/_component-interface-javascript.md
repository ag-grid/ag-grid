[[only-javascript]]
|### Header Component Interface
|
|Header components work similar to other component types in AG Grid in which they should implement the following interface:
|
|```ts
|interface IHeaderComp {
|    // optional method, gets called once with params
|    init?(params: IHeaderCompParams): void;
|    
|    // can get called more than once, you should return the HTML element
|    getGui(): HTMLElement;
|    
|    // gets called when a new Column Definition has been set for this header
|    refresh(params: IHeaderCompParams): HTMLElement;
|    
|    // optional method, gets called once, when component is destroyed
|    destroy?(): void;
|}
|```
|
|### Custom Header Parameters
|
|The `init(params)` method takes a params object with the items listed below. If the user provides params via the `colDef.headerComponentParams` attribute, these 
|will be additionally added to the params object, overriding items of the same name if a name clash exists.
|
