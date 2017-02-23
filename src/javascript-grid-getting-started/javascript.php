<h2 ng-if="!isFramework('all')"><img style="vertical-align: middle" src="/images/javascript.png" height="25px"/> Overview</h2>

<h3>Download ag-Grid</h3>

<table>
    <tr>
        <td style="padding: 10px;"><img src="../images/bower.png"/></td>
        <td>
            <b>Bower</b><br/>
            bower install ag-grid
        </td>

        <td style="width: 20px;"/>

        <td style="padding: 10px;"><img src="../images/npm.png"/></td>
        <td>
            <b>NPM</b><br/>
            npm install ag-grid
        </td>

        <td style="width: 20px;"/>

        <td style="padding: 10px;"><img src="../images/github.png"/></td>
        <td>
            <b>Github</b><br/>
            Download from <a href="https://github.com/ceolter/ag-grid">Github</a>
        </td>
    </tr>
</table>

<h3>Referencing ag-Grid</h3>

<p>
    ag-Grid is distributed as both a self contained bundle (that places ag-Grid on the global scope)
    and also via a CommonJS package.
</p>

<p>Using the bundled version is the quickest way to get going - reference this version in your HTML file is all you need
    to do.</p>
<p>You also need to provide a block (a div is the most common) element for the Grid to use - assign it an ID which you
    can then use later
    when instantiating the Grid.</p>

<pre>
&lt;html&gt;
&lt;head&gt;
    &lt;script src="path-to-ag-grid-/ag-grid.js"&gt;&lt;/script&gt;
    &lt;script src="example1.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 100%;" class="ag-fresh"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>

<p>Here we've referenced the ag-Grid dependency in the <code>head</code> section, and specified a <code>div</code> with
    an ID of <code>myGrid</code>.</p>
<p>We've also specified the <a href="../http://localhost:8080/javascript-grid-themes/fresh-theme.php">Fresh Theme</a> -
    themes are we
    we can define the look and feel of the Grid. More on that later.
</p>
<p><code>example1.js</code> would be where your application code would live in this example.</p>


<h3>Creating the Grid</h3>

<p>Now that we have a <code>div</code> for the Grid, we need to specify the following at a minimum:</p>
<ul>
    <li>Columns</li>
    <li>Row Data</li>
</ul>

<p>So let's create a simply example with 3 columns and 3 rows of data:</p>
<pre>
<span class="codeComment">// specify the columns</span>
var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

<span class="codeComment">// specify the data</span>
var rowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
];

<span class="codeComment">// let the grid know which columns and what data to use</span>
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
};

<span class="codeComment">// wait for the document to be loaded, otherwise ag-Grid will not find the div in the document.</span>
document.addEventListener("DOMContentLoaded", function() {

    <span class="codeComment">// lookup the container we want the Grid to use</span>
    var eGridDiv = document.querySelector('#myGrid');

    <span class="codeComment">// create the grid passing in the div to use together with the columns & data we want to use</span>
    new agGrid.Grid(eGridDiv, gridOptions);
});
</pre>

<p>With that in place we have a quick and simple Grid up and running:</p>

<show-example exampleheight="130px" example="example-js"></show-example>

<h4>ag-Grid Bundle Types</h4>
<p>
    There are four bundle files in the distribution:
<ul>
    <li>dist/ag-grid.js -> standard bundle containing JavaScript and CSS</li>
    <li>dist/ag-grid.min.js -> minified bundle containing JavaScript and CSS</li>
    <li>dist/ag-grid.noStyle.js -> standard bundle containing JavaScript without CSS</li>
    <li>dist/ag-grid.min.noStyle.js -> minified bundle containing JavaScript without CSS</li>
</ul>
</p>

<h4>CommonJS</h4>

<p>
    To use CommonJS, it's best to download the packages via NPM and then either <i>require</i> (ECMA 5) or
    <i>import</i> (ECMA 6)
    them into your project.
</p>

<pre>// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid/main';
</pre>

<div class="collapsableDocs">
    <div class="collapsableDocs-header"
         onclick="javascript: this.classList.toggle('active');">
        <div style="padding: 5px;vertical-align: middle"><?php include '../enterprise.php'; ?>&nbsp;&nbsp;<strong>Installing
                ag-Grid-Enterprise</strong>
        </div>
        <i class="fa fa-arrow-right" aria-hidden="true"></i>
    </div>

    <div class="collapsableDocs-content">

        <h3>Download ag-Grid-Enterprise</h3>

        <table>
            <tr>
                <td style="padding: 10px;"><img src="../images/bower.png"/></td>
                <td>
                    <b>Bower</b><br/>
                    bower install ag-grid-enterprise
                </td>

                <td style="width: 20px;"/>

                <td style="padding: 10px;"><img src="../images/npm.png"/></td>
                <td>
                    <b>NPM</b><br/>
                    npm install ag-grid-enterprise
                </td>

                <td style="width: 20px;"/>

                <td style="padding: 10px;"><img src="../images/github.png"/></td>
                <td>
                    <b>Github</b><br/>
                    Download from <a href="https://github.com/ceolter/ag-grid-enterprise">Github</a>
                </td>
            </tr>
        </table>

        <h3>Referencing ag-Grid-Enterprise</h3>

        <p>
            ag-Grid-Enterprise is also distributed as both a self contained bundle and also via a CommonJS package.
        </p>

        <p>As with the ag-Grid example, all we need to do is reference the ag-grid-enterprise dependency and we're good
            to go:</p>
        <pre>
&lt;html&gt;
&lt;head&gt;
    &lt;script src="path-to-ag-grid-enterprise/ag-grid-enterprise.js"&gt;&lt;/script&gt;
    &lt;script src="example1.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 100%;" class="ag-fresh"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
        <note>
            <strong>Self Contained Bundles</strong>

            <p>Do <b>not</b> include both ag-Grid and ag-Grid-Enterprise self contained bundles. The ag-Grid-Enterprise
                contains ag-Grid.</p>
        </note>

        <p>The creation of the Grid would be the same as the ag-Grid example above.</p>

        <h4>ag-Grid Enterprise Bundle Types</h4>
        <p>
            Again similar to ag-Grid, ag-Grid-Enterprise has 4 bundles:
        <ul>
            <li>dist/ag-grid-enterprise.js -> standard bundle containing JavaScript and CSS</li>
            <li>dist/ag-grid-enterprise.min.js -> minified bundle containing JavaScript and CSS</li>
            <li>dist/ag-grid-enterprise.noStyle.js -> standard bundle containing JavaScript without CSS</li>
            <li>dist/ag-grid-enterprise.min.noStyle.js -> minified bundle containing JavaScript without CSS</li>
        </ul>
        </p>

        <p>Even if you are using React, AngularJS 1.x, Angular, VueJS or Web Components, the above is all you need
            to
            do.
            Any grid you create will be an enterprise grid once you load the library.</p>

        <h4>CommonJS</h4>
        <p>
            If using CommonJS, you one need to include ag-Grid-Enterprise into your project. You do not need to
            execute any code inside it. When ag-Grid-Enterprise loads, it will register with ag-Grid such that the
            enterprise features are available when you use ag-Grid.
        </p>

        <pre>// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');
// only include this line if you want to use ag-grid-enterprise
require('ag-grid-enterprise');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid/main';
// only include this line if you want to use ag-grid-enterprise
import 'ag-grid-enterprise/main';
</pre>
    </div>
</div>
