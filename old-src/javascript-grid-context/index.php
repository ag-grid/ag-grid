<?php
$key = "Context";
$pageTitle = "ag-Grid Context";
$pageDescription = "ag-Grid provides the ability to pass down values to the renderers or use in the rendering process. These are stored in the context in the grid options.";
$pageKeyboards = "ag-Grid Context";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="context">Context</h2>

    <p>
        The context object is passed to most of the callbacks used in ag-Grid, such as the cell renderers.
        ag-Grid does not place anything into the context, it is not used at all internally by ag-Grid.
        Its purpose is to allow the client application to pass details to custom callbacks.
    </p>

    <h4 id="example">Example</h4>

    In the example below, the drop down selects a reporting currency. This reporting currency selection
    is placed inside the context object, which is subsequently used by the a) cell renderer to calculate
    the value to display and b) the header of the last column, to display a particular header value.

    <?= example('Example context', 'context', 'vanilla') ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
