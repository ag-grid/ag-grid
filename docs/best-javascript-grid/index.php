<?php
$key = "Getting Started Javascript";
$pageTitle = "Best Javascript Grid";
$pageDescription = "Shows how to use ag-Grid to build a Javascript grid using only Javascript and without using any framework";
$pageKeyboards = "Best Javascript Data Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - Plain Javascript</h2>

    <p>
        You don't have to use any framework to use ag-Grid if you don't want to.
        Just load the ag-Grid <i>.js</i> and <i>.css</i> files as normal and
        then from your Javascript code, call the ag-Grid global function <i>agGridGlobalFunc()</i>.
        This page shows how to set up ag-Grid using just Javascript and native
        DOM manipulation.
    </p>

    <p>
        To use ag-Grid using pure Javascript new <i>ag.grid.Grid(div, gridOptions)</i> function to initialise an instance of the grid.
    </p>

    <pre>    // example creating a grid using raw Javascript
    var eGridDiv = document.querySelector('#myGrid'); // get a reference to the grid div
    new ag.grid.Grid(eGridDiv, gridOptions); //create a new grid
</pre>

    <h2>Simple Plain Javascript Example</h2>

    <p>
        Below is a simple example using standard Javascript.
    </p>

    <show-example example="example1"></show-example>

    <h2>Complex Plain Javascript Example</h2>

    <p>
        The below example has much more details. The mechanism for setting up the grid
        is the same as above. Don't worry about the finer details for now, how all the
        different options are configured is explained in the relevant parts of the documentation.
    </p>

    <show-example example="html5grid"></show-example>

    <h2>Destroy</h2>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

    <h2>Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>
</div>


<?php include '../documentation_footer.php';?>
