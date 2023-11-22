<framework-specific-section frameworks="react">
| The api of the grid can be accessed via a ref passed to the `AgGridReact` component.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // Create a ref to pass to the grid
| const gridRef = useRef();
|
| const onClick = useCallback(()=> {
|     
|    // gridRef.current will be undefined until the grid is initialised
|    if (!gridRef.current) { return; }
|
|     // use the Grid API
|     gridRef.current.api.deselectAll();
|
| }, []);
|
| &lt;button click={onClick}>Deselect Rows&lt;/button>
| &lt;AgGridReact
|     ref={gridRef}
|     //...
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
| ### API within Events and Callbacks
|
| The `api` is also provided on the params for all grid events and callbacks.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // access api from the event
| onGridReady = useCallback((event: GridReadyEvent) => {
|     event.api.resetColumnState();
| },[]);
|
| // access api from callback params
| sendToClipboard = useCallback((params) => {
|     params.api.resetColumnState();
| }, []);
|
| &lt;AgGridReact
|     onGridReady={onGridReady}
|     sendToClipboard={sendToClipboard}
|     //...
| />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>
| The gridRef.current value will not be defined until after the AgGridReact component has been initialised.
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
| Note the if using Grid Options, the grid will not react to property changes. For example `gridOptions.pagination` will only get used once when the grid is initialised, not if you change `gridOptions.pagination` after the grid is initialised. For this reason, while using React, it's best to only use Grid Options for properties that do not change.
</framework-specific-section>
