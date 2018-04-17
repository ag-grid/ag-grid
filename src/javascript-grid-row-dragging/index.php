<?php
$pageTitle = "Row Dragging: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Row Dragging. Row Dragging allows you to re-arrange rows by dragging them. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "Javascript Grid row dragging";
$pageGroup = "features";
include '../documentation-main/documentation_header.php';
?>

    <h1>
        Row Dragging
    </h1>

    <p class="lead">
        Row dragging is used to rearrange rows by dragging the row with the mouse. To
        enable row dragging, set the column property <code>rowDrag</code> on one (typically
        the first) column.
    </p>

    <snippet>// option 1 - all rows are draggable
colDef = {
    rowDrag: true,
    ...
}

// option 2 - only some rows are draggable
colDef = {
    rowDrag: function(params) {
        // only allow non-groups to be dragged
        return !params.node.group;
    },
    ...
}</snippet>

    <p>
        There are two ways in which row dragging works in the grid, managed and unmanaged:
    </p>
        <ul class="content">
            <li>
                <b>Managed Dragging</b>: This is the simplest and the grid will rearrange
                rows as you drag them.
            </li>
            <li>
                <b>Unmanaged Dragging</b>: This is more complex and more powerful. The grid
                will not rearrange rows as you drag. Instead the application is responsible
                for responding to events fired by the grid and rows are rearranged by the
                application.
            </li>
        </ul>

    <h2>Managed Dragging</h2>

    <p>
        In managed dragging, the grid is responsible for rearranging the rows as the rows
        are dragged. Managed dragging is enabled with the property <code>rowDragManaged=true</code>.
    </p>

    <p>
        The example below shows simple managed dragging. The following can be noted:
    </p>
        <ul class="content">
            <li>
                The first column has <code>rowDrag=true</code> which results in a
                draggable area included in the cell.
            </li>
            <li>
                The property <code>rowDragManaged</code> is set, to tell the grid to move
                the row as the row is dragged.
            </li>
            <li>
                If a sort (click on the header) or filter (open up the column menu) is
                applied to the column, the draggable icon for row dragging is hidden.
                This is consistent with the constraints explained after the example.
            </li>
        </ul>

    <?= example('Row Drag Simple Managed', 'simple-managed', 'generated') ?>

    <p> The logic for managed dragging is simple and has the following constraints:</p>
        <ul class="content">
            <li>
                Works with <a href="../javascript-grid-in-memory/">In Memory</a> row model only and
                not with the <a href="../javascript-grid-infinite-scrolling/">Infinite</a>,
                <a href="../javascript-grid-enterprise-model/">Enterprise</a> or
                <a href="../javascript-grid-viewport/">Viewport</a> row models.
            </li>
            <li>
                Does not work if <a href="../javascript-grid-pagination/">Pagination</a> is enabled.
            </li>
            <li>
                Does not work when sorting is applied. This is because the sort order of
                the rows depends on the data and moving the data would break the sort order.
            </li>
            <li>
                Does not work when filtering is applied. This is because a filter removes rows
                making it impossible to know what 'real' order of rows when some are missing.
            </li>
            <li>
                Does not work when row grouping or pivot is active. This is because moving
                rows between groups would require a knowledge of the underlying data which only
                your application knows.
            </li>
        </ul>

        <p>These constraints are easily got around by using unmanaged row dragging explained below.  </p>

    <h2>Suppress Row Drag</h2>

    <p>
        You can hide the draggable area by calling the grid API <code>setSuppressRowDrag()</code>
        or by setting the bound property <code>suppressRowDrag</code>.
    </p>

    <p>
        The example below is almost identical to the previous example with the following differences:
    </p>
        <ul class="content">
            <li>Button <b>Suppress</b> will hide the drag icons.</li>
            <li>Button <b>Remove Suppress</b> will un-hide the drag icons.</li>
            <li>Applying a sort or a filter to the grid will also suppress the drag icons.</li>
        </ul>

    <?= example('Suppress Row Drag', 'suppress-row-drag', 'generated') ?>

    <h2>Unmanaged Dragging</h2>

    <p>
        Unmanaged dragging is the default dragging for the grid. To use it, do not set
        the property <code>rowDragManaged</code>. Unmanaged dragging differs from managed
        dragging in the following ways:
    </p>
        <ul class="content">
            <li>
                The grid does not manage moving of the rows. The only thing the grid
                responds with is firing drag events. It is up to the application to do
                the moving of the rows (if that is what the application wants to do).
            </li>
            <li>
                Dragging is allowed while sort is applied.
            </li>
            <li>
                Dragging is allowed while filter is applied.
            </li>
            <li>
                Dragging is allowed while row group or pivot is applied.
            </li>
        </ul>

    <note>
        It is not possible for the grid to provide a generic solution for row dragging that fits
        all usage scenarios. The way around this is the grid fires events and the application
        is responsible for implementing what meets the applications requirements.
    </note>

    <h3>Row Drag Events</h3>

    <p> There are four grid events associated with row dragging which are:</p>
        <ul class="content">
            <li>
                <code>rowDragEnter</code>: A drag has started, or dragging already started and the mouse
                has re-entered the grid having previously left the grid.
            </li>
            <li>
                <code>rowDragMove</code>: The mouse has moved while dragging.
            </li>
            <li>
                <code>rowDragLeave</code>: The mouse has left the grid while dragging.
            </li>
            <li>
                <code>rowDragEnd</code>: The drag has finished over the grid.
            </li>
        </ul>
        <p>Typically a drag will fire the following events:</p>
        <ol class="content">
            <li><code>rowDragEnter</code> fired once - The drag has started.</li>
            <li><code>rowDragMove</code> fired multiple times - The mouse is dragging over the rows.</li>
            <li><code>rowDragEnd</code> fired once - The drag has finished.</li>
        </ol>

    <p>Additional <code>rowDragLeave</code> and <code>rowDragEnter</code> events are fired if the mouse
        leaves or re-enters the grid. If the drag is finished outside of the grid, then the
        <code>rowDragLeave</code> is the last event fired and no <code>rowDragEnd</code> is fired,
        as the drag did not end on the grid.
    </p>

    <p> Each of the four row drag events has the following attributes:</p>
        <ul class="content">
            <li><code>type</code>: One of {rowDragEnter, rowDragMove, rowDragEnd, rowDragLeave}.</li>
            <li><code>api</code>: The grid API.</li>
            <li><code>columnApi</code>: The grid Column API.</li>
            <li><code>event</code>: The underlying mouse move event associated with the drag.</li>
            <li><code>node</code>: The row node getting dragged.</li>
            <li><code>overIndex</code>: The row index the mouse is dragging over.</li>
            <li><code>overNode</code>: The row node the mouse is dragging over.</li>
            <li>
                <code>y</code>: The vertical pixel location the mouse is over, with zero meaning
                the top of the first row. This can be compared to the <code>rowNode.rowHeight</code>
                and <code>rowNode.rowTop</code> to work out the mouse position relative to rows.
                The provided attributes <code>overIndex</code> and <code>overNode</code>
                means the <code>y</code>
                property is mostly redundant. The <code>y</code> property can be handy if you want more
                information such as 'how close is the mouse to the top or bottom of the row'.
            </li>
            <li>
                <code>vDirection</code>: Direction of the drag, either <code>up</code>,
                <code>down</code> or blank (if mouse is moving
                horizontally and not vertically).
            </li>
        </ul>

    <h3>Example Events</h3>

    <p>
        The below example demonstrates unmanaged row dragging with no attempt by the application
        or the grid to re-order the rows - this is on purpose to
        demonstrate the grid will not attempt to re-order rows when unless you set the
        <code>rowDragManaged</code> property. The example also demonstrates all the events that are fired.
    </p>

    <p>
        From the example the following can be noted:
    </p>
        <ul class="content">
            <li>
                The first column has <code>rowDrag=true</code> which results in a draggable
                area included in the cell.
            </li>
            <li>
                The grid has not set <code>rowDragManaged</code> which results in the grid
                not reordering rows as they are dragged.
            </li>
            <li>
                All of the drag events are listened for and when one is received, it is
                printed to the console. To best see this, open the example
                in a new tab and open the developer console.
            </li>
            <li>
                Because <code>rowDragManaged</code> is not set, the row dragging is left enabled even
                if sorting or filtering is applied. This is because your application should decide
                if dragging should be allowed / suppressed using the <code>suppressRowDrag</code>
                property.
            </li>
        </ul>

    <?= example('Row Drag Events', 'dragging-events', 'generated') ?>

    <h2>Simple Unmanaged Example</h2>

    <p>
        The example below shows how to implement simple row dragging using
        unmanaged row dragging and events. The example behaves the same as the first example above
        however the logic for moving the rows is with the application and
        not the grid.
    </p>

    <p>
        From the example the following can be noted:
    </p>
        <ul class="content">
            <li>
                The property <code>suppressRowDrag=true</code> is set by the application
                depending on whether sorting or filtering is active. This is because the logic
                in the example doesn't cover these scenarios and wants to prevent row
                dragging when sorting or filtering is active.
            </li>
            <li>
                To update the data the example uses an
                <a href="../javascript-grid-data-update/#delta-row-data">Immutable Data Store</a>
                and sets <code>deltaRowDataMode=true</code>. The application is free to use any
                update mechanism it wants - see <a href="../javascript-grid-data-update/">Updating Data</a>
                for different options.
            </li>
        </ul>

    <?= example('Row Drag Simple Unmanaged', 'simple-unmanaged', 'generated') ?>

    <p>
        The simple example doesn't add anything that managed dragging gives (the first
        example on this page). Things get interesting when we introduce complex scenarios
        such as row grouping or tree data, which are explained below.
    </p>

    <h2>Dragging & Row Grouping</h2>

    <p>
        <a href="../javascript-grid-grouping/">Row Grouping</a> in the grid allows grouping
        rows by a particular column. Dragging rows while grouping is possible when doing
        unmanaged row dragging.
        The application is responsible for updating the data based on the drag events fired by
        the grid.
    </p>

    <p>
        The example below uses row dragging to place rows into groups. It does not try to order
        the rows within the group. For this reason, the logic works regardless of sorting or
        filtering.
    </p>

    <p>
        The example below shows row dragging with <a href="../javascript-grid-grouping/">Row Grouping</a>
        where the following can be noted:
    </p>
        <ul class="content">
            <li>
                The column 'Athlete' has row drag true for non-group rows. This is achieved
                using the function variant of the <code>rowDrag</code> property.
            </li>
            <li>
                The grid has not set <code>rowDragManaged</code> property which results in
                unmanaged row dragging.
            </li>
            <li>
                The example does not re-order the rows. Instead the example demonstrates putting
                the rows into groups. If you drag a row, you can place it in a different parent
                group.
            </li>
            <li>
                The example listens to the event <code>onRowDragMove</code> and changes the group
                a row belongs to while the drag is happening (which is different to the next
                Tree Data example which waits until the drag is complete). It is the choice of your
                application whether it wants to move rows in real time during the drag, or wait
                until the drag action is complete.
            </li>
            <li>
                The application can still move rows to groups even if ordering or sorting is applied.
                For this reason, the application does not suppress row dragging if sorting
                or filtering is applied.
            </li>
        </ul>

    <?= example('Dragging with Row Groups', 'dragging-with-row-groups', 'generated', array("enterprise" => 1)) ?>

    <h2>Row Dragging & Tree Data</h2>

    <p>
        <a href="../javascript-grid-tree-data/">Tree Data</a> in the grid allows providing
        data to the grid in parent / child relationships, similar to that required for a file
        browser. Dragging rows with tree data is possible when doing
        unmanaged row dragging.
        The application is responsible for updating the data based on the drag events fired by
        the grid.
    </p>

    <h3>Example Tree Data</h3>

    <p>
        The example below shows <a href="../javascript-grid-tree-data/">Tree Data</a>
        and row dragging where the following can be noted:
    </p>
        <ul class="content">
            <li>
                The <a href="../javascript-grid-grouping/#auto-column-group">auto-group column</a>
                has row drag true for all rows.
            </li>
            <li>
                The example registers for <code>onRowDragEnd</code> events and rearranges
                the rows when the drag completes.
            </li>
            <li>
                The applications does NOT rearrange the rows as the drag is happening. Instead it
                waits for the <code>onRowDragEnd</code> event before updating the data.
            </li>
        </ul>

        <?= example('Dragging with Tree Data', 'dragging-with-tree-data', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>


    <h3>Example Highlighted Tree Data</h3>

    <p>
        The example above works, however it is not intuitive as the user is given no visual hint
        what folder will be the destination folder. The example below continues with the example
        above by providing hints to the user while the drag is in progress. From the example
        the following can be observed:

    </p>
        <ul class="content">
            <li>
                The example registers for <code>onRowDragMove</code> events and works out what folder
                the mouse is over as the drag is happening.
            </li>
            <li>
                While the row is dragging, the application highlights the folder that is currently
                selected as the destination folder (called <code>potentialParent</code> in the example
                code).
            </li>
            <li>
                The applications does NOT rearrange the rows as the drag is happening. As with the
                previous example, it waits for the <code>onRowDragEnd</code> event before updating the data.
            </li>
            <li>
                The example uses
                <a href="../javascript-grid-cell-styles/#cellClassRules">Cell Class Rules</a>
                to highlight the destination folder. The example adds the example provided CSS class
                <code>hover-over</code> to all the cells of the destination folder.
            </li>
            <li>
                The example uses <a href="../javascript-grid-refresh/#refresh-cells">Refresh Cells</a>
                to get the grid to execute the Cell Class Rules again over the destination folder when
                the destination folder changes.
            </li>
        </ul>

        <?= example('Highlighting Drag with Tree Data', 'highlighting-drag-tree-data', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>

    <h2>Dragging Multiple Rows</h2>

    <p>
        With unmanaged row dragging, the application is in control of what gets dragged. So it is possible
        to use the events to drag more than one row at a time, eg to move all selected rows in one go if
        using row selection.
    </p>

    <h2>Other Row Models</h2>

    <p>
        Unmanaged row dragging will work with any of the row models
        <a href="../javascript-grid-infinite-scrolling/">Infinite</a>,
        <a href="../javascript-grid-enterprise-model/">Enterprise</a> and
        <a href="../javascript-grid-viewport/">Viewport</a>.
        With non-managed, the implementation of what happens when a particular drag happens is up
        to your application.
    </p>

    <p>
        Because the grid implementation with regards row dragging is identical to the above,
        examples of row dragging with the other row models are not given. How your application
        behaves with regards the row drag events is the difficult bit, but that part is specific
        to your application and how your application stores it's state. Giving an example here with
        a different data store would be redundant.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>