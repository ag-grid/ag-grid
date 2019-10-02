<?php
$pageTitle = "ag-Grid Reference: Using Rollup with ag-Grid";
$pageDescription = "This Getting Started guide demonstrates building ag-Grid with Rollup. Featuring step by step guide and code examples.";
$pageKeyboards = "TypeScript Grid Rollup";
$pageGroup = "basics";

include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="building-with-rollup">
        Building ag-Grid with Rollup.js</h1>

    <p class="lead">We walk through the main steps required when using ag-Grid with Rollup.js.</p>

    <note>A full working example of using Rollup.js with ag-Grid can be found on <a
                href="https://github.com/seanlandsman/ag-grid-rollup">Github</a>.</note>
    <h3>Initialise Project</h3>

    <snippet language="sh">
        mkdir ag-grid-rollup
        cd ag-grid-rollup
        npm init --yes
    </snippet>

    <h3>Install Dependencies</h3>

    <snippet language="sh">
        npm i --save ag-grid-community
        npm i --save-dev rollup rollup-plugin-node-resolve

        # optional - only necessary if you're using any of the Enterprise features
        npm i --save ag-grid-enterprise</snippet>

    <h3>Create Application</h3>

    <p>Our application will be a very simple one, consisting of a single file that will render a simple grid:</p>

    <snippet>
// main-community.js
import {Grid} from 'ag-grid-community';

// import if using any enterprise features
// import 'ag-grid-enterprise';

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

// lookup the container we want the Grid to use
var eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new Grid(eGridDiv, gridOptions);
    </snippet>

    <snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;link rel="stylesheet" href="./node_modules/ag-grid-community/dist/styles/ag-grid.css"&gt;
    &lt;link rel="stylesheet" href="./node_modules/ag-grid-community/dist/styles/ag-theme-balham.css"&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div id="myGrid" style="height: 200px;width:500px;" class="ag-theme-balham"&gt;&lt;/div&gt;

&lt;script src="./dist/community-bundle.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
    </snippet>

    <h2>Rollup Configuration</h2>

    <p>Our <code>rollup.community.json</code> is very simple in this example:</p>

<snippet>
const node = require('rollup-plugin-node-resolve');

export default <span ng-non-bindable>&#123;</span>
    input: './main-community.js',
    output: <span ng-non-bindable>&#123;</span>
        file: './dist/community-bundle.js',
        format: 'umd',
    },
    plugins: [
        node()
    ],
    onwarn: (msg, warn) => <span ng-non-bindable>&#123;</span>
        if (msg.code === 'THIS_IS_UNDEFINED') return;
        if (!/Circular/.test(msg)) <span ng-non-bindable>&#123;</span>
            warn(msg)
        }
    }
};
</snippet>

    <h2>
        Building our bundle
    </h2>
    <p>We can now build our bundle:</p>

<snippet language="sh">
rollup -c rollup.community.config.js
</snippet>

    <p>The resulting bundle will be available in <code>./dist/community-bundle.js</code></p>

    <p>If we now serve <code>index-community.html</code> our grid will be rendered as expected:</p>

    <img src="./bundled-grid.png" style="width: 50%" alt="Bundled Grid">
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
