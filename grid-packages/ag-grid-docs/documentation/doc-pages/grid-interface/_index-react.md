<framework-specific-section frameworks="react">
|
| ## Properties, Events, Callbacks and API
|
| - **Properties**: properties are defined by passing React props down to AG Grid (e.g. `columnDefs={this.state.columnDefs}`)
| - **Callbacks**: callbacks are also defined using React Props (e.g. `getRowHeight={this.myGetRowHeightFunction}`).
| - **Event Handlers**: event handlers are also defined using React Props (e.g. `onCellClicked={this.onCellClicked}`).
| - **API**: grid api can be used to control the grid
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
|    getRowHeight={myGetRowHeightFunction}
|
|    // these are registering event callbacks
|    onCellClicked={onCellClicked}
|    onColumnResized={onColumnEvent}
|
|    // inside onGridReady, you receive the grid api if you want them
|    onGridReady={onGridReady}
| />
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="react">
| ## React Hooks
|
| When setting properties, it's best to treat non-simple types as immutable objects (e.g. by using `useState` or `useMemo`). See [React Hooks](/react-hooks/) for best practices on using React Hooks with the grid.
|
| ## Access the Grid API
|
| The api of the grid can be referenced through the component's reference.
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // React reference
| const gridRef = useRef();
|
| const myListener = ()=> {
|     // api on the gridRef object
|     const {api} = gridRef.current;
|
|     // api will be null before grid initialised
|     if (api == null) { return; }
|
|     // access the Grid API
|     gridRef.api.deselectAll();
|
| }
|
| &lt;button click={myListener}>Do Something&lt;/button>
| &lt;AgGridReact
|     ref={gridRef}
|     //...
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The api is also provided as part of props for all grid events and callbacks.
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
| The gridRef will not be defined until after the AgGridReact component has been initialised.
| If you want to access the api as soon as it's available (ie do initialisation
| work), consider listening to the `gridReady` event.
</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ## Grid Options
|
| The `gridOptions` object contains all the props available to configure the AgGridReact component.
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
|     // Objects like myRowData and myColDefs would be created in your application
|     rowData: myRowData,
|     columnDefs: myColDefs,
|     pagination: true,
|     rowSelection: 'single',
|
|     // EVENTS
|     // Add event handlers
|     onRowClicked: event => console.log('A row was clicked'),
|     onColumnResized: event => console.log('A column was resized'),
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
| Note the if using Grid Options, the grid will not react to property changes. For example `gridOptions.rowData` will only get used once when the grid is initialised, not if you change `gridOptions.rowData` after the grid is initialised. For this reason, while using React, it's best only use Grid Options for properties that do not change.
</framework-specific-section>
