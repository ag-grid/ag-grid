<?php
$key = "Bootstrap Theme";
$pageTitle = "ag-Grid Bootstrap Theme Data Grid";
$pageDescription = "ag-Grid Bootstrap Theme Data Grid";
$pageKeyboards = "ag-Grid Bootstrap Theme Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="bootstrap-theme">Bootstrap Theme</h2>

    The Bootstrap Theme is one of the four themes supplied with ag-Grid.

    <p/>
    <p/>
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    <p/>
    The following is an example of using the ag-bootstrap theme:<br/>
    <snippet>
&lt;div ag-grid="gridOptions" class="ag-bootstrap"&gt;&lt;/div&gt;</snippet>

    <div class="bigTitle" id="bootstrap-theme-example">Bootstrap Theme Example</div>

    This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel
    <p/>

    <?= example('Bootstrap Theme', 'theme-bootstrap') ?>

</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
