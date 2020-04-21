<?php
$pageTitle = "ag-Grid Reference: Using ag-Grid with AMD";
$pageDescription = "This Getting Started guide demonstrates building ag-Grid with AMD. Featuring step by step guide and code examples.";
$pageKeywords = "TypeScript Grid AMD";
$pageGroup = "basics";

include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 id="building-with-amd">Using ag-Grid with AMD</h1>

    <p class="lead">We walk through the main steps required when using ag-Grid with AMD.</p>

    <h3>Initialise Project</h3>

    <snippet language="sh">
        mkdir ag-grid-amd
        cd ag-grid-amd
        npm init --yes
    </snippet>

    <h3>Install Dependencies</h3>

    <snippet language="sh">
        npm i --save ag-grid-community

        # or, if using Enterprise features
        npm i --save ag-grid-enterprise
    </snippet>

    <h3>Create Application</h3>

    <p>Our application will be a very simple one:</p>

<snippet>
requirejs.config({
    baseUrl: '../node_modules',
    paths: {
        'agGrid': 'ag-grid-community/dist/ag-grid-community.amd.min', // for community features
        // 'agGrid': 'ag-grid-enterprise/dist/ag-grid-enterprise.amd.min',   // for enterprise features
    }
});

requirejs(['agGrid'], function (agGrid) {
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

    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
</snippet>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;script data-main="app" src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 200px;width: 600px" class="ag-theme-alpine"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</snippet>

    <p>Now we can either serve the HTML file above which will result in the following grid.</p>

    <img src="./ts-grid.png" alt="Datagrid">

    <h2>Example Code</h2>

    <p>The code for this example can be found on <a href="git@github.com:seanlandsman/ag-grid-amd-example.git">GitHub</a>.</p>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
