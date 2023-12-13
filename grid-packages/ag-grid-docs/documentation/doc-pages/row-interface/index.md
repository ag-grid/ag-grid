---
title: "Row Overview"
---

Every row displayed in the grid is represented by a Row Node which exposes stateful attributes and methods for directly interacting with the row.

## Row Node

Row Nodes implement the `IRowNode<TData>` interface and in most cases wrap individual data items as supplied to the grid. Row nodes also contain runtime information about the row such as its current rowIndex. The Row Node contains attributes, methods and emits events. Additional attributes are used if the Row Node is a group. 

See [Row Reference](/row-object/) for a complete list of attributes / methods associated with rows.

## Row Events

Row Nodes fire events as they are updated which makes it possible to trigger logic in your application. 

<note>
Most users will not need to use Row Events but they are made available for advanced use cases. Please consider the guidance below.
</note>

### Row Event Guidance

All events fired by the `rowNode` are synchronous (events are normally asynchronous). The grid is also listening for these events internally. This means that when you receive an event, the grid  may still have some work to do (e.g. if `rowTop` changed, the grid UI may still have to update to reflect this change). 

It is recommended to **not** call any grid API functions while receiving events from the `rowNode`. Instead, it is best to put your logic into a timeout and call the grid in another VM tick.

### Row Event Listener Lifecycle

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
    })
}
```

See [Row Events](/row-events) for a complete list of row events. 


