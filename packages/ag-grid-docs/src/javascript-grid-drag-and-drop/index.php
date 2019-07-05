<?php
$pageTitle = "Drag and Drop: How to drag and drop data to/from the grid";
$pageDescription = "Drag and drop is a mechanism for dragging and dropping rows to / from the data grid";
$pageKeyboards = "Javascript Grid Drag Drop";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Drag and Drop</h1>

    <p class="lead">
        This is the drag and drop section.
    </p>

    <p>
        Native drag and drop is typically used for moving data between applications, eg moving a URL from an email
        into a web browser to open the URL, or moving a file from a file explorer application to a text editor application.
        Native drag and drop is not typically used for operating on data inside and application. Native drag and
        drop is similar to clipboard functionality, eg data must be represented as MIME types and objects cannot be
        passed by reference (the data must be converted to a MIME type and copied).
    </p>

    <note>
        The grid has it's own dragging service that is internal to the grid and nothing to do with the
        browsers drag and drop feature. The grid uses it's own internal drag and drop when
        <a href="../javascript-grid-row-dragging/">Row Dragging</a> (for reordering rows) and
        for moving columns around (eg re-ordering or using the
        <a href="../javascript-grid-tool-panel-columns/">Column Tool Panel</a>).
        The grid uses it's own dragging in these instances as it needs finer control over the data
        than native browser drag & drop supports. For example, the native d&d does not provide
        access to the dragged item until after the drag operation is complete. The grid's internal drag
        and drop system does allow access to the dragged item which allows the grid to respond to
        drags before the drag operation is compete. This allows the grid to, for example, show the columns
        moving as the drag is taking place rather than requiring the drag operation to complete first.
    </note>

    <?= example('Simple', 'simple', 'generated') ?>


    <?= example('Two Grids', 'two-grids', 'generated', array('extras' => array('fontawesome')) ) ?>

    <?= example('Custom Drag Data', 'custom-drag-data', 'generated') ?>

    <note>
        The ag-Grid team gave consideration towards providing grid callbacks for all the drop
        target events, eg
    </note>

<?php include '../documentation-main/documentation_footer.php'; ?>
