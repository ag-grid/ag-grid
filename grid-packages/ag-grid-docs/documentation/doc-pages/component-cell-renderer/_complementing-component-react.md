[[only-react]]
|
|```jsx
|// define cellRenderer to be reused
|const ColourCellRenderer = props => <span style={{color: props.color}}>{props.value}</span>;
|
|const GridExample = () => {
|   // other properties & methods
|
|   const [columnDefs] = useState([
|        {
|            headerName: "Colour 1",
|            field: "value",
|            cellRenderer: ColourCellRenderer,
|            cellRendererParams: {
|               color: 'guinnessBlack'
|            }
|        },
|        {
|            headerName: "Colour 2",
|            field: "value",
|            cellRenderer: ColourCellRenderer,
|            cellRendererParams: {
|               color: 'irishGreen'
|            }
|        }
|   ]);
|
|   return (
|       <div className="ag-theme-alpine">
|           <AgGridReact
|              columnDefs={columnDefs}
|              ...other properties
|           />
|       </div>
|   );
|};
|```
