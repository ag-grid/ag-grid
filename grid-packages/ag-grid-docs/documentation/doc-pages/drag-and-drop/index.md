---
title: "Drag & Drop"
---

Drag & Drop is concerned with moving data around an application, or between applications, using the operating system drag and drop support. When using drag and drop, data is moved or copied around using MIME types in a way similar to using the clipboard.

Native drag and drop is typically used for moving data between applications, e.g. moving a URL from an email into a web browser to open the URL, or moving a file from a file explorer application to a text editor application. Native drag and drop is not typically used for operating on data inside an application. Native drag and drop is similar to clipboard functionality, e.g. data must be represented as MIME types and objects cannot be passed by reference (the data must be converted to a MIME type and copied).

This section outlines how the grid fits in with native operating system drag and drop. It is assumed the reader is familiar with how drag and drop works. If not, refer to one of the following introductions:

- [W3C Schools](https://www.w3schools.com/html/html5_draganddrop.asp)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

[[note]]
| The grid implements its own drag and drop separate to the operating system drag and drop.
| It is used internally by the grid for
| [Row Dragging](/row-dragging/) (for reordering rows) and for column dragging
| (e.g. re-ordering columns or moving columns in the [Column Tool Panel](/tool-panel-columns/)).
| The grid uses its own implementation in these instances as it needs finer control over the data
| than native browser drag & drop supports. For example, the native d&d does not provide
| access to the dragged item until after the drag operation is complete.

## Enable Drag Source

To allow dragging from the grid, set the property `dndSource=true` on one of the columns.
This will result in the column having a drag handle displayed. When the dragging starts, the grid
will by default create a JSON representation of the data and set this as MIME types `application/json` and also `text/plain`.


<api-documentation source='column-properties/properties.json' section='row dragging' names='["dndSource"]'></api-documentation>

In the example below, note the following:

- The first column has `dndSource=true`, so staring a mouse drag on a cell in the first column will start a drag operation.

- When the data is dragged to the drop zone, the drop zone will display the received JSON. This is because the drop zone is programmed to accept `application/json` MIME types.

- You can also drag to other applications outside of the browser. For example, some text editors (eg Sublime Text) or word processors (eg Microsoft Word) will accept the drag based on the `text/plain` MIME type. You can test this by dragging a cell to e.g. Microsoft Word.

<grid-example title='Simple' name='simple' type='generated'></grid-example>

## Dragging Between Grids

It is possible to drag rows between two instances of AG Grid. The drag is done exactly like the simple case described above. The drop is done as demonstrated in the example below.

In the example below, note the following:

- Rows can be dragged from one grid to the other grid. When the row is received, it is **not** removed from the first grid. This is the choice of the example. The example could equally have removed from the other grid.

- If the row is already present in the grid, it will not be added twice. Again this is the choice of the example.

- Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.

- New rows can be created by dragging out from red, green and blue 'Create' draggable areas.

<grid-example title='Two Grids' name='two-grids' type='mixed' options='{ "extras": ["fontawesome"] }'></grid-example>

Note that there is no specific drop zone logic in the grid. This was done on purpose after analysis.

On initial analysis, consideration was given to exposing callbacks or firing events in the grid for the drop zone relevant events e.g. `onDragEnter`, `onDragExit` etc. However this did not add any additional value given that the developer can easily add such event listeners to the grid div directly.

Given that the grid would be simply exposing the underlying events / callbacks rather than doing any processing itself, it would not be adding any value and so providing such callbacks would just be adding a layer of useless logic.

## Custom Drag Data

It is possible that a JSON representation of the data is not what is required as the drag data.

To provide alternative drag data, use the `dndSourceOnRowDrag` callback on the column definition. This allows specific processing by the application for the `rowdrag` even rather than the default grid behaviour.

<api-documentation source='column-properties/properties.json' section='row dragging' names='["dndSourceOnRowDrag"]' ></api-documentation>

The example below is identical to the first example on this page with the addition of custom drag data. Note the following:

- The draggable column also has `dndSourceOnRowDrag` set.
- The `onRowDrag` method provides an alternative piece of drag data to be set into the drag event.
- The data dragged also includes row state such as whether the rows is selected or not.

<grid-example title='Custom Drag Data' name='custom-drag-data' type='generated'></grid-example>

## Custom Drag Component

Drag and drop is a complex application-level requirement. As such, a component (the grid) can't propose a drag and drop solution that is appropriate for all applications. For this reason, if the application has drag and drop requirements, you would likely want to implement a custom [Cell Renderer](/component-cell-renderer/) specifically for your needs.

The example below shows a custom drag and drop cell renderer. Note the following:

- The dragging works similar to before, rows are dragged from the left grid to the right drop zone.
- The grid does not provide the dragging. Instead, the example's cell renderer implements the drag logic.

<grid-example title='Custom Drag Component' name='custom-drag-comp' type='generated' options='{  }'></grid-example>
