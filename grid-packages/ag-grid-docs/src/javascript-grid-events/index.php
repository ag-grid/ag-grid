<?php
$pageTitle = "ag-Grid Reference: Grid Events";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. As you interact with the grid, it fires events. This reference guide covers each of these events.";
$pageKeywords = "javascript data grid ag-Grid events";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Grid Events</h1>

<p>This is a list of the events that the grid raises. You can register callbacks for these events through the <code>GridOptions</code> interface.</p>

<p>
    The name of the callback is constructed by prefixing the event name with <code>on</code>. For example, the callback for the
    <code>cellClicked</code> event is <code>gridOptions.onCellClicked</code>.
</p>

<note>
    TypeScript users can take advantage of the events' interfaces. You can construct the interface name by suffixing the event name with
    <code>Event</code>. For example, the <code>cellClicked</code> event uses the interface <code>CellClickedEvent</code>.
</note>

<note>
    See the <a href="#properties-and-hierarchy">Event Properties and Hierarchy</a> section below to find out what properties each event has.
</note>

<?php createDocumentationFromFile('events.json') ?>

<h2 id="properties-and-hierarchy">Event Properties and Hierarchy</h2>

<p>
    Below shows the event hierarchy and properties. All properties are inherited. For example the <code>CellValueChangedEvent</code> interface
    has the following properties:
</p>

<?= createSnippet(<<<SNIPPET
interface CellValueChangedEvent {
    type, api, columnApi, // -&gt; properties from AgEvent
    node, data, rowIndex, rowPinned, context, event, // -&gt; properties from RowEvent
    column, colDef, value, // -&gt; properties from CellEvent
    oldValue, newValue // -&gt; properties from CellValueChangedEvent
}
SNIPPET
) ?>

<pre class="event-hierarchy">
<span class="event-properties">//---------------------------------------------------------//</span>
<span class="event-properties">// Event hierarchy, and properties, for all ag-Grid events //</span>
<span class="event-properties">//---------------------------------------------------------//</span>
└── AgEvent <span class="event-properties">{
    │     <span class="event-attribute">type</span>: string, // the event type, eg 'sortChanged' or 'columnResized'
    │   }</span>
    └── AgGridEvent
        │     <span class="event-attribute">api</span>: GridAPI, // see <a href="../javascript-grid-api/">Grid API</a>
        │     <span class="event-attribute">columnApi</span>: ColumnAPI // see <a href="../javascript-grid-column-api/">Column API</a>
        │   }</span>
        ├── GridReadyEvent <span class="event-properties">{}</span>
        ├── SelectionChangedEvent <span class="event-properties">{}</span>
        ├── SortChangedEvent <span class="event-properties">{}</span>
        ├── RowDataChangedEvent <span class="event-properties">{}</span>
        ├── RowDataUpdatedEvent <span class="event-properties">{}</span>
        ├── PinnedRowDataChangedEvent <span class="event-properties">{}</span>
        ├── NewColumnsLoadedEvent <span class="event-properties">{}</span>
        ├── GridColumnsChangedEvent <span class="event-properties">{}</span>
        ├── VirtualColumnsChangedEvent <span class="event-properties">{}</span>
        ├── ColumnPivotModeChangedEvent <span class="event-properties">{}</span>
        ├── ColumnEverythingChangedEvent <span class="event-properties">{}</span>
        ├── DisplayedColumnsChangedEvent <span class="event-properties">{}</span>
        ├── ToolPanelVisibleChangedEvent <span class="event-properties">{}</span>
        ├── AnimationQueueEmptyEvent <span class="event-properties">{}</span>
        ├── FilterChangedEvent <span class="event-properties">{</span>
        │       <span class="event-attribute">afterFloatingFilter</span>: Column, // if filter was changed via floating filter
        │       <span class="event-attribute">afterDataChange</span>: number, // if filter was changed as a result of data changing
        │     }</span>
        ├── FilterModifiedEvent <span class="event-properties">{</span>
        │       <span class="event-attribute">column</span>: Column, // the column for the event
        │       <span class="event-attribute">filterInstance</span>: number, // the filter instance
        │     }</span>
        ├── CellFocusedEvent <span class="event-properties">{
        │       <span class="event-attribute">rowIndex</span>: number, // the row index of the focused cell
        │       <span class="event-attribute">column</span>: Column, // the column of the focused cell
        │       <span class="event-attribute">rowPinned</span>: string, // either 'top', 'bottom' or undefined/null (if not pinned)
        │       <span class="event-attribute">forceBrowserFocus</span>: boolean // whether browser focus is also set (false when editing)
        │     }</span>
        ├── ViewportChangedEvent <span class="event-properties">{
        │       <span class="event-attribute">firstRow</span>: number, // the index of the first rendered row
        │       <span class="event-attribute">lastRow</span>: number // the index of the last rendered row
        │     }</span>
        ├── FirstDataRendereredEvent <span class="event-properties">{
        │       <span class="event-attribute">firstRow</span>: number, // the index of the first rendered row
        │       <span class="event-attribute">lastRow</span>: number // the index of the last rendered row
        │     }</span>
        ├── GridSizeChangedEvent <span class="event-properties">{
        │       <span class="event-attribute">clientWidth</span>: number, // the grids DIV's clientWidth
        │       <span class="event-attribute">clientHeight</span>: number // the grids DIV's clientHeight
        │     }</span>
        ├── RangeSelectionChangedEvent <span class="event-properties">{
        │       <span class="event-attribute">started</span>: boolean, // true for first event in a sequence of dragging events
        │       <span class="event-attribute">finished</span>: boolean // true for last event in sequence of dragging events
        │     }</span>
        ├── ColumnGroupOpenedEvent <span class="event-properties">{
        │       <span class="event-attribute">columnGroup</span>: OriginalColumnGroup // the original column group that was opened
        │     }</span>
        ├── BodyScrollEvent <span class="event-properties">{
        │       <span class="event-attribute">direction</span>: string // either 'horizontal' or 'vertical'
        │       <span class="event-attribute">top</span>: number // top px of the scroll
        │       <span class="event-attribute">left</span>: number // left px of the scroll
        │     }</span>
        ├── PaginationChangedEvent <span class="event-properties">{
        │       <span class="event-attribute">animate</span>: boolean, // true if rows were animated to new position
        │       <span class="event-attribute">keepRenderedRows</span>: boolean, // true if rows were kept (otherwise complete redraw)
        │       <span class="event-attribute">newData</span>: boolean, // true if data was new (ie user set new data)
        │       <span class="event-attribute">newPage</span>: boolean // true if user went to a new pagination page
        │     }</span>
        ├── ModelUpdatedEvent <span class="event-properties">{
        │       <span class="event-attribute">animate</span>: boolean, // true if rows were animated to new position
        │       <span class="event-attribute">keepRenderedRows</span>: boolean, // true if rows were kept (otherwise complete redraw)
        │       <span class="event-attribute">newData</span>: boolean, // true if data was new (ie user set new data)
        │       <span class="event-attribute">newPage</span>: boolean // true if user went to a new pagination page
        │     }</span>
        ├── ComponentStateChangedEvent <span class="event-properties">{
        │       // one attribute for each changed property
        │     }</span>
        ├── ExpandCollapseAllEvent <span class="event-properties">{
        │       <span class="event-attribute">source</span>: string
        │     }</span>
        ├── DragEvent <span class="event-properties">{
        │   │    <span class="event-attribute">type</span>: string, // one of {'cell','row','headerCell','toolPanel'}
                 <span class="event-attribute">target</span>: HTMLElement, // The DOM element that started the event.
        │   │  }</span>
        │   ├── DragStartedEvent <span class="event-properties">{}</span>
        │   ├── DragStoppedEvent <span class="event-properties">{}</span>
        ├── RowDragEvent <span class="event-properties">{ // abstract event, never fired
        │   │    <span class="event-attribute">event</span>: MouseEvent, // The underlying mouse move event associated with the drag.
        │   │    <span class="event-attribute">node</span>: RowNode, // The row node getting dragged. Also the node that started the drag when multi-row dragging.
        │   │    <span class="event-attribute">nodes</span>: RowNode[], // The list of nodes being dragged.
        │   │    <span class="event-attribute">overIndex</span>: number, // The row index the mouse is dragging over.
        │   │    <span class="event-attribute">overNode</span>: RowNode, // The row node the mouse is dragging over.
        │   │    <span class="event-attribute">y</span>: number, // The vertical pixel location the mouse is over.
        │   │    <span class="event-attribute">vDirection</span>: string, // Direction of the drag, either 'up', 'down' or null.
        │   │  }</span>
        │   ├── RowDragEnterEvent <span class="event-properties">{}</span> // row drag has started / re-entered
        │   ├── RowDragMoveEvent <span class="event-properties">{}</span> // mouse moved while dragging
        │   ├── RowDragEndEvent <span class="event-properties">{}</span> // row drag finished while mouse over grid
        │   ├── RowDragLeaveEvent <span class="event-properties">{}</span> // mouse left grid while dragging
        ├── ColumnEvent <span class="event-properties">{
        │   │    <span class="event-attribute">column</span>: Column, // the impacted column, only set if action was on one column
        │   │    <span class="event-attribute">columns</span>: Column[] // list of all impacted columns
        │   │    <span class="event-attribute">source</span>: string // A string describing where the event is coming from
        │   │  }</span>
        │   ├── ColumnPivotChangedEvent <span class="event-properties">{}</span> // a column was added / removed to pivot list
        │   ├── ColumnRowGroupChangedEvent <span class="event-properties">{}</span> // a column was added / removed to row group list
        │   ├── ColumnValueChangedEvent <span class="event-properties">{}</span> // a column was added / removed to values list
        │   ├── ColumnMovedEvent <span class="event-properties">{
        │   │        <span class="event-attribute">toIndex</span>: number // the position the column was moved to
        │   │      }</span>
        │   ├── ColumnResizedEvent <span class="event-properties">{
        │   │        <span class="event-attribute">finished</span>: boolean // set to true for last event in a sequence of move events
        │   │      }</span>
        │   ├── ColumnVisibleEvent <span class="event-properties">{
        │   │        <span class="event-attribute">visible</span>: boolean // true if column was set to visible, false if set to hide
        │   │      }</span>
        │   └── ColumnPinnedEvent <span class="event-properties">{
        │            <span class="event-attribute">pinned</span>: string // either 'left', 'right', or undefined / null (it not pinned)
        │          }</span>
        └── RowEvent <span class="event-properties">{
            │     <span class="event-attribute">node</span>: RowNode, // the RowNode for the row in question
            │     <span class="event-attribute">data</span>: any, // the user provided data for the row in question
            │     <span class="event-attribute">rowIndex</span>: number, // the visible row index for the row in question
            │     <span class="event-attribute">rowPinned</span>: string, // either 'top', 'bottom' or undefined / null (if not pinned)
            │     <span class="event-attribute">context</span>: any, // bag of attributes, provided by user, see <a href="../javascript-grid-context/">Context</a>
            │     <span class="event-attribute">event?</span>: Event // if event was due to browser event (eg click), this is browser event
            │   }</span>
            ├── RowSelectedEvent <span class="event-properties">{}</span>
            ├── RowClickedEvent <span class="event-properties">{}</span>
            ├── RowDoubleClickedEvent <span class="event-properties">{}</span>
            ├── RowEditingStartedEvent <span class="event-properties">{}</span>
            ├── RowEditingStoppedEvent <span class="event-properties">{}</span>
            ├── RowGroupOpenedEvent <span class="event-properties">{
            │     <span class="event-attribute">expanded</span>: boolean // true if the group is expanded.
            }</span>
            ├── RowValueChangedEvent <span class="event-properties">{}</span>
            ├── VirtualRowRemovedEvent <span class="event-properties">{}</span>
            └── CellEvent <span class="event-properties">{
                │   <span class="event-attribute">column</span>: Column, // the column for the cell in question
                │   <span class="event-attribute">colDef</span>: ColDef, // the column definition for the cell in question
                │   <span class="event-attribute">value</span>: any // the value for the cell in question
                │ }</span>
                ├── CellClickedEvent <span class="event-properties">{}</span>
                ├── CellMouseDownEvent <span class="event-properties">{}</span>
                ├── CellDoubleClickedEvent <span class="event-properties">{}</span>
                ├── CellMouseOverEvent <span class="event-properties">{}</span>
                ├── CellMouseOutEvent <span class="event-properties">{}</span>
                ├── CellContextMenuEvent <span class="event-properties">{}</span>
                ├── CellEditingStartedEvent <span class="event-properties">{}</span>
                ├── CellKeyDown <span class="event-properties">{}</span>
                ├── CellKeyPress <span class="event-properties">{}</span>
                ├── CellEditingStoppedEvent <span class="event-properties">{
                        <span class="event-attribute">oldValue</span>: any, // the old value before editing
                        <span class="event-attribute">newValue</span>: any // the new value after editing
                      }</span>
                └── CellValueChangedEvent <span class="event-properties">{
                        <span class="event-attribute">oldValue</span>: any, // the old value before editing
                        <span class="event-attribute">newValue</span>: any // the new value after editing
                      }</span></pre>

<?php include '../documentation-main/documentation_footer.php'; ?>
