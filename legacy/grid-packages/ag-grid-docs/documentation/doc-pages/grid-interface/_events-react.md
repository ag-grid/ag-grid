<framework-specific-section frameworks="react">
|
| To listen to an event pass a callback to the `AgGridReact` component for the given event. All events start with the prefix `on`, i.e the `cellClicked` event has the prop name `onCellClicked`.
| We recommend the use of  `useCallback` to avoid wasted renders: see [React Hooks](/react-hooks/).
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform="{false}" language="ts">
| const onCellClicked = useCallback((params: CellClickedEvent) => {
|   console.log('Cell was clicked')   
| }, []);
|
| &lt;AgGridReact onCellClicked={onCellClicked}> &lt;/AgGridReact>
</snippet>
</framework-specific-section>