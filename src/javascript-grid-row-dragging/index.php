<?php
$pageTitle = "Row Dragging";
$pageDescription = "Rearranging rows is done by dragging the row with the mouse to the new position.";
$pageKeyboards = "Javascript Grid row dragging";
$pageGroup = "features";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="row-models">
        Row Dragging
    </h1>

    <p>
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
        There are two ways in which row dragging works in the grid, active and passive:
        <ul>
            <li>
                <b>Active Dragging</b>: This is the simplest and the grid will rearrange
                rows as you drag them.
            </li>
            <li>
                <b>Passive Dragging</b>: This is more complex and more powerful, the grid
                will not rearrange rows as you drag. Instead the grid fires events and the
                application is responsible for responding in a way that makes sense for the
                application.
            </li>
        </ul>
    </p>

    <h2>Active Dragging</h2>

    <p>
        In active dragging the grid is responsible for rearranging the rows as the rows
        are dragged. Active dragging (as opposed to passive dragging) is the default,
        there is no other configuration to do other than set <code>rowDrag=true</code>
        on one of the columns.
    </p>

    <p>
        The example below shows simple active dragging. The following can be noted:
        <ul>
            <li>
                The first column has <code>rowDrag=true</code> which results in a
                draggable area included in the cell.
            </li>
            <li>
                Dragging the row will rearrange the row to the new position.
            </li>
            <li>
                If a sort (click on the header) or filter (open up the column menu) is
                applied to the column, the draggable icon for row dragging is hidden.
                This is consistent with the constraints explained after the example.
            </li>
        </ul>
    </p>

    <?= example('Row Drag Simple', 'simple', 'generated') ?>

    <p>
        The simplistic implementation of active dragging means it has the following constraints:
        <ul>
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
        These constraints are easily got around by using passive row dragging explained below.
    </p>

    <h2>Suppress Row Drag</h2>

    <p>
        You can hide the dragging icon by calling the grid API <code>setSuppressRowDrag()</code>
        or by setting the bound property <code>suppressRowDrag=true</code> (if using a framework that
        allows bound properties).
    </p>

    <p>
        The example below is almost identical to the previous example with the following differences:
        <ul>
            <li>Button <b>Suppress</b> will hide the drag icons.</li>
            <li>Button <b>Remove Suppress</b> will un-hide the drag icons.</li>
            <li>Applying a sort or a filter to the grid will also suppress the drag icons.</li>
        </ul>
    </p>

    <?= example('Suppress Row Drag', 'suppress-row-drag', 'generated') ?>

    <h2>Passive Dragging</h2>

    <p>
        To turn on passive dragging set the grid property <code>rowDragPassive=true</code>.
        Passive dragging differs from active dragging in the following ways:
        <ul>
            <li>
                The grid does not moves rows in-line, the application is expected to do this
                following events fired by the grid.
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
    </p>

    <note>
        It is not possible for the grid to provide a generic solution for row dragging that fits
        all usage scenarios. The way around this is the grid fires events and the application
        is responsible for implementing what meets the applications requirements.
    </note>

    <h3>Row Drag Events</h3>

    <p>
        There are four grid events associated with row dragging which are:
        <ul>
            <li>
                <b>rowDragEnter</b>: A drag has started, or dragging already started and the mouse
                has re-entered the grid having previously left the grid.
            </li>
            <li>
                <b>rowDragMove</b>: The mouse has moved while dragging.
            </li>
            <li>
                <b>rowDragLeave</b>: The mouse has left the grid while dragging.
            </li>
            <li>
                <b>rowDragEnd</b>: The drag has finished over the grid.
            </li>
        </ul>
        Typically a drag will fire the following events:
        <ol>
            <li>rowDragEnter x 1 - The drag has started.</li>
            <li>rowDragMove x multiple - The mouse is dragging over the rows.</li>
            <li>rowDragEnd x 1 - The drag has finished.</li>
        </ol>
        Additional rowDragLeave and rowDragEnter events are fired if the mouse leaves or
        re-enters the grid.
    </p>

    <p>
        Each of the four row drag events has the following attributes:
        <ul>
            <li><b>type</b>: One of {rowDragEnter, rowDragMove, rowDragEnd, rowDragLeave}.</li>
            <li><b>api</b>: The grid API.</li>
            <li><b>columnApi</b>: The grid Column API.</li>
            <li><b>event</b>: The underlying mouse move event associated with the drag.</li>
            <li><b>node</b>: The row node getting dragged.</li>
            <li><b>overIndex</b>: The row index the mouse is dragging over.</li>
            <li><b>overNode</b>: The rows node the mouse is dragging over.</li>
            <li><b>y</b>: The pixel index the mouse is over. This is comparable to rowNode.rowHeight and rowNode.rowTop.</li>
            <li><b>vDirection</b>: Direction of the drag, either 'up', 'down' or blank (if mouse is moving horizontally and not vertically).</li>
        </ul>
    </p>

    <h3>Example Passive Events</h3>

    <p>
        The below example demonstrates setting <code>rowDragPassive=true</code> and observing
        events that are fired. The example does not re-order the rows - this is on purpose to
        demonstrate the grid will not attempt to re-order rows when <code>rowDragPassive=true</code>.
    </p>

    <p>
        From the example the following can be noted:
        <ul>
            <li>
                The first column has <code>rowDrag=true</code> which results in a draggable
                area included in the cell.
            </li>
            <li>
                The grid has set <code>rowDragPassive=true</code> which results in the grid
                NOT rearrange the rows as they are dragged.
            </li>
            <li>
                All of the four drag events are registered for by the example. When an event
                is received, is it printed to the console. To best observe this, open the example
                in a new tab and open the developer console.
            </li>
            <li>
                Because <code>rowDragPassive=true</code> the row dragging is left enabled even
                if sorting or filtering is applied. This is because your application should decide
                if dragging should be allowed / suppressed using the <code>suppressRowDrag</code>
                property.
            </li>
        </ul>
    </p>

    <?= example('Row Drag Passive Events', 'passive-events', 'generated') ?>

    <h2>Simple Passive Example</h2>

    <p>
        The example below shows how to implement simple row dragging using
        passive events. The example behaves the same as the first example on this
        page however the logic for moving the rows is with the application and
        not the grid as the property <code>rowDragPassive=true</code> is set.
    </p>

    <p>
        From the example the following can be noted:
        <ul>
            <li>
                The property <code>suppressRowDrag=true</code> is set by the application
                depending on whether sorting or filtering is active. This is because the logic
                in the example doesn't cover these scenarios and hence wants to prevent row
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
    </p>

    <?= example('Row Drag Simple Passive Moving', 'simple-passive-moving', 'generated') ?>

    <p>
        The simple passive example doesn't add anything that active dragging gives (the first
        example on this page). Things get interesting when we introduce complex scenarios
        such as row grouping or tree data, which are explained below.
    </p>

    <h2>Passive & Row Grouping</h2>

    <p>
        <a href="../javascript-grid-grouping/">Row Grouping</a> in the grid allows grouping
        rows by a particular column. Dragging rows while grouping is possible when
        <code>rowDragPassive=true</code>.
        The application is responsible for updating the data base on the drag events fired by
        the grid.
    </p>

    <p>
        The example below shows <a href="../javascript-grid-grouping/">Row Grouping</a>
        and row dragging where the following can be noted:
        <ul>
            <li>
                The column 'Athlete' has row drag true for non-group rows. This is achieved
                using the function variant of the <code>rowDrag</code> property.
            </li>
            <li>
                The grid has set <code>rowDragPassive=true</code> which results in the grid
                NOT rearrange the rows as they are dragged.
            </li>
            <li>
                The example does not re-order the rows. Instead the example demonstrates putting
                the rows into groups. If you drag a row, you can place it in a different parent
                group.
            </li>
            <li>
                The example listens to event <code>onRowDragMove</code> and changes the group
                a row belongs to while the drag is happening (which is different to the next
                Tree Data example which waits until the drag is complete).
            </li>
        </ul>
    </p>

    <?= example('Dragging with Row Groups', 'dragging-with-row-groups', 'generated', array("enterprise" => 1)) ?>

    <h2>Passive & Tree Data</h2>

    <?= example('Dragging with Tree Data', 'dragging-with-tree-data', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>

    <h2>Other Row Models</h2>

</div>

<?php include '../documentation-main/documentation_footer.php';?>