<?php
$key = "Events";
$pageTitle = "ag-Grid Events";
$pageDescription = "Learn how each events impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid events";
include '../documentation_header.php';
?>

<div>

    <h2>Events</h2>


    <p>
        Below are listed all the events of the grid. Remember you can listen to events in
        the following ways:
    <p>

    <h4>
        <img src="/images/javascript.png" height="20"/>
        <img src="/images/angularjs.png" height="20px"/>
        Javascript and AngularJS 1.x
    </h4>
    <p>
        Add the relevant onXXX() method to the gridOptions or register a method
        via api.addEventListener(eventName, handler).
    </p>

    <h4>
        <img src="/images/angular2.png" height="20px"/>
        AngularJS 2
    </h4>
    <p>
        Add the relevant onXXX() method to the gridOptions or register a method
        via api.addEventListener(eventName, handler). You can also register events
        using AngularJS 2 event binding eg <i>(event-name)="myEventHandler"</i>.
    </p>

    <h4>
        <img src="/images/webComponents.png" height="20px"/>
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

    <h2>Core Grid Events</h2>

    <table class="table">
        <tr>
            <th>Event</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>rowSelected</th>
            <td>Row is selected.</td>
        </tr>
        <tr>
            <th>rowDeselected</th>
            <td>Row is de-selected.</td>
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
            <th>cellClicked</th>
            <td>Cell is clicked.</td>
        </tr>
        <tr>
            <th>cellDoubleClicked</th>
            <td>Cell is double clicked.</td>
        </tr>
        <tr>
            <th>cellContextMenu</th>
            <td>Cell is right clicked.</td>
        </tr>
        <tr>
            <th>cellFocused</th>
            <td>Cell is focused.</td>
        </tr>
        <tr>
            <th>modelUpdated</th>
            <td>Displayed rows have changed. Happens following sort, filter or tree expand / collapse events.</td>
        </tr>
        <tr>
            <th>beforeSortChanged<br/>afterSortChanged</th>
            <td>Sorting changed. 'before' dispatches before the grid executes the sort. 'after'
                dispatches after the grid executes the sort.</td>
        </tr>
        <tr>
            <th>filterModified<br/>beforeFilterChanged<br/>afterFilterChanged</th>
            <td>Filtering changed. 'before' dispatches before the grid executes the filter. 'after'
                dispatches after the grid executes the filter. filterModified is useful when using the Apply button.</td>
        </tr>
        <tr>
            <th>ready</th>
            <td>ag-Grid has initialised. The name 'ready'
                was influenced by the authors time programming the Commodore 64. Use this event if,
                for example, you need to use the grid's API to fix the columns to size.</td>
        </tr>
        <tr>
            <th>selectionChanged</th>
            <td>Selection is changed. Event contains the selection.</td>
        </tr>
        <tr>
            <th>cellValueChanged</th>
            <td>Value has changed after editing.</td>
        </tr>

    </table>

    <h2>Column Changed Events</h2>

    <p>
        A column change event gets fired whenever something changes with one of the columns.
        You add a column change event as follows:
    </p>

    <table class="table">
        <tr>
            <th>Event</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>columnEverythingChanged</th>
            <td>Shotgun - gets called when new columns are set, so everything has changed.</td>
        </tr>
        <tr>
            <th>columnResized</th>
            <td>A column was resized.</td>
        </tr>
        <tr>
            <th>columnPivotChanged</th>
            <td>A pivot column was added or removed.</td>
        </tr>
        <tr>
            <th>columnValueChanged</th>
            <td>A value column was added or removed.</td>
        </tr>
        <tr>
            <th>columnMoved</th>
            <td>A column was moved.</td>
        </tr>
        <tr>
            <th>columnVisible</th>
            <td>A column was hidden / shown.</td>
        </tr>
        <tr>
            <th>columnGroupOpened</th>
            <td>A column group was opened / closed.</td>
        </tr>
        <tr>
            <th>columnPinnedCountChanged</th>
            <td>The number of pinned columns has changed.</td>
        </tr>
    </table>

</div>

<?php include '../documentation_footer.php';?>
