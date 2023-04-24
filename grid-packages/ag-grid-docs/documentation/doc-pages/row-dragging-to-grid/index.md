---
title: "Row Dragging Between Grids"
---

Row Drag Between Grids is concerned with seamless integration among different grids, allowing records to be dragged from one grid and dropped at a specific index on another grid.

<api-documentation source='grid-api/api.json' section='rowDrag' names='["addRowDropZone", "removeRowDropZone", "getRowDropZoneParams"]'></api-documentation>

## Adding a Grid as Target

To allow adding a grid as DropZone, the `getRowDropZoneParams` API method should be used in the target grid and the `addRowDropZone` in the source grid.


```js
var dropZoneParams = targetGridApi.getRowDropZoneParams({
    onDragStop: function() {
        alert('Record Dropped!');
    }
});

sourceGridApi.addRowDropZone(dropZoneParams);

// when the DropZone above is no longer needed
sourceGridApi.removeRowDropZone(dropZoneParams);
```

In the example below, note the following:

- When you drag from one grid to another, a line will appear indicating where the row will be placed.

- Rows can be dragged from one grid to the other grid. When the row is received, it is **not**
removed from the first grid. This is the choice of the example. The example could equally have removed
from the other grid.

- Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.

- New rows can be created by clicking on the red, green and blue buttons.

<grid-example title='Two Grids with Drop Position' name='two-grids-with-drop-position' type='mixed' options='{ "extras": ["fontawesome"] }'></grid-example>

## Dragging Multiple Records Between Grids

It is possible to drag multiple records at once from one grid to another.

In the example below, note the following:

- This example allows for `rowDragMultiRow`, between grids. For more info on `multiRowDrag` within the grid see the [Multi-Row Dragging](/row-dragging/#multi-row-dragging) section in the Row Dragging documentation.

- This example allows you to toggle between regular `multiRow` selection and `checkboxSelection`. For more info see the [Row Selection](/row-selection/) documentation.

- When `Remove Source Rows` is selected, the rows will be removed from the **Athletes** grid once they are dropped onto the **Selected Athletes** grid.

- If `Only Deselect Source Rows` is selected, all selected rows that were copied will be deselected but will not be removed.<br /> Note: If some rows are selected and a row that isn't selected is copied, the selected rows will remain selected.

- If `None` is selected, the rows will be copied from one grid to another and the source grid will stay as is.

<grid-example title='Multiple Records with Drop Position' name='two-grids-with-multiple-records' type='mixed' options='{ "extras": ["fontawesome", "bootstrap"] }'></grid-example>

