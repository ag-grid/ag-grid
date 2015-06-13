<?php
$key = "No Vertical Scroll";
$pageTitle = "AngularJS Angular Grid No Vertical Scroll";
$pageDescription = "AngularJS Angular Grid No Vertical Scroll";
$pageKeyboards = "AngularJS Angular Grid No Vertical Scroll";
include '../documentation_header.php';
?>

<div>

    <h2>No Vertical Scroll</h2>

    <p>
        No vertical scroll will have the grid size it's height to fit it's content. This
        is useful for <b>small tables</b> where the grid will be placed in a web page
        alongside other components. This will allow a nice flow layout. Unlike 'dontUseScrolls'
        option, the grid's layout is the same and you can use pinned columns.
    </p>

    <p>
        The example below shows the impact of the grid with different numbers of rows. Notice
        that the grid grows, packing tightly with the content below the grid.
    </p>

    <show-example example="exampleNoVerticalScroll"></show-example>

</div>

<?php include '../documentation_footer.php';?>
