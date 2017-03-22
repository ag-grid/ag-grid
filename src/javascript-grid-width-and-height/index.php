<?php
$key = "Width & Height";
$pageTitle = "ag-Grid Width and Height";
$pageDescription = "ag-Grid Resizing";
$pageKeyboards = "ag-Grid Resizing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="width-and-height">Grid Size</h2>

    <p>
        The grid width and height should be set using CSS width and height styles.
        This can be done using pixels or percentages.
    </p>

    <pre><span class="codeComment">// set width using percentages</span>
&lt;div id="myGrid" class="ag-fresh" <b>style="width: 100%; height: 100%;"</b>>&lt;/div>

<span class="codeComment">// OR set width using fixed pixels</span>
&lt;div id="myGrid" class="ag-fresh" <b>style="width: 500px; height: 200px;"</b>>&lt;/div></pre>

    <h3 id="percent-width-and-height">Pitfall When Using Percent Width & Height</h3>

    <p>
        If using % for your height, then make sure the container you are putting the grid into
        also has height specified, as the browser will fit the div according to a percentage of
        the parents height, and if the parent has no height, then this % will always be zero.
        If your grid is not using all the space you think it should, then put a border on the grid's
        div and see if that's the size you want (the grid will fill this div). If it is not the size
        you want, then you have a CSS layout issue to solve outside of the grid.
    </p>

    <h3 id="changing-width-and-height">Changing Width and Height</h3>

    <p>
        If the width and / or height change after the grid is initialised, the grid will
        automatically resize to fill the new area.
    </p>

    <p>
        There is no JavaScript event for when an element changes size (there is a window resized
        event, but no element resized) so the grid checks it's size every 500ms. If your application
        changes the size of the grid, you can get the grid to resize immediatly (rather than wait
        for the next 500ms check) by calling <i>api.doLayout()</i>.
    </p>

    <h3 id="example-width-and-height">Example: Setting and Changing Grid Width and Height</h3>

    <p>
        The example below shows setting the grid size and then changing it as the user
        selects the buttons. Notice that the example calls <i>api.doLayout()</i> after
        the resize to avoid a flicker.
    </p>

    <show-example example="exampleWidthAndHeight"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
