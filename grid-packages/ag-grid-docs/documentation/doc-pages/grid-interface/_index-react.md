<framework-specific-section frameworks="react">
|
| ## Properties, Callbacks, Events
|
| Properties, callbacks and event handlers are all defined via props on the `AgGridReact` component. 
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| &lt;AgGridReact
|    ref={gridRef} // useful for accessing the grid's api
|
|    rowSelection="multiple" // simple attributes, not bound to any state or prop
|
|    // these are bound props, so can use anything in React state or props
|    columnDefs={columnDefs}
|    showToolPanel={showToolPanel}
|
|    // this is a callback
|    getRowHeight={myGetRowHeightCallback}
|
|    // these are registering event handlers
|    onCellClicked={onCellClicked}
|    onColumnResized={onColumnEvent}
|
|    // inside onGridReady, you receive the grid api
|    onGridReady={onGridReady}
| />
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
| ## React Hooks
|
| When setting properties, it's best to treat non-simple types as immutable objects (e.g. by using `useState` or `useMemo`). See [React Hooks](/react-hooks/) for best practices.
|
</framework-specific-section>
