<?php
$pageTitle = "ag-Grid Reference: Getting Started with the Polymer Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This Getting Start guide covers installing our seed repo and getting up and running with a simple Polymer Datagrid. We also cover basisc configuration."; 
$pageKeyboards = "Polymer Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>

<div>

    <h1> Polymer Grid </h1>

    <p class="lead">This section documents how to get started with ag-Grid and Polymer as quickly as possible. You will start off with
        a simple application and section by section add Grid features to the application ending up with a fully fledged
        application, with ag-Grid and Polymer at the heart of it.</p>

    <h2>Prerequisites</h2>

    <p>You will need the following build tools installed at a minimum:</p>

    <ul class="content">
        <li>Git: Please see <a href="https://git-scm.com/">Git</a> for installation options</li>
        <li>npm: Please see <a href="https://www.npmjs.com/get-npm">npm</a> for installation options</li>
    </ul>

    <h2>Scaffolding</h2>

    <p>To get started as quickly as possible we provide a <code>"Seed"</code> repo on Git that you can use. Let's clone
        this
        repo, install the dependencies and start it up:</p>

    <snippet language="sh">
# clone the ag-Grid Polymer seed project
git clone https://github.com/ag-grid/ag-grid-polymer-seed
cd ag-grid-polymer-seed

# install the project dependencies
npm i

# start the application
npm start</snippet>

    <p>With those 3 commands you should now see the following application:</p>

    <img src="../images/seed.png" style="display: block;margin: auto;height: 170px;padding-bottom: 10px">

    <p>Great! A working Grid application in no time at all. Let's break down the application into it's main parts:</p>

    <h2>Row Data</h2>

    <p>At a minimum, a Grid requires row data & column definitions. Row data is provided to the grid as an array of
        JavaScript objects:</p>

    <snippet>
// row data 
[
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
]</snippet>

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
    {headerName: "Model", field: "model", cellRendererFramework: 'red-cell-renderer'},
    {headerName: "Price", field: "price"}
]</snippet>

    <p>At a minimum a column definition needs a <code>headerName</code> - the column title to display - and a <code>field</code>
        - the data item to read off of from the row data. Here we're defining 3 columns, <code>Make</code>,
        <code>Model</code>
        and <code>Price</code>, each of which correspond to their lowercase equivalent in the row data above.</p>
    
    <p>In the case of the <code>model</code> column definition we've also defined a <code>red-cell-renderer</code> - this allows
    us to use an Polymer Component to render the data for that cell. This is entirely optional, but does allow you to leverage
    the full power of Polymer while still gaining the performance and functionality offered by ag-Grid.</p>

    <h2>Grid Definition</h2>

    <p>Ok, so now we know how to define our row and column data - how do we define our actual Grid?</p>

    <p>For a Polymer application, you need to pull in the <code>ag-grid-polymer</code> Component and include it in your <code>template</code>:</p>

    <snippet>
// Grid Definition
&lt;ag-grid-polymer style="width: 500px; height: 120px;"
                 class="ag-theme-balham"
                 rowData="{{rowData}}"
                 columnDefs="{{columnDefs}}"
                 onGridReady="{{onGridReady}}"&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>Here we're telling the Grid to read the row & column definitions off the application Component itself, in fields
        called <code>rowData</code> and <code>columnDefs</code>. For a very simple Grid, this is all you need to do display tabular data.</p>

    <p>Of course there is much more we can do - in the following sections we will build on this starting point. For our
        seed application here is the complete Component:</p>

    <snippet language="html">
&lt;!-- simple-grid.html  -->
&lt;link rel="import" href="red-cell-renderer.html"&gt;
&lt;dom-module id="simple-grid"&gt;
    &lt;template&gt;
        &lt;link rel="stylesheet" href="bower_components/ag-grid/dist/styles/ag-grid.css"&gt;
        &lt;link rel="stylesheet" href="bower_components/ag-grid/dist/styles/ag-theme-balham.css"&gt;

        &lt;h1&gt;Simple ag-Grid Polymer Example&lt;/h1&gt;
        &lt;ag-grid-polymer style="width: 500px; height: 120px;"
                         class="ag-theme-balham"
                         rowData="{{rowData}}"
                         columnDefs="{{columnDefs}}"
                         onGridReady="{{onGridReady}}"&gt;&lt;/ag-grid-polymer&gt;
    &lt;/template&gt;
    &lt;script&gt;
        class SimpleGrid extends Polymer.Element {
            static get is() {
                return "simple-grid";
            }

            constructor() {
                super();

                this.rowData = [
                    {make: "Toyota", model: "Celica", price: 35000},
                    {make: "Ford", model: "Mondeo", price: 32000},
                    {make: "Porsche", model: "Boxter", price: 72000}
                ];

                this.columnDefs = [
                    {headerName: "Make", field: "make"},
                    {
                        headerName: "Model",
                        field: "model",
                        cellRendererFramework: 'red-cell-renderer'
                    },
                    {headerName: "Price", field: "price"}
                ];
            }

            onGridReady() {
                this.api.sizeColumnsToFit();
            }
        }
        customElements.define(SimpleGrid.is, SimpleGrid);
    &lt;/script&gt;
&lt;/dom-module&gt;</snippet>

    <h2>Adding Features</h2>

    <p>Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
        most expensive (or least!)?</p>

    <h3>Sorting</h3>

    <p>Adding sorting to our application is very easy - all you need to do is let the Grid know you want sorting to be
        enabled by setting a Grid property to true:</p>

    <snippet language="html">
&lt;!-- Grid Definition -->
&lt;ag-grid-polymer style="width: 500px; height: 120px;"
                 class="ag-theme-balham"
                 rowData="{{rowData}}"
                 columnDefs="{{columnDefs}}"
                 enableSorting
                 onGridReady="{{onGridReady}}"&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>With a single property change we are now able to sort any column by clicking the column header (you can keep
        clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
        by <code>Price</code> in ascending order (indicated by the up arrow):</p>

    <img src="../images/js-gs-sorting.png" style="display: block;margin: auto;height: 170px;">

    <h3>Filtering</h3>

    <p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
        real-world
        application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
        this filtering is your friend.
    </p>

    <p>As with sorting, enabling filtering is as easy as setting a single property in our Grid definition:</p>

    <snippet language="html">
&lt;!-- Grid Definition -->
&lt;ag-grid-polymer style="width: 500px; height: 120px;"
                 class="ag-theme-balham"
                 rowData="{{rowData}}"
                 columnDefs="{{columnDefs}}"
                 enableFilter="true"
                 onGridReady="{{onGridReady}}"&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>With the <code>enableFilter</code> property set we are now able to filter any column by clicking the column
        header
        "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
        <code>Model</code>
        column by the text <code>Celica</code> - only the row with <code>Celica</code> is shown now.</p>

    <img src="../images/js-gs-filtering.png" style="display: block;margin: auto;height: 170px;">

    <h2>Summary</h2>

    <p id="polymer-rich-grid-example">We've only scratched the surface with what you can do with the Grid - please refer to the full set of features on
        the left
        hand navigation for an idea of what's on offer, but below we show a feature rich example:</p>

    <?= example('Rich Polymer Grid', 'rich-grid', 'polymer', array("exampleHeight" => 500, 'enterprise' => true)) ?>

    <p>This example makes use of custom Cell Renderers to show data in a visually friendly way, demonstrates
        column grouping as well as using <strong>Polymer Components</strong> in the name column. And even this rich
        example is only
        scratching the surface - we've only just gotten started with with ag-Grid can do!</p>

    <p>Please read the <a href="../polymer-more-details">More Details</a> section next to get a deeper understanding of
        how to
        use ag-Grid and Polymer, as well the <strong>Enterprise Features</strong>.</p> 
</div>

<?php include '../getting-started/footer.php'; ?>
