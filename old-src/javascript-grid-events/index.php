<?php
$key = "Events";
$pageTitle = "ag-Grid Events";
$pageDescription = "Learn how each events impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid events";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="events" class="first-h1">Grid Events</h1>

    <note>
        TypeScript users can take advantage of the events interfaces. You can work our the interface
        name by putting 'Event' after the event name. For example, the cellClicked event uses the interface
        CellClickedEvent.
    </note>

    <note>
        See the <a href="#properties-and-hierarchy">Event Properties & Hierarchy</a> below for what properties each event has.
    </note>

    <table id="ag-grid-events" class="table">

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Selection</td>
        </tr>

        <tr>
            <th>cellClicked</th>
            <td>
                Cell is clicked.
            </td>
        </tr>
        <tr>
            <th>cellDoubleClicked</th>
            <td>
                Cell is double clicked.
            </td>
        </tr>
        <tr>
            <th>cellFocused</th>
            <td>Cell is focused.</td>
        </tr>
        <tr>
            <th>cellMouseOver, cellMouseOut</th>
            <td>Mouse enters / leaves cell.</td>
        </tr>
        <tr>
            <th>rowClicked</th>
            <td>Row is clicked.</td>
        </tr>
        <tr>
            <th>rowDoubleClicked</th>
            <td>Row is double clicked.</td>
        </tr>
        <tr>
            <th>rowSelected</th>
            <td>Row is selected or deselected.</td>
        </tr>
        <tr>
            <th>selectionChanged</th>
            <td>Row selection is changed. Use the grid API to get the new row selected.</td>
        </tr>
        <tr>
            <th>cellContextMenu</th>
            <td>Cell is right clicked.</td>
        </tr>
        <tr>
            <th>rangeSelectionChanged</th>
            <td>A change to range selection has occurred.</td>
        </tr>
        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Editing</td>
        </tr>

        <tr>
            <th>cellValueChanged</th>
            <td>Value has changed after editing.</td>
        </tr>
        <tr>
            <th>rowValueChanged</th>
            <td>A cells value within a row has changed. This event corresponds to
                <a href="../javascript-grid-cell-editing/#fullRowEdit">Full Row Editing</a> only.
            </td>
        </tr>
        <tr>
            <th>cellEditingStarted, cellEditingStopped</th>
            <td>Editing a cell has started / stopped.</td>
        </tr>
        <tr>
            <th>rowEditingStarted, rowEditingStopped</th>
            <td>Editing a row has started / stopped (when row editing is enabled). When row editing, these events
                will be fired once and <code>cellEditingStarted / cellEditingStopped</code> will be fired for each
                individual cell. These events correspond to
                <a href="../javascript-grid-cell-editing/#start-stop-editing-events">Full Row Editing</a> only.
            </td>
        </tr>
        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Sort & Filter</td>
        </tr>

        <tr>
            <th>sortChanged</th>
            <td>
                Sort has changed, grid also listens for this and updates the model.<br/>
            </td>
        </tr>
        <tr>
            <th>filterChanged</th>
            <td>
                Filter has modified and applied.<br/>
            </td>
        </tr>
        <tr>
            <th>filterModified</th>
            <td>
                Filter was modified but not applied. Used when filters have 'Apply' buttons.<br/>
            </td>
        </tr>

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Columns</td>
        </tr>

        <tr>
            <th>columnVisible</th>
            <td>A column, or group of columns, was hidden / shown.</td>
        </tr>
        <tr>
            <th>columnPinned</th>
            <td>A column, or group of columns, was pinned / unpinned.</td>
        </tr>
        <tr>
            <th>columnResized</th>
            <td>A column was resized.</td>
        </tr>
        <tr>
            <th>columnMoved</th>
            <td>A column was moved. To find out when the column move is finished you can use the dragStopped event below.
            </td>
        </tr>
        <tr>
            <th>columnRowGroupChanged</th>
            <td>A row group column was added or removed.</td>
        </tr>
        <tr>
            <th>columnValueChanged</th>
            <td>A value column was added or removed.</td>
        </tr>
        <tr>
            <th>columnPivotModeChanged</th>
            <td>The pivot mode flag was changed</td>
        </tr>
        <tr>
            <th>columnPivotChanged</th>
            <td>A pivot column was added, removed or order changed.</td>
        </tr>
        <tr>
            <th>columnGroupOpened</th>
            <td>A column group was opened / closed.</td>
        </tr>
        <tr>
            <th>newColumnsLoaded</th>
            <td>User has set in new columns.</td>
        </tr>
        <tr>
            <th>gridColumnsChanged</th>
            <td>The list of grid columns has changed.</td>
        </tr>
        <tr>
            <th>displayedColumnsChanged</th>
            <td>The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc.
            </td>
        </tr>
        <tr>
            <th>virtualColumnsChanged</th>
            <td>The list of rendered columns has changed (only columns in the visible scrolled viewport are rendered by
                default).
            </td>
        </tr>
        <tr>
            <th>columnEverythingChanged</th>
            <td>Shotgun - gets called when either a) new columns are set or b) columnApi.setState() is used, so
                everything has changed.
            </td>
        </tr>

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Miscellaneous</td>
        </tr>
        <tr>
            <th>gridReady</th>
            <td>ag-Grid has initialised. The name 'ready'
                was influenced by the authors time programming the Commodore 64. Use this event if,
                for example, you need to use the grid's API to fix the columns to size.
            </td>
        </tr>
        <tr>
            <th>modelUpdated</th>
            <td>Displayed rows have changed. Happens following sort, filter or tree expand / collapse events.</td>
        </tr>
        <tr>
            <th>rowGroupOpened</th>
            <td>A row group was opened or closed.</td>
        </tr>
        <tr>
            <th>paginationChanged</th>
            <td>
                The displayed page for pagination has changed. For example the data was filtered or sorted, or the user
                has moved to a different page.
            </td>
        </tr>
        <tr>
            <th>gridSizeChanged</th>
            <td>The grid had to lay out again because it changed size.</td>
        </tr>
        <tr>
            <th>pinnedRowDataChanged</th>
            <td>The client has set new pinned row data into the grid</td>
        </tr>
        <tr>
            <th>virtualRowRemoved</th>
            <td>A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row.</td>
        </tr>
        <tr>
            <th>viewportChanged</th>
            <td>Informs when rows rendered into the DOM changes.</td>
        </tr>
        <tr>
            <th>bodyScroll</th>
            <td>Informs when the body is scrolled horizontally or vertically.</td>
        </tr>
        <tr>
            <th>dragStarted, dragStopped</th>
            <td>When column dragging starts or stops. Useful if you want to wait until after a drag
                event before doing an action.
            </td>
        </tr>
        <tr>
            <th>rowDataChanged</th>
            <td>The client has set new data into the grid using <code>api.setRowData()</code> or changing
            the <code>rowData</code> bound property.</td>
        </tr>
        <tr>
            <th>rowDataUpdated</th>
            <td>The client has updated data for the grid using <code>api.updateRowData(transaction)</code> or changing
            the <code>rowData</code> bound property with <code>deltaRowDataMode=true</code>.</td>
        </tr>
        <tr>
            <th>componentStateChanged</th>
            <td>
                Only used by React, Angular 2+, Web Components, Aurelia and VueJS ag-Grid components
                (not used if doing plain JavaScript or Angular 1.x). If the grid receives changes due
                to bound properties, this event fires after the grid has finished processing the
                change.
            </td>
        </tr>
    </table>

    <h2 id="properties-and-hierarchy">Event Properties & Hierarchy</h2>

    <p>
        Below shows the event hierarchy and properties. All properties are inherited. For example the CellValueChangedEvent
        has properties:
    <snippet>
&lt;span class="event-properties"&gt;// all properties, including inherited, for CellValueChangedEvent&lt;/span&gt;
CellValueChangedEvent {
    type, api, columnApi, &lt;span class="event-properties"&gt;// -&gt; properties from AgEvent&lt;/span&gt;
    node, data, rowIndex, rowPinned, context, event, &lt;span class="event-properties"&gt;// -&gt; properties from RowEvent&lt;/span&gt;
    column, colDef, value, &lt;span class="event-properties"&gt;// -&gt; properties from CellEvent&lt;/span&gt;
    oldValue, newValue &lt;span class="event-properties"&gt;// -&gt; properties from CellValueChangedEvent&lt;/span&gt;
}</snippet>
    </p>

    <pre class="event-hierarchy"><span class="event-properties">//---------------------------------------------------------//</span>
<span class="event-properties">// Event hierarchy, and properties, for all ag-Grid events //</span>
<span class="event-properties">//---------------------------------------------------------//</span>
└── AgEvent <span class="event-properties">{
    │     <span class="event-attribute">type</span>: string, // the event type, eg 'sortChanged' or 'columnResized'
    │     <span class="event-attribute">api</span>: GridAPI, // see <a href="../javascript-grid-api/">Grid API</a>
    │     <span class="event-attribute">columnApi</span>: ColumnAPI // see <a href="../javascript-grid-column-api/">Column API</a>
    │   }</span>
    ├── GridReadyEvent <span class="event-properties">{}</span>
    ├── SelectionChangedEvent <span class="event-properties">{}</span>
    ├── FilterChangedEvent <span class="event-properties">{}</span>
    ├── FilterModifiedEvent <span class="event-properties">{}</span>
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
    ├── DragStartedEvent <span class="event-properties">{}</span>
    ├── DragStoppedEvent <span class="event-properties">{}</span>
    ├── CellFocusedEvent <span class="event-properties">{
    │       <span class="event-attribute">rowIndex</span>: number, // the row index of the focused cell
    │       <span class="event-attribute">column</span>: Column, // the column of the focused cell
    │       <span class="event-attribute">rowPinned</span>: string, // either 'top', 'bottom' or undefined/null (if not pinned)
    │       <span class="event-attribute">forceBrowserFocus</span>: boolean // whether browser focus is also set (false when editing)
    │     }</span>
    ├── GridSizeChangedEvent <span class="event-properties">{
    │       <span class="event-attribute">clientWidth</span>: number, // new width in pixels of the grid
    │       <span class="event-attribute">clientHeight</span>: number // new height in pixels of the grid
    │     }</span>
    ├── ViewportChangedEvent <span class="event-properties">{
    │       <span class="event-attribute">firstRow</span>: number, // the index of the first rendered row
    │       <span class="event-attribute">lastRow</span>: number // the index of the last rendered row
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
    ├── ColumnEvent <span class="event-properties">{
    │   │    <span class="event-attribute">column</span>: Column, // the impacted column, only set if action was on one column
    │   │    <span class="event-attribute">columns</span>: Column[] // list of all impacted columns
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
        │     <span class="event-attribute">event?</span>: Event // if even was due to browser event (eg click), then this is browser event
        │   }</span>
        ├── RowSelectedEvent <span class="event-properties">{}</span>
        ├── RowClickedEvent <span class="event-properties">{}</span>
        ├── RowDoubleClickedEvent <span class="event-properties">{}</span>
        ├── RowEditingStartedEvent <span class="event-properties">{}</span>
        ├── RowEditingStoppedEvent <span class="event-properties">{}</span>
        ├── RowGroupOpenedEvent <span class="event-properties">{}</span>
        ├── RowValueChangedEvent <span class="event-properties">{}</span>
        ├── VirtualRowRemovedEvent <span class="event-properties">{}</span>
        └── CellEvent <span class="event-properties">{
            │   <span class="event-attribute">column</span>: Column, // the column for the cell in question
            │   <span class="event-attribute">colDef</span>: ColDef, // the column definition for the cell in question
            │   <span class="event-attribute">value</span>: any // the value for the cell in question
            │ }</span>
            ├── CellClickedEvent <span class="event-properties">{}</span>
            ├── CellDoubleClickedEvent <span class="event-properties">{}</span>
            ├── CellMouseOverEvent <span class="event-properties">{}</span>
            ├── CellMouseOutEvent <span class="event-properties">{}</span>
            ├── CellContextMenuEvent <span class="event-properties">{}</span>
            ├── CellEditingStartedEvent <span class="event-properties">{}</span>
            ├── CellEditingStoppedEvent <span class="event-properties">{}</span>
            └── CellValueChangedEvent <span class="event-properties">{
                    <span class="event-attribute">oldValue</span>: any, // the old value before editing
                    <span class="event-attribute">newValue</span>: any // the new value after editing
                  }</span></pre>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
