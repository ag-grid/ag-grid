<?php
$key = "Change Log";
$pageTitle = "ag-Grid Angular Grid Change Log";
$pageDescription = "ag-Grid change log. Details the items that have change between each release.";
$pageKeyboards = "ag-Grid Angular Grid Change Log";
include 'documentation_header.php';
?>

<div style="padding: 20px;">

    <h3>Version 3.3.3</h3>
    <li>Buf fix: Pinned rows were not colored correctly</li>

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

<?php include 'documentation_footer.php';?>
