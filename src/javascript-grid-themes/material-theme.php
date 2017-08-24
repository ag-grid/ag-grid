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
        The Material Next theme is available from <strong>version 13.0</strong> onwards. 
        To comply with the <a href="https://material.io/guidelines/components/data-tables.html#">material design data table guidelines</a>, 
        the theme uses different spacing and icon set compared to the other available themes. 
    </p>

    <p/>
        To use the theme, add <code>ag-theme-material</code> CSS class to the DIV element on which the ag-Grid instance is instantiated.
    <p/>

    The following is an example of using the theme (using AngularJS 1.x):<br/>
<pre>
&lt;div ag-grid="gridOptions" class="ag-theme-material"&gt;&lt;/div&gt;
</pre>

    </p>

    <div class="bigTitle" id="material-theme-example">Material Theme Example</div>

    <p/>

    <show-example example="example-theme-material"></show-example>
</pre>

</div>

<div>
    <h2 id="material-theme-legacy">Material Theme (legacy)</h2>

    The Material Theme is one of the four original themes supplied with ag-Grid. It is deprecated in favor of the new material theme.

    <p/>
    <p/>
    To use a theme, add the theme class name to the div element where the ag-Grid directive is attached.
    <p/>
    The following is an example of using the ag-material theme:<br/>
    <pre>&lt;div ag-grid="gridOptions" class="ag-material">&lt;/div></pre>

    </p>
    Note that to use the Material theme you'll need to override the default rowHeight
    <pre>gridOptions = {
    rowHeight: 48
}</pre>

    Additionally, to be consistent with Googles guidelines, you should override the default checkbox behaviour - in the example
    below we've overriden the selected checkbox state to be blue
    <pre>gridOptions = {
    icons: {
        checkboxChecked: '&lt;img src="data:image/png;base64,..."/>'
    }
}</pre>

    <div class="bigTitle" id="material-theme-example">Material Theme Example</div>

    This grouped example demonstrates some of the different facets of a theme - full, part and no checkbox selection for example, as well as general look and feel

    <p/>

    <show-example example="example-material"></show-example>

</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
