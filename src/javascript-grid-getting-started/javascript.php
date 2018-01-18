<h2>
    <img src="../images/svg/docs/getting_started.svg" width="50"/>
    <img style="vertical-align: middle" src="../images/svg/javascript.svg" height="25px"/>
    Getting Started
</h2>

<?php include 'ag-grid-dependency.php' ?>

<p>Here we've referenced the ag-Grid dependency in the <code>head</code> section, and specified a <code>div</code> with
    an ID of <code>myGrid</code>.</p>
<p>We've also specified the <a href="../http://localhost:8080/javascript-grid-themes/fresh-theme.php">Fresh Theme</a> -
    themes are we
    we can define the look and feel of the Grid. More on that later.
</p>
<p><code>example1.js</code> would be where your application code would live in this example.</p>


<h3 id="javascript-simple-grid">Creating the Grid</h3>

<p>Now that we have a <code>div</code> for the Grid, we need to specify the following at a minimum:</p>
<ul>
    <li>Columns</li>
    <li>Row Data</li>
</ul>

<p>So let's create a simply example with 3 columns and 3 rows of data:</p>
<snippet>
    // specify the columns
    var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
    ];

    // specify the data
    var rowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
    ];

    // let the grid know which columns and what data to use
    var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
    };

    // wait for the document to be loaded, otherwise ag-Grid will not find the div in the document.
    document.addEventListener("DOMContentLoaded", function() {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
    });
</snippet>

<p>With that in place we have a quick and simple Grid up and running:</p>

<h3>A Richer Example</h3>
<p>
    The below example is a more complex example demonstration much more interactivity and customisation.
    The mechanism for setting up the grid
    is the same as before. Don't worry about the finer details for now, how all the
    different options are configured is explained in the relevant parts of the documentation.
</p>

</div>
