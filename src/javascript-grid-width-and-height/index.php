<?php
$key = "Width & Height";
$pageTitle = "ag-Grid Width and Height";
$pageDescription = "ag-Grid Resizing";
$pageKeyboards = "ag-Grid Resizing";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Width and Height</h2>

    <h4>Fixed Width and Height</h4>

    <p>
        Set the width and height of the table by applying CSS to the containing div. Eg:
    </p>

    <p/>

    <pre><code>style="width: 100px; height: 100px;"</code></pre>

    <h4>Percent Width and Height</h4>

    <p>
        The width and / or height can also be set to a percentage. Eg:
    </p>

    <pre><code>style="width: 100%; height: 100%;"</code></pre>

    <p>
        If using % for your height, then make sure the container you are putting the grid into
        also has height specified, as the browser will fit the div according to a percentage of
        the parents height, and if the parent has no height, then this % will always be zero.
        If your grid is not using all the space you think it should, then put a border on the grid's
        div and see if that's the size you want (the grid will fill this div). If it is not the size
        you want, then you have a CSS layout issue to solve outside of the grid.
    </p>

    <h4>Changing Width and Height</h4>

    <p>
        If the width and / or height change after the grid is initialised, the grid will
        automatically resize to fill the new area.
    </p>


    <show-example example="exampleWidthAndHeight"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
