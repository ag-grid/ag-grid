[[only-react]]
|## Mixing JavaScript and React
|When providing Custom Components have a choice of the following:
|
|1. Provide an ag-Grid component in JavaScript.
|1. Provide an ag-Grid component as an React Component.
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
|   components = {
|       'javascriptComponent': JavascriptComponent    
|   };
|   frameworkComponents = {
|       'reactComponent': ReactComponent    
|   };
|
|    return (
|        <div className="ag-theme-alpine">
|            <AgGridReact
|               components={components}
|               frameworkComponents={frameworkComponents}
|               ...other properties
|            >
|                <AgGridColumn headerName="JS Cell" field="value" cellRenderer="javascriptComponent" />
|                <AgGridColumn headerName="React Cell" field="value" cellRenderer="reactComponent" />
|            </AgGridReact>
|        </div>
|    );
|};
|```

