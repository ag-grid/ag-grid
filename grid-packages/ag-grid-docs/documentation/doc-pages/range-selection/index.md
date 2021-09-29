---
title: "Range Selection"
enterprise: true
---

Range selection allows Excel-like range selection of cells. Range selections are useful for visually highlighting data, copying data to the [Clipboard](/clipboard/), or for doing aggregations using the [Status Bar](/status-bar/).

## Selecting Ranges

Ranges can be selected in the following ways:

- **Mouse Drag:** Click the mouse down on a cell and drag and release the mouse over another cell. A range will be created between the two cells and clear any existing ranges.

- **Ctrl & Mouse Drag:** Holding <kbd>Ctrl</kbd> key while creating a range using mouse drag will create a new range selection and keep any existing ranges.

- **Shift & Click:** Clicking on one cell to focus that cell, then holding down <kbd>Shift</kbd> while clicking another cell, will create a range between both cells.

- **Shift & Arrow Keys:** Focusing a cell and then holding down <kbd>Shift</kbd> and using the arrow keys will create a range starting from the focused cell.

Range Selection is enabled using the following grid option property `enableRangeSelection=true`.

The example below demonstrates simple range selection. Ranges can be selected in all the ways described above.

<grid-example title='Range Selection' name='range-selection' type='generated' options='{ "enterprise": true, "modules": ["clientside", "range", "menu", "clipboard"] }'></grid-example>

## Suppress Multi Range Selection

By default multiple ranges can be selected. To restrict range selection to a single range, even if the <kbd>Ctrl</kbd> key is held down, enable the following grid options property: `suppressMultiRangeSelection=true`.

The following example demonstrates single range selection:

<grid-example title='Range Selection Suppress Multi' name='range-selection-suppress-multi' type='generated' options='{ "enterprise": true, "modules": ["clientside", "range", "menu", "clipboard"] }'></grid-example>

## Ranges with Pinning and Floating

It is possible to select a range that spans pinned and non-pinned sections of the grid. If you do this, the selected range will not have any gaps with regards to the column order. For example, if you start the drag on the left pinned area and drag to the right pinned area, then all of the columns in the center area will also be part of the range.

Likewise with floating, no row gaps will occur if a range spans into pinned rows. A range will be continuous between the floating top rows, the center, and the floating bottom rows.

The above two (pinning and floating) can be thought of as follows: if you have a grid with pinning and / or floating, then 'flatten out' the grid in your head so that all rows and columns are visible, then the range selection will work as you would expect in the flattened out version where only full rectangles can be selectable.

## Range Selection Changed Event

The `rangeSelectionChanged` event tells you that the range selection has changed. The event has two properties, `started` and `finished`, which are `true` when the selection is starting or finishing. For example, if selecting a range of 10 cells in a row, the user will click the first cell and drag to the last cell. This will result in up to 11 events. The first event will have `started=true`, the last will have `finished=true`, and all the intermediary events will have both of these values as `false`.

<api-documentation source='grid-events/events.json' section='selection' names='["rangeSelectionChanged"]' ></api-documentation>

## Range Selection API

The following methods are available on the `GridApi` for managing range selection.

### getCellRanges()

Get the selected ranges using `api.getCellRanges()`. This will return back a list of cell range objects, each of which contains the details of one range. 

The start is the first cell the user clicked on and the end is the cell where the user stopped dragging. Do not assume that the start cell's index is numerically before the end cell, as the user could have dragged up.

<api-documentation source='grid-api/api.json' section='selection' names='["getCellRanges"]' ></api-documentation>

### clearRangeSelection()

<api-documentation source='grid-api/api.json' section='selection' names='["clearRangeSelection"]' ></api-documentation>

### addCellRange(rangeSelection)

Adds a range to the selection. This keeps any previous ranges. If you wish to only have the new range selected, then call `clearRangeSelection()` first. The method takes the params of type `CellRangeParams`.

<api-documentation source='grid-api/api.json' section='selection' names='["addCellRange"]' ></api-documentation>

Ranges are normally bounded by a start and end row. However it is also possible to define a range unbounded by rows (i.e. to contain all rows). For an unbounded range, do not provide start or end row positions.

Row positions are defined by a row index and pinned. Row indexes start at zero and increment. Pinned can be either `'top'` (row is in pinned top section), `'bottom'` (row is in pinned bottom section) or `null` (row is in the main body). See [Row Pinning](/row-pinning/) for information on row pinning.

Ranges are defined by a list of columns. Pass in either a) a list of columns or b) a start and end column and let the grid work out the columns in between. Passing a list of columns instead of a start and end column has the advantage that the columns do not need to be contiguous.

## Copy Range Down

When you have more than one row selected in a range, pressing keys <kbd>Ctrl</kbd>+<kbd>D</kbd> will copy the top row values to all other rows in the selected range.

## Example: Advanced Range Selection

The example below demonstrates a more complex range selection scenario. The example listens for the `rangeSelectionChanged` event and creates a sum of all the number values that are in the range (it ignores all non-number values). The `finished` flag is used to update the eager and lazy figures separately.

The example also shows use of the `processCellForClipboard` and `processCellFromClipboard` [callbacks](/clipboard/#processing-clipboard-data) by making all the athlete names uppercase when copying into the clipboard and lowercase when copying from the clipboard.

<grid-example title='Advanced Range Selection' name='range-selection-advanced' type='generated' options='{ "enterprise": true, "exampleHeight": 700, "modules": ["clientside", "range", "menu", "clipboard"] }'></grid-example>
