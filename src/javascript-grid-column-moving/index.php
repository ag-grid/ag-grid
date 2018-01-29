<?php
$pageTitle = "ag-Grid: Core Features - Column Moving";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. Here we explains how to move columns in ag-Grid, including moving via the API and fixing columns.";
$pageKeyboards = "Javascript Grid Column Moving";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Column Moving</h1>

<p>
    Columns can be moved in the grid in the following ways:
</p>
    <ul class="content">
        <li>Dragging the column header with the mouse or through touch.</li>
        <li>Using the column API.</li>
    </ul>

<h2>API</h2>

<p>
    The column API methods for moving columns are as follows:
</p>
    <ul class="content">
        <li><code>moveColumn(key, toIndex)</code>: Move one column to specific index.</li>
        <li><code>moveColumns(keys, toIndex)</code>: Move list of columns to specific index.</li>
        <li><code>moveColumnByIndex(fromIndex, toIndex)</code>: Move column from <code>fromIndex</code> to <code>toIndex</code>.</li>
    </ul>

<h2>Simple Example</h2>

<p>
    The example below demonstrates simple moving via mouse dragging and the API. The following
    can be noted:
</p>
    <ul class="content">
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

<?= example('Column Moving Simple', 'moving-simple', 'generated') ?>

<h2>Suppress Hide Leave</h2>

<p>
    The grid property <code>suppressDragLeaveHidesColumns</code> will stop columns getting removed
    from the grid if they are dragged outside of the grid. This is handy if the user moves a column
    outside of the grid by accident while moving a column but doesn't intend to make it hidden.
</p>

<h2>Suppress Movable</h2>

<p>
    The column property <code>suppressMovable</code> changes whether the column can be dragged.
    The column header cannot be dragged by the user to move
    the columns when <code>suppressMovable=true</code>.
    However the column can be inadvertently moved by placing other columns around it
    thus only making it practical if all columns have this property.
</p>

<h2>Lock Position</h2>

<p>
    The column property <code>lockPosition</code> locks columns to the first position in the grid.
    When <code>lockPosition=true</code>, the column will always appear first, cannot be dragged by the user,
    and can not be moved out of position by dragging other columns.
</p>

<h2>Suppress Movable & Lock Position Example</h2>

<p>
    The example below demonstrates these properties as follows:
</p>
    <ul class="content">
        <li>
            The column 'Age' is locked as first column in the scrollable area of the grid. It is not possible
            to move this column, or have other columns moved over it to impact it's position. As a result the 'Age' column marks the beggining of the scrollable area regardless it's position. 
        </li>
        <li>
            The column 'Athlete' has moving suppressed. It is not possible to move
            this column, however it is possible to move other columns around it.
        </li>
        <li>
            The grid has <code>suppressDragLeaveHidesColumns=true</code> so columns dragged
            outside of the grid are not hidden (normally dragging a column out of the grid
            will hide the column).
        </li>
        <li>
            Age and Athlete columns have the user provided <code>locked-col</code>
            and <code>suppress-movable-col</code> CSS classes applied to them respectively to
            change the background color.
        </li>
    </ul>

<?= example('Column Suppress & Lock', 'suppress-and-lock', 'generated') ?>

<h2>Advanced Locked Position Example</h2>

<p>
    Below is a more real work example of where locked columns would be used.
    The first column is a row number, similar to the row column in Excel. The
    second column is a buttons column - an application could have buttons for
    actions eg 'Delete', 'Buy', 'Sell' etc.
</p>

<p>
    From the example the following can be noted:
</p>
    <ul class="content">
        <li>
            The first two columns are locked into first position by setting
            <code>colDef.lockPosition=true</code>. This means they cannot be moved out of place,
            including other columns can not be moved around them.
        </li>
        <li>
            The first two columns have the user provided <code>locked-col</code> CSS class
            applied to them to change the background color.
        </li>
        <li>
            The sample application listens for column pinned events. If any column is pinned,
            then the locked columns are also pinned. This is to keep the locked columns at the
            first position.
            <ul class="content">
                <li>
                    Clicking <b>Pin Athlete</b> will pin athlete, which will result in fixed columns
                    getting pinned.
                </li>
                <li>
                    Clicking <b>Un-Pin Athlete</b> will un-pin athlete, which will result in fixed columns
                    getting un-pinned (assuming no other columns are left pinned).
                </li>
            </ul>
        </li>
    </ul>

<?= example('Advanced Lock', 'advanced-lock', 'generated') ?>

<h2>Lock Visible</h2>

<p>
    When you move columns around it is possible to change their visibility as follows:
</p>
    <ul class="content">
        <li>You can hide a column by dragging it outside of the grid.</li>
        <li>
            You can show a column by dragging it from the
            <a href="../javascript-grid-tool-panel/">tool panel</a>
            onto the grid.
        </li>
    </ul>

<p>
    The column property <code>lockVisible</code> will stop individual columns from been made
    visible or hidden via the UI. When <code>lockVisible=true</code>, then the column will not
    hide when it is dragged out of the grid, and columns dragged from the tool panel onto the
    grid will not become visible.
</p>

<p>
    There is slight overlap with the property <code>suppressDragLeaveHidesColumns</code>.
    When <code>suppressDragLeaveHidesColumns=true</code> then all columns remain visible
    if they are dragged outside of the grid. This is a good way to block all columns from
    hiding as the user reorders the columns via dragging. The <code>lockVisible</code>
    property is at the column level and blocks all UI functions that change a column's visibility.
</p>

<h3>Lock Visible Example</h3>

<p>
    The example below shows lock visible. The following can be noted:
</p>
    <ul class="content">
        <li>
            The columns Age, Gold, Silver and Bronze are all locked visible.
            It is not possible to hide the columns by dragging them out of the grid
            and not possible to show the columns by dragging them in from the tool panel.
        </li>
        <li>
            If you make a group visible or hidden in the tool panel, the locked columns
            are not impacted.
        </li>
        <li>
            If you drag a group (eg the 'Athlete' group) out of the grid, all normal
            columns in the group are removed and all locked columns in the group are left intact.
        </li>
    </ul>

<?= example('Lock Visible', 'lock-visible', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
