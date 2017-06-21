<?php
$key = "Getting Started Javascript";
$pageTitle = "JavaScript Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your plain JavaScript application. This page details how to get started.";
$pageKeyboards = "Javascript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="../images/javascript.png" height="25px"/>
        JavaScript Grid
    </h1>

    <h3>
        Getting started with ag-Grid and plain JavaScript.
    </h3>

    <p>This section documents how to get started with ag-Grid and JavaScript as quickly as possible. You will start off
        with
        a simple application and section by section add Grid features to the application ending up with a fully fledged
        application with ag-Grid at the heart of it.</p>

    <h2>Prerequisites</h2>

    <p>You will need the following build tools installed at a minimum:</p>

    <ul>
        <li>Git: Please see <a href="https://git-scm.com/">Git</a> for installation options</li>
    </ul>

    <h2>Scaffolding</h2>

    <p>To get started as quickly as possible we provide a <code>"Seed"</code> repo on Git that you can use. Let's clone
        this
        repo, install the dependencies and start it up:</p>

    <pre>
<span class="codeComment">// clone the ag-Grid React seed project</span>
git clone https://github.com/ceolter/ag-grid-seed
cd ag-grid-react-seed/javascript

<span class="codeComment">// Now either open index.html from the browser of your choice, or from the command line:</span>
<span class="codeComment">// either Windows:</span>
start index.html
<span class="codeComment">// or OSX:</span>
open index.html
</pre>

    <p>With those 2 commands you should now see the following application:</p>

    <show-complex-example example="example-js.html"
                          sources="{
                            [
                                { root: './', files: 'example-js.html,example-js.js' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/369YrrgCVrnPjD528OtT/"
                          exampleheight="190px">
    </show-complex-example>

    <p>Great! A working Grid application in no time at all. Let's break down the application into it's main parts:</p>

    <h3>Row Data</h3>

    <p>At a minimum, a Grid requires row data & column definitions. Row data is provided to the grid as an array of
        JavaScript objects:</p>

    <pre>
<span class="codeComment">// row data </span>
[
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
]
</pre>

    <p>Here we have 3 rows of data, with <code>make</code>, <code>model</code> and <code>price</code> making up the
        data.</p>

    <h3>Column Definitions</h3>

    <p>To display this information we need to tell the Grid what data we're interested in. Let's define the three
        columns
        that match the data above:</p>

    <pre>
<span class="codeComment">// column definitions</span>
[
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
]
</pre>

    <p>At a minimum a column definition needs a <code>headerName</code> - the column title to display - and a <code>field</code>
        - the data item to read off of from the row data. Here we're defining 3 columns, <code>Make</code>,
        <code>Model</code>
        and <code>Price</code>, each of which correspond to their lowercase equivalent in the row data above.</p>

    <h3>Grid Definition</h3>

    <p>Ok, so now we know how to define our row and column data - how do we define our actual Grid?</p>

    <p>For a JavaScript application, you need to reference ag-Grid in your html file and provide a container (typically
        a
        <code>div</code> for ag-Grid to use::</p>

    <pre>
<span class="codeComment">&lt;!-- index.hmtl --></span>
&lt;html&gt;
&lt;head&gt;
    <span class="codeComment">&&lt;!-- reference the ag-Grid library--></span>
    &lt;script src="https://cdnjs.cloudflare.com/ajax/libs/ag-grid/10.1.0/ag-grid.js"&gt;&lt;/script&gt;

    <span class="codeComment">&lt;!-- our application code --></span>
    &lt;script src="example.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;h1&gt;Simple ag-Grid Example&lt;/h1&gt;

<span class="codeComment">&lt;!-- the div ag-Grid will use to render it's data --></span>
&lt;div id="myGrid" style="height: 115px;width:500px" class="ag-fresh"&gt;&lt;/div&gt;

&lt;/body&gt;
&lt;/html&gt;
</pre>

    <p>Here we're referencing version 10.1.0 from a CDN. You can use a CDN too, download ag-Grid (see <a
                href="../javascript-more-details">More Details</a>) or bundle it with a tool like <a
                href="https://webpack.github.io/">Webpack</a>.</p>

    <p>We're also providing a <code>div</code> for ag-Grid to use here, along with a width and height. These could be
        any unit
        of course, including <code>%</code>.</p>

    <p>Finally, we provide a <code>theme</code> for our Grid - the theme determines the Grids look and feel. Please see
        <a
                href="../javascript-grid-styling">Themes</a> for more information.</p>

    <p>Next in our application, we define a gridOptions object that we will pass to the Grid - in this we declare the
        row and column
        information we want displayed:</p>

    <pre>
<span class="codeComment">// Grid Definition </span>
<span class="codeComment">// let the grid know which columns and what data to use</span>
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
}
</pre>

    <p>Finally, we wait for the DOM to load and once ready find the container we want ag-Grid to use (as defined by the
        ID we provided above)
        and pass in the <code>GridOptions</code> we want to use:</p>

    <pre>
<span class="codeComment">// wait for the document to be loaded, otherwise,</span>
<span class="codeComment">// ag-Grid will not find the div in the document.</span>
document.addEventListener("DOMContentLoaded", function() {

    <span class="codeComment">// lookup the container we want the Grid to use</span>
    var eGridDiv = document.querySelector('#myGrid');

    <span class="codeComment">// create the grid passing in the div to use together with the columns & data we want to use</span>
    new agGrid.Grid(eGridDiv, gridOptions);
});
</pre>

    <p>We encourage you to experiment with the plunker above - try adding new rows of data for example or renaming
        column headers.</p>

    <p>With this we have a simple application ready to go of course there is much more we can do - in the following
        sections
        we will build on this starting point. </p>

    <h3>Adding Features</h3>

    <p>Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
        most expensive (or least!)?</p>

    <h4>Sorting</h4>

    <p>Adding sorting to our application is very easy - all you need to do is let the Grid know you want sorting to be
        enabled by setting a Grid property to true:</p>

    <pre>
<span class="codeComment">// Grid Definition </span>
<span class="codeComment">// let the grid know which columns and what data to use</span>
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,

    <span class="codeComment">// enable sorting </span>
    enableSorting: true
}
</pre>

    <p>With a single property change we are now able to sort any column by clicking the column header (you can keep
        clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
        by <code>Price</code> in ascending order (indicated by the up arrow):</p>

    <img src="../images/js-gs-sorting.png" style="display: block;margin: auto;height: 200px;">

    <h4>Filtering</h4>

    <p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
        real-world
        application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
        this filtering is your friend.
    </p>

    <p>As with sorting, enabling filtering is as easy as setting a single property in our Grid definition:</p>

    <pre>
<span class="codeComment">// Grid Definition </span>
<span class="codeComment">// let the grid know which columns and what data to use</span>
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,

    enableSorting: true,

    <span class="codeComment">// enable filtering </span>
    enableFilter: true
}
</pre>

    <p>With the <code>enableFilter</code> property set we are now able to filter any column by clicking the column
        header
        "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
        <code>Model</code>
        column by the text <code>Celica</code> - only the row with <code>Celica</code> is shown now.</p>

    <img src="../images/js-gs-filtering.png" style="display: block;margin: auto;height: 200px;">

    <h3 id="summary">Summary</h3>

    <p>We've only scratched the surface with what you can do with the Grid - please refer to the full set of features on
        the left
        hand navigation for an idea of what's on offer, but below we show a feature rich example:</p>

    <show-example example="html5grid"></show-example>

    <p>This example makes use of custom <code>cellRenderers</code> to show data in a visually friendly way, demonstrates
        <code>column grouping</code> as well as using <code>JavaScript Components</code> in the header. And even this
        rich
        example is only scratching the surface - we've only just gotten started with with ag-Grid can do!</p>

    <p>Please read the <a href="../javascript-more-details">More Details</a> section next to get a deeper understanding
        of
        how to use ag-Grid and React, as well as the options in installing dependencies and accessing the <code>Enterprise
            Features</code>.</p>

<?php include '../documentation-main/documentation_footer.php'; ?>