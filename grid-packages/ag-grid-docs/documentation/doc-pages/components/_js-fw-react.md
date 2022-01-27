[[only-react]]
||## Mixing JavaScript and React
|
|When providing Custom Components you have a choice of the following:
|1. Provide an AG Grid component as a React Component.
|1. Provide an AG Grid component in JavaScript.
|
|When referencing React components directly, use `xxxFramework` (eg `cellRendererFramework`).
|
|When referencing JavaScript components directly, use `xxx` (eg `cellRenderer`).
|
|When looking up JavaScript or React components, use `xxx` (eg `cellRenderer`) for both.
|
|The following code snippet shows how both JavaScript and React Components can be used at the same time:
|
|```jsx
|//...other imports
|import JavascriptComponent from './JavascriptComponent.js';
|import ReactComponent from './ReactComponent';
|
|const GridExample = () => {
|   // JS components
|   const [components] = useState({
|       'javascriptComponent': JavascriptComponent,
|   });
|   // React components
|   const [components] = useState({
|       'reactComponent': ReactComponent    
|   });
|
|   const [columnDefs] = useState([
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: 'javascriptComponent', // use JS comp by Name
|       },
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: JavascriptComponent, // use JS comp by Direct Reference
|       },
|       {
|           headerName: "React Cell",
|           field: "value",
|           cellRenderer: 'reactComponent', // use React comp by Name
|       },
|       {
|           headerName: "React Cell",
|           field: "value",
|           cellRendererFramework: ReactComponent, // use React comp by Direct Reference
|       }
|   ]);
|
|    return (
|        <div className="ag-theme-alpine">
|            <AgGridReact
|               components={components}
|               frameworkComponents={frameworkComponents}
|               columnDefs={columnDefs}
|               ...other properties
|            />
|        </div>
|    );
|};
|```
|