<?php
$pageTitle = "Row Drag - Drag and Drop: How to drag rows from the grid to other components";
$pageDescription = "Drag and drop is a mechanism for dragging and dropping rows to / from the data grid";
$pageKeywords = "Javascript Grid Drag Drop";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Row Dragging Between Grids</h1>

<p class="lead">
    Row Drag Between Grids is concerned with seamless integration among different grids, allowing records to be dragged
    from one grid and dropped at a specific index on another grid.
</p>

<?= createSnippet(<<<SNIPPET
function addRowDropZone(params: RowDropZoneParams) => void;
function removeRowDropZone(params: RowDropZoneParams) => void;
function getRowDropZoneParams(events: RowDropZoneEvents) => RowDropZoneParams;

// interface for events
export interface RowDropZoneEvents {
    onDragEnter?: (params: RowDragEnterEvent) => void;
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    onDragging?: (params: RowDragMoveEvent) => void;
    onDragStop?: (params: RowDragEndEvent) => void;
}
SNIPPET
) ?>

<h2>Adding a Grid as Target</h2>

<p>
    To allow adding a grid as DropZone, the <code>getRowDropZoneParams</code> API method should be used in
    the target grid and the <code>addRowDropZone</code> in the source grid.
</p>

<?= createSnippet(<<<SNIPPET
// example usage:
new agGrid.Grid(gridElement, gridOptions);
new agGrid.Grid(gridElement, gridOptions2);

var dropZoneParams = GridApi2.getRowDropZoneParams({
    onDragStop: function() {
        alert('Record Dropped!');
    }
});

gridApi.addRowDropZone(dropZoneParams);

// when the DropZone above is no longer needed
gridApi.removeRowDropZone(dropZoneParams);
SNIPPET
) ?>

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
        New rows can be created by clicking on the red, green and blue buttons.
    </li>
</ul>

<?= grid_example('Two Grids with Drop Position', 'two-grids-with-drop-position', 'vanilla', ['extras' => ['fontawesome']]) ?>

<h2>Dragging Multiple Records Between Grids</h2>

<p>
    It is possible to drag multiple records at once from one grid to another.
</p>

<p>
    In the example below, note the following:
</p>

<ul>
    <li>
        This example allows for <code>enableMultiRowDragging</code>, between grids. For more info on <code>multiRowDrag</code> within the grid see the
        <a href="../javascript-grid-row-dragging/#multirow-dragging">Multi-Row Dragging</a> section in the Row Dragging documentation.
    </li>
    <li>
        This example allows you to toggle between regular <code>multiRow</code> selection and <code>checkboxSelection</code>. For more info see the
        <a href="../javascript-grid-selection/">Row Selection</a> documentation.
    </li>
    <li>
        When <code>Remove Source Rows</code> is selected, the rows will be removed from the <strong>Athletes</strong> grid once they are dropped onto
        the <strong>Selected Athletes</strong> grid.
    </li>
    <li>
        If <code>Only Deselect Source Rows</code> is selected, all selected rows that were copied will be deselected but will not be removed.<br />
        Note: If some rows are selected and a row that isn't selected is copied, the selected rows will remain selected.
    </li>
    <li>
        If <code>None</code> is selected, the rows will be copied from one grid to another and the source grid will stay as is.
    </li>
</ul>

<?= grid_example('Multiple Records with Drop Position', 'two-grids-with-multiple-records', 'vanilla', ['extras' => ['fontawesome', 'bootstrap']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
