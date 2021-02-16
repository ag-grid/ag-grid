[[only-angular]]
|## Cell Renderer Component
|
|The interface for the cell renderer component is as follows:
|
|```ts
|interface AgRendererComponent {
|    // Optional - Params for rendering
|    agInit(params: ICellRendererParams): void;
|
|    // Optional - Return true if you want to manage a cell refresh yourself, otherwise return false.
|    // If you return false, the grid will remove the component from the DOM and create  a new component in its place 
|    // with the new values.
|    refresh(params: ICellRendererParams): boolean;
|}
|```
|The interface for the cell renderer parameters is as follows:
|
