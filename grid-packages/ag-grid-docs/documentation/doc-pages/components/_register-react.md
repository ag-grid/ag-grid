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
|Both options are fully supported by the grid, however registering by name is AG Grid's preferred option as it's more flexible.
|All of the examples in the documentation use this approach.
|The direct reference approach is kept for backwards compatibility as this was the original way to do it in AG Grid.
|
|### 1. By Name
|
|When registering a React component by name you need to first register the component within the grid `frameworkComponents` property,
|then reference the component by name where you want it used (i.e. as a Cell Renderer, Filter etc).
|
|In this example we've registered our `CubeComponent` React Component and given it a name of `cubeComponent` (this can be any name you choose).
|We then specify that we want the previously registered `cubeComponent` to be used as a Cell Renderer in the `Cube` column:
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
|When registering an Angular Component by reference you simply pass the Component to the place you want it used (i.e. Cell Renderer, Filter etc).
|
|In this example we're specifying that we want our `CubeComponent` React Component as a Cell Renderer in the `Cube` column:
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
|When registering by Direct Reference you do not need to specify it in `frameworkComponents`, but you lose future flexibility
|if you decide for example to switch this component out for another.
|
|[[note]]
||A React Component in this context can be any valid React Component - A Class Based Component, a Hook or even an inline
||Functional Component. 
||The same rules apply regardless of the type of component used.
