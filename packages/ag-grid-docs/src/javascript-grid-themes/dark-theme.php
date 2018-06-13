<?php
$pageTitle = "ag-Grid Themes: The Dark Datagrid Theme";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers the Dark Theme for your datagrid. This theme has proved very popular for financial applications.";
$pageKeyboards = "ag-Grid Dark Theme";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>
    <h1>Dark Theme</h1>

    <p class="lead">
        The Dark Theme is one of the five themes supplied with ag-Grid.
        To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    </p>

    <p>The following is an example of using the ag-theme-dark theme:</p>

    <snippet>
&lt;div ag-grid="gridOptions" class="ag-theme-dark"&gt;&lt;/div&gt;</snippet>

    <h2>Dark Theme Example</h2>

    <p>This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel</p>

    <?= example('Dark Theme', 'theme-dark', 'generated', array( 'enterprise' => true )) ?>

<?php include '../documentation-main/documentation_footer.php';?>
