<framework-specific-section frameworks="react">
|For all custom components, you should enable the grid option `reactiveCustomComponents`. This provides the simplest way to set up custom components when using Hooks.
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>If your custom component was built in an imperative way instead of setting the `reactiveCustomComponents` option, it needs to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be true by default.  See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents).</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
|There are two ways to register custom components:
|
|- Direct reference.
|- By name.
|
|### 1. By Direct Reference
|
|When registering a React Component by reference you simply pass the Component to the place you want it used (i.e. Cell Renderer, Filter etc).
|
|In this example we're specifying that we want our React `CubeComponent` as a Cell Renderer in the `Cube` column:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|//...other imports
|import CubeComponent from './CubeComponent';
|
|const GridExample = () => {
|   // other properties & methods
|   
|    const columnDefs = useMemo( () => [{field: 'value', cellRenderer: CubeComponent}], []);
|
|    return (
|         &lt;AgGridReact
|            columnDefs={columnDefs}
|            ...other properties            
|         />
|    );
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|The advantage of referencing Components directly is cleaner code, without the extra level of indirection added when referencing by name.
|
|### 2. By Name
|
|When registering a React component by name you need to first register the component within the grid `components` property,
|then reference the component by name where you want it used (i.e. as a Cell Renderer, Filter etc).
|
|In this example we've registered our React `CubeComponent` and given it a name of `cubeComponent` (this can be any name you choose).
|We then specify that we want the previously registered `cubeComponent` to be used as a Cell Renderer in the `Cube` column:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|//...other imports
|import CubeComponent from './CubeComponent';
|
|const GridExample = () => {
|   // other properties & methods
|   
|   const components = useMemo(() => ({
|       cubeComponent: CubeComponent    
|   }), []);
|
|   const columnDefs = useMemo(() => [{field: 'value', cellRenderer: 'cubeComponent'}], []);
|
|   return (
|         &lt;AgGridReact
|            components={components}
|            columnDefs={columnDefs}
|            ...other properties            
|         />
|   );
|};
</snippet> 
</framework-specific-section>

<framework-specific-section frameworks="react">
|The advantage of referencing components by name is definitions (eg Column Definitions) can be composed of simple types (ie JSON), which is useful should you wish to persist Column Definitions.
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>
|A React Component in this context can be any valid React Component - A Class Based Component, a Hook or even an inline
|Functional Component. 
|The same rules apply regardless of the type of component used.
</note>
</framework-specific-section>
