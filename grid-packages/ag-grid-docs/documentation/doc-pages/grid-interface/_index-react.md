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
| ## Access the Grid API
|
| The api of the grid can be accessed via a ref defined in your component when passed to the grid's ref: `&lt;AgGridReact ref={gridRef}`.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // React reference
| const gridRef = useRef();
|
| const myListener = useCallback(()=> {
|     // api on the gridRef object
|     const {api} = gridRef.current;
|
|     // api will be null before grid initialised
|     if (api == null) { return; }
|
|     // access the Grid API
|     gridRef.api.deselectAll();
|
| }, []);
|
| &lt;button click={myListener}>Do Something&lt;/button>
| &lt;AgGridReact
|     ref={gridRef}
|     //...
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The `api` is also provided on the params for all grid events and callbacks for easy access to the api.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // access api from the event
| onGridReady = event => {
|     event.api.sizeColumnsToFit();
|     event.api.resetColumnState();
| }
|
| // access api from callback params
| sendToClipboard = params => {
|     params.api.sizeColumnsToFit();
|     params.api.resetColumnState();
| }
|
| &lt;AgGridReact
|     onGridReady={onGridReady} // register event listener
|     sendToClipboard={sendToClipboard} // register callback
|     //...
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>
| The gridRef value will not be defined until after the AgGridReact component has been initialised.
| If you want to access the api as soon as it's available (ie do initialisation
| work), consider listening to the `gridReady` event.
</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Grid Options
|
| The `gridOptions` object also contains all the props available on the AgGridReact component.
| Grid options can be used instead of, or in addition to, normal framework bindings. If an option is set via `gridOptions`, as well as a property on the component, then the component property will take precedence.
|
| The GridOptions interface supports a generic parameter for row data as detailed in [Typescript Generics](/typescript-generics).
|
| The example below shows the different types of items available on `gridOptions`.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| const gridOptions = {
|     // PROPERTIES
|     pagination: true,
|     rowSelection: 'single',
|
|     // EVENTS
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked'),
|     onGridReady: event => console.log('The grid is now ready'),
|
|     // CALLBACKS
|     getRowHeight: (params) => 25
| }
| &lt;AgGridReact
|     gridOptions={gridOptions}
|
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| Note the if using Grid Options, the grid will not react to property changes. For example `gridOptions.pagination` will only get used once when the grid is initialised, not if you change `gridOptions.pagination` after the grid is initialised. For this reason, while using React, it's best only use Grid Options for properties that do not change.
</framework-specific-section>
