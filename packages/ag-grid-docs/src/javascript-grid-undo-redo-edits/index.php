<?php
$pageTitle = "Undo / Redo Edits";
$pageDescription = "Allows the user to undo and redo edits made to cells.";
$pageKeyboards = "ag-Grid Undo / Redo";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Undo / Redo Edits</h1>

    <p class="lead">
        This section covers how to allow users to undo / redo their cell edits.
    </p>

    <p>
        When <a href="../javascript-grid-cell-editing/">Cell Editing</a> is enabled in the grid, it is usually desirable
        to allow users to undo / redo any edits.
    </p>

    <p>
        Users can change the contents of cells through the following grid features:
    </p>

    <ul class="content">
        <li><a href="../javascript-grid-cell-editing/">Cell Editing</a></li>
        <li><a href="../javascript-grid-clipboard/">Copy / Paste</a></li>
        <li><a href="../javascript-grid-range-selection-fill-handle/">Fill Handle</a></li>
    </ul>

    <note>This Undo / Redo feature is designed to be a recovery mechanism for user editing mistakes.</note>

    <h2>Enabling Undo / Redo</h2>

    <p>
        The following undo / redo properties are provided in the grid options interface:
    </p>


<snippet>
    undoRedoCellEditing: true
    undoRedoCellEditingLimit: 20 // default is 10
</snippet>

    <p>
        As shown in the snippet above, undo / redo is enabled through the <code>undoRedoCellEditing</code> property.
    </p>
    <p>
        The default number of undo / redo steps is <code>10</code>. To change this default the
        <code>undoRedoCellEditingLimit</code> property can be used.
    </p>

    <h2>Undo / Redo Shortcuts</h2>

    <p>
        The following keyboard shortcuts are available when undo / redo is enabled:
    </p>

    <ul class="content">
        <li><b>Ctrl+Z / CMD+Z</b>: will undo the last cell edit(s).</li>
        <li><b>Ctrl+Y / CMD+SHIFT+Z</b>: will redo the last undo.</li>
    </ul>

    <p>
        Note that the grid needs focus for these shortcuts to have an effect.
    </p>

    <h2>Undo / Redo API</h2>

    <p>
        It is also possible to control undo / redo using the following grid API methods:
    </p>

<snippet>
    gridApi.undoCellEditing();
    gridApi.redoCellEditing();
</snippet>

    <h2>Undo / Redo Example</h2>

    <p>
        The example below has the following grid options enabled to demonstrate undo / redo:
    </p>

<snippet>
defaultColDef: {
    // makes all cells editable
    editable: true
},

// allows copy / paste using cell ranges
enableRangeSelection: true,

// enables the fill handle
enableFillHandle: true,

// enables undo / redo
undoRedoCellEditing: true,

// restricts the number of undo / redo steps to 5
undoRedoCellEditingLimit: 5,

// enables flashing to help see cell changes
enableCellChangeFlash: true,
</snippet>

    <p>
        To see undo / redo in action, try the following:
    </p>

    <ul class="content">
        <li><b>Cell Editing</b>: click and edit some cell values.</li>
        <li><b>Fill Handle</b>: drag the fill handle to change a range of cells.</li>
        <li><b>Copy / Paste</b>: use CTRL+C / CTRL+V to copy and paste a range of cells.</li>
        <li><b>Undo Shortcut</b>: use CTRL+Z to undo the cell edits.</li>
        <li><b>Redo Shortcut</b>: use CTRL+Y to redo the undone cell edits.</li>
        <li><b>Undo API</b>: use the 'Undo' button to invoke <code>gridApi.undoCellEditing().</code></li>
        <li><b>Redo API</b>: use the 'Redo' button to invoke <code>gridApi.redoCellEditing().</code></li>
    </ul>

    <?= example('Undo / Redo', 'undo-redo', 'generated', array("enterprise" => true, "processVue" => true)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
