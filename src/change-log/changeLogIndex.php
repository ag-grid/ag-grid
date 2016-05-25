<?php
$key = "Change Log";
$pageTitle = "ag-Grid Change Log";
$pageDescription = "ag-Grid change log. Details the items that have change between each release.";
$pageKeyboards = "ag-Grid Change Log";
include '../documentation-main/documentation_header.php';
?>

<div style="padding: 20px;">

<!--    <h3>Pivots</h3>
    + New event columnPivotChanged (note - need to put callbacks and component changes in for pivot event)
    + New colDef property pivotIndex
    + New column API methods: setPivotColumns, removePivotColumn, removePivotColumns, addPivotColumn, addPivotColumns
-->
    <h3>Version xxx</h3>
    <li>Bug fix: when dragging columns out of rowGroupPanel, GUI wasn't redrawing correctly and crashing, causing inconsistent state and console error messages</li>
    <li>Bug fix: disabled menu items were still allowed to be clicked</li>
    <li>Bug fix: you can now tab into and out of the grid.</li>
    <li>Bug fix: default text editor was displaying 'undefined' when initial value was missing. now showing blank.</li>

    <li>Enhancement: New theme for Bootstrap</li>
    <li>Enhancement: New theme for Material Design</li>
    <li>Enhancement: Dark theme revised</li>
    <li>Enhancement: better default icons for row groups and checkbox selection</li>
    <li>Enhancement: row selection 'checked' icons are now icons and not browser checkbox. they are now also customisable via changing icons.</li>
    <li>Enhancement: moving drag via dragging now supports:
        <ul>
            <li>Drag groups of columns from within table to move</li>
            <li>Drag groups of columns from column toolPanel</li>
            <li>Drag groups of columns to 'row group panel' to row group by multiple columns</li>
        </ul>
    </li>
    <li>Enhancement: changed icons for drag pinning, now when you drag a column to the edge, the drag icon changes to 'pinned' so use knows the column is about to be pinned.</li>
    <li>Enhancement: new property for column group called 'marryChildren', when true then group cannot be split up by moving children.</li>
    <li>Enhancement: toolpanel now has icon beside column group to show visibility of the group. icon is also clickable to set visible / hidden all children of the group</li>
    <li>Enhancement: a range of rows can be selected together by holding down shift (does not work with virtual pagination or viewport, only normal 'in memory row model').</li>
    <li>Enhancement: editing now has methods isCancelBeforeStart() and isCancelAfterEnd() to help with lifecycle.</li>
    <li>Enhancement: new property suppressDragLeaveHidesColumns, so when columns dragged out of grid, they are not hidden.</li>
    <li>Enhancement: new method api.refreshInMemoryRowModel, does a complete refresh of the in memory row model. Useful if you need to get the groups worked out again.</li>
    <li>Enhancement: default text editor - now 'right' and 'left' key presses do not loose focus on current cell</li>
    <li>Enhancement: added ag-row-hover class for when mouse is over row</li>
    <li>Enhancement: new property 'suppressMiddleClickScrolls', so you can listen or 'middle mouse clicks' if you want (otherwise middle mouse click is taken by browser to scroll)</li>
    <li>Enhancement: new property 'suppressPreventDefaultOnMouseWheel' so you can allow browser to handle mouse wheel events - useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page</li>
    <li>Enhancement: build in renderer 'animiateShowChange' now highlights changes when values are not numbers (eg strings).</li>

    <h3>Version 4.1.x patch (ag-Grid 4.1.5, ag-Grid-Enterprise 4.1.4)</h3>
    <li>Bug fix: when setting columns directly on gridOptions, the groupByPanel was not initialised correctly.</li>
    <li>Bug fix: row group panel was not initialising correctly.</li>

    <h3>Version 4.1.x patch (ag-Grid 4.1.4, ag-Grid-Enterprise 4.1.3)</h3>
    <li>Bug fix: api.deselectAll() was not calling onSelectionChanged, it is now.</li>
    <li>Bug fix: defaultExpanded setting was not been used, it is now.</li>
    <li>Bug fix: popup editor was not working, init() was not called.</li>

    <h3>Version 4.1.x</h3>

    <b>Big changes</b>
    <li>Vamped up Cell Editing and Rendering. See new documentation pages for <a href="../javascript-grid-cell-editing">Cell Editing</a> and <a href="../javascript-grid-cell-rendering">Cell Rendering</a></li>
    <li>New row model called <a href="../javascript-grid-viewport/">Viewport</a>. Designed for views over large data and pushing out updates from server to client.</li>

    <b>Breaking Change</b>
    <li>If you are using the built in groupCellRenderer, check the examples on how to configure it. The colDef.cellRenderer property is broken up into cellRenderer and cellRendererParams.</li>

    <b>Small changes</b>
    <li>Enhancement: New event - viewportChanged - gets called when the rendered rows changes, either
    due to scrolling, new data or grid resize. Using this, you know exactly what divs will be rendered in the DOM.</li>
    <li>Navigation: When not editing, tab moves between cells. Shift+tab goes backwards.</li>
    <li>Editing: Hitting any key started editing.</li>
    <li>Enhancement: New api methods: showColumnMenuAfterButtonClick(colKey, buttonElement), showColumnMenuAfterMouseClick(colKey, mouseEvent)</li>
    <li>Enhancement: new function colDef.valueFormatter - value formatting responsibility used to tie in cellRenderer, now it's broken out into valueFormatter, allows reusing cellRenderer's against different formats.</li>
    <li>Enhancement: added 'destroyFilter' api</li>
    <li>Enhancement: columnApi.addRowGroupColumn() and columnApi.removeRowGroupColumn() now work off colKey and not columns, so you can pass in colDefs, colIds or columns (previously was just columns)</li>
    <li>Enhancement: New methods: columnApi.addRowGroupColumns(), columnApi.removeRowGroupColumns(), columnApi.setRowGroupColumns()</li>
    <li>Enhancement: When you refresh the grid, doing a refresh doesn't loose the focused cell if a cell has browser focus.</li>
    <li>Bugfix: Row grouping was not working when colId was provided.</li>
    <li>Bugfix: api.setFocusedCell() method now sets browser focus (previous was just graphically highlighting the cell)</li>

    <h3>Version 4.0.x (ag-Grid 4.0.5, ag-Grid-Enterprise 4.0.7)</h3>
    <li>Bugfix: Status bar was not calculating 'min' correctly.</li>
    <li>Enhancement: Now ctrl+d will copy down the selected range, similar to Excel</li>
    <li>Deprecated: cellRendererParams.addRenderedRowListener() is now deprecated. If you want callback methods for cellRendering, use the cellRenderer Component pattern.</li>

    <h3>Version 4.0.x (ag-Grid 4.0.4)</h3>

    <li>Bugfix: Firefox was showing native context menu on top of grids context menu.</li>
    <li>Bugfix: Drag event is only cancelled if source is image, allows user to implement custom drag event.</li>
    <li>Bugfix: Angular compiling is now done after row is inserted into the DOM.</li>
    <li>Bugfix: Fixed horizontal scroll on trackpads when mouse over pinned column.</li>

    <h3>Version 4.0.x (ag-Grid 4.0.2, ag-Grid-Enterprise 4.0.4)</h3>

    <li>Bugfix: When filter was 'zero' (for number filer) is was not saving correctly when using 'getFilterModel()'.</li>
    <li>Bugfix: Event 'gridSizeChanged' was not getting called when width of grid changed, only height.</li>
    <li>Bugfix: Renamed 'PopupService.js' to 'popupService.js -> caused issued for some import styles.</li>
    <li>Bugfix: Bug in virtual pagination, grid was not initialising when datasource set in gridOptions.</li>
    <li>Bugfix: Mouse double click was not working correctly in firefox.</li>
    <li>Bugfix: Enterprise filters were not getting params in the 'afterGuiAttached' method.</li>

    <li>Enhancement: setColumnState() now returns a boolean, false if one or more columns could not be found.</li>
    <li>Enhancement: added API methods copySelectedRowsToClipboard() and copySelectedRangeToClipboard().</li>
    <li>Enhancement: changed how auto-range aggregations work - blank cells not counted in count, and non-number cells not used for avg</li>

    <h3>Version 4.0.x</h3>

    <!-- NEW FEATURES -->
    <h4>New Features</h4>

    <li>The grid has moved to Enterprise vs Free.</li>

    <li>Enterprise Feature: Enhanced enterprise column menu, in addition to filtering there is now a menu and also column management.</li>

    <li>Enterprise Feature: Row group panel on top of grid, so you can drag columns to here to group.</li>

    <li>Enterprise Feature: You can now drag columns from the tool panel into the grid to make them visible.</li>

    <li>Enterprise Feature: Row grouping and aggregation are no longer in the tool panel as they can be done
    bia column menu (grouping and aggregation) or dragging to the row group panel (grouping).</li>

    <li>Enterprise Feature: Context Menu</li>

    <li>Enterprise Feature: Range Selection</li>
    <li>Enterprise Feature: Enterprise column menu</li>
    <li>Enterprise Feature: Clipboard interaction</li>
    <li>Enterprise Feature: Status bar</li>

    <li>Tool panel, set filter, row grouping and aggregation are now only available in Enterprise version
    of ag-Grid.</li>

    <!-- ENHANCEMENTS -->
    <h4>Enhancements & Changes</h4>

    <li>Performance improvements - no longer attaching listeners to each cell, so when scrolling, the dom is not
    been ripped up with adding and removing listeners. Instead the grid has one listener (eg for mouse click),
    and when the click happens, the grid then works out which cell it was for.</li>

    <li>rowNode is now a class object with methods (previously it only have properties, a simple data object).
        Methods now include: setSelected(), isSelected(), addEventListener(), removeEventListener(),
        resetQuickFilterAggregateText(), deptFirstSearch(callback).
    </li>

    <li>RowNode now has method 'setSelected'. This should now be used for row selection over the gridApi.selectXXXX() methods.</li>

    <li>api.getSelectedNodesById gone, use api.getSelectedNodes instead</li>

    <li>Event rowDeselected gone, now event rowSelected gets fired for both selected and deselected. Check node state
        to see if row is selected or not.</li>

    <li>Event selectionChanged no longer contains the selected rows or nodes. Use the API to look these up if needed.
        Preparing these lists took CPU time, so it's best they are only prepared if needed.</li>

    <li>Concept of 'suppressEvents' was dumped for row selection. No other event event type had this feature, and it
        was out of sync with how web components work in general. If you don't want to be notified of an event, then remove
        your event listener.</li>

    <li>api.addVirtualRowListener is gone. Instead for row selection/deselection listening, use node.addEventListener(),
        and for virtual row removed, use api.addRenderedRowListener()</li>

    <li>New API methods: getFirstRenderedRow() and getLastRenderedRow(), to know the first and last rows in the DOM
        (the grid only renders enough rows (plus a buffer) to show what's visible for performance reasons).</li>

    <li>Introduced property modelType, set to 'pagination' or 'virtual' for pagination and virtual pagination.
        This replaces virtualPaging, as virtual was a boolean when in fact we need to distinctly model three modes
        of operation: Normal, Pagination and Virtual Pagination.</li>

    <li>rowsAlreadyGrouped replaced with getNodeChildDetails. If you are providing already grouped data to the grid,
    see the new section 'Tree Data' on how this is now done. It had to change because Node is now an object with
    functinality, so you can't just pass in JSON an expect them to be treated like nodes.</li>

    <li>Renamed: columnApi.getState()/setState()/resetState() to columnApi.getColumnState()/setColumnState()/resetColumnState() </li>

    <li>Floating rows can now be selected and navigated.</li>

    <li>processRowPostCreate callback, so you can process the grid row after it is created. Handy for adding attributes or other stuff to the row after create.</li>

    <li>Now CSV export allows you to format cells on their way out. Handy if you want to import into Excel and need to make dates, for example, into Excel formatted dates.</li>

    <li>New colDef properties suppressAggregation and suppressRowGroup for suppressing aggregation and row group for particular columns</li>

    <li>Added new property: suppressFieldDotNotation</li>

    <li>Took out property groupHideGroupColumns, if you don't want a column to be shown, just hide it. This feature was not necessary and caused complexity in the design.</li>

    <li>Removed api.refreshRowGroup() -> it wasn't documented, and I can't remember why I put it in, refreshing the grid has the same effect.</li>

    <li>api.getValue(colKey, node) replaces api.getValue(colDef, node, data), the colDef and data were 'old design', newer method works much better.</li>

    <li>api.getFocusedCell() -> now returns rowIndex and Column (used to return colDef and rowNode, colDef not needed as you can get from Column, rowNode not needed as you can lookup using rowIndex)</li>

    <li>rowNode attributes floatingTop and floatingBottom removed, now floating is no longer a boolean, it's a string that can be 'top' or 'bottom' if floating.</li>

    <li>setFocusedCell(rowIndex, colId) is now setFocusedCell(rowIndex, colKey, floating).</li>

    <!-- BUG FIXES -->
    <h4>Bug Fixes</h4>

    <li>Text filter 'ends with' was not working correctly if search string appeared twice in the text.</li>

    <li>forPrint was occasionally given 'Uncaught TypeError: Cannot read property 'appendChild' of undefined'. now fixed. </li>

    <!-- NO VIRTUAL DOM -->
    <h4>RIP Virtual DOM</h4>

    Took out virtual dom. This was an implementation detail, no change in how you interface with the grid.
    It only made an improvement on IE, and now that we are using delayed scrolling, IE is
        working fast enough now. In addition, I have now tested with Windows 10 and Edge (the IE replacement) and
        it's work very fast. So the virtual DOM was giving very little benefit and was 'getting in the way' of a clean
        design. So I've favored a clean design rather than a more complex design just to get it faster in IE. If
        you want to see how little difference a virtual DOM made, see the Angular Connect 2015 talk I gave.




    <h3>Version 3.3.3</h3>
    <li>Bug fix: Pinned rows were not colored correctly</li>

    <h3>Version 3.3.2</h3>
    <li>Bug fix: Was not exporting initialiseAgGridWithAngular1() and initialiseAgGridWithWebComponents() with CommonJS</li>
    <li>Buf fix: Period in fields (ie address.line1) was not working for editing.</li>

    <h3>Version 3.3.0</h3>
    <li>Minor: headerClass (column definition) can now be provided for column groups.</li>
    <li>Major: If using Pure JavaScript "new ag.grid.Grid()", it's now "new agGrid.Grid()".</li>
    <li>Major: Event 'ready' is now called 'gridReady'</li>
    <li>Major: Angular 1 - you now need to initialise the grid via agGrid.initialiseAgGridWithAngular1(angular)</li>
    <li>Major: Web Components - you now need to initialise the grid via agGrid.initialiseAgGridWithWebComponents()</li>
    <li>Major: Angular 2 - Dropped support for UMD version of Angular</li>
    <li>Major: Angular 2 - Now supports CommonJS and ECMA 6 module loading</li>
    <li>Minor: BugFix: forPrint was not sizing headers correctly when doing grouped columns.</li>
    <li>Major: Added sorting to groups</li>
    <li>Minor: Added minColWidth and maxColWidth grid properties. Impacts all columns if set.</li>
    <li>Major: Column no longer has 'index' attribute, as the columns moving now has no meaning. Use 'colId' to identify columns.</li>
    <li>Major: api.ensureColIndexVisible(index) replace with api.ensureColumnVisible(colKey)</li>
    <li>Major: Focused cell not longer has attribute colIndex, instead has attribute colId.</li>
    <li>Major: Movable columns via dragging the column header.</li>

    <li>Major Build Changes:
        <ul>
            <li>CSS now bundled in ag-Grid.js file</li>
            <li>Took out TypeScript internal modules</li>
            <li>Moved to ECMA 6 style imports (instead of require)</li>
            <li>Moved to WebPack for bundling</li>
            <li>Moved Angular 2 component to new project</li>
        </ul>
    </li>

    <h3>Version 3.2.0</h3>
    <li>Minor: New event rowGroupOpened, for when row groups are opened / closed.</li>
    <li>Minor: Bug fix - pinning was not saved during columnApi.getState()</li>
    <li>Minor: Added 'typings' to package.json, so TypeScript can pick up typings from node module</li>
    <li>Minor: groupDefaultExpanded must be number (used to be number or boolean). Set to -1 instead of 'true' for same effect.</li>
    <li>Minor: addVirtualRowListener - now takes an event type and a function, so has similar pattern to normal event listeners.</li>
    <li>Minor: New method 'destroy' added to custom filters. If you need to do cleanup, put it in the destroy method.</li>
    <li>Minor: Took out 'agGridGlobalFunc()', should use ag.grid.Grid() instead.</li>

    <h3>Version 3.1.2</h3>
    <li>Minor: New column API methods: getLeftDisplayedColumnGroups(), getCenterDisplayedColumnGroups(), getRightDisplayedColumnGroups(), getAllDisplayedColumnGroups()</li>

    <h3>Version 3.1.1</h3>

    <li>Minor: Added 'columnSeparator' to CSV Export</li>
    <li>Minor: Added starting character of '\ufeff' to CSV Export (for Excel compatibility)</li>
    <li>Minor: Bug fix - gridOptions.isEnableSorting && colDef.suppressSorting were not used in 3.1.0, fixed.</li>

    <h3>Version 3.1.0</h3>

    <li>Minor: New <i>allColumns</i> property for export to csv</li>
    <li>Minor: API method <i>deselectNode()</i> now takes <i>'suppressEvents'</i> parameter.</li>
    <li>Minor: Now <i>colDef.field</i> can had deep references, eg colDef.field = 'owner.firstName' </li>
    <li>Minor: New event <i>gridSizeChanged</i>, gets fired when grid changes size, due to window resize or other application state change. Useful if you want to lay out the grid, eg call api.sizeColumnsToFit()</li>
    <li>Minor: Bug fix - since v3 columnDefs was mandatory and threw error if missing. Is now optional again.</li>
    <li>Major: Implemented auto-size for column. Now columns can be told to fit their content.</li>
    <li>Minor: New property: suppressParentsInRowNodes - if you don't want parents in the row node tree structure.</li>
    <li>Minor: Fixed up placement of menu icon, it was hitting the header border.</li>
    <li>Major: Rows can have variable heights with new getRowHeight() callback.</li>
    <li>Minor: bugfix - setColState was not restoring 'visible' correctly</li>
    <li>Minor: New APi - columnApi.resetState()</li>
    <li>Major: Implemented column header templates</li>

    <h3>Version 3.0.0</h3>

    <p>
        Version 3 is a major version and has breaking changes. Where possible, the grid will hint if you are using an old property.
    </p>

    <ul>
    <li>Major: Grouping of headers is now called 'columnGrouping' and can now take multiple levels of groups.</li>
    <li>Major: Pinning can now be done on the left and right, previously was just the right.</li>
    <li>Major: Row pivoting is now called row grouping. So the two types of grouping are now called Row Grouping and Column Grouping. Pivoting was taken out as it wasn't true pivoting. The was done to allow true pivoting to happen in a future release and avoid any name clashes.</li>
    <li>Major: gridOptions.groupKeys and gridOptions.groupAggFields are now gone. These were duplicated ways of setting rowGroups and rowAggregation. The correct (and only non-duplicated way) is to use colDef.rowGroupIndex and colDef.aggFunc.</li>
    <li>Major: New Column API method setColumnPinned().</li>
    <li>Major: api.refreshPivot() now called api.refreshRowGroup()</li>
    <li>Major: Event EVENT_COLUMN_PINNED_COUNT_CHANGED removed and EVENT_COLUMN_PINNED added.</li>
    <li>Major: Column getState() and setState() now include pinned state.</li>
    <li>Major: Header Height is now height per row, so if 25, and three column groups, total header height is 3x25 = 75. Before it was total header height (so height was split evenly across the header rows)</li>
    <li>Major: gridOptions.groupHeaders is no longer a property, as grouping in the headers is now defined inside the column definitions.</li>
    <li>Minor: CSS Classes ag-header-cell-grouped and ag-header-cell-not-grouped are no longer used.</li>
    <li>Major: colDef.headerGroupShow is now called colDef.columnGroupShow.</li>
    <li>Major: Icons {headerGroupOpened, headerGroupClosed} now called {columnGroupOpened, columnGroupClosed}</li>
    <li>Major: Column API - columnGroupOpened() renamed to setColumnGroupOpened()</li>
    <li>Major: setColumnVisible(key) now takes a 'key' which can be a colId, field, ColDef object or Column object - previously you had to provide a Column object. Also new method setColumnsVisible(listOfKeys) for updating batches of columns.</li>
    <li>Major: New methods setColumnPinned(key) and setColumnsPinned(listOfKeys) - behave similar to previously mentioned 'visible' methods</li>
    <li>Major: In get/set column state, pivotIndex is now called rowGroupIndex</li>
    <li>Major: If doing raw Javascript version, then angularGridGlobalFunction() is now deprecated, use "new ag.grid.Grid()" method instead.</li>
    <li>Major: checkboxSelection (on colDef) can now be a function, so you can use params in the function
        to work out at runtime if the cell should have a checkbox. gridOptions now also has function of the same
        name, so you can configure the grid to have a checkbox in the first column always regardless of the colDef
        (this is what the test drive does).</li>
    </ul>

    <h3>Version 2.3.7</h3>
    <li>Minor: Updated AngularJS 2 to version Beta 0. Example updated to show changes.</li>

    <h3>Version 2.3.5</h3>
    <li>Minor: Overlays can now be disabled via new properties suppressLoadingOverlay and suppressNoRowsOverlay.</li>

    <h3>Version 2.3.4</h3>
    <li>Bug fix: Template cache now working with IE9</li>
    <li>Bug fix: forEachNodeAfterFilter and forEachNodeAfterFilterAndSort were not working properly when grouping.</li>
    <li>Minor: Now set filter can take a comparator.</li>
    <li>Bug fix: Was not possible to add event listeners or set attributes to virtual elements after binding. This is now possible.</li>

    <h3>Version 2.3.3</h3>
    <li>Bug fix: Setting rowBuffer to zero did not work.</li>
    <li>Bug fix: Export to csv was not managing large exports.</li>
    <li>Minor: Moved Angular 2 examples to alpha 44.</li>

    <h3>Version 2.3.2</h3>
    <li>Bug fix: 'no rows' overlay was blocking column headers, so if showing, couldn't change filter.</li>

    <h3>Version 2.3.1</h3>
    <li>Bug fix: Angular 2 - EventEmitter for rowDeselected was missing.</li>
    <li>Major: Added getBusinessKeyForNode() method, to allow easily identifying of rows for automated testing.</li>
    <li>Minor: Removed declaration of 'module' and 'exports' in main.ts, so no longer clashes with node.ts typics.</li>
    <li>Minor: Fixed headerClass, array of classes was not working</li>

    <h3>Version 2.3.0</h3>
    <li>Major - Introduced 'no rows' message for when grid is empty.</li>
    <li>Major - Introduced custom overlays for 'no rows' and 'loading', so now they can be what you like.</li>
    <li>Major - Moved to AngularJS 2 alpha 38.</li>
    <li>Major - Took out auto loading of AngularJS 2 module with JSPM.</li>
    <li>Minor - Exposed global function for initialising Angular 1.x, to use if Angular not available on the global scope, eg using JSPM</li>
    <li>Minor - Bugfix - rowRenderer was not working when useEntireRow=true</li>

    <h3>Version 2.2.0</h3>
    <li>Major - Implemented 'destroy' API method, to release grids resources. Needed for Web Components and native
    Javascript (AngularJS lifecycle manages this for you).</li>
    <li>Major - Column resize events now have 'finished' flag, so if resizing, you know which event from a stream of
    'dragging' events is the final one.</li>
    <li>Major - New event: rowDeselected.</li>
    <li>Major - Now have 'customHeader' and 'customFooter' for export to csv.</li>
    <li>Minor - Now filters are positioned relative to their actual size instead of assuming each filter
                is 200px wide. Now wide filters don't fall off the edge of the grid.</li>
    <li>Minor - Bug fix #459 - getTopLevelNodes was called for not reason during filter initialisation which resulted in 'undefined' error for server side filtering</li>

    <h3>Version 2.1.3</h3>
    <li>Minor - Added header to Typescript definitions file and included in Definitely Typed</li>
    <li>Minor - Removed unused 'require' from agList - was conflicting when require defined elsewhere</li>

    <hr/>

    <p>
        <b>23rd Sep</b> ag-Grid 2.0 released - AngularJS 2 and Web Components supported
    </p>

    <hr/>

    <p>
        <b>13th Sep</b> First pass on AngularJS 2
    </p>

    <hr/>

    <p>
        <b>6th Sep</b> Floating headers and footers
    </p>

    <hr/>

    <p>
        <b>31th Aug</b> Column API, External Filtering, Excel Like Filtering
    </p>

    <hr/>

    <p>
        <b>16th Aug</b> Master & Slave Grids.
    </p>

    <hr/>

    <p>
        <b>26th July</b> minWidth and maxWidth for columns. Chaining of cell expressions.
    </p>

    <hr/>

    <p>
        <b>18th July</b> Expressions implemented. Grid now works like Excel!!
    </p>

    <hr/>

    <p>
        <b>5th July</b> Typescript, Values on Tool Panel, Column API
    </p>

    <hr/>

    <p>
        <b>21st June</b> First version of Tool Panel, showing / hiding / reordering / grouping columns.
    </p>

    <hr/>

    <p>
        <b>14th June</b> Server side sorting and filtering, headerValueGetter, newRowsAction, suppressUnSort & suppressMultiSort'.
    </p>

    <hr/>

    <p>
        <b>7th June</b> New features: Ensure Col Index Visible, No Isolated Scope, API for Sorting,
        API for Saving / Setting Filters
    </p>

    <hr/>

    <p>
        <b>31st May</b> New features: Default aggregation, filtering API, de-selection, foeEachInMemory.
    </p>

    <hr/>

    <p>
        <b>25th May</b> Keyboard Navigation and general improvements
    </p>

    <hr/>

    <p>
        <b>17th May</b> Revamp of Grouping, ensureIndexVisible, ensureNodeVisible, Multi Column Sort (thanks Dylan Robinson), Fixed Width Cols.
    </p>

    <hr/>

    <p>
        <b>26 April</b> - Volatile Columns, Soft Refresh, Cell Templates.
    </p>

    <hr/>

    <p>
        <b>25 April</b> - Bug fixes:
        <a href="https://github.com/ceolter/angular-grid/issues/35">Pinned Blank Space</a>,
        <a href="https://github.com/ceolter/angular-grid/issues/91">Group Sorting</a>,
        <a href="https://github.com/ceolter/angular-grid/issues/90">Cell Templates</a>,
        <a href="https://github.com/ceolter/angular-grid/issues/29">Expand / Collapse</a>
    </p>

    <hr/>

    <p>
        <b>20 April</b> - Value Getters, Context and Expressions. Will be available in 1.3, or take latest.
        All documented in relevant sections.
    </p>

    <hr/>

    <p>
        <b>18 April</b> - Gulp! Thank you Tanner Linsley for implementing Gulp.
    </p>

    <hr/>

    <p>
        <b>16 April</b> - Checked in column opening & closing column Groups. Now you can show and hide columns in groups.
        Will be available in 1.3, or take latest. Documentation page 'Grouping Headers' updated.
    </p>

    <hr/>

    <p>
        <b>13 April</b> - Checked in 'tab navigation for editing', so when you hit tab while editing a cell, it goes into
        editing the next cell. Will be available in 1.3, or take latest.
    </p>

    <hr/>

    <p>
        <b>12 April</b> - Checked in datasources, pagination, virtual paging, infinite scrolling. Will be available in 1.3, or take latest. Documentation
        pages 'Datasource', 'Pagination' and 'Virtual Paging' created.
    </p>

    <hr/>

    <p>
        <b>09 April</b> - Checked in support for 'Refresh Aggregate Data'. Will be available in 1.3, or take latest. Documentation
        page 'Grouping and Aggregating Rows' updated.
    </p>

    <hr/>

    <p>
        <b>06 April</b> - Checked in support for 'Loading Panel' to show when fetching data. Will be available in 1.3, or take latest. Documentation
        page for loading created.
    </p>

    <hr/>

    <p>
        <b>05 April</b> - Checked in support for custom icons in the headers. Will be available in 1.3, or take latest. Documentation
        page for icons created.
    </p>

    <hr/>

    <p>
        <b>04 April</b> - Checked in support for footers while grouping. Will be available in 1.3, or take latest. Documentation
        for grouping and example in 'test drive' updated to show.
    </p>

    <hr/>

    <p>
        <b>31 March</b> - DailyJS covers launch of Angular Grid.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
