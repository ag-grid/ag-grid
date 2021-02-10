[[only-javascript]]
|## Cell Renderer Component
|
|The interface for the cell renderer component is as follows:
|
|```ts
|interface ICellRendererComp {
|    // Optional - Params for rendering. The same params that are passed to the cellRenderer function.
|    init?(params: ICellRendererParams): void;
|
|    // Mandatory - Return the DOM element of the component, this is what the grid puts into the cell
|    getGui(): HTMLElement;
|
|    // Optional - Gets called once by grid after rendering is finished - if your renderer needs to do any cleanup,
|    // do it here
|    destroy?(): void;
|
|    // Mandatory - Get the cell to refresh. Return true if the refresh succeeded, otherwise return false.
|    // If you return false, the grid will remove the component from the DOM and create
|    // a new component in its place with the new values.
|    refresh(params: ICellRendererParams): boolean;
|}
|```
|
|The interface for the cell renderer parameters is as follows:
|
