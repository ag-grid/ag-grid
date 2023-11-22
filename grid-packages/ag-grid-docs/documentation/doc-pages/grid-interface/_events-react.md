<framework-specific-section frameworks="react">
|
| All event handlers are defined via props on the `AgGridReact` component.
|
</framework-specific-section>


<framework-specific-section frameworks="react">
| Provide your event handler to the relevant React Prop on the `AgGridReact` component.
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform="{false}" language="ts">
| const onCellClicked = (params: CellClickedEvent) => console.log('Cell was clicked');
|
| &lt;AgGridReact onCellClicked={onCellClicked}> &lt;/AgGridReact>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|
| When adding event listeners, you can optionally use `useCallback`. See [React Hooks](/react-hooks/) for best practices on using React Hooks with the grid.
|
</framework-specific-section>