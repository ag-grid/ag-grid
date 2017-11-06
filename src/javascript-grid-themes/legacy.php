<?php
$key = "Legacy Themes";
$pageTitle = "ag-Grid Legacy Themes";
$pageDescription = "ag-Grid Legacy Themes";
$pageKeyboards = "ag-Grid Legacy Themes";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="material-theme">Legacy Themes</h2>

    <p>Prior to v 14.1.0 (October 2017), ag-Grid shipped five themes called `ag-fresh`, `ag-material`, `ag-dark`, `ag-blue`, and `ag-bootstrap`. 
These are now deprecated; you should consider migrating to the current ones which provide more consistent whitespace and easier customization through Sass variables.
</p>

<style scoped>
.theme-table td,
.theme-table th {
padding-left: 2em;
}
</style>

<table class="theme-table">
            <tr>
                <th>Old Theme</th><th>New Theme</th>
            </tr>
            <tr>
                <td>ag-fresh</td><td>ag-theme-fresh</td>
            </tr>
            <tr>
                <td>ag-dark</td><td>ag-theme-dark</td>
            </tr>
            <tr>
                <td>ag-blue</td><td>ag-theme-blue</td>
            </tr>
            <tr>
                <td>ag-material</td><td>ag-theme-material</td>
            </tr>
            <tr>
                <td>ag-bootstrap</td><td>ag-theme-bootstrap</td>
            </tr>
        </table>


</div>

<?php include '../documentation-main/documentation_footer.php';?>
