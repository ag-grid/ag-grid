<?php
$key = "Header Rendering";
$pageTitle = "AngularJS Angular Grid Header Rendering";
$pageDescription = "AngularJS Angular Grid Header Rendering";
$pageKeyboards = "AngularJS Angular Grid Header Rendering";
include '../documentation_header.php';
?>

<div>

    <h2>Header Rendering</h2>

    The default header rendering can be done by providing a header renderer in the grid options.

    <p/>

    The same renderer is used for all columns and the column definition is provided to the renderer.

    <p/>

    The returned result can be a) a string of HTML or b) an HTML element object.

    <p/>
    Like other grid renderers, you have the option to use AngularJS for the custom renderer. If you
    require AngularJS for header rendering, then set the grid option value 'angularCompileHeaders'
    to true.

    <p/>

    The example below shows using a header renderer to add angle brackets to the header
    name and to also add click handling to the header, so that the header changes color with a click.

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
