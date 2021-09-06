---
title: "Row Dragging to an External DropZone"
---

Row Dragging to an External DropZone is concerned with moving rows from the grid to different components within the same application. When using row drag with an external DropZone, the data is moved or copied around using the grid events; this is in contrast to standard [Drag &amp; Drop](/drag-and-drop/) which uses browser events.

The Row Drag to an External DropZone uses the grid's internal Managed Row Dragging system combined with row selection
to create a seamless data drag and drop experience.

<api-documentation source='grid-api/api.json' section='rowDrag' names='["addRowDropZone", "removeRowDropZone"]'></api-documentation>


[[note]]
| If you read the [Managed Dragging](/row-dragging/#managed-dragging) section of the Row Dragging
| documentation you probably noticed that when you `sort`, `filter` and
| `rowGroup` the Grid, the managed Row Dragging stops working. The only exception to this
| rule is when you register external drop zones using `addRowDropZone`. In this case, you
| will be able to drag from one container to another, but will not be able to drag the rows within the
| grid.


## Adding and Removing Row Drop Targets

To allow dragging from the grid onto an outside element, or a different grid, call the `addRowDropZone` from the grid API. This will result in making the passed element or `Grid` a valid target when moving rows around. If you later wish to remove that drop zone use the `removeRowDropZone` method from the grid API.

```js
// define drop zone
const targetContainer = document.querySelector('.target-container');
const dropZoneParams = {
    getContainer: () => targetContainer,
    onDragStop: params => {
        // here we create an element for the target container
        const element = createElement(params.node.data);
        targetContainer.appendChild(element);
    }
};

// register drop zone with grid
gridApi.addRowDropZone(dropZoneParams);

// deregister the drop zone when no longer required
gridApi.removeRowDropZone(dropZoneParams);
```

In the example below, note the following:

- You can move rows inside the grid.
- You can move rows to the container on the right hand side.
- Toggle the checkbox to enable or disable [suppressMoveWhenRowDragging](/row-dragging/#suppress-move-when-dragging)

<grid-example title='Simple' name='simple' type='generated'></grid-example>

## Dragging Between Grids

It is possible to use a generic `DropZone` to Drag and Drop rows from one grid to another. However, this approach will treat the target grid as a generic `HTMLElement` and adding the rows should be handled by the `onDragStop` callback. If you wish the grid to manage the Drag and Drop across grids and also handle where the record should be dropped, take a look at
[Row Dragging - Grid to Grid](/row-dragging-to-grid/)

In the example below, note the following:

- Rows can be dragged from one grid to the other grid. When the row is received, it is **not** removed from the first grid. This is the choice of the example. The example could equally have removed from the other grid.

- If the row is already present in the grid, it will not be added twice. This happens because the grid will not allow duplicated IDs.

- Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.

- New rows can be created by clicking on the red, green and blue buttons.


<grid-example title='Two Grids' name='two-grids' type='multi' options='{ "extras": ["fontawesome"] }'></grid-example>
