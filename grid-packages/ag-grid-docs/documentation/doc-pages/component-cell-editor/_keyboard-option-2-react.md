[[only-react]]
|
|```jsx
|const KEY_UP = 38;
|const KEY_DOWN = 40;
|
|const GridExample = () => {
|    // rest of the component
|
|    return (
|        <div
|            style={{
|                height: '100%',
|                width: '100%'
|            }}
|            className="ag-theme-alpine test-grid">
|            <AgGridReact ...rest of the definition...>
|                <AgGridColumn field="value"
|                              suppressKeyboardEvent={params => {
|                                   console.log('cell is editing: ' + params.editing);
|                                   console.log('keyboard event:', params.event);
|                            
|                                   // return true (to suppress) if editing and user hit up/down keys
|                                   const keyCode = params.event.keyCode;
|                                   const gridShouldDoNothing = params.editing && (keyCode===KEY_UP || keyCode===KEY_DOWN);
|                                   return gridShouldDoNothing;
|                              }}
|                />
|            </AgGridReact>
|        </div>
|    );
|};
||```
