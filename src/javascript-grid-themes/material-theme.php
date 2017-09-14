<?php
$key = "Material Theme";
$pageTitle = "ag-Grid Material Design Data Grid";
$pageDescription = "ag-Grid Material Design Data Grid";
$pageKeyboards = "ag-Grid Material Design Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="material-theme">Material Theme<sup class=new>new</sup></h2>

    <p>
        The New material theme is available from <strong>version 13.0</strong> onwards. 
        To comply with the <a href="https://material.io/guidelines/components/data-tables.html#">material design data table guidelines</a>, 
        the theme uses different spacing and icon set compared to the other themes. 
    </p>

    <p> The example below shows the grid with a rich set of features enabled.</p>
    <?= example('Material Theme', 'theme-material') ?>


    <p>
        To use the theme, add <code>ag-theme-material</code> CSS class to the DIV element on which the ag-Grid instance is instantiated.
    <p/>

    <p>The following is an example of using the theme (using AngularJS 1.x):</p>

<snippet>
&lt;div ag-grid="gridOptions" class="ag-theme-material"&gt;&lt;/div&gt;</snippet>

    <h3>Include the Roboto Font</h3>

    <p>The material design guidelines require the Roboto font to be used throughout the interface. The easiest way to include it in the document is by loading it from the Google CDN. 
Put the following code in the HEAD element of your document: </p>

<snippet>
&lt;link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"&gt;</snippet>


    <h3>Change the Theme Primary / Secondary Colors through Scss</h3>

    <p>
    The material theme uses Scss internally, exposing several variables which control its appearance. 
    The ones you are likely looking into changing are the primary and secondary colors. The default ones are 
    <a href="https://material.io/guidelines/style/color.html#color-color-palette">indigo-500 and pink-A200 from the Google color palette</a>, which match the indigo-pink Angular Material theme.
    </p>

    <p>To change the application colors, set the variables values to your colors of choice, and include the Scss theme file after that.<p>

<snippet>
// Set the colors to blue and amber
$ag-mat-primary: #2196F3; // blue-500
$ag-mat-accent: #FFD740; // amber-A200

// Import the ag-Grid material theme
@import '~ag-grid/src/styles/ag-theme-material';</snippet>

<p>You can examine the full list of the variables that can be changed in the <a href="https://github.com/ag-grid/ag-grid/blob/latest/src/styles/ag-theme-material.scss#L17-L59">theme source file</a>.</p>

<p>
The recommended way to process your project's Scss files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle. 
A working example for Angular 2 based on angular-cli can be found in <a href="https://github.com/ag-grid/ag-grid-material/tree/master/angular-material">the ag-grid-material repository</a>.
</p>

<note>The ag grid icons path should be re-adjusted when importing the scss file. 
This is a common problem, <a href="https://github.com/webpack-contrib/sass-loader#problems-with-url">described in the Sass(scss) loader project</a>. 
The theme exposes the <code>$ag-mat-icons-path</code> variable to address that. The <a href="https://github.com/ag-grid/ag-grid-material/blob/master/angular-material/src/styles.scss#L22-L23">example from above</a> showcases how to override the variable.</note>

<h3>Change the Theme Icons</h3>

<h4>Replace the Entire Set</h4>
<p>
The easiest way to replace the entire icon set is to change the <code>$ag-mat-icons-path</code> Scss variable to point to a directory with your set of icons.
The icons should be <strong>18x18px sized SVG</strong> files. You can check the <a href="https://github.com/ag-grid/ag-grid/tree/latest/src/styles/material-icons">full list in the GitHub repository</a>. 
</p> 

<h4>Change Individual Icons</h4>
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

<h3>Integrate with Other Material Component Libraries</h3>

<p>
You can customize the various UI bits of the grid by providing custom cell renderers or editor components. 
A working example that integrates Angular Material's input, checkbox, select and datepicker can be found in the <a href="https://github.com/ag-grid/ag-grid-material/tree/master/angular-material">ag-grid-material GitHub repository</a>.
</p> 

</div>
<hr>


<div style="border-left: 4px solid lightcoral; padding-left: 4px;">

    <h2 id="material-theme-legacy">DEPRECATED - Old Material Theme (legacy)</h2>

    The Material Theme is one of the four original themes supplied with ag-Grid. It is deprecated in favor of the new material theme.

    <p/>
    <p/>
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    <p/>
    The following is an example of using the ag-material theme:<br/>
    <snippet>
&lt;div ag-grid="gridOptions" class="ag-material"&gt;&lt;/div&gt;</snippet>

    </p>
    Note that to use the Material theme you'll need to override the default rowHeight
    <snippet>
gridOptions = {
    rowHeight: 48
}</snippet>

    Additionally, to be consistent with Googles guidelines, you should override the default checkbox behaviour - in the example
    below we've overriden the selected checkbox state to be blue
    <snippet>
gridOptions = {
    icons: {
        checkboxChecked: '&lt;img src="data:image/png;base64,..."/&gt;'
    }
}</snippet>

    <div class="bigTitle" id="material-theme-example">Material Theme Example</div>

    This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel

    <p/>

    <?= example('Old Material Theme', 'theme-material-old') ?>

</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
