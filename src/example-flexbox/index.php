<?php
$pageTitle = "ag-Grid Examples: ag-Grid in a flexbox layout";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This example showcases how to have a responsive ag-grid inside containers with flexbox.";
$pageKeyboards = "ag-Grid flexbox";
$pageGroup = "examples";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>ag-Grid inside flexbox container</h1>
<p class="lead">By default, ag-Grid runs a timer that watches its container size and resizes the UI accordingly. This might interfere with the default behavior of elements with <code>display: flex</code> set. The simple workaround is to add <code>overflow: hidden</code> to the grid element parent.</p>


<p>Open the example below in a new tab and resize the window to see how the grid instance gets resized accordingly.</p>

<?= example('grid inside a flexbox container', 'flexbox', 'generated') ?>


<?php include '../documentation-main/documentation_footer.php';?>
