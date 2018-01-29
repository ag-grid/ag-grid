<?php
$pageTitle = "ag-Grid Themes: The Fresh Datagrid Theme";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers the Fresh Theme for your datagrid.";
$pageKeyboards = "ag-Grid Fresh Theme Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<h1>Fresh Theme</h1>

<p class="lead">The Fresh Theme is one of the five themes supplied with ag-Grid. To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.</p>

<p>The following is an example of using the ag-theme-fresh theme:</p>

<snippet>
&lt;div ag-grid="gridOptions" class="ag-theme-fresh"&gt;&lt;/div&gt;</snippet>

<h2>Fresh Theme Example</h2>

<p>This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel.</p>

<?= example('Fresh Theme', 'theme-fresh', 'generated', array( "enterprise" => true )) ?>


<?php include '../documentation-main/documentation_footer.php';?>
