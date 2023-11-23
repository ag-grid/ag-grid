<framework-specific-section frameworks="react">
| The api of the grid can be accessed via a ref passed to the `AgGridReact` component.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // Create a gridRef
| const gridRef = useRef();
|
| const onClick = useCallback(() => {
|     // Use the gridRef to access the api
|     gridRef.current?.api.deselectAll();
| }, []);
|
| &lt;AgGridReact ref={gridRef}  />
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<warning>
| The gridRef.current value will not be defined until after the AgGridReact component has been initialised.
| If you want to access the api as soon as it's available (ie do initialisation
| work), consider listening to the `gridReady` event.
</warning>
</framework-specific-section>

<framework-specific-section frameworks="react">
| The `api` is also provided on the params for all grid events and callbacks.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| // access api directly within event handler
| onGridReady = useCallback((event: GridReadyEvent) => {
|     event.api.resetColumnState();
| },[]);
|
| &lt;AgGridReact onGridReady={onGridReady} />
</snippet>
</framework-specific-section>