<?php
$pageTitle = "Drag and Drop: How to drag and drop data to/from the grid";
$pageDescription = "Drag and drop is a mechanism for dragging and dropping rows to / from the data grid";
$pageKeyboards = "Javascript Grid Drag Drop";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Drag & Drop</h1>

    <p class="lead">
        Drag & Drop is concerned with moving data around an application, or between applications,
        using the operating system drag and drop support. When using drag and drop, data is moved or
        copied around using MIME types in a way similar to using the clipboard.
    </p>

    <p>
        Native drag and drop is typically used for moving data between applications, eg moving a URL from an email
        into a web browser to open the URL, or moving a file from a file explorer application to a text editor application.
        Native drag and drop is not typically used for operating on data inside and application. Native drag and
        drop is similar to clipboard functionality, eg data must be represented as MIME types and objects cannot be
        passed by reference (the data must be converted to a MIME type and copied).
    </p>

    <p>
        This section outlines how the grid fits in with native operating system drag and drop. It is assumed
        the reader is familiar with how drag and drop works. If not, refer to one of the following introductions:
    </p>

    <ul>
        <li><a href="https://www.w3schools.com/html/html5_draganddrop.asp">W3C Schools</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API">MDN Wed Docs</a></li>
    </ul>

    <note>
        The grid implements it's own drag and drop separate to the operating system drag and drop.
        It is used internally by the grid for
        <a href="../javascript-grid-row-dragging/">Row Dragging</a> (for reordering rows) and
        for column dragging (eg re-ordering columns or moving colums in the
        <a href="../javascript-grid-tool-panel-columns/">Column Tool Panel</a>).
        The grid uses it's own implementation in these instances as it needs finer control over the data
        than native browser drag & drop supports. For example, the native d&d does not provide
        access to the dragged item until after the drag operation is complete.
    </note>

    <h2>Enable Drag Source</h2>

    <p>
        To allow dragging from the grid, set the property <code>dndSource=true</code> on one of the columns.
        This will result in the column having a drag handle displayed. When the dragging starts, the grid
        will by default create a JSON representation of the data and set this as MIME types <code>application/json</code>
        and also <code>text/plain</code>.
    </p>

    <p>
        In the example below, note the following:
    </p>

    <ul>
        <li>
            The first column has <code>dndSource=true</code>, so staring a mouse drag on a cell in the first column
            will start a drag operation.
        </li>
        <li>
            When the data is dragged to the drop zone, the drop zone will display the received JSON.
            This is because the drop zone is programmed to accept <code>application/json</code> MIME
            types.
        </li>
        <li>
            You can also drag to other applications outside of the browser. For example, some text editors
            (eg Sublime Text) or word processors (eg Microsoft Word) will accept the drag based on the
            <code>text/plain</code> MIME type. You can test this by dragging a cell to e.g. Microsoft Word.
        </li>
    </ul>

    <?= grid_example('Simple', 'simple', 'generated') ?>

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

    <?= grid_example('Two Grids', 'two-grids', 'multi') ?>

    <p>
        Note that there is no specific drop zone logic in the grid. This was done on purpose after analysis.
    </p>
    <p>
        On initial analysis consideration was given to exposing callbacks or firing events in the grid for the
        drop zone relevant events e.g. ondragenter, on dragexit etc. However this did not add any additional value
        given that the developer can easily add such event listeners to the grid div directly, and that the
        grid would be simply exposing the underlying events / callbacks rather than doing any processing itself.
    </p>
    <p>
        Given the grid was not adding any value, providing such callbacks would just be adding a layer of useless
        logic.
    </p>

    <h2>Custom Drag Data</h2>

    <p>
        It is possible that a JSON representation of the data is not what is required as the drag data.
    </p>

    <p>
        To provide alternative drag data, use the <code>dndSourceOnRowDrag</code> callback on the column
        definition. This allows specific processing by the application for the <code>rowdrag</code>
        even rather than the default grid behaviour.
    </p>

    <p>
        The example below is identical to the first example on this page with the addition of custom drag
        data. Note the following:
    </p>

    <ul>
        <li>
            The draggable column also has <code>dndSourceOnRowDrag</code> set.
        </li>
        <li>
            The <code>onRowDrag</code> method provides an alternative piece of drag data to be set into the
            drag event.
        </li>
        <li>
            The data dragged also includes row state such as whether the rows is selected or not.
        </li>
    </ul>

    <?= grid_example('Custom Drag Data', 'custom-drag-data', 'generated') ?>

    <h2>Custom Drag Component</h2>

    <p>
        Drag and drop is a complex application-level requirement. As such, a component (the grid) can't propose 
        a drag and drop solution that is appropriate for all applications. For this reason, if the application has 
        drag and drop requirements, you would likely want to implement a custom 
        <a href="../javascript-grid-cell-rendering-components/">Cell Renderer</a> specifically for your needs.
    </p>

    <p>
        The example below shows a custom drag and drop cell renderer. Note the following:
    </p>

    <ul>
        <li>
            The dragging works similar to before, rows are dragged from the left grid to the right drop zone.
        </li>
        <li>
            The grid does not provide the dragging. Instead, the example's cell renderer implements the drag logic.
        </li>
    </ul>

    <?= grid_example('Custom Drag Component', 'custom-drag-comp', 'generated', array("enterprise" => 1)) ?>


<?php include '../documentation-main/documentation_footer.php'; ?>
