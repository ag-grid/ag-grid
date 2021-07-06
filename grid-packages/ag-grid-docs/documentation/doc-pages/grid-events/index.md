---
title: "Grid Events"
---

This is a list of the events that the grid raises. You can register callbacks for these events through the `GridOptions` interface.

The name of the callback is constructed by prefixing the event name with `on`. For example, the callback for the `cellClicked` event is `gridOptions.onCellClicked`.

[[note]]
| TypeScript users can take advantage of the events' interfaces. You can construct the interface name by suffixing the event name with `Event`. For example, the `cellClicked` event uses the interface `CellClickedEvent`.

[[note]]
| See the [Event Properties and Hierarchy](#properties-and-hierarchy) section below to find out what properties each event has.

<api-documentation source='events.json'></api-documentation>

## Event Properties and Hierarchy

Below shows the event hierarchy and properties. All properties are inherited. For example the `CellValueChangedEvent` interface has the following properties:

```ts
interface CellValueChangedEvent {
    type, api, columnApi, // -> properties from AgEvent
    node, data, rowIndex, rowPinned, context, event, // -> properties from RowEvent
    column, colDef, value, // -> properties from CellEvent
    oldValue, newValue // -> properties from CellValueChangedEvent
}
```

<pre class="event-hierarchy">
<span class="event-hierarchy__property">//---------------------------------------------------------//</span>
<span class="event-hierarchy__property">// Event hierarchy, and properties, for all AG Grid events //</span>
<span class="event-hierarchy__property">//---------------------------------------------------------//</span>
└── AgEvent <span class="event-hierarchy__property">{
    │     <span class="event-hierarchy__attribute">type</span>: string, // the event type, eg 'sortChanged' or 'columnResized'
    │   }</span>
    └── AgGridEvent
        │     <span class="event-hierarchy__attribute">api</span>: GridAPI, // the Grid API
        │     <span class="event-hierarchy__attribute">columnApi</span>: ColumnAPI // the Column API
        │   }</span>
        ├── GridReadyEvent <span class="event-hierarchy__property">{}</span>
        ├── SelectionChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── SortChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── RowDataChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── RowDataUpdatedEvent <span class="event-hierarchy__property">{}</span>
        ├── PinnedRowDataChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── NewColumnsLoadedEvent <span class="event-hierarchy__property">{}</span>
        ├── GridColumnsChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── VirtualColumnsChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── ColumnPivotModeChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── ColumnEverythingChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── DisplayedColumnsChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── ToolPanelVisibleChangedEvent <span class="event-hierarchy__property">{}</span>
        ├── AnimationQueueEmptyEvent <span class="event-hierarchy__property">{}</span>
        ├── FilterChangedEvent <span class="event-hierarchy__property">{</span>
        │       <span class="event-hierarchy__attribute">afterFloatingFilter</span>: Column, // if filter was changed via floating filter
        │       <span class="event-hierarchy__attribute">afterDataChange</span>: number, // if filter was changed as a result of data changing
        │     }</span>
        ├── FilterModifiedEvent <span class="event-hierarchy__property">{</span>
        │       <span class="event-hierarchy__attribute">column</span>: Column, // the column for the event
        │       <span class="event-hierarchy__attribute">filterInstance</span>: number, // the filter instance
        │     }</span>
        ├── CellFocusedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">rowIndex</span>: number, // the row index of the focused cell
        │       <span class="event-hierarchy__attribute">column</span>: Column, // the column of the focused cell
        │       <span class="event-hierarchy__attribute">rowPinned</span>: string, // either 'top', 'bottom' or undefined/null (if not pinned)
        │       <span class="event-hierarchy__attribute">isFullWidthCell</span>: boolean, // whether the cell is a full width cell or regular cell.
        │       <span class="event-hierarchy__attribute">forceBrowserFocus</span>: boolean // whether browser focus is also set (false when editing)
        │     }</span>
        ├── ViewportChangedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">firstRow</span>: number, // the index of the first rendered row
        │       <span class="event-hierarchy__attribute">lastRow</span>: number // the index of the last rendered row
        │     }</span>
        ├── FirstDataRendereredEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">firstRow</span>: number, // the index of the first rendered row
        │       <span class="event-hierarchy__attribute">lastRow</span>: number // the index of the last rendered row
        │     }</span>
        ├── GridSizeChangedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">clientWidth</span>: number, // the grids DIV's clientWidth
        │       <span class="event-hierarchy__attribute">clientHeight</span>: number // the grids DIV's clientHeight
        │     }</span>
        ├── RangeSelectionChangedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">started</span>: boolean, // true for first event in a sequence of dragging events
        │       <span class="event-hierarchy__attribute">finished</span>: boolean // true for last event in sequence of dragging events
        │     }</span>
        ├── ColumnGroupOpenedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">columnGroup</span>: OriginalColumnGroup // the original column group that was opened
        │     }</span>
        ├── BodyScrollEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">direction</span>: string // either 'horizontal' or 'vertical'
        │       <span class="event-hierarchy__attribute">top</span>: number // top px of the scroll
        │       <span class="event-hierarchy__attribute">left</span>: number // left px of the scroll
        │     }</span>
        ├── PaginationChangedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">animate</span>: boolean, // true if rows were animated to new position
        │       <span class="event-hierarchy__attribute">keepRenderedRows</span>: boolean, // true if rows were kept (otherwise complete redraw)
        │       <span class="event-hierarchy__attribute">newData</span>: boolean, // true if data was new (ie user set new data)
        │       <span class="event-hierarchy__attribute">newPage</span>: boolean // true if user went to a new pagination page
        │     }</span>
        ├── ModelUpdatedEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">animate</span>: boolean, // true if rows were animated to new position
        │       <span class="event-hierarchy__attribute">keepRenderedRows</span>: boolean, // true if rows were kept (otherwise complete redraw)
        │       <span class="event-hierarchy__attribute">newData</span>: boolean, // true if data was new (ie user set new data)
        │       <span class="event-hierarchy__attribute">newPage</span>: boolean // true if user went to a new pagination page
        │     }</span>
        ├── ComponentStateChangedEvent <span class="event-hierarchy__property">{
        │       // one attribute for each changed property
        │     }</span>
        ├── ExpandCollapseAllEvent <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">source</span>: string
        │     }</span>
        ├── AsyncTransactionsFlushed <span class="event-hierarchy__property">{
        │       <span class="event-hierarchy__attribute">results</span>: (RowNodeTransaction | ServerSideTransactionResult) []
        │     }</span>
        ├── DragEvent <span class="event-hierarchy__property">{
        │   │    <span class="event-hierarchy__attribute">type</span>: string, // one of {'cell','row','headerCell','toolPanel'}
                 <span class="event-hierarchy__attribute">target</span>: HTMLElement, // The DOM element that started the event.
        │   │  }</span>
        │   ├── DragStartedEvent <span class="event-hierarchy__property">{}</span>
        │   ├── DragStoppedEvent <span class="event-hierarchy__property">{}</span>
        ├── RowDragEvent <span class="event-hierarchy__property">{ // abstract event, never fired
        │   │    <span class="event-hierarchy__attribute">event</span>: MouseEvent, // The underlying mouse move event associated with the drag.
        │   │    <span class="event-hierarchy__attribute">node</span>: RowNode, // The row node getting dragged. Also the node that started the drag when multi-row dragging.
        │   │    <span class="event-hierarchy__attribute">nodes</span>: RowNode[], // The list of nodes being dragged.
        │   │    <span class="event-hierarchy__attribute">overIndex</span>: number, // The row index the mouse is dragging over.
        │   │    <span class="event-hierarchy__attribute">overNode</span>: RowNode, // The row node the mouse is dragging over.
        │   │    <span class="event-hierarchy__attribute">y</span>: number, // The vertical pixel location the mouse is over.
        │   │    <span class="event-hierarchy__attribute">vDirection</span>: string, // Direction of the drag, either 'up', 'down' or null.
        │   │  }</span>
        │   ├── RowDragEnterEvent <span class="event-hierarchy__property">{}</span> // row drag has started / re-entered
        │   ├── RowDragMoveEvent <span class="event-hierarchy__property">{}</span> // mouse moved while dragging
        │   ├── RowDragEndEvent <span class="event-hierarchy__property">{}</span> // row drag finished while mouse over grid
        │   ├── RowDragLeaveEvent <span class="event-hierarchy__property">{}</span> // mouse left grid while dragging
        ├── ColumnEvent <span class="event-hierarchy__property">{
        │   │    <span class="event-hierarchy__attribute">column</span>: Column, // the impacted column, only set if action was on one column
        │   │    <span class="event-hierarchy__attribute">columns</span>: Column[] // list of all impacted columns
        │   │    <span class="event-hierarchy__attribute">source</span>: string // A string describing where the event is coming from
        │   │  }</span>
        │   ├── ColumnPivotChangedEvent <span class="event-hierarchy__property">{}</span> // a column was added / removed to pivot list
        │   ├── ColumnRowGroupChangedEvent <span class="event-hierarchy__property">{}</span> // a column was added / removed to row group list
        │   ├── ColumnValueChangedEvent <span class="event-hierarchy__property">{}</span> // a column was added / removed to values list
        │   ├── ColumnMovedEvent <span class="event-hierarchy__property">{
        │   │        <span class="event-hierarchy__attribute">toIndex</span>: number // the position the column was moved to
        │   │      }</span>
        │   ├── ColumnResizedEvent <span class="event-hierarchy__property">{
        │   │        <span class="event-hierarchy__attribute">finished</span>: boolean // set to true for last event in a sequence of move events
        │   │        <span class="event-hierarchy__attribute">flexColumns</span>: Column[] // any columns resized due to flex
        │   │      }</span>
        │   ├── ColumnVisibleEvent <span class="event-hierarchy__property">{
        │   │        <span class="event-hierarchy__attribute">visible</span>: boolean // true if column was set to visible, false if set to hide
        │   │      }</span>
        │   └── ColumnPinnedEvent <span class="event-hierarchy__property">{
        │            <span class="event-hierarchy__attribute">pinned</span>: string // either 'left', 'right', or undefined / null (it not pinned)
        │          }</span>
        └── RowEvent <span class="event-hierarchy__property">{
            │     <span class="event-hierarchy__attribute">node</span>: RowNode, // the RowNode for the row in question
            │     <span class="event-hierarchy__attribute">data</span>: any, // the user provided data for the row in question
            │     <span class="event-hierarchy__attribute">rowIndex</span>: number, // the visible row index for the row in question
            │     <span class="event-hierarchy__attribute">rowPinned</span>: string, // either 'top', 'bottom' or undefined / null (if not pinned)
            │     <span class="event-hierarchy__attribute">context</span>: any, // bag of attributes, provided by user, see [Context](/context/)
            │     <span class="event-hierarchy__attribute">event?</span>: Event // if event was due to browser event (eg click), this is browser event
            │   }</span>
            ├── RowSelectedEvent <span class="event-hierarchy__property">{}</span>
            ├── RowClickedEvent <span class="event-hierarchy__property">{}</span>
            ├── RowDoubleClickedEvent <span class="event-hierarchy__property">{}</span>
            ├── RowEditingStartedEvent <span class="event-hierarchy__property">{}</span>
            ├── RowEditingStoppedEvent <span class="event-hierarchy__property">{}</span>
            ├── RowGroupOpenedEvent <span class="event-hierarchy__property">{
            │     <span class="event-hierarchy__attribute">expanded</span>: boolean // true if the group is expanded.
            }</span>
            ├── RowValueChangedEvent <span class="event-hierarchy__property">{}</span>
            ├── VirtualRowRemovedEvent <span class="event-hierarchy__property">{}</span>
            ├── FullWidthCellKeyDownEvent <span class="event-hierarchy__property">{}</span>
            ├── FullWidthCellKeyPressEvent <span class="event-hierarchy__property">{}</span>
            └── CellEvent <span class="event-hierarchy__property">{
                │   <span class="event-hierarchy__attribute">column</span>: Column, // the column for the cell in question
                │   <span class="event-hierarchy__attribute">colDef</span>: ColDef, // the column definition for the cell in question
                │   <span class="event-hierarchy__attribute">value</span>: any // the value for the cell in question
                │ }</span>
                ├── CellClickedEvent <span class="event-hierarchy__property">{}</span>
                ├── CellMouseDownEvent <span class="event-hierarchy__property">{}</span>
                ├── CellDoubleClickedEvent <span class="event-hierarchy__property">{}</span>
                ├── CellMouseOverEvent <span class="event-hierarchy__property">{}</span>
                ├── CellMouseOutEvent <span class="event-hierarchy__property">{}</span>
                ├── CellContextMenuEvent <span class="event-hierarchy__property">{}</span>
                ├── CellEditingStartedEvent <span class="event-hierarchy__property">{}</span>
                ├── CellKeyDownEvent <span class="event-hierarchy__property">{}</span>
                ├── CellKeyPressEvent <span class="event-hierarchy__property">{}</span>
                ├── CellEditingStoppedEvent <span class="event-hierarchy__property">{
                        <span class="event-hierarchy__attribute">oldValue</span>: any, // the old value before editing
                        <span class="event-hierarchy__attribute">newValue</span>: any // the new value after editing
                      }</span>
                └── CellValueChangedEvent <span class="event-hierarchy__property">{
                        <span class="event-hierarchy__attribute">oldValue</span>: any, // the old value before editing
                        <span class="event-hierarchy__attribute">newValue</span>: any // the new value after editing
                      }</span></pre>
