<?php
$key = "Getting Started Angular";
$pageTitle = "Angular 2 Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your Angular 2 application. This page details how to get started using ag-Grid inside an Angular 2 application.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="/images/angular2_small.png" height="25px"/>
        Angular 2 Grid
    </h1>
    <h2>Getting Started</h2>

    <p>This section documents how to get started with ag-Grid and Angular as quickly as possible. You will start off with
        a simple application and section by section add Grid features to the application ending up with a fully fledged
        application, with ag-Grid and Angular at the heart of it.</p>

    <h2>Prerequisites</h2>

    <p>You will need the following build tools installed at a minimum:</p>

    <ul>
        <li>Git: Please see <a href="https://git-scm.com/">Git</a> for installation options</li>
        <li>npm: Please see <a href="https://www.npmjs.com/get-npm">npm</a> for installation options</li>
    </ul>

    <h2>Scaffolding</h2>

    <p>To get started as quickly as possible we provide a <code>"Seed"</code> repo on Git that you can use. Let's clone
        this
        repo, install the dependencies and start it up:</p>

    <pre>
<span class="codeComment">// clone the ag-Grid Angular seed project</span>
git clone https://github.com/ag-grid/ag-grid-angular-seed
cd ag-grid-angular-seed/angular-cli

<span class="codeComment">// install the project dependencies</span>
npm i

<span class="codeComment">// build & start the application</span>
npm start
</pre>

    <p>With those 3 commands you should now see the following application:</p>

    <img src="../images/angular-seed.png" style="display: block;margin: auto;height: 200px;">

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
    {headerName: "Model", field: "model", cellRendererFramework: RedComponentComponent},
    {headerName: "Price", field: "price"}
]
</pre>

    <p>At a minimum a column definition needs a <code>headerName</code> - the column title to display - and a <code>field</code>
        - the data item to read off of from the row data. Here we're defining 3 columns, <code>Make</code>,
        <code>Model</code>
        and <code>Price</code>, each of which correspond to their lowercase equivalent in the row data above.</p>
    
    <p>In the case of the <code>model</code> column definition we've also defined a <code>cellRendererFramework</code> - this allows 
    us to use an Angular Component to render the data for that cell. This is entirely optional, but does allow you to leverage
    the full power of Angular while still gaining the performance and functionality offered by ag-Grid.</p>

    <h3>Grid Definition</h3>

    <p>Ok, so now we know how to define our row and column data - how do we define our actual Grid?</p>

    <p>For a Angular application, you need to pull in the <code>ag-grid-angular</code> Component and include it in your <code>template</code>:</p>

    <pre>
<span class="codeComment">// src/app/my-grid-application/my-grid-application.component.html</span>
&lt;ag-grid-angular style="width: 500px; height: 115px;" class="ag-fresh"
                 [rowData]="rowData"
                 [columnDefs]="columnDefs"&gt;
&lt;/ag-grid-angular&gt;
</pre>

    <p>Here we're telling the Grid to read the row & column definitions off the application Component itself, in fields
        called <code>rowData</code> and <code>columnDefs</code>. For a very simple Grid, this is all you need to do display tabular data.</p>

    <p>Of course there is much more we can do - in the following sections we will build on this starting point. For our
        seed application here is the complete Component:</p>

    <pre>
<span class="codeComment">// src/app/my-grid-application/my-grid-application.component.ts</span>
import {Component} from "@angular/core";
import {RedComponentComponent} from "../red-component/red-component.component";

@Component({
    selector: 'app-my-grid-application',
    templateUrl: './my-grid-application.component.html'
})
export class MyGridApplicationComponent {
    columnDefs;
    rowData;

    constructor() {
        this.columnDefs = [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model", cellRendererFramework: RedComponentComponent},
            {headerName: "Price", field: "price"}
        ];

        this.rowData = [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ]
    }

    onGridReady(params) {
        params.api.sizeColumnsToFit();
    }
}

</pre>

    <h3>Adding Features</h3>

    <p>Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
        most expensive (or least!)?</p>

    <h4>Sorting</h4>

    <p>Adding sorting to our application is very easy - all you need to do is let the Grid know you want sorting to be
        enabled by setting a Grid property to true:</p>

    <pre>
<span class="codeComment">// Grid Definition </span>
&lt;ag-grid-angular style="width: 500px; height: 115px;" class="ag-fresh"
                 [rowData]="rowData"
                 [columnDefs]="columnDefs"&gt;

                 enableSorting <span class="codeComment">// shorthand for [enableSorting]="true"</span>
&lt;/ag-grid-angular&gt;
    </pre>

    <p>With a single property change we are now able to sort any column by clicking the column header (you can keep
        clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
        by <code>Price</code> in ascending order (indicated by the up arrow):</p>

    <img src="../images/angular-gs-sorting.png" style="display: block;margin: auto;height: 200px;">

    <h4>Filtering</h4>

    <p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
        real-world
        application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
        this filtering is your friend.
    </p>

    <p>As with sorting, enabling filtering is as easy as setting a single property in our Grid definition:</p>

    <pre>
<span class="codeComment">// Grid Definition </span>
&lt;ag-grid-angular style="width: 500px; height: 115px;" class="ag-fresh"
                 [rowData]="rowData"
                 [columnDefs]="columnDefs"&gt;

                 enableFilter <span class="codeComment">// shorthand for [enableFilter]="true"</span>
&lt;/ag-grid-angular&gt;
</pre>

    <p>With the <code>enableFilter</code> property set we are now able to filter any column by clicking the column
        header
        "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
        <code>Model</code>
        column by the text <code>Celica</code> - only the row with <code>Celica</code> is shown now.</p>

    <img src="../images/angular-gs-filtering.png" style="display: block;margin: auto;height: 200px;">

    <h3>Summary</h3>

    <p>We've only scratched the surface with what you can do with the Grid - please refer to the full set of features on
        the left
        hand navigation for an idea of what's on offer, but below we show a feature rich example:</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=rich-grid"
                          sources="{
                            [
                                { root: '/ng2-example/app/rich-grid-example/', files: 'rich-grid.component.ts,rich-grid.component.html,proficiency-renderer.css,rich-grid.css' },
                                { root: '/ng2-example/app/header-group-component/', files: 'header-group.component.ts,header-group.component.html,header-group.component.css' },
                                { root: '/ng2-example/app/header-component/', files: 'header.component.ts,header.component.html,header.component.css' },
                                { root: '/ng2-example/app/filters/', files: 'skillFilter.ts,proficiencyFilter.ts' },
                                { root: '/ng2-example/app/date-component/', files: 'date.component.ts,date.component.html,date.component.css' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/EINfsm/"
                          exampleHeight="525px">
    </show-complex-example>

    <p>This example makes use of custom <code>cellRenderers</code> to show data in a visually friendly way, demonstrates
        <code>column grouping</code> as well as using <code>Angular Components</code> in the header. And even this rich
        example is only
        scratching the surface - we've only just gotten started with with ag-Grid can do!</p>

    <p>Please read the <a href="../angular-more-details">More Details</a> section next to get a deeper understanding of
        how to
        use ag-Grid and Angular, as well as the options in installing dependencies and accessing the <code>Enterprise
            Features</code>.</p>

    <?php include '../documentation-main/documentation_footer.php'; ?>
</div>