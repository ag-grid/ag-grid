<?php
$pageTitle = "Updating Data: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Updating Data. Data can be updated in real time. The grid can highlight the change by flashing the cells or by animation inside the cell as the cell refreshes. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Updating Client-Side Data</h1>

<p class="lead">
    There are many ways in which data can change in your application, and as a result many ways in which you
    can inform the grid of data changes. This section explains the different ways of how you can update
    data inside the grid using the grid's API.
</p>

<h2>Updates vs Edits vs Refresh</h2>

<p>
    Updating data in the grid via the grid's API does not cover all the ways in which data can change
    inside the grid. Data can also change in the grid in the following ways:
</p>

<ol class="content">
    <li>
        Editing data inside the grid using the grid's UI, e.g. by the user double-clicking on a cell and
        editing the cell's value. When this happens the grid is in control and there is no need to
        explicitly tell the grid data has changed. See
        <a href="../javascript-grid-cell-editing">in-line editing</a> on how to edit via the grid's UI.
    </li>
    <li>
        The grid's data is updated from elsewhere in your application. This can happen if you pass data
        to the grid and then subsequently change that data outside of the grid. This leaves
        the grid's view out of sync with the data that it has. In this instance what you want to do is
        <a href="../javascript-grid-refresh">refresh the view</a> to have the grid's UI redraw to display
        the data changes.
    </li>
</ol>

<h2 id="setting-fresh-row-data">Setting Fresh Row Data</h2>

<p>
    The easiest way to update data inside the grid is to replace the data you gave it with a fresh
    set of data. This is done by either updating the <code>rowData</code> bound property (if using a
    framework) or calling <code>api.setRowData(newData)</code>.
</p>

<p>
    Replacing the data with a fresh set means the grid will treat
    it as a brand new set of data and as such the following will occur:
</p>

<ul>
    <li>
        Row selection will be cleared.
    </li>
    <li>
        If grouping, the open / closed state of the groups will be cleared.
    </li>
    <li>
        The entire grid's UI will be refreshed from scratch. This has the following drawbacks:
        <ul>
            <li>
                All <a href="../angular-grid-cell-rendering/">Cell Renderers</a> will be destroyed and
                re-created with no option to have them refresh, losing out on a chance to provide
                custom animation between value changes (e.g. fade or slide old value out).
            </li>
            <li>
                <a href="../javascript-grid-animation.">Row Animation</a> will not be applied. For example,
                if the difference in data is one row is removed, all rows below will jump up one position
                rather than having a smooth transition.
            </li>
            <li>
                It is not possible to highlight data changes, e.g. to flash cells.
            </li>
        </ul>
    </li>
    <li>
        All of the Client-Side Row Model calculations will be redone from scratch, i.e. sorting,
        filtering, grouping, aggregation and pivoting.
    </li>
</ul>

<p>
    Use the technique of setting new Row Data when you are dealing with a different distinct set of data
    e.g. loading a new report with a completely different dataset to the previous one. This makes sure nothing
    is lying around from the old dataset and all data-related grid state (selection, groups etc.) is cleared.
</p>

<h2>Changes to Row Data</h2>

<p>
    Changes to Row Data means you want to change some of the data and have the grid keep all state that
    it had before the data change.
</p>

<p>
    Keeping all state means items such as row selection and group open / closed state will be maintained.
</p>

<p>
    There are different ways of updating row data which are summarised as follows:
</p>

<ul>
    <li>
        <h3>Single Row / Cell</h3>
        <p>
            Updates the value of a single row or cell. This is done by getting a reference
            to the Row Node and then calling either
            <code>rowNode.setData()</code> or <code>rowNode.setDataValue()</code>.
        </p>
        <p>
            Use transactions for updating a small number of individual rows infrequently.
            There is no way to insert or remove rows with this method.
        </p>
        <p>
            See <a href="../javascript-grid-data-update-single-row-cell/">Updating Single Row / Cell</a>
            for more details.
        </p>
    </li>
    <li>
        <h3>Transaction</h3>
        <p>
            The grid takes a transaction containing rows to add, remove
            and update. This is done using <code>api.applyTransaction(transaction)</code>.
        </p>
        <p>
            Use transactions for doing add, remove or update operations on a large number of rows
            that are infrequent.
        </p>
        <p>
            If you are frequently updating rows (e.g. 5 or more updates a second), consider moving
            to High Frequency instead (achieved with Async Transactions).
        </p>
        <p>
            See <a href="../javascript-grid-data-update-transactions/">Transaction Updates</a>
            for more details.
        </p>
    </li>
    <li>
        <h3>High Frequency</h3>

        <p>
            High Frequency (achieved with Async Transactions) is a mechanism of applying many transactions
            over a small space of time and have the grid apply all the transactions in batches.
            The high frequency / batch method is for when you need the fastest possible way to process many continuous
            updates, such as providing a stream of updates to the grid. This is done using
            the API <code>applyTransactionAsync(transaction)</code>.
        </p>
        <p>
            Use Async Transactions for doing add, remove or update operations that are frequent, e.g. for
            managing streaming updates into the grid of tens, hundreds or thousands of updates a second.
        </p>
        <p>
            See <a href="../javascript-grid-data-update-high-frequency/">High Frequency Updates</a>
            for more details.
        </p>
    </li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
