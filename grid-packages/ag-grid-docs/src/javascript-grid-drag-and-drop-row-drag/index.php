<?php
$pageTitle = "Row Drag - Drag and Drop: How to drag rows from the grid to other components";
$pageDescription = "Drag and drop is a mechanism for dragging and dropping rows to / from the data grid";
$pageKeywords = "Javascript Grid Drag Drop";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Row Dragging - External DropZone</h1>

    <p class="lead">
        Row Drag - External DropZone is concerned with moving rows between grids or between a grid and a different component
        within the same application. When using row drag with an external DropZone, the data is moved or copied around using the
        grid events - this is in contrast to standard <a href="../javascript-grid-drag-and-drop/">Drag & Drop</a>
        which uses browser events.
    </p>

    <p>
        The Row Drag - External DropZone uses the grid's internal Managed Row Dragging system combined with row selection
        to create a seamless data drag and drop experience.
    </p>

<snippet>
function addRowDropZone(params: RowDropZoneParams) =&gt; void;

function removeRowDropZone(params: RowDropZoneParams) =&gt; void;

function getRowDropZoneParams() =&gt; RowDropZoneParams;

// interface for params
interface RowDropZoneParams {
    // A callback method that returns the DropZone HTMLElement
    getContainer: () => HTMLElement;
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
</snippet>

    <note>
        If you read the <a href="./javascript-grid-row-dragging/#managed-dragging">Managed Dragging</a> section of the Row Dragging
        documentation you probably noticed that when you <code>sort</code>, <code>filter</code> and <code>rowGroup</code> the Grid, the
        managed Row Dragging stops working. The only exception to this rule is when you register external dropZones using <code>addRowDropZone</code>.
        In this case, you will be able to Drag from one container to another, but will not be able to drag the rows within the grid.
    </note>

    <h2>Adding and Removing Row Drop Targets</h2>

    <p>
        To allow dragging from the grid onto an outside element, or a different grid, call the <code>addRowDropZone</code> from the grid API.
        This will result in making the passed element or Grid a valid target when moving rows around. If you later wish to remove that dropZone
        use the <code>removeRowDropZone</code> method from the grid API.
    </p>


<snippet>
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

gridOptions.api.addRowDropZone(dropZoneParams);

// when the DropZone above is no longer needed
gridOptions.api.removeRowDropZone(dropZoneParams);
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
        <li>
            Toggle the checkbox to enable or disable <a href="./javascript-grid-row-dragging/#suppress-move-when-dragging">suppressMoveWhenRowDragging</a>.
        </li>
    </ul>

    <?= grid_example('Simple', 'simple', 'generated') ?>

    <h2>Dragging between grids</h2>

    <p>
        It is possible to drag rows between instances of the grid. The drag is done exactly like the simple
        case described above, where adding the new records is handled by custom callback methods.
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
            If the row is already present in the grid, it will not be added twice. This happens because the grid will not allow duplicated ids.
        </li>
        <li>
            Rows can be removed from both grids by dragging the row to the 'Trash' drop zone.
        </li>
        <li>
            New rows can be created by clicking on the red, green and blue buttons.
        </li>
    </ul>

    <?= grid_example('Two Grids', 'two-grids', 'vanilla', ['extras' => ['fontawesome']]) ?>

    <h2>Dragging between grids and dropping at an index</h2>

    <p>
        It is possible to drag records between grids and let the grid handle where the new records will fall.
    </p>

    <note>
        When the requirement is to let the grid decide where the records should fall, the <code>rowDropZone</code> should
        be created using the <code>RowDropZoneParams</code> generated from the target grid's <code>getRowDropZoneParams</code> API method.
    </note>

<snippet>
// example usage: 
new agGrid.Grid(gridElement, gridOptions);
new agGrid.Grid(gridElement2, gridOptions2);

var dropZoneParams = gridOptions2.api.getRowDropZoneParams();

gridOptions.api.addRowDropZone(dropZoneParams);

// when the DropZone above is no longer needed
gridOptions.api.removeRowDropZone(dropZoneParams);
</snippet>

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

    <h2>Dragging multiple records between grids</h2>
    
    <p>
        It is possible to drag multiple records at once from one grid to another and drop them at a specific index in the second grid.
    </p>
    <p>
        When you add a rowDropZone by calling <code>getRowDropZoneParams</code> from the grid API, you might want to add some callbacks to
        the standard events in the returned params. In order to do this, pass the as params to the <code>getRowDropZoneParams</code> method.
    </p>
<snippet>
    function getRowDropZoneParams(events: RowDropZoneEvents) =&gt; RowDropZoneParams;

    interface RowDropZoneEvents = {
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
</snippet>

<snippet>
// example usage
var dropZoneParams = gridOptions2.api.getRowDropZoneParams({
    onDragStop: function(event) {
        alert(event.dragItem.rowNodes.length + ' record(s) dropped');
    }
});

gridOptions.api.addRowDropZone(dropZoneParams);
</snippet>
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
