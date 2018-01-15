<?php
$pageTitle = "React Datagrid";
$pageDescription = "ag-Grid can be used as a data grid inside your React application. This page details how to get started.";
$pageKeyboards = "React Datagrid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>
        React Datagrid - Getting Started
    </h1>

    <p>This section documents how to get started with ag-Grid and React as quickly as possible. You will start off with
        a simple application and section by section add Grid features to the application ending up with a fully fledged
        application, with ag-Grid and React at the heart of it.</p>

    <h3>Prerequisites</h3>

    <p>You will need the following build tools installed at a minimum:</p>

    <ul class="content">
        <li>Git: Please see <a href="https://git-scm.com/">Git</a> for installation options</li>
        <li>npm: Please see <a href="https://www.npmjs.com/get-npm">npm</a> for installation options</li>
    </ul>

    <h3>Scaffolding</h3>

    <p>To get started as quickly as possible we provide a "Seed" repo on Git that you can use. Let's clone
        this
        repo, install the dependencies and start it up:</p>


<snippet language="sh">
# clone the ag-Grid React seed project
git clone https://github.com/ag-grid/ag-grid-react-seed
cd ag-grid-react-seed/react

# install the project dependencies
npm install

# build & start the application
npm start
</snippet>


    <p>It will take a few seconds to bundle the application and with just those 3 commands you should now see the following application:</p>

    <img src="../images/react-seed.png" style="display: block;margin: auto;height: 200px;">

    <p>Great! A working Grid application in no time at all. Let's break down the application into it's main parts:</p>

    <h3>Row Data</h3>

    <p>At a minimum, a Grid requires row data & column definitions. Row data is provided to the grid as an array of
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

    <h3>Column Definitions</h3>

    <p>To display this information we need to tell the Grid what data we're interested in. Let's define the three
        columns
        that match the data above:</p>

<snippet language="jsx">
// column definitions
&lt;AgGridColumn field="make">&lt;/AgGridColumn>
&lt;AgGridColumn field="model">&lt;/AgGridColumn>
&lt;AgGridColumn field="price">&lt;/AgGridColumn>
</snippet>

    <p>At a minimum a column definition needs a <code>field</code> defined
        - the data item to read off of from the row data. Here we're defining 3 columns, <code>Make</code>,
        <code>Model</code>
        and <code>Price</code>, each of which correspond to their lowercase equivalent in the row data above.</p>

    <p>Although we define the columns declaratively here, we can also declare them on <code>GridOptions</code> as an alternative.</p>

    <h3>Grid Definition</h3>

    <p>Ok, so now we know how to define our row and column data - how do we define our actual Grid?</p>

    <p>For a React application, you need to pull in the <code>AgGridReact</code> Component and include it in your <code>render</code>
        function:</p>

<snippet language="jsx">
// Grid Definition 
&lt;AgGridReact
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}&gt;

    {/* column definitions */}
    &lt;AgGridColumn field="make">&lt;/AgGridColumn>
    &lt;AgGridColumn field="model">&lt;/AgGridColumn>
    &lt;AgGridColumn field="price">&lt;/AgGridColumn>
&lt;/AgGridReact&gt;
</snippet>

    <p>Here we're telling the Grid to read the row & column definitions off the Components <code>state</code>. For a
        very simple Grid,
        this is all you need to do display tabular data.</p>

    <p>Of course there is much more we can do - in the following sections we will build on this starting point. For our
        seed application here is the complete example:</p>

    <?= example('ag-Grid in React', 'hello-world', 'react',  array( "exampleHeight" => 130, "showResult" => true)); ?>

    <h2>Adding Features</h2>

    <p>Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
        most expensive (or least!)?</p>

    <h3>Sorting</h3>

    <p>Adding sorting to our application is very easy - all you need to do is let the Grid know you want sorting to be
        enabled by setting a the <code>enableSorting</code>Grid property. Notice that <code>enableSorting</code> is shorthand for <code>enableSorting=true</code>.</p>

<snippet language="jsx">
// Grid Definition 
&lt;AgGridReact
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}
    enableSorting&gt;

    {/* column definitions */}
    &lt;AgGridColumn field="make">&lt;/AgGridColumn>
    &lt;AgGridColumn field="model">&lt;/AgGridColumn>
    &lt;AgGridColumn field="price">&lt;/AgGridColumn>
&lt;/AgGridReact&gt;
</snippet>

    <p>With a single property change we are now able to sort any column by clicking the column header (you can keep
        clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
        by <code>Price</code> in ascending order (indicated by the up arrow):</p>

    <img src="../images/react-gs-sorting.png" style="display: block;margin: auto;height: 200px;">

    <h3>Filtering</h3>

    <p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
        real-world
        application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
        this filtering is your friend.
    </p>

<p>As with sorting, enabling filtering is as easy as setting <code>enableFilter</code> in our Grid definition:</p>

<snippet language="jsx">
// Grid Definition 
&lt;AgGridReact
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}
    enableSorting
    enableFilter&gt;

    {/* column definitions */}
    &lt;AgGridColumn field="make">&lt;/AgGridColumn>
    &lt;AgGridColumn field="model">&lt;/AgGridColumn>
    &lt;AgGridColumn field="price">&lt;/AgGridColumn>
&lt;/AgGridReact&gt;
</snippet>

    <p>With the <code>enableFilter</code> property set we are now able to filter any column by clicking the column
        header
        "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
        <code>Model</code>
        column by the text <code>Celica</code> - only the row with <code>Celica</code> is shown now.</p>

    <img src="../images/react-gs-filtering.png" style="display: block;margin: auto;height: 200px;">

    <h2>Summary</h2>

    <p id="react-rich-grid-example">We've only scratched the surface with what you can do with the Grid - please refer to the full set of features on
        the left
        hand navigation for an idea of what's on offer, but below we show a feature rich example:</p>

    <?= example('ag-Grid in React', 'full-rich-markup', 'react', array("enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

   <p>This example makes use of custom <code>cellRenderers</code> to show data in a visually friendly way, demonstrates
        <code>column grouping</code> as well as using <code>React Components</code> in the header. And even this rich
        example is only
        scratching the surface - we've only just gotten started with with ag-Grid can do!</p>

    <p>Please read the <a href="../react-more-details">More Details</a> section next to get a deeper understanding of
        how to
        use ag-Grid and React, as well as the options in installing dependencies and accessing the <code>Enterprise
            Features</code>.</p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
