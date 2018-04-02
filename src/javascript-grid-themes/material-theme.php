<?php
$pageTitle = "ag-Grid Themes: The Material Design Datagrid Theme";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers the Material Design Theme for your datagrid.";
$pageKeyboards = "ag-Grid Material Design Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>


    <h1>Material Design Theme</h1>

    <p class="lead">
        The New material theme is available from <strong>version 13.0</strong> onwards. 
        To comply with the <a href="https://material.io/guidelines/components/data-tables.html#">material design data table guidelines</a>, 
        the theme uses different spacing and icon set compared to the other themes. 
    </p>

    <p> The example below shows the grid with a rich set of features enabled.</p>

    <?= example('Material Theme', 'theme-material', 'generated', array( 'enterprise' => true, 'extras' => array("roboto") )) ?>

    <p>
        To use the theme, add <code>ag-theme-material</code> CSS class to the DIV element on which the ag-Grid instance is instantiated.
    <p/>

    <p>The following is an example of using the theme (using AngularJS 1.x):</p>

<snippet>
&lt;div ag-grid="gridOptions" class="ag-theme-material"&gt;&lt;/div&gt;</snippet>

    <h2>Include the Roboto Font</h2>

    <p>The material design guidelines require the Roboto font to be used throughout the interface. The easiest way to include it in the document is by loading it from the Google CDN. 
Put the following code in the HEAD element of your document: </p>

<snippet>
&lt;link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"&gt;</snippet>


<h2>Change the Theme Primary / Secondary Colors through Scss</h2>

<p>
The material theme uses Scss internally, exposing several variables which control its appearance. 
The ones you are likely looking into changing are the primary and secondary colors. The default ones are 
<a href="https://material.io/guidelines/style/color.html#color-color-palette">indigo-500 and pink-A200 from the Google color palette</a>, which match the indigo-pink Angular Material theme.
</p>

<p>To change the application colors, set the variables values to your colors of choice, and include the Scss theme file after that.<p>

<snippet>
// Set the colors to blue and amber
$primary-color: #2196F3; // blue-500
$accent-color: #FFD740; // amber-A200

// Import the ag-Grid material theme
@import '~ag-grid/src/styles/ag-theme-material';</snippet>

<p>You can examine the full list of the variables that can be changed in the <a href="https://github.com/ag-grid/ag-grid/blob/latest/src/styles/ag-theme-material.scss#L17-L59">theme source file</a>.</p>

<p>
The recommended way to process your project's Scss files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle. 
A working example for Angular 2 based on angular-cli can be found in <a href="https://github.com/ag-grid/ag-grid-material/tree/master/angular-material">the ag-grid-material repository</a>.
</p>

<note>The ag grid icons path should be re-adjusted when importing the scss file. 

This is a common problem, <a href="https://github.com/webpack-contrib/sass-loader#problems-with-url">described in the Sass(scss) loader project</a>. 
The theme exposes the <code>$ag-icons-path</code> variable to address that. The <a href="https://github.com/ag-grid/ag-grid-material/blob/master/angular-material/src/styles.scss#L22-L23">example from above</a> showcases how to override the variable.</note>

<h2>Change the row height / header height / icon size </h2>

<p>
The material design guidelines specify the size of the icons, height of the headers and the rows. We recommend keeping them to the default values for "true" material look.
However, In case you wish to change the sizing, you should do that both in the grid configuration 
and by overriding the <code>$grid-size</code> and <code>$icon-size</code>.
A working example that showcases this using webpack can be found <a href="https://github.com/ag-grid/ag-grid-material/tree/master/custom-sizing">ag-grid-material GitHub repository</a>.
</p> 

<h2>Change the Theme Icons</h2>

<h3>Replace the Entire Set</h3>

<p>
The easiest way to replace the entire icon set is to change the <code>$icons-path</code> Scss variable to point to a directory with your set of icons.
The icons should be <strong>18x18px sized SVG</strong> files. You can check the <a href="https://github.com/ag-grid/ag-grid/tree/latest/src/styles/material-icons">full list in the GitHub repository</a>. 
</p> 

<h3>Change Individual Icons</h3>

<p>You can also change individual icons by overriding the background images for the respective CSS selector. 
The following code snippet overrides the pin icon used in the drag hint when reordering columns:<p>

<snippet>
/* 
 * The override should be placed after the import of the theme. 
 * Alternatively, you can aso increase the selector's specifcity 
 */
.ag-theme-material .ag-icon-pin {
    background-image: url('path/to/my-pin-icon.svg');
}</snippet>

<p>The icon classes follow the <code>.ag-icon-{icon-file-name}</code> convention.</p>

<h2>Integrate with Other Material Component Libraries</h2>

<p>
You can customize the various UI bits of the grid by providing custom cell renderers or editor components. 
A working example that integrates Angular Material's input, checkbox, select and datepicker can be found in the <a href="https://github.com/ag-grid/ag-grid-material/tree/master/angular-material">ag-grid-material GitHub repository</a>.
</p> 

<?php include '../documentation-main/documentation_footer.php';?>
