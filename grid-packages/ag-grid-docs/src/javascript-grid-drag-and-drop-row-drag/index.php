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
        To allow dragging from the grid onto an element, call the <code>addRowDropZone</code> from the grid API.
        This will result in making the passed element a valid target when moving rows around.
    </p>

    <snippet>
// function for valueGetter
function addRowDropZone(params: RowDropZoneParams) =&gt; void;

// interface for params
interface RowDropZoneParams {
    // The target element or GridInstance that will be considered a valid element to drop rows
    // Note: GridInstance only works in combination with `dropAtIndex = true`.
    target: HTMLElement | GridInstance;
    // Set this option to true to allow managed row dragging to drop rows at an specific index
    // Note: This option requires the target to be a GridInstance
    dropAtIndex?: boolean;
    // callback function that will be executed when the rowDrag enters the target
    onDragEnter?: (params: DraggingEvent) => void;
    // callback function that will be executed when the rowDrag leaves the target
    onDragLeave?: (params: DraggingEvent) => void;
    // callback function that will be executed when the rowDrag is dragged inside the target
    // note: this gets called multiple times
    onDragging?: (params: DraggingEvent) => void;
    // callback function that will be executed when the rowDrag drops rows within the target
    onDragStop?: (params: DraggingEvent) => void;
}

interface GridInstance {
    api: GridApi;
    columnApi: ColumnApi;
}

// example usage: 
new agGrid.Grid(gridElement, gridOptions);
new agGrid.Grid(gridElement2, gridOptions2);

gridOptions.api.addRowDropZone({
    // after calling new agGrid.Grid(element, gridOptions), the gridOptions object will 
    // contain the `api` and `columnApi`, so it is considered a valid GridInstance.
    target: gridOptions2, 
    dropAtIndex: true,
    onDragStop: function(params) {
        alert(params.dragItem.rowNodes.length + ' item(s) dropped');
    }
});
    </snippet>

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

    <h2>Dragging between grids</h2>

    <p>
        It is possible to drag rows between instances of the Grid. The drag is done exactly like the simple
        case described above. The drop is done by the example.
    </p>

    <note>
        When using Drag & Drop between two grids, and <code>dropAtIndex=false</code>, the Drag Manager will understand that you want to handle
        where to position the records yourself. So in this case set the target to be the grid HTMLElement, not the GridInstance.
    </note>

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

    <h2>Dragging between grids and dropping at an index</h2>

    <p>
        It is possible to drag records between grids and let the grid handle where the new records will fall.
    </p>

    <note>
        When using `dropAtIndex = true`, the target grid needs to be configured with `suppressMoveWhenRowDragging = true`.
    </note>

    <?= grid_example('Two Grids with Drop Position', 'two-grids-with-drop-position', 'vanilla', ['extras' => ['fontawesome']]) ?>

    <h2>Dragging multiple records between grids</h2>
    
    <p>
        It is possible to drag multiple records at once from one grid to another and drop them at a specific index in the second grid.
    </p>

    <?= grid_example('Multipe Records with Drop Position', 'two-grids-with-multiple-records', 'vanilla', ['extras' => ['fontawesome', 'bootstrap']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
