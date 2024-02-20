<framework-specific-section frameworks="react">
|## Mixing JavaScript and React
|
|When providing Custom Components you have a choice of the following:
|1. Provide an AG Grid component as a React Component.
|1. Provide an AG Grid component in JavaScript (JavaScript Class Components only, not JavaScript Functional Components).
|
|The following code snippet shows how both JavaScript and React Components can be used at the same time:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|//...other imports
|import JavascriptComponent from './JavascriptComponent.js';
|import ReactComponent from './ReactComponent';
|
|const GridExample = () => {
|   // JS and React components, only need register if looking up by name
|   const components = useMemo(() => ({
|       'javascriptComponent': JavascriptComponent,
|       'reactComponent': ReactComponent    
|   }), []);
|
|   const columnDefs = useMemo( () => [
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: 'javascriptComponent', // JS comp by Name
|       },
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: JavascriptComponent, // JS comp by Direct Reference
|       },
|       {
|           headerName: "React Cell",
|           field: "value",
|           cellRenderer: 'reactComponent', // React comp by Name
|       },
|       {
|           headerName: "React Cell",
|           field: "value",
|           cellRenderer: ReactComponent, // React comp by Direct Reference
|       }
|   ], []);
|
|    return (
|        &lt;div className="ag-theme-quartz">
|            &lt;AgGridReact
|               components={components}
|               columnDefs={columnDefs}
|               ...other properties
|            />
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>