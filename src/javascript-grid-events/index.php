<?php
$key = "Events";
$pageTitle = "ag-Grid Events";
$pageDescription = "Learn how each events impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid events";
$pageGroup = "interfacing";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="events">Events</h2>


    <p>
        Below are listed all the events of the grid you can listen to.
    <p>

    <?php if (isFrameworkJavaScript()) { ?>
        <div>
            <h4 id="javascript-and-angularjs">
                <img src="/images/javascript.png" height="20"/> Javascript
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler).
            </p>
        </div>
    <?php } ?>

    <?php if (isFrameworkAngularJS()) { ?>
        <div>
            <h4 id="javascript-and-angularjs">
                <img src="/images/angularjs.png" height="20px"/>
                AngularJS 1.x
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler).
            </p>
            <note>
                For AngularJS 1.x - ag-Grid does not not fire events inside an Angular JS digest
                cycle. This is done on purpose
                for performance reasons, as there are many events fired, even if you don't listen to them. Firing the digest
                cycle
                for each one would kill performance. So you may want to $scope.$apply() after you handle the event.
            </note>
        </div>
    <?php } ?>

    <?php if (isFrameworkReact()) { ?>
        <div>
            <h4 id="react">
                <img src="/images/react.png" height="20px"/>
                React
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler). You can also register events
                using React props in your JSX eg <i>eventName={this.myEventHandler.bind(this)}</i>.
            </p>
        </div>
    <?php } ?>

    <?php if (isFrameworkAngular()) { ?>
        <div>
            <h4 id="angular">
                <img src="/images/angular2.png" height="20px"/>
                Angular
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler). You can also register events
                using Angular event binding eg <i>(event-name)="myEventHandler"</i>.
            </p>
        </div>
    <?php } ?>

    <?php if (isFrameworkVue()) { ?>
        <div>
            <h4 id="vuejs">
                <img src="/images/vue_large.png" height="20px"/>
                VueJS
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler). You can also register events
                using VueJS event binding eg <i>:event-name="myEventHandler"</i>.
            </p>
        </div>
    <?php } ?>

    <?php if (isFrameworkWebComponents()) { ?>
        <div>
            <h4 id="web-components">
                <img src="../images/webComponents.png" height="20px"/>
                Web Components
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler). You can also register events
                by calling <i>domElement.addEventListener(eventName, handler)</i> or placing
                an onXXX method directly onto the dom element - but remember the latter
                uses lower case event name and handler name to be consistent with how other
                DOM elements work.
            </p>
        </div>
    <?php } ?>

    <?php if (isFrameworkAurelia()) { ?>
        <div>
            <h4 id="aurelia-components">
                <img src="/images/aurelia.png" height="20px"/>
                Aurelia Components
            </h4>
            <p>
                Add the relevant onXXX() method to the gridOptions or register a method
                via api.addEventListener(eventName, handler). You can also register events
                by calling <i>domElement.addEventListener(eventName, handler)</i> or placing
                an onXXX method directly onto the dom element - but remember the latter
                uses lower case event name and handler name to be consistent with how other
                DOM elements work.
            </p>
        </div>
    <?php } ?>

<table id="ag-grid-events" class="table">

    <!------------------->
    <!-- Selection -->
    <!------------------->
    <tr>
        <th colspan="2"><h2>Selection</h2></th>
    </tr>
    <tr>
        <th>cellClicked</th>
        <td>Cell is clicked.</td>
    </tr>
    <tr>
        <th>cellDoubleClicked</th>
        <td>Cell is double clicked.</td>
    </tr>
    <tr>
        <th>cellFocused</th>
        <td>Cell is focused.</td>
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

    <!------------------->
    <!-- Editing -->
    <!------------------->
    <tr>
        <th colspan="2"><h2>Editing</h2></th>
    </tr>

    <tr>
        <th>cellValueChanged</th>
        <td>Value has changed after editing.</td>
    </tr>
    <tr>
        <th>rowValueChanged</th>
        <td>A cells value within a row has changed.</td>
    </tr>
    <tr>
        <th>rowEditingStarted</th>
        <td>Editing a row has started (when row editing is enabled). When row editing, this event will be fired
            once, and <code>cellEditingStarted</code> will be fired for each cell being edited.
        </td>
    </tr>
    <tr>
        <th>rowEditingStopped</th>
        <td>Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired
            once, and <code>cellEditingStopped</code> will be fired for each cell being edited.
        </td>
    </tr>
    <tr>
        <th>cellEditingStarted</th>
        <td>Editing a cell has started.</td>
    </tr>
    <tr>
        <th>cellEditingStopped</th>
        <td>Editing a cell has stopped.</td>
    </tr>
    <tr>
        <th>itemsAdded</th>
        <td>Client added a new row.</td>
    </tr>
    <tr>
        <th>itemsRemoved</th>
        <td>Client removed a row.</td>
    </tr>

    <!------------------->
    <!-- Sort & Filter -->
    <!------------------->
    <tr>
        <th colspan="2"><h2>Sort & Filter</h2></th>
    </tr>

    <tr>
        <th>sortChanged<br/>beforeSortChanged<br/>afterSortChanged</th>
        <td>
            sortChanged -> Sort has changed, grid also listens for this and updates the model.<br/>
            beforeSortChanged -> Sort has changed, grid has not updated.<br/>
            afterSortChanged -> Sort has changed, grid has updated.<br/>
        </td>
    </tr>
    <tr>
        <th>filterChanged</br>beforeFilterChanged<br/>afterFilterChanged<br/>filterModified</th>
        <td>
            filterChanged -> Filter has changed, grid also listens for this and updates the model.<br/>
            beforeFilterChanged -> Filter has changed, grid has not updated.<br/>
            afterFilterChanged -> Filter has changed, grid has updated.<br/>
            filterModified -> Gets called when filter has been modified, but grid not informed. Useful when
            using an apply button inside the filter.<br/>
        </td>
    </tr>

    <!------------------->
    <!-- Columns -->
    <!------------------->
    <tr>
        <th colspan="2"><h2>Columns</h2></th>
    </tr>

    <tr>
        <th>columnEverythingChanged</th>
        <td>Shotgun - gets called when either a) new columns are set or b) columnApi.setState() is used, so
            everything has changed.
        </td>
    </tr>
    <tr>
        <th>rowGroupOpened</th>
        <td>A row group was opened or closed.</td>
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
        <th>columnRowGroupChanged</th>
        <td>A row group column was added or removed.</td>
    </tr>
    <tr>
        <th>columnValueChanged</th>
        <td>A value column was added or removed.</td>
    </tr>
    <tr>
        <th>columnMoved</th>
        <td>A column was moved. To find out when the column move is finished you can use the dragStopped event below.
        </td>
    </tr>
    <tr>
        <th>columnGroupOpened</th>
        <td>A column group was opened / closed.</td>
    </tr>
    <tr>
        <th>virtualColumnsChanged</th>
        <td>The list of rendered columns has changed (only columns in the visible scrolled viewport are rendered by
            default).
        </td>
    </tr>
    <tr>
        <th>newColumnsLoaded</th>
        <td>User has set in new columns.</td>
    </tr>
    <tr>
        <th>columnPivotModeChanged</th>
        <td>The pivot mode flag was changed</td>
    </tr>
    <tr>
        <th>columnRowGroupChanged</th>
        <td>A row group column was added, removed or order changed.</td>
    </tr>
    <tr>
        <th>columnPivotChanged</th>
        <td>A pivot column was added, removed or order changed.</td>
    </tr>
    <tr>
        <th>gridColumnsChanged</th>
        <td>The list of grid columns has changed.</td>
    </tr>
    <tr>
        <th>displayedColumnsChanged</th>
        <td>The list of displayed columns has changed, can result from columns open / close, column move, pivot,
            group, etc
        </td>
    </tr>

    <!------------------->
    <!-- Pagination -->
    <!------------------->
    <tr>
        <th colspan="2"><h2>Pagination</h2></th>
    </tr>
    <tr>
        <th>paginationReset</th>
        <td>
            Pagination service is reset.
        </td>
    </tr>
    <tr>
        <th>paginationPageLoaded</th>
        <td>
            Pagination page load is finished.
        </td>
    </tr>
    <tr>
        <th>paginationPageRequested</th>
        <td>
            Pagination page load is requested.
        </td>
    </tr>

    <!------------------->
    <!-- Miscellaneous -->
    <!------------------->
    <tr>
        <th colspan="2"><h2>Miscellaneous</h2></th>
    </tr>
    <tr>
        <th>gridReady</th>
        <td>ag-Grid has initialised. The name 'ready'
            was influenced by the authors time programming the Commodore 64. Use this event if,
            for example, you need to use the grid's API to fix the columns to size.
        </td>
    </tr>
    <tr>
        <th>gridSizeChanged</th>
        <td>The grid had to lay out again because it changed size.</td>
    </tr>
    <tr>
        <th>modelUpdated</th>
        <td>Displayed rows have changed. Happens following sort, filter or tree expand / collapse events.</td>
    </tr>
    <tr>
        <th>floatingRowDataChanged</th>
        <td>The client has set new floating data into the grid</td>
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
        <td>The client has set new data into the grid</td>
    </tr>
</table>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
