<?php
$pageTitle = "ag-Grid Features: Context Object";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It provides the ability to pass down values to the renderers or use in the rendering process. These are stored in the context in the grid options.";
$pageKeyboards = "ag-Grid Context";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>



    <h1>Context</h1>

    <p class="lead">
        The context object is passed to most of the callbacks used in ag-Grid, such as the cell renderers.
        ag-Grid does not place anything into the context, it is not used at all internally by ag-Grid.
        Its purpose is to allow the client application to pass details to custom callbacks.
    </p>

    <h2>Example</h2>

    <p>
        In the example below, the drop down selects a reporting currency. This reporting currency selection
        is placed inside the context object, which is subsequently used by the a) cell renderer to calculate
        the value to display and b) the header of the last column, to display a particular header value.
    </p>

    <?= example('Example context', 'context', 'vanilla') ?>


<?php include '../documentation-main/documentation_footer.php';?>
