<?php
$pageTitle = "ag-Grid Reference: ag-Grid Modules - Building Examples";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page explains how to ag-grid modules";
$pageKeyboards = "ag-Grid JavaScript Data Grid Modules";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>ag-Grid Building Applications With ag-Grid Modules</h1>

<p class="lead">
    In this section we describe how you can cherry pick modules to provide the features you need with a reduced
    application
    bundle size.
</p>

<h2>Introduction</h2>

<p>
    In order to use selective ag-Grid modules within your application you need to do two things:
</p>

<ul>
    <li>Specify the modules you require as dependencies</li>
    <li>Register the modules you require with the Grid</li>
</ul>

<p>That's it! In the sections below we expand on these points with examples</p>

<note>This page assume that you want to selective choose modules and do not require all Grid functionality. If you
require all Grid features (either Community or Enterprise) then you might be better off using <code>ag-grid-community</code>
or <code>ag-grid-enterprise</code> and follow the steps documented in the <a
            href="../javascript-grid-getting-started/">Getting Started Guides</a> as doing so will require less effort on your part.</note>
<h3>Choosing Modules</h3>

<p>Please refer to the complete list of modules <a href="../javascript-grid-modules/#modules">here</a>.</p>

<p>For our purposes we're going to assume that the application we're building requires the following features:</p>

<ul>
    <li>Client Side Row Model</li>
    <li>Excel Export</li>
    <li>Context Menu</li>
</ul>

<p>Recall from earlier <a href="../javascript-grid-modules/#providing-modules-to-individual-grids">documentation</a> that
at a minimum you need to provide a <a href="../javascript-grid-row-models/">Row Model</a> to the Grid and in our case we've
opted for the Client Side Row Model.</p>

<p>Additionally we're going to provide <a href="../javascript-grid-excel/">Excel Export</a> functionality, so we're going to need
the corresponding Excel Module.</p>

<p>Finally, we'd like our users to be able to export the data using the <a href="../javascript-grid-context-menu/">Context Menu</a>,
so we'll include that module too.</p>

<p>This is what our <code>package.json</code> file will look like based on the requirements above:</p>

<snippet>
"dependencies": {
    "@ag-grid-community/client-side-row-model": "~22.0.0",
    "@ag-grid-enterprise/excel-export": "~22.0.0",
    "@ag-grid-enterprise/menu": "~22.0.0"

    ...other dependencies...
}
</snippet>

<h3>Registering Modules</h3>

<p>Now that these modules are available to us we need to import them within our application, and then register them with the Grid:</p>

<snippet>
import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {ExcelExportModule} from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule]);
</snippet>

<note>You do not need to register framework modules (ie. <code>@ag-grid-community/angular</code>, <code>@ag-grid-community/react</code> etc).</note>

<p>And that's all that's required. Below are examples using using the above configuration across various frameworks.</p>

<p>We don't list plain JavaScript here as the assumption is that if using JavaScript you'll most likely be using the
    provided UMD bundles. If you'd like to create a custom UMD bundle please see the section following the examples on
    how to do so.</p>

<?= example('Using Modules', 'module-grid', 'multi', array("enterprise" => 1, "showResult" => false)) ?>
<?//= example('Using Modules', 'module-grid', 'multi', array("exampleHeight" => 170)) ?>

<note>Full working examples of this can be found on <a
            href="https://github.com/seanlandsman/ag-grid-module-bundling">Github</a>.</note>

<h2>Building Your Own UMD Bundle</h2>

<p><code>ag-grid-community</code> and <code>ag-grid-enterprise</code> provide UMD bundles with their distribution for ease of use,
and these are great for getting started and making use of all features with very little effort.</p>

<p>If however you do not need all the features provided by either package (Community or Enterprise) then it's possible to create
your own UMD bundle - the rest of this section describes how this can be done.</p>

<p>As with the sections above we're going to assume that we only require the following modules in our bundle:</p>

<ul>
    <li>Client Side Row Model</li>
    <li>Excel Export</li>
    <li>Context Menu</li>
</ul>

<h3>Specify Our Dependencies</h3>

<p>This is what our <code>package.json</code> file will look like based on the requirements above:</p>

<snippet>
"dependencies": {
    "@ag-grid-community/client-side-row-model": "~22.0.0",
    "@ag-grid-enterprise/excel-export": "~22.0.0",
    "@ag-grid-enterprise/menu": "~22.0.0"

    ...other dependencies...
}
</snippet>

<h3>Specify What Include in the Bundle</h3>

<p>Next we need to include the modules in the bundle we're going to create. We also need to ensure we include
the relevant <code>core</code> packages - in our case we need both <code>@ag-grid-community/core</code> and
<code>@ag-grid-enterprise/core</code> as we're using both Community and Enterprise features. If you were only
using the Community bundle you could omit the <code>@ag-grid-enterprise/core</code> entry here.</p>

<p>Additionally we can include the theme(s) we want to include in our bundle - for our example we're going to specify
the Balham theme.</p>

<p>Let's create a file called <code>main.js</code> that will serve as our entry point:</p>

<snippet>
export * from "@ag-grid-community/core";
export * from '@ag-grid-enterprise/core';
export * from '@ag-grid-community/client-side-row-model';
export * from '@ag-grid-enterprise/menu';
export * from '@ag-grid-enterprise/excel-export';

import {ModuleRegistry} from "@ag-grid-community/core";
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {ExcelExportModule} from '@ag-grid-enterprise/excel-export';

ModuleRegistry.register(ClientSideRowModelModule);
ModuleRegistry.register(MenuModule);
ModuleRegistry.register(ExcelExportModule);

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";
</snippet>

<p>Note that we've included the Module Registration step here - we do this so that consumers of our UMD bundle won't have to.
This is a convenience step but is recommended for UMD bundles.</p>

<p>Next we'll create a Webpack configuration file:</p>

<snippet>
module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, "../src/main.js"),
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: 'bundle.umd.js',
        library: ["agGrid"],
        libraryTarget: "umd"
    }
</snippet>

<p>There are two main items here:</p>

<ul>
<li><code>entry</code>: We specify the <code>main.js</code> entry file we created that will determine what to include in our bundle.</li>
<li><code>output</code>: We specify a library name of <code>agGrid</code> as the property to export when the bundle is included - this can however be any name you choose.</li>
</ul>
    
<p>You can then build your bundle as follows:</p>
    
<snippet>webpack --config config/webpack.prod.js</snippet>
    
<p>Which will result in a file called <code>dist/bundle.umd.js</code> being created, which we can then use as follows:</p>
    
<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;script src="./dist/bundle.umd.js"&gt;&lt;/script&gt;

    &lt;script&gt;
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

        // setup the grid after the page has finished loading
        document.addEventListener('DOMContentLoaded', function () {
            var gridDiv = document.querySelector('#myGrid');
            new agGrid.Grid(gridDiv, gridOptions);
        });
    &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-balham"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</snippet>

<note>Full working examples of this can be found on <a
            href="https://github.com/seanlandsman/ag-grid-module-bundling">Github</a>.</note>
<?php include '../documentation-main/documentation_footer.php'; ?>
