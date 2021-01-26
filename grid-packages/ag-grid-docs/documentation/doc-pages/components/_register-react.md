[[only-react]]
|
|## Registering Custom Components
|
|The pages for each component type (cell renderer, cell editor etc) contain examples on how to register and use each component type.
|It is however useful here to step back and focus on the component registration process which is common across all component types.
|
|There are two ways to register custom components:
|
|- By name.
|- Direct reference.
|
|Both options are fully supported by the grid, however registering by name is ag-Grid's preferred options as it's more flexible.
|All of the examples in the documentation use this approach.
|The direct reference approach is kept for backwards compatibility reasons as this was the original way to do it in ag-Grid.
|
|### 1. By Name
|
| To use an React component within the grid you will reference components by name, for example:
|
|```jsx
|//...other imports
|import CubeComponent from './CubeComponent';
|
|const GridExample = () => {
|   // other properties & methods
|   
|   frameworkComponents = {
|       'cubeComponent': CubeComponent    
|   };
|
|    return (
|        <div className="ag-theme-alpine">
|            <AgGridReact
|               frameworkComponents={frameworkComponents}
|               ...other properties
|            >
|                <AgGridColumn headerName="Cube" field="value" cellRenderer="cubeComponent" />
|            </AgGridReact>
|        </div>
|    );
|};
|```
|### 2. By Direct Reference
|
|```jsx
|//...other imports
|import CubeComponent from './CubeComponent';
|
|const GridExample = () => {
|   // other properties & methods
|   
|    return (
|        <div className="ag-theme-alpine">
|            <AgGridReact
|               ...other properties            
|            >
|                <AgGridColumn headerName="Cube" field="value" cellRendererFramework={CubeComponent} />
|            </AgGridReact>
|        </div>
|    );
|};
|```
