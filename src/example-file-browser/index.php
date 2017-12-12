<?php
$pageTitle = "ag-Grid File Browser";
$pageDescription = "How to make a file browser using ag-Grid. This page gives you an example you can follow.";
$pageKeyboards = "ag-Grid File Browser";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>File Browser</h2>

    <p>
        The example below shows how you can make complex tree structure using ag-Grid.
    </p>

    <p>
        Notice that the data passed to the grid is already in a tree structure, it is not using
        the grids grouping functions to create the hierarchy.
    </p>

    <show-example example="fileBrowser"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
