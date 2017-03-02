<?php
header("HTTP/1.1 301 Moved Permanently");
header("Location: https://www.ag-grid.com/javascript-grid-getting-started/?framework=all");
?>

<?php
/*$key = "Getting Started Javascript";
$pageTitle = "Javascript Datagrid";
$pageDescription = "How to set up the Best Javascript Datagrid. Shows how to use ag-Grid to build a Javascript grid using only Javascript and without using any framework";
$pageKeyboards = "Best Javascript Datagrid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
*/?><!--

<div>

    <h1 id="implementing-the-javascript-datagrid">Implementing the JavaScript Datagrid</h1>

    <p>
        When using no framework, you have the choice of using the bundled ag-Grid (which puts
        the ag-Grid library into the global scope of the browser) or using a package manager
        to access the CommonJS version of the grid.
    </p>
    <h3>Pull in the ag-Grid Dependencies</h3>
    <p>You'll need to ensure you refer to the ag-grid library correctly - this can be done in a number of ways, but
        but you'll need to ensure you refer to either the ag-grid or the ag-grid-enterprise
        dependency, depending on which feature set you're using (i.e. if you're using any Enterprise features you'll need ag-grid-enterprise)</p>
    <p>As an example we'll use NPM to manage our dependencies, and then refer to the dependencies in our HTML file:</p>
    <h5>Using ag-Grid</h5>
    <pre><span class="codeComment">// package.json</span>
"dependencies": {
    "ag-grid": "8.0.x",
}

<span class="codeComment">// index.html</span>
&lt;html>
&lt;head>
    &lt;script src="node_modules/ag-grid/dist/ag-grid.js">&lt;/script>
    &lt;script src="&lt;your script>.js">&lt;/script>
&lt;/head>
</pre>
    <h5>Using ag-Grid-Enterprise</h5>
    <pre><span class="codeComment">// package.json</span>
"dependencies": {
    "ag-grid-enterprise": "8.0.x",
}

<span class="codeComment">// index.html</span>
&lt;html>
&lt;head>
    &lt;script src="node_modules/ag-grid-enterprise/dist/ag-grid-enterprise.js">&lt;/script>
    &lt;script src="&lt;your script>.js">&lt;/script>
&lt;/head>
</pre>
    <p>In either of the above examples we're using the full JS dependency which includes styles & themes - you can optionally chose to use the version without styles included (<code>.noStyle.js</code>).
        If you do this, you'll need to refer to the styles & themes separately, as below:</p>
    <pre>
<span class="codeComment">// index.html</span>
&lt;html>
&lt;head>
    &lt;script src="node_modules/ag-grid/dist/ag-grid.js">&lt;/script>
    &lt;link href="node_modules/ag-grid/dist/styles/ag-grid.css" rel="stylesheet" />
    &lt;link href="node_modules/ag-grid/dist/styles/theme-fresh.css" rel="stylesheet" />
    &lt;script src="&lt;your script>.js">&lt;/script>
&lt;/head>
</pre>
    </p>

    <h3 id="using-bundled-ag-Grid-and-pure-javascript">Using Bundled ag-Grid and Pure Javascript</h3>

    <p>
        Reference the ag-Grid script from your
        web page and then access the library through global scope as follows:
    </p>

    <pre>// example creating a grid using raw Javascript
var eGridDiv = document.querySelector('#myGrid'); // get a reference to the grid div
new agGrid.Grid(eGridDiv, gridOptions); //create a new grid</pre>

    <p>
        Below is a simple example using standard Javascript.
    </p>

    <show-example example="example1"></show-example>

    <p>
        The below example is a more complex example demonstration much more interactivity and customisation.
        The mechanism for setting up the grid
        is the same as before. Don't worry about the finer details for now, how all the
        different options are configured is explained in the relevant parts of the documentation.
    </p>

    <show-example example="html5grid"></show-example>

    <h3 id="using-commonjs-and-pure-javascript">Using CommonJS and Pure Javascript</h3>

    <p>
        For an example of using the CommonJS and raw JavaScript version of ag-Grid, see
        the example <a href="https://github.com/ceolter/ag-grid-commonjs-example">CommonJS, Gulp and Browersify</a> on Github.
    </p>

    <h3 id="destroy">Destroy</h3>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

    <h3 id="next-steps">Next Steps...</h3>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>
</div>


--><?php /*include '../documentation-main/documentation_footer.php';*/?>