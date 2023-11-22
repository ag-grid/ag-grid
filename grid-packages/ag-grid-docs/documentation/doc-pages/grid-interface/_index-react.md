<framework-specific-section frameworks="react">
|
| All properties, callbacks are defined via props on the `AgGridReact` component.
|
| ### Initial Only 
|
| TODO: Explain initial only vs reactive
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| &lt;AgGridReact
|    // Reference to component including the grid's api
|    ref={gridRef}
|    // Simple attributes
|    rowSelection="multiple"
|    // State item
|    columnDefs={columnDefs}
|    // Callback function
|    getRowHeight={myGetRowHeightCallback}
|    // Event handlers
|    onCellClicked={onCellClicked}
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
 <warning>
 When setting properties, it's best to treat non-simple types as immutable objects (e.g. by using `useState` or `useMemo`). See [React Hooks](/react-hooks/) for best practices.
 </warning>
</framework-specific-section>