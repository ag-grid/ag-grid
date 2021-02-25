[[only-react]]
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
