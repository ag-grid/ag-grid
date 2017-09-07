<?php
$key = "Material Next Theme";
$pageTitle = "ag-Grid Material Design Data Grid";
$pageDescription = "ag-Grid Material Design Data Grid";
$pageKeyboards = "ag-Grid Material Design Data Grid";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="material-theme">Material Next Theme</h2>

    <p>
        The Material Next theme is available from <strong>v13</strong> onwards. 
        To comply with the <a href="https://material.io/guidelines/components/data-tables.html#">material design data table guidelines</a>, 
        the theme uses different spacing and icon set compared to the other available themes.
    </p>

    <p/>
        To use the theme, add <code>ag-material-next</code> CSS class to the DIV element on which the ag-Grid instance is instantiated.
    <p/>

    The following is an example of using the ag-material-next theme (using AngularJS 1.x):<br/>

<snippet>
&lt;div ag-grid="gridOptions" class="ag-material-next"&gt;&lt;/div&gt;</snippet>

    </p>

    <div class="bigTitle" id="material-theme-example">Material Next Theme Example</div>

    <p/>

    <show-example example="example-material-next"></show-example>

</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
