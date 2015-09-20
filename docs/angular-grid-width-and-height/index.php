<?php
$key = "Width & Height";
$pageTitle = "Angular Grid Width and Height";
$pageDescription = "Angular Grid Resizing";
$pageKeyboards = "Angular Grid Resizing";
include '../documentation_header.php';
?>

<div>

    <h2>Width and Height</h2>

    <h4>Fixed Width and Height</h4>

    Set the width and height of the table by applying CSS to the containing div. Eg:

    <p/>

    <pre><code>style="width: 100px; height: 100px;"</code></pre>

    <h4>Percent Width and Height</h4>

    The width and / or height can also be set to a percentage. Eg:

    <pre><code>style="width: 100%; height: 100%;"</code></pre>

    <h4>Changing Width and Height</h4>

    If the width and / or height change after the grid is initialised, the grid will
    automatically resize to fill the new area.

    <show-example example="exampleWidthAndHeight"></show-example>

</div>

<?php include '../documentation_footer.php';?>
