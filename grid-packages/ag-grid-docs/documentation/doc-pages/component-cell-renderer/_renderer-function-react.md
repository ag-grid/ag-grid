[[only-react]]
|## Cell Renderer Function
|
|Instead of using a React component, it's possible to use a simple function for a cell renderer.
|
|This is probably most useful if you have a simple String value to render and want to avoid the overhead of an actual React
|component.
|
|In the example below we're outputting a simple string value that depends on the cell value:
|
|```jsx
|const GridExample = () => {
|   // other properties & methods
|
|   return (
|       <div className="ag-theme-alpine">
|           <AgGridReact
|           ...other properties>
|               <AgGridColumn headerName="Value" field="value" cellRenderer={params => params.value > 1000 ? "LARGE VALUE" : "SMALL VALUE"} />
|           </AgGridReact>
|       </div>
|   );
|};
|```
| It is also possible to write a JavaScript-based cell renderer function - refer to the [docs here](../../javascript-grid/component-cell-renderer/#cell-renderer-function) for more information
