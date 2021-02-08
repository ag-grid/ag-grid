[[only-react]]
|## Complementing Cell Renderer Params
|
|On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if you want to 'configure' your cell renderer. For example, you might have a cell renderer for formatting currency but you need to provide what currency for your cell renderer to use.
|
|Provide params to a cell renderer using the colDef option `cellRendererParams`.
|
|```jsx
|// define cellRenderer to be reused
|const ColourCellRenderer = props => <span style={{color: props.color}}>{props.value}</span>;
|
|const GridExample = () => {
|   // other properties & methods
|
|   frameworkComponents = {
|       'colourCellRenderer': ColourCellRenderer    
|   };
|
|   return (
|       <div className="ag-theme-alpine">
|           <AgGridReact
|           frameworkComponents={frameworkComponents}
|           ...other properties>
|               <AgGridColumn headerName="Colour 1" field="value" cellRenderer="colourCellRenderer" cellRendererParams={{ color: 'guinnessBlack' }} />
|               <AgGridColumn headerName="Colour 2" field="value" cellRenderer="colourCellRenderer" cellRendererParams={{ color: 'irishGreen' }} />
|           </AgGridReact>
|       </div>
|   );
|};
|```
