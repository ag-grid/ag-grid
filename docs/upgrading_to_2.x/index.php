<?php
$key = "Upgrading to 2.0";
$pageTitle = "Upgrading to ag-Grid 2.x";
$pageDescription = "Shows steps in moving your project from ag-Grid 1.x to ag-Grid 2.0.";
$pageKeyboards = "ag-Grid upgrading 1.x to 2.0";
include '../documentation_header.php';
?>

<div>

    <h3>Overview</h3>
    <p>
        ag-Grid 2.0 is is a significant step forward for ag-Grid. The internals have been reworked to support
        Web Components and Angular 2. For example, the interface into the grid is now clearly separated into
        events (data out), properties (data in), callbacks (queries out) and an API (other interaction).
        To get these changes in required reworking the interface. The heart of the grid is still the same,
        but to get your application working with ag-Grid 2.0 will require some small changes, mostly just
        method renames.
    </p>

    <p>
        Previous the interface into ag-Grid was modelled around ui-Grid. This was done as I wanted
        a low barrier to entry for my 'new on the scene' grid. Now that ag-Grid has a very large following, plus
        I have learnt a lot recently, I believe the new interface to be better suited to the
        future (Web Components and AngularJS 2).
    </p>

    <p>
        If your interested you can read the <a href="http://webcomponents.org/articles/web-components-best-practices/">
            best practices for Web Components</a> to understand why I made these interface changes.
    </p>

    <p>
        I have also moved away from Angular Grid and towards ag-Grid with the naming. This includes a new
        (mirrored) website www.ag-grid.com.
    </p>

    <p>The remainder of this page goes through the breaking changes.</p>

    <h3>angular-Grid -> ag-Grid</h3>

    <p>
        All distribution files (.css and .js) are now <i>ag-Grid</i> eg <i>ag-Grid.js</i> and <i>ag-Grid.css</i>.
        So change where you include the ag-Grid files to the new names.
    </p>

    <p>
        <b>NPM Only</b>: NPM package is now ag-grid, not angular-grid as before. So install into NPM as:<br/>
        <i>npm install <b>ag-grid</b></i>
    </p>
    <p>
        <b>AngularJS 1.x Only</b>: Angular module is now agGrid, not angularGrid. So to include the module use:<br/>
        <i>var yourSexyModule = angular.module("yourSexyModuleName", <b>["agGrid"]</b>);</i>
    </p>
    <p>
        <b>Javascript Only</b>: ag-Grid global func is now agGridGlobalFunc. So to create grid from Javascript:<br/>
        <i><b>agGridGlobalFunc</b>('#myGrid', gridOptions);</i>
    </p>

    <h3>Events</h3>

    <p>
        Before, there were only 'events' for the column changes, and all other data out of the grid (eg cellClicked)
        came via callbacks. Now all data from the grid works as follows:
        <ul>
            <li>All data out of the grid comes via events.</li>
            <li>There is one <i>eventing system</i> for the entire grid, it's not exclusive to columns.</li>
            <li>To listen for an event, either:<br>
                a) Register interest with <i>api.addEventListener(eventName, listener)</i><br/>
                b) provide the relevant <i>onXXX()</i> handler method in the gridOptions.</li>
        </ul>
        The new pattern is similar to how native DOM entities work.
    </p>

    <p>
        Steps to upgrade are as follows:
        <ul>
        <li>
            Previously column events were registered with <i>columnApi</i> and grid events were registered
            by overriding <i>onXXX()</i> methods in gridOptions. Now both are the same, you have the choice of
            <i>onXXX</i> or <i>addEventListener</i> method.
        </li>
        <li>
            Event names for columns have changed as follows:<br>
            <i>
            everything -> columnEverythingChanged<br>
            pivot -> columnPivotChanged<br>
            value -> columnValueChanged<br>
            pinnedCountChanged -> columnPinnedCountChanged<br>
            </i>
            The following have not changed:
            <i>
            columnMoved<br>
            columnVisible<br>
            columnGroupOpened<br>
            columnResized<br>
            </i>
        </li>
        <li>
            All event handler methods on gridOptions now start with 'on'. For example, <i>rowClicked(event)</i>
            is now called <i>onRowClicked(event)</i>.
        </li>
    </ul>
    </p>

    <p>Note the the <i>onXXX(event)</i> handler takes a parameter. This parameter is the same event that gets passed
    to the event listener registered with <i>addEventListener</i>.</p>

    <h3>Selection</h3>

    <p>
        Selection works the same, but the selected rows are no longer provided in gridOptions. The
        selected rows are available from the following locations:
    </p>
    <ul>
        <li>
            The selection event contains both <i>selectedRows</i> and <i>selectedNodesById</i>.
        </li>
        <li>
            The grid api has methods <i>getSelectedNodes(), getSelectedNodesById() and
            getSelectedRows()</i> for getting the current selection.
        </li>
    </ul>

    <p>
        Data coming out of the grid via Events, and not via shared scope, is the way of the future (cough AngularJS 2
        and Web Components).
    </p>

    <h3>forEachInMemory / getVirtualRowCount</h3>

    <p>
        <i>forEachInMemory()</i> and <i>getVirtualRowCount()</i> are used a lot by people, and not for the purpose I intended. So to
        align the grid with what you guys are using it for, I have added the following:
    <ul>
        <li><i>forEachNode(callback):</i> replaces forEachInMemory.</li>
        <li><i>forEachNodeAfterFilter(callback):</i> for iterating through all nodes after filter is applied.</li>
        <li><i>forEachNodeAfterFilterAndSort(callback):</i> for iterating after filter and sort is applied.</li>
    </ul>
    </p>

    <p>
        People were using the rowModel and virtualRow methods to get the rows after sort and filter,
        which was not great. The virtualRow methods are still there and you can stay using,
        but I'd recommend the methods above for getting data after sort and filter.
    </p>

    <h3>dontUseScrolls -> forPrint</h3>

    <p>
        <i>dontUseScrolls</i> is now called <i>forPrint</i>. I implemented this feature for making printable
        versions of the grid (hence no tool panel etc). It also gave the grid variable height (based on number
        of rows) but was not a good solution for achieving this on a web page. I will solve the 'variable row
        height' as a separate feature shortly.
    </p>
    <p>
        The feature still works the same so you can still use it (it's just a name change), however I wanted
        to make the name change so we are all on the same page, no confusion, forPrint is for printing the grid.
        If you find another use for it and you find it isn't great for that other use, that's not a problem
        with the grid so don't raise it in the forum!!
    </p>

    <h3>onNewRows, onNewCols, onNewDatasource</h3>

    <p>
        The methods <i>onNewRows(), onNewCols()</i> and <i>onNewDatasource()</i> are now gone. The correct way to tell the grid
        that there are new rows, cols or datasource is to use the <i>setRowData(), setColumnDefs()</i> and <i>setDatasource()</i>.
        The old way was my attempt to mimic how ui-Grid works by sharing $scope items, however I'm no longer interested in that.
        The new way allows Web Component and AngularJS 2 bound properties (yeeah haa!!!).
    </p>

    <h3>Web Component agile-grid</h3>

    <p>
        The web component tag was "&lt;agile-grid>". This is now changed to "&lt;ag-grid>". Sorry about that, I was high
        on mushrooms when I thought 'agile' was where I was going with the name.
    </p>

    <h3>Module awk -> ag</h3>

    <p>
        For those using TypeScript definitions, you will notice the top most module name was "awk". It is now "ag".
        Again I was taking drugs with awk.
    </p>
</div>

<?php include '../documentation_footer.php';?>
