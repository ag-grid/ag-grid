[[only-react]]
|## Mixing JavaScript and React
|When providing Custom Components you have a choice of the following:
|
|1. Provide an AG Grid component in JavaScript.
|1. Provide an AG Grid component as an React Component.
|
|For example if you want to build a cell renderer you have the choice to build the cell renderer using either React or using plain JavaScript.
|
|The following code snippet shows how both JavaScript and React Components can be used at the same time:
|
|```jsx
|//...other imports
|import JavascriptComponent from './JavascriptComponent.js';
|import ReactComponent from './ReactComponent';
|
|const GridExample = () => {
|   // other properties & methods
|   
|   // All components registered together
|   const [comps] = useState({
|       'javascriptComponent': JavascriptComponent,
|       'reactComponent': ReactComponent    
|   });
|
|   const [columnDefs] = useState([
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRendererComp: 'javascriptComponent', // use JS comp by Name
|       },
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRendererComp: JavascriptComponent, // use JS comp by Direct Reference
|       },
|       {
|           headerName: "React Cell",
|           field: "value",
|           cellRendererComp: 'reactComponent', // use React comp by Name
|       },
|       {
|           headerName: "React Cell",
|           field: "value",
|           cellRendererComp: ReactComponent, // use React comp by Direct Reference
|       }
|   ]);
|
|    return (
|        <div className="ag-theme-alpine">
|            <AgGridReact
|               comps={comps}
|               columnDefs={columnDefs}
|               ...other properties
|            />
|        </div>
|    );
|};
|```
|