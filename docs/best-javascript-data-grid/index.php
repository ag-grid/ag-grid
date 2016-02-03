<?php
$key = "Getting Started Javascript";
$pageTitle = "Best Javascript Data Grid";
$pageDescription = "How to set up the Best Javascript Data Grid. Shows how to use ag-Grid to build a Javascript grid using only Javascript and without using any framework";
$pageKeyboards = "Best Javascript Data Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Best JavaScript Data Grid</h2>

    <p>
        When using no framework, you have the choice of using the bundled ag-Grid (which puts
        the ag-Grid library into the global scope of the browser) or using a package manager
        to access the CommonJS version of the grid.
    </p>

    <h3>Using Bundled ag-Grid and Pure Javascript</h3>

    <p>
        Reference the ag-Grid script from your
        web page and then access the library through global scope as follows:
    </p>

    <pre>// example creating a grid using raw Javascript
var eGridDiv = document.querySelector('#myGrid'); // get a reference to the grid div
new agGrid.Grid(eGridDiv, gridOptions); //create a new grid</pre>

    <p>
        Below is a simple example using standard Javascript.
    </p>

    <show-example example="example1"></show-example>

    <p>
        The below example is a more complex example demonstration much more interactivity and customisation.
        The mechanism for setting up the grid
        is the same as before. Don't worry about the finer details for now, how all the
        different options are configured is explained in the relevant parts of the documentation.
    </p>

    <show-example example="html5grid"></show-example>

    <h3>Using CommonJS and Pure Javascript</h3>

    <p>
        For an example of using the CommonJS and raw JavaScript version of ag-Grid, see
        the example <a href="https://github.com/ceolter/ag-grid-commonjs-example">CommonJS, Gulp and Browersify</a> on Github.
    </p>

    <h3>Destroy</h3>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

    <h3>Next Steps...</h3>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>
</div>


<?php include '../documentation_footer.php';?>
