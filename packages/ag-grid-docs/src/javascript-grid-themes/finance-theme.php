<?php
$pageTitle = "ag-Grid Themes: The Finance Design Datagrid Theme";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with six themes out of the box, this page covers the Finance Design Theme for your datagrid.";
$pageKeyboards = "ag-Grid Finance Design Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>


    <h1>Finance Design Theme</h1>

    <p class="lead">
        The Finance theme, available from <strong>version 17.0</strong> onwards, is the default theme of ag-Grid. It comes in two versions, <strong>light</strong> and <strong>dark</strong>. 
    </p>

    <p> The example below shows the grid with a rich set of features enabled.</p>

    <?= example('Finance Theme', 'theme-finance', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>
    <?= example('Finance Theme (dark)', 'theme-finance-dark', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>

    <p>
        To use the theme, add <code>ag-theme-finance</code> or <code>ag-theme-finance-dark</code> CSS class to the DIV element on which the ag-Grid instance is instantiated.
    <p/>

<p>The following is an example of the angular version of ag-Grid with the finance theme:</p>

<snippet language="html">
&lt;ag-grid-angular class="ag-theme-finance"&gt;&lt;/ag-grid-angular&gt;

&lt;ag-grid-angular class="ag-theme-finance-dark"&gt;&lt;/ag-grid-angular&gt;
</snippet>


<h2>Change the Theme Accent Color</h2>

<p>In addition to the finer grained Scss color variables available for the rest of the themes, the Finance theme has a 'catch all' Sass variable named '$active' that determines the color of the selected checkboxes, selected rows and icons in the column menu.</p>

<snippet>
// Set the colors to blue and amber
$active: #E91E63; // pink-500 from https://www.materialui.co/colors
// Import the ag-Grid finance theme
@import '~ag-grid/src/styles/ag-theme-finance/sass/ag-theme-finance';</snippet>

<p>You can examine the full list of the variables that can be changed in the <a href="https://github.com/ag-grid/ag-grid/blob/latest/src/styles/ag-theme-finance.scss">theme source file</a>.</p>

<p>
The recommended way to process your project's Scss files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle. 
</p>


<?php include '../documentation-main/documentation_footer.php';?>
