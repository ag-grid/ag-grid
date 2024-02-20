<framework-specific-section frameworks="react">
<snippet transform={false}>
|// define cellRenderer to be reused
|const ColourCellRenderer = props => &lt;span style={{color: props.color}}>{props.value}&lt;/span>;
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
|       &lt;div className="ag-theme-quartz">
|           &lt;AgGridReact
|              columnDefs={columnDefs}
|              ...other properties
|           />
|       &lt;/div>
|   );
|};
</snippet>
</framework-specific-section>