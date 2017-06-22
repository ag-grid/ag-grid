<?php
$key = "Cell Renderer";
$pageTitle = "ag-Grid Cell Rendering";
$pageDescription = "Out of the box grid rendering components and how to configure them.";
$pageKeyboards = "ag-Grid Rendering";
$pageGroup = "features";
include '../documentation-main/documentation_header.php';
?>

<h2 id="cell-editors">Cell Rendering</h2>

<p>
</p>

<h3>Group Cell Renderer</h3>

<p>
    If grouping, you will need to dedicate a column to displaying the group, as described above.
    To have the column behave appropriate, you need to provide it with an appropriate cell renderer.
    You can either a) use the built in provided group cell renderer or b) bake your own grouping
    cell renderer. The provided cell renderer is selected by providing the string 'group' for
    the cellRenderer. You also provide params with options as follows:
<pre>colDef.cellRenderer = 'group';
colDef.cellRendererParams = {
        keyMap: {from: 'to'},
        suppressCount: false,
        checkbox: true,
        padding: 10,
        innerRenderer: myInnerRenderer,
        footerValueGetter: myFooterValueGetter
};</pre>

<p>
    The parameters are:
<ul>
    <li><b>suppressCount:</b> One of [true, false], if true, count is not displayed beside the name.</li>
    <li><b>checkbox:</b> One of [true,false], if true, a selection checkbox is included.</li>
    <li><b>padding:</b> A positive number. The amount of padding, in pixels, to indent each group.</li>
    <li><b>suppressPadding:</b> Set to true to node including any padding (indentation) in the child rows.</li>
    <li><b>innerRenderer:</b> The renderer to use for inside the cell (after grouping functions are added).</li>
    <li><b>footerValueGetter:</b> The value getter for the footer text. Can be a function or expression.</li>
</ul>
</p>


<?php include '../documentation-main/documentation_footer.php';?>
