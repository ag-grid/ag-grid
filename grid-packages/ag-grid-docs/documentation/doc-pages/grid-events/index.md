---
title: "Grid Events"
---

This is a list of the events that the grid raises.

[[only-javascript]]
|
|You register callbacks for these events through the `GridOptions` interface.
|The name of the callback is constructed by prefixing the event name with `on`. For example, the callback for the `cellClicked` event is `gridOptions.onCellClicked`.
|
|```ts
| const gridOptions = {
|     // Add event handlers
|     onCellClicked: (event: CellClickedEvent) => console.log('Cell was clicked'),
| }
|```
|[[note]]
|| TypeScript users can take advantage of the events' interfaces. You can construct the interface name by suffixing the event name with `Event`. For example, the `cellClicked` event uses the interface `CellClickedEvent`.


[[only-angular]]
| Provide your event handler to the relevant `Output` property on the `ag-grid-angular` component. Note that the 'on' prefix is not part of the output name. 
|
| ```html
| <ag-grid-angular (cellClicked)="onCellClicked($event)">
| ```

[[only-react]]
| Provide your event handler to the relevant React Prop on the `AgGridReact` component.
|
| ```tsx
| const onCellClicked = (params: CellClickedEvent) => console.log('Cell was clicked');
|
| <AgGridReact onCellClicked={onCellClicked}> </AgGridReact>
| ```
|
| ## React Hooks
|
| When adding event listeners, you can optionally use `useCallback`. See [React Hooks](/react-hooks/) for best practices on using React Hooks with the grid.
|

[[only-vue]]
| Provide your event handler to the relevant event callback on the `ag-grid-vue` component.
|
| ```jsx
| onCellClicked = (params) => console.log('Cell was clicked');
|
| <ag-grid-vue @cell-clicked="onCellClicked"> </ag-grid-vue> 
| ```

[[only-frameworks]]
|
| ## Registering via Grid Options
|
|Registering the event onto the grid component as shown above is the recommendey way. However additionally a callback can be put on the [Grid Options](/grid-interface/#grid-options-3), if you are using a Grid Options object.
|The name of the callback is constructed by prefixing the event name with `on`. For example, the callback for the `cellClicked` event is `gridOptions.onCellClicked`.
|
|```ts
| const gridOptions = {
|     // Add event handlers
|     onCellClicked: (event: CellClickedEvent) => console.log('Cell was clicked'),
| }
|```

## List of Events

The following are all events emitted by the grid. If using TypeScript, you can reference the interface for each event.

<api-documentation source='events.json' ></api-documentation>
