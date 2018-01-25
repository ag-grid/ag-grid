<?php
$pageTitle = "ag-Grid Themes: The Bootstrap Datagrid Theme";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers the Bootstrap Theme for your datagrid.";
$pageKeyboards = "ag-Grid Bootstrap Theme Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<h1>Bootstrap Theme</h1>

<p class="lead">
    The Bootstrap Theme is one of the five themes supplied with ag-Grid.
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
</p>

<p>The following is an example of using the ag-theme-bootstrap theme:</p>

<snippet>
&lt;div ag-grid="gridOptions" class="ag-theme-bootstrap"&gt;&lt;/div&gt;</snippet>

<h2>Bootstrap Theme Example</h2>

<p>This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel.</p>

<?= example('Bootstrap Theme', 'theme-bootstrap', 'generated', array( 'enterprise' => true )) ?>

<?php include '../documentation-main/documentation_footer.php';?>
