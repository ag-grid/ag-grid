<?php
$key = "Context";
$pageTitle = "AngularJS Angular Grid Context";
$pageDescription = "Angular Grid provides the ability to pass down values to the renderers or use in the rendering process. These are stored in the context in the grid options.";
$pageKeyboards = "AngularJS Angular Grid Context";
include '../documentation_header.php';
?>

<div>

    <h2>Context</h2>

    <p>
        The context object is passed to most of the callbacks used in Angular Grid, such as the cell renderers.
        Angular Grid does not place anything into the context, it is not used at all internally by Angular
        Grid. It's purpose is to allow the client application to pass details to custom callbacks.
    </p>

    <h4>Example</h4>

    In the example below, the drop down selects a reporting currency. This reporting currency selection
    is placed inside the context object, which is subsequently used by the a) cell renderer to calculate
    the value to display and b) the header of the last column, to display a particular header value.

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
