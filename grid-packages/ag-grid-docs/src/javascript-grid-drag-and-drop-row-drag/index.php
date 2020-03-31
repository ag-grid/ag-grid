<?php
$pageTitle = "Row Drag - Drag and Drop: How to drag rows from the grid to other components";
$pageDescription = "Drag and drop is a mechanism for dragging and dropping rows to / from the data grid";
$pageKeywords = "Javascript Grid Drag Drop";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Row Drag - Drag & Drop</h1>

    <p class="lead">
        Row Drag - Drag & Drop is concerned with moving rows between applications, and within the grid.
        When using row drag, data is moved or copied around using the grid events.
    </p>

    <p>
        The Row Drag - Drag and Drop leverages the grid internal Drag and Drop system combined with row selection
        to create a seamless data drag and drop experience.
    </p>

    <h2>Add a row drop target</h2>

    <p>
        To allow dragging from the grid onto an element, call the <code>addDropTarget</code> from the grid API.
        This will result in making the passed element a valid target when moving rows around.
    </p>

    <p>
        In the example below, note the following:
    </p>

    <ul>
        <li>
            You can move rows inside the grid.
        </li>
        <li>
            You can move rows to the container on the right hand side.
        </li>
    </ul>

    <?= grid_example('Simple', 'simple', 'generated') ?>

    <h2>With suppressMoveWhenDragging</h2>

    <p>
        To prevent the rows from moving while you are dragging to another container, enable <code>suppressMoveWhenRowDragging</code>.
    </p>

    <?= grid_example('Simple with suppressMoveWhenRowDragging', 'simple-suppress-move', 'generated') ?>

    <h2>Dragging Between Grids</h2>

    <p>
        It is possible to drag rows between two instances of ag-Grid. The drag is done exactly like the simple
        case described above. The drop is done by the example.
    </p>

    <p>
        In the example below, note the following:
    </p>

    <ul>
        <li>
            Rows can be dragged from one grid to the other grid. When the row is received, it is <b>not</b>
            removed from the first grid. This is the choice of the example. The example could equally have removed
            from the other grid.
        </li>
        <li>
            If the row is already present in the grid, it will not be added twice. Again this is the choice of the example.
        </li>
        <li>
            Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.
        </li>
        <li>
            New rows can be created by dragging out from red, green and blue 'Create' draggable areas.
        </li>
    </ul>

    <?= grid_example('Two Grids', 'two-grids', 'vanilla', ['extras' => ['fontawesome']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
