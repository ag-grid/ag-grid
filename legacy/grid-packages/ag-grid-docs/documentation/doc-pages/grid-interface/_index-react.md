<framework-specific-section frameworks="react">
| The grid is configure via props on the `AgGridReact` component. Props consist of simple types, arrays, complex objects and callback functions.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| &lt;AgGridReact
|    // Simple attributes
|    rowSelection="multiple"
|    // Component state 
|    columnDefs={columnDefs}
|    // Callback
|    getRowHeight={getRowHeight}
|    // Event handlers
|    onCellClicked={onCellClicked}
| />
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
 <warning>
 When setting properties, it's best to treat non-simple types as immutable objects (e.g. by using `useState` or `useMemo`). See [React Hooks](https://ag-grid.com/react-data-grid/react-hooks/) for best practices.
 </warning>
</framework-specific-section>
