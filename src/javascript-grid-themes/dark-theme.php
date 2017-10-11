<?php
$key = "Dark Theme";
$pageTitle = "ag-Grid Dark Theme";
$pageDescription = "ag-Grid Dark Theme";
$pageKeyboards = "ag-Grid Dark Theme";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="dark-theme">Dark Theme</h2>

    The Dark Theme is one of the four themes supplied with ag-Grid.

    <p/>
    <p/>
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    <p/>
    The following is an example of using the ag-dark theme:<br/>
    <snippet>
&lt;div ag-grid="gridOptions" class="ag-dark"&gt;&lt;/div&gt;</snippet>

    <div class="bigTitle" id="dark-theme-example">Dark Theme Example</div>

    This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel
    <p/>

    <?= example('Dark Theme', 'theme-dark', 'generated', array( 'enterprise' => true )) ?>

</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
