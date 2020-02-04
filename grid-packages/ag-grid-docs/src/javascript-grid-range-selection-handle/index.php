<?php
$pageTitle = "Range Handle: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Range Selection. Drag the mouse over cells to create a Range Selection. The last cell will contain a handle ta can be dragged to change the selection range.. Version 21 is available for download now, take it for a free two month trial.";
$pageKeyboards = "range selection handle javascript grid ag-grid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 class="heading-enterprise">Range Handle</h1>

    <p class="lead">
        When working with a Range Selection, it can be useful to have a handle inside the last cell to enable the size of the current
        range to be adjusted.
    </p>

    <? enterprise_feature("Range Handle"); ?>

    <h2>Enabling the Range Handle</h2>
    <p>
        To enable the Range Handle, simply set <code>enableRangeHandle</code> to <code>true</code> in the <code>gridOptions</code>.
    </p>

    <h3>Example: Range Selection with Range Handle</h3>
    <p>
        The example below demonstrates simple range selection with a range handle.
    </p>

    <?= grid_example('Range Handle', 'range-selection-handle', 'generated', array("enterprise" => 1, "processVue" => true)) ?>


</div>

<?php include '../documentation-main/documentation_footer.php';?>
