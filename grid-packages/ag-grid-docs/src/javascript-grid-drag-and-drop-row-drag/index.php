<?php
$pageTitle = "Row Drag - Drag and Drop: How to drag rows from the grid to other components";
$pageDescription = "Drag and drop is a mechanism for dragging and dropping rows to / from the data grid";
$pageKeywords = "Javascript Grid Drag Drop";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Row Drag - Drag & Drop</h1>

    <p class="lead">
        Row Drag - Drag & Drop is concerned with moving rows between grids or between a grid and a different component
        within the same application. When using row drag for drag and drop, data is moved or copied around using the
        grid events - this is in contrast to standard <a href="../javascript-grid-drag-and-drop/">Drag & Drop</a>
        which uses browser events.
    </p>

    <p>
        The Row Drag - Drag and Drop leverages the grid internal Managed Row Dragging system combined with row selection
        to create a seamless data drag and drop experience.
    </p>

    <note>
        If you read the <a href="./javascript-grid-row-dragging/#managed-dragging">Managed Dragging</a> section of the Row Dragging
        documentation you probably noticed that when you <code>sort</code>, <code>filter</code> and <code>rowGroup</code> the Grid, the
        managed Row Dragging stops working. The only exception to this rule is when you register outside dropZones using <code>addRowDropZone</code>.
        In this case, you will be able to Drag from one container to another, but will not be able to drag the rows within the grid.
    </note>

    <h2>Adding and Removing Row Drop Targets</h2>

    <p>
        To allow dragging from the grid onto an outside element, or a different grid, call the <code>addRowDropZone</code> from the grid API.
        This will result in making the passed element or Grid a valid target when moving rows around. If you later wish to remove that dropZone
        use the <code>removeRowDropZone</code> method from the grid API.
    </p>

<snippet>
function addRowDropZone(params: RowDropZoneParams) =&gt; void;

function removeRowDropZone(target: HTMLElement | GridInstance) =&gt; void;

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

// when the DropZone above is no longer needed
gridOptions.api.removeRowDropZone(gridOptions2);
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

    <p>
        In the example below, note the following:
    </p>

    <ul>
        <li>
            This example works just as the example above, the only difference being the <code>suppressMoveWhenRowDragging</code>. For
            more info, please check the <a href="./avascript-grid-row-dragging/#suppress-move-when-dragging">suppressMoveWhenRowDragging</a> section
            of the Row Dragging docs.
        </li>
    </ul>

    <?= grid_example('Simple with suppressMoveWhenRowDragging', 'simple-suppress-move', 'generated') ?>

    <h2>Dragging between grids</h2>

    <p>
        It is possible to drag rows between instances of the grid. The drag is done exactly like the simple
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
            If the row is already present in the grid, it will not be added twice. This happens because the grid will not allow duplicated ids.
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

    <p>
        In the example below, note the following:
    </p>

    <ul>
        <li>
            When you drag from one grid to another, a line will appear indicating where the row will be placed.
        </li>
        <li>
            Rows can be dragged from one grid to the other grid. When the row is received, it is <b>not</b>
            removed from the first grid. This is the choice of the example. The example could equally have removed
            from the other grid.
        </li>
        <li>
            Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.
        </li>
        <li>
            New rows can be created by dragging out from red, green and blue 'Create' draggable areas.
        </li>

    <?= grid_example('Two Grids with Drop Position', 'two-grids-with-drop-position', 'vanilla', ['extras' => ['fontawesome']]) ?>

    <h2>Dragging multiple records between grids</h2>
    
    <p>
        It is possible to drag multiple records at once from one grid to another and drop them at a specific index in the second grid.
    </p>

    <p>
        In the example below, note the following:
    </p>

    <ul>
        <li>
            This example allows for <code>enableMultiRowDragging</code>, between grid, for more info on multiRowDrag within the grid see the 
            <a href="./javascript-grid-row-dragging/#multirow-dragging">MultiRow Dragging</a> section in the Row Dragging documentation.
        </li>
        <li>
            This example allows you to toggle between regular multiRow selection and checkboxSelection. For more info see the
            <a href="./javascript-grid-selection/">Row Selection</a> documentation.
        </li>
        <li>
            When <code>Remove Source Rows</code> is selected, the rows will be removed from the <strong>Athletes</strong> grid once they are dropped onto 
            the <strong>Selected Athletes</strong> grid.
        </li>
        <li>
            If <code>Only Deselect Source Rows</code> is selected, all selected rows that were copied will be deselected but will not be removed.<br>
            Note: If some rows are selected and a row that isn't selected is copied, the selected rows will remain selected.
        </li>
        <li>
            If <code>None</code> is selected, the rows will be copied from one grid to another and the source grid will stay as is.
        </li>
    </ul>

    <?= grid_example('Multipe Records with Drop Position', 'two-grids-with-multiple-records', 'vanilla', ['extras' => ['fontawesome', 'bootstrap']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
