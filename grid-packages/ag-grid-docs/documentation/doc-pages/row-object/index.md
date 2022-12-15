---
title: "Row Object (aka Row Node)"
---

A Row Node represents one row of data. 

The Row Node will contain a reference to the data item your application provided as well as other runtime information about the row. The Row Node contains attributes, methods and emits events. Additional attributes are used if the Row Node is a group.

If using Typescript, Row Nodes' support a generic data type via `RowNode<TData>`. If not set `TData` defaults to `any`. See [Typescript Generics](/typescript-generics) for more details.

<api-documentation source='resources/reference.json'></api-documentation>
<api-documentation source='resources/methods.json' config='{ "isApi": true }'></api-documentation>

## Row Node Events

All events fired by the `rowNode` are synchronous (events are normally asynchronous). The grid is also listening for these events internally. This means that when you receive an event, the grid  may still have some work to do (e.g. if `rowTop` changed, the grid UI may still have to update to reflect this change). It is also best you do not call any grid API functions while receiving events from the `rowNode` (as the grid is still processing). Instead, it is best to put your logic into a timeout and call the grid in another VM tick.

When adding event listeners to a row, they will stay with the row until the row is destroyed. This means if the row is taken out of memory (pagination or virtual paging) then the listener will be removed. Likewise, if you set new data into the grid, all listeners on the old data will be removed.

Be careful when adding listeners to `rowNodes` in cell renderers that you remove the listener when the rendered row is destroyed due to row virtualisation. You can cater for this as follows:

```js
init(params: ICellRendererParams) {
    // add listener
    var selectionChangedCallback = () => {
        // some logic on selection changed here
        console.log('node selected = ' + params.node.isSelected());
    };

    params.node.addEventListener('rowSelected', selectionChangedCallback);

    // remove listener on destroy
    params.api.addRenderedRowListener('virtualRowRemoved', params.rowIndex, () => {
        params.node.removeEventListener('rowSelected', selectionChangedCallback);
    }
}
```
<api-documentation source='resources/events.json'></api-documentation>

