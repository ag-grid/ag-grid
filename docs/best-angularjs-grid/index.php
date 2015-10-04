<?php
$key = "Getting Started ng1";
$pageTitle = "Best AngularJS Grid";
$pageDescription = "Explains how to set up the Best AngularJS Grid grid, ag-Grid, inside your browser.";
$pageKeyboards = "Best AngularJS Grid Datagrid";
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

    <h2>Basic AngularJS 1.x Example</h2>
    <show-example example="example1" example-height="200px"></show-example>

    <h2>Advanced AngularJS 1.x Example</h2>

    <p>
        The below example has much more details. The mechanism for setting up the grid
        is the same as above. Don't worry about the finer details for now, how all the
        different options are configured is explained in the relevant parts of the documentation.
    </p>

    <show-example example="basic"></show-example>

    <h2>Further Example Starting Point</h2>

    <p>
        Below is another simple example, but it loads rows instead of creating rows on the fly.
        This example is used as as starting point for most of the further examples in the
        documentation.
    </p>

    <p>
        The rows are loaded after the grid is initialised, so the grid's API is used to
        update the rows into the grid. The API is explained in full in it's own section
        within the documentation.
    </p>

    <pre><code>$scope.gridOptions.api.setRowData(newRows)</code></pre>

    <show-example example="example2"></show-example>

    <h2>Destroy</h2>

    <p>
        You do not need to manually clean up the grid. The grid ties in with the AngularJS 1 lifecycle
        and releases all resources when the directive is destroyed.
    </p>

    <h2>Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

<?php include '../documentation_footer.php';?>
