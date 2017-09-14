<?php
$key = "Fresh Theme";
$pageTitle = "ag-Grid Fresh Theme Data Grid";
$pageDescription = "ag-Grid Fresh Theme Data Grid";
$pageKeyboards = "ag-Grid Fresh Theme Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="fresh-theme">Fresh Theme</h2>

    The Fresh Theme is one of the four themes supplied with ag-Grid.

    <p/>
    <p/>
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    <p/>
    The following is an example of using the ag-fresh theme:<br/>
    <snippet>
&lt;div ag-grid="gridOptions" class="ag-fresh"&gt;&lt;/div&gt;</snippet>

    <div class="bigTitle" id="fresh-theme-example">Fresh Theme Example</div>

    This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel
    <p/>

    <?= example('Fresh Theme', 'theme-fresh') ?>

</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
