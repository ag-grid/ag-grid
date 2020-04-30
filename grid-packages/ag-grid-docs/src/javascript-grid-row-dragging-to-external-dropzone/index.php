<?php
$pageTitle = "Row Drag - Drag and Drop: How to drag rows from the grid to other components";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Row Dragging to external elements. Row Dragging allows you to drag rows from the grid and drop onto any element on the page.";
$pageKeywords = "Javascript Grid Row Drag External Elements";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Row Dragging to an External DropZone</h1>

<p class="lead">
    Row Dragging to an External DropZone is concerned with moving rows from the grid to different components within the same application.
    When using row drag with an external DropZone, the data is moved or copied around using the grid events; this is in contrast
    to standard <a href="../javascript-grid-drag-and-drop/">Drag &amp; Drop</a> which uses browser events.
</p>

<p>
    The Row Drag to an External DropZone uses the grid's internal Managed Row Dragging system combined with row selection
    to create a seamless data drag and drop experience.
</p>

<?= createSnippet(<<<SNIPPET
function addRowDropZone(params: RowDropZoneParams) => void;
function removeRowDropZone(params: RowDropZoneParams) => void;

// interface for params
interface RowDropZoneParams {
    // A callback method that returns the DropZone HTMLElement
    getContainer: () => HTMLElement;
    // callback function that will be executed when the rowDrag enters the target
    onDragEnter?: (params: RowDragEnterEvent) => void;
    // callback function that will be executed when the rowDrag leaves the target
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    // callback function that will be executed when the rowDrag is dragged inside the target
    // note: this gets called multiple times
    onDragging?: (params: RowDragMoveEvent) => void;
    // callback function that will be executed when the rowDrag drops rows within the target
    onDragStop?: (params: RowDragEndEvent) => void;
}
SNIPPET
, 'ts') ?>

<note>
    If you read the <a href="../javascript-grid-row-dragging/#managed-dragging">Managed Dragging</a> section of the Row Dragging
    documentation you probably noticed that when you <code>sort</code>, <code>filter</code> and <code>rowGroup</code> the Grid, the
    managed Row Dragging stops working. The only exception to this rule is when you register external drop zones using <code>addRowDropZone</code>.
    In this case, you will be able to drag from one container to another, but will not be able to drag the rows within the grid.
</note>

<h2>Adding and Removing Row Drop Targets</h2>

<p>
    To allow dragging from the grid onto an outside element, or a different grid, call the <code>addRowDropZone</code> from the grid API.
    This will result in making the passed element or <code>Grid</code> a valid target when moving rows around. If you later wish to remove that drop zone
    use the <code>removeRowDropZone</code> method from the grid API.
</p>

<?= createSnippet(<<<SNIPPET
// example usage:
new agGrid.Grid(gridElement, gridOptions);

var container = document.querySelector('.row-drop-zone'),
    dropZoneParams = {
        getContainer: function() {
            return container;
        },
        onDragStop: function(params) {
            // do some custom action
        }
    };

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
        You can move rows inside the grid.
    </li>
    <li>
        You can move rows to the container on the right hand side.
    </li>
    <li>
        Toggle the checkbox to enable or disable <a href="../javascript-grid-row-dragging/#suppress-move-when-dragging">suppressMoveWhenRowDragging</a>.
    </li>
</ul>

<?= grid_example('Simple', 'simple', 'generated') ?>

<h2>Dragging Between Grids</h2>

<p>
    It is possible to use a generic <code>DropZone</code> to Drag and Drop rows from one grid to another. However,
    this approach will treat the target grid as a generic <code>HTMLElement</code> and adding the rows should be
    handled by the <code>onDragStop</code> callback. If you wish the grid to manage the Drag and Drop
    across grids and also handle where the record should be dropped, take a look at
    <a href="../javascript-grid-row-dragging-to-grid">Row Dragging - Between Grids</a>.
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
        If the row is already present in the grid, it will not be added twice. This happens because the grid will not allow duplicated IDs.
    </li>
    <li>
        Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.
    </li>
    <li>
        New rows can be created by clicking on the red, green and blue buttons.
    </li>
</ul>

<?= grid_example('Two Grids', 'two-grids', 'vanilla', ['extras' => ['fontawesome']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
