<?php
$pageTitle = "Javascript Grid Column Moving";
$pageDescription = "Explains how to move columns in ag-Grid, including moving via the API and fixing columns.";
$pageKeyboards = "Javascript Grid Column Moving";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1">Column Moving</h1>

<p>
    Columns can be moved in the grid in the following ways:
    <ul>
        <li>Dragging the column header with the mouse or through touch.</li>
        <li>Using the column API.</li>
    </ul>
</p>

<h2>API</h2>

<p>
    The column API methods for moving columns are as follows:
    <ul>
        <li><code>moveColumn(key, toIndex)</code>: Move one column to specific index.</li>
        <li><code>moveColumns(keys, toIndex)</code>: Move list of columns to specific index.</li>
        <li><code>moveColumnByIndex(fromIndex, toIndex)</code>: Move column from <code>fromIndex</code> to <code>toIndex</code>.</li>
    </ul>
</p>

<h2>Simple Example</h2>

<p>
    The example below demonstrates simple moving via mouse dragging and the API. The following
    can be noted:
    <ul>
        <li>Dragging the column headers with the mouse moves the column to the new location.</li>
        <li>
            The <b>Medals First</b> and <b>Medals Last</b> buttons call the API
            <code>moveColumns(keys, toIndex)</code>
            to place the columns at the start and at the end respectively.
        </li>
        <li>
            The <b>Country First</b> button calls the API <code>moveColumn(key, toIndex)</code>
            to place the country column first.
        </li>
        <li>
            The <b>Swap First Two</b> button calls the API <code>moveColumnByIndex(fromIndex, toIndex)</code>
            to swap the first two columns.
        </li>
        <li>
            The <b>Print Columns</b> button calls the API <code>getAllGridColumns()</code> to print
            to the dev console the current column order.
        </li>
    </ul>
</p>

<?= example('Column Moving Simple', 'column-moving-simple', 'generated') ?>

<h2>Pin with Move</h2>

<p>
    It is possible to pin a column by moving it in the following ways:
    <ul>
        <li>
            When columns are pinned, drag the column to the pinned area.
        </li>
        <li>
            When no columns are pinned, drag the column to the edge of the grid and wait
            for approximately one second.
        </li>
    </ul>

    <img src="./pinningByMoving.gif" style="margin: 10px; border: 1px solid #aaa;"/>

</p>


<h2>Suppress & Lock</h2>

<p>
    Two column properties restrict movement of columns via the UI by the user:
    <ul>
        <li>
            <code>suppressMovable</code>: The column header cannot be dragged by the user to move
            the columns. However the column can be inadvertently moved by placing other columns around it
            thus only making it practical if all columns have this property.
        </li>
        <li>
            <code>lockPosition</code>: The column will always appear first, cannot be dragged by the user,
            and can not be moved out of position by dragging other columns.
        </li>
    </ul>
</p>

<h3>Suppress & Lock Example</h3>

<p>
    The example below demonstrates these properties as follows:
    <ul>
        <li>
            The column 'Locked' is locked into the first position. It is not possible
            to move this column, or have other columns moved over it to impact it's position.
        </li>
        <li>
            The column 'Athlete' has moving suppressed. It is not possible to move
            this column, however it is possible to move other columns around it.
        </li>
    </ul>
</p>

<?= example('Column Suppress & Lock', 'column-suppress-and-lock', 'generated') ?>

<h3>Advanced Lock Example</h3>


<?php include '../documentation-main/documentation_footer.php';?>
