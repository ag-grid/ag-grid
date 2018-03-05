<?php
$pageTitle = "ag-Grid Themes: The Balham Design Datagrid Theme";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with six themes out of the box, this page covers the Balham Design Theme for your datagrid.";
$pageKeyboards = "ag-Grid Balham Design Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>


    <h1>Balham Design Theme</h1>

    <p class="lead">
        The Balham theme, available from <strong>version 17.0</strong> onwards, is the default theme of ag-Grid. It comes in two versions, <strong>light</strong> and <strong>dark</strong>. 
    </p>

    <p> The example below shows the grid with a rich set of features enabled.</p>

    <?= example('Balham Theme', 'theme-balham', 'generated', array( 'enterprise' => true )) ?>
    <?= example('Balham Theme (dark)', 'theme-balham-dark', 'generated', array( 'enterprise' => true )) ?>

    <p>
        To use the theme, add <code>ag-theme-balham</code> or <code>ag-theme-balham-dark</code> CSS class to the DIV element on which the ag-Grid instance is instantiated.
    <p/>

<p>The following is an example of the angular version of ag-Grid with the balham theme:</p>

<snippet language="html">
&lt;ag-grid-angular class="ag-theme-balham"&gt;&lt;/ag-grid-angular&gt;

&lt;ag-grid-angular class="ag-theme-balham-dark"&gt;&lt;/ag-grid-angular&gt;
</snippet>


<h2>Change the Theme Accent Color</h2>

<p>In addition to the finer grained Scss color variables available for the rest of the themes, the Balham theme has a 'catch all' Sass variable named '$active' that determines the color of the selected checkboxes, selected rows and icons in the column menu.</p>

<snippet>
// Set the colors to blue and amber
$active: #E91E63; // pink-500 from https://www.materialui.co/colors
// Import the ag-Grid balham theme
@import '~ag-grid/src/styles/ag-theme-balham';</snippet>

<p>You can examine the full list of the variables that can be changed in the <a href="https://github.com/ag-grid/ag-grid/blob/latest/src/styles/ag-theme-balham.scss">theme source file</a>.</p>

<p>
The recommended way to process your project's Scss files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle. 
</p>

<note>The ag grid icons path should be re-adjusted when importing the scss file. 

This is a common problem, <a href="https://github.com/webpack-contrib/sass-loader#problems-with-url">described in the Sass(scss) loader project</a>. 
The theme exposes the <code>$ag-icons-path</code> variable to address that. The <a href="https://github.com/ag-grid/ag-grid-customise-theme/">customize theme sample repo in github</a> demonstrates how to override the variable.</note>


<h2>Change the Theme Icons</h2>

<h3>Replace the Entire Set</h3>

<p>
The easiest way to replace the entire icon set is to change the <code>$ag-icons-path</code> Scss variable to point to a directory with your set of icons.
The icons should be <strong>16x16px sized SVG</strong> files. You can check the <a href="https://github.com/ag-grid/ag-grid/tree/latest/src/styles/balham-icons">full list in the GitHub repository</a>. 
</p> 

<h3>Change Individual Icons</h3>

<p>You can also change individual icons by overriding the background images for the respective CSS selector. 
The following code snippet overrides the pin icon used in the drag hint when reordering columns:<p>

<snippet>
/* 
 * The override should be placed after the import of the theme. 
 * Alternatively, you can aso increase the selector's specifcity 
 */
.ag-theme-balham .ag-icon-pin {
    background-image: url('path/to/my-pin-icon.svg');
}</snippet>

<p>The icon classes follow the <code>.ag-icon-{icon-file-name}</code> convention.</p>

<?php include '../documentation-main/documentation_footer.php';?>
