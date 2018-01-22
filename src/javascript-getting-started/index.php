<?php
$pageTitle = "JavaScript Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your plain JavaScript application. This page details how to get started.";
$pageKeyboards = "Javascript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>JavaScript Grid</h1>

    <p>This section documents how to get started with ag-Grid and JavaScript as quickly as possible. You will start off
        with
        a simple application and section by section add Grid features to the application ending up with a fully fledged
        application with ag-Grid at the heart of it.</p>

    <h2>Prerequisites</h2>

    <p>You will need the following build tools installed at a minimum:</p>

    <ul class="content">
        <li>Git: Please see <a href="https://git-scm.com/">Git</a> for installation options</li>
    </ul>

    <h2>Scaffolding</h2>

    <p>To get started as quickly as possible we provide a <code>"Seed"</code> repo on Git that you can use. Let's clone
        this
        repo, install the dependencies and start it up:</p>

<snippet language="sh">
# clone the ag-Grid  seed project
git clone https://github.com/ag-grid/ag-grid-seed
cd ag-grid-seed/javascript

# Now either open index.html from the browser of your choice, or from the command line:
# either Windows:
start index.html
# or OSX:
open index.html
</snippet>

    <p>Great! A working Grid application in no time at all. Let's break down the application into its main parts:</p>

    <h2>Row Data</h2>

    <p>At a minimum, a Grid requires row data &amp; column definitions. Row data is provided to the grid as an array of
        JavaScript objects:</p>

<snippet>
// row data 
[
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
]
</snippet>

<p>Here we have 3 rows of data, with <code>make</code>, <code>model</code> and <code>price</code> making up the
    data.</p>

<h2>Column Definitions</h2>

    <p>To display this information we need to tell the Grid what data we're interested in. Let's define the three
        columns
        that match the data above:</p>

<snippet>
// column definitions
[
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
]
</snippet>

    <p>At a minimum a column definition needs a <code>headerName</code> - the column title to display - and a <code>field</code>
        - the data item to read off of from the row data. Here we're defining 3 columns, <code>Make</code>,
        <code>Model</code>
        and <code>Price</code>, each of which correspond to their lowercase equivalent in the row data above.</p>

<h2>Grid Definition</h2>

    <p>Ok, so now we know how to define our row and column data - how do we define our actual Grid?</p>

    <p>For a JavaScript application, you need to reference ag-Grid in your html file and provide a container (typically
        a <code>div</code> for ag-Grid to use:</p>

<snippet language="html">
&lt;html&gt;
&lt;head&gt;
    &lt;!-- reference the ag-Grid library--&gt;
    &lt;script src="https://unpkg.com/ag-grid/dist/ag-grid.min.js"&gt;&lt;/script&gt;

    &lt;!-- our application code --&gt;
    &lt;script src="example.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;h1&gt;Simple ag-Grid Example&lt;/h1&gt;

&lt;!-- the div ag-Grid will use to render it's data --&gt;
&lt;div id="myGrid" style="height: 115px;width:500px" class="ag-theme-balham"&gt;&lt;/div&gt;

&lt;/body&gt;
&lt;/html&gt;
</snippet>

    <p>Here we're referencing the latest version from the <a href="https://unpkg.com/ag-grid/">unpkg CDN service</a>. You can use a CDN too, download ag-Grid (see <a
                href="../javascript-more-details">More Details</a>) or bundle it with a tool like <a
                href="https://webpack.github.io/">Webpack</a>.</p>

    <p>We're also providing a <code>div</code> for ag-Grid to use here, along with a width and height. These could be
        any unit
        of course, including <code>%</code>.</p>

    <p>Finally, we provide a <code>theme</code> for our Grid - the theme determines the Grid's look and feel. Please see
        <a href="../javascript-grid-styling">themes</a> for more information.</p>

    <p>Next in our application, we define a <code>gridOptions</code> object that we will pass to the Grid - in this we declare the
        row and column information we want displayed:</p>

<snippet>
// Grid Definition 
// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
}
</snippet>

    <p>Finally, we wait for the DOM to load and once ready find the container we want ag-Grid to use (as defined by the
        ID we provided above)
        and pass in the <code>GridOptions</code> we want to use:</p>

<snippet>
// wait for the document to be loaded, otherwise,
// ag-Grid will not find the div in the document.

document.addEventListener("DOMContentLoaded", function() {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});
</snippet>

    <p>The final setup looks like this:</p>

<?= example('Simple ag-Grid Example', 'hello-world', 'vanilla', array("showResult" => true,"exampleHeight" => 140)) ?>

    <p>We encourage you to experiment with the plunker above - try adding new rows of data for example or renaming
        column headers.</p>

    <p>With this we have a simple application ready to go of course there is much more we can do - in the following
        sections
        we will build on this starting point. </p>

    <h3>Adding Features</h3>

    <p>Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
        most expensive (or least!)?</p>

    <h3>Sorting</h3>

    <p>Adding sorting to our application is very easy - all you need to do is let the Grid know you want sorting to be
        enabled by setting a Grid property to true:</p>

<snippet>
// Grid Definition 
// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,

    // enable sorting 
    enableSorting: true
}
</snippet>

    <p>With a single property change we are now able to sort any column by clicking the column header (you can keep
        clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
        by <code>Price</code> in ascending order (indicated by the up arrow):</p>

    <p><img src="../images/js-gs-sorting.png" alt="ag-Grid with Sorting" height="183"></p>

    <h3>Filtering</h3>

    <p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
        real-world
        application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
        this filtering is your friend.
    </p>

    <p>As with sorting, enabling filtering is as easy as setting a single property in our Grid definition:</p>

    <snippet>
// Grid Definition 
// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableSorting: true,
    // enable filtering 
    enableFilter: true
}
</snippet>

    <p>With the <code>enableFilter</code> property set we are now able to filter any column by clicking the column
        header
        "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
        <code>Model</code>
        column by the text <code>Celica</code> - only the row with <code>Celica</code> is shown now.</p>

    <p><img src="../images/js-gs-filtering.png" height="179" alt="ag-Grid with filtering"></p>

    <h2 id="summary">Summary</h2>

    <p>We've only scratched the surface with what you can do with the Grid - please refer to the full set of features on
        the left
        hand navigation for an idea of what's on offer, but below we show a feature rich example:</p>

    <?= example('Advanced ag-Grid Example', 'rich-grid', 'vanilla', array("enterprise" => 1, "showResult" => true, "exampleHeight" => 460, "extras" => array("bootstrap", "jquery"))) ?>


    <p>This example makes use of custom <code>cell renderers</code> to show data in a visually friendly way, demonstrates
        <code>column grouping</code> as well as using <code>JavaScript Components</code> in the header. And even this
        rich
        example is only scratching the surface - we've only just gotten started with with ag-Grid can do!</p>

    <p>Please read the <a href="../javascript-more-details">More Details</a> section next to get a deeper understanding
        of how to use ag-Grid, as well as the options in installing dependencies and accessing the <code>Enterprise
            Features</code>.</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
