<?php
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid Angular Compiling";
$pageKeyboards = "Angular Grid Angular Compiling";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started</h2>

    <h4>Dependencies</h4>
    In your html, include AngularJS (1.2 or later) and AngularGrid (download from this website).

    <p/>
    AngularGrid has no other dependencies except AngularJS.

    <h4>Creating the Angular Module</h4>
    While creating your Angular module, include AngularGrid as a dependency of your module. Eg:
    <p/>
    <pre><code>var module = angular.module("example", <b>["angularGrid"]</b>);</code></pre>

    <h4>Angular Grid Div</h4>

    To include a grid in your html, add the AngularGrid attribute to a div. The value
    of the div should be the provided grid options on the scope.

    <p/>
    It is also usual (although not neccessary) to provide a styling theme to
    the grid. Two themes come with the grid, ag-fresh and ag-dark. Each one is
    set by applying the corresponding class of the same name to the div. In the
    example, ag-fresh is used.

    <h4>Grid Options</h4>
    The grid options provide AngularGrid with the details needed to render. At a
    minimum you provide the columns (columnDefs) and the rows (rowData).

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
