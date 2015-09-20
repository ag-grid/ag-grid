<?php
$key = "Getting Started ng1";
$pageTitle = "Getting Started AngularJS 1";
$pageDescription = "Getting Started AngularJS 1";
$pageKeyboards = "Getting Started AngularJS 1";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - AngularJS 1.x</h2>

    <p>
        The ag-Grid script, when loaded, will check if AngularJS is loaded. If it finds it,
        it will register the grid as an AngularJS 1.x Directive. All you need to do is make sure you
        load AngularJS before you load ag-Grid, and then load ag-Grid before you initialise
        your AngularJS module.
    </p>

    <h4>Creating the AngularJS Module</h4>
    Include ag-Grid as a dependency of your module like this:
    <p/>
    <pre><code>var module = angular.module("example", <b>["agGrid"]</b>);</code></pre>

    <h4>ag-Grid Div</h4>

    <p>
        To include a grid in your html, add the ag-Grid attribute to a div. The value
        of the div should be the provided grid options on the scope.
    </p>

    <p>
        It is also usual (although not necessary) to provide a styling theme to
        the grid. Three themes come with the grid, ag-fresh, ag-dark and ag-blue. Each one is
        set by applying the corresponding class of the same name to the div. In the
        example, ag-fresh is used.
    </p>

    <p>
        You must provide <b>width and height</b> to your grid. The grid is programmed to fill
        the width and height you give it.
    </p>

    <pre>&lt;div <b>ag-grid="gridOptions" class="ag-fresh" style="height: 100%;"</b>>&lt;/div></pre>

    <p>
        (note: a div by default has 100% width, so the width is not specified explicitly above).
    </p>

    <h4>Grid Options</h4>
    <p>
        The grid options provide ag-Grid with the details needed to render. At a
        minimum you provide the columns (columnDefs) and the rows (rowData).
    </p>

    <h4>Very Simple Example</h4>
    <show-example example="example1" example-height="200px"></show-example>

    <h2>Loading Rows</h2>

    <h4>Calling setRows()</h4>

    If rows are loaded after the grid is initialised, call the grid's API function to update the rows after the load.

    <pre><code>$scope.gridOptions.api.setRows(newRows)</code></pre>

    <p/>

    The API is explained in full in it's own section.

    <p/>

    <show-example example="example2"></show-example>




</div>

<?php include '../documentation_footer.php';?>
