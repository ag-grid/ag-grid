<framework-specific-section frameworks="react">
<snippet transform={false}>
|// define Cell Component to be reused
|const ColourCellComp = props => &lt;span style={{color: props.color}}>{props.value}&lt;/span>;
|
|const GridExample = () => {
|   const [columnDefs] = useState([
|        {
|            headerName: "Colour 1",
|            field: "value",
|            cellRenderer: ColourCellComp,
|            cellRendererParams: {
|               color: 'guinnessBlack'
|            }
|        },
|        {
|            headerName: "Colour 2",
|            field: "value",
|            cellRenderer: ColourCellComp,
|            cellRendererParams: {
|               color: 'irishGreen'
|            }
|        }
|   ]);
|
|   //...
|};
</snippet>
</framework-specific-section>