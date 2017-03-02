<?php
header("HTTP/1.1 301 Moved Permanently");
header("Location: https://www.ag-grid.com/javascript-grid-getting-started/?framework=angularjs");
?>


<?php
/*$key = "Getting Started ng1";
$pageTitle = "AngularJS 1.x Datagrid";
$pageDescription = "Shows an example of the best Javascript Datagrid. Explains how to set up the Best AngularJS 1.x Grid grid, ag-Grid, inside your browser.";
$pageKeyboards = "Best AngularJS 1.x Grid Datagrid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
*/?><!--

<div>

    <h1 id="implementing-the-angularjs-datagrid">Implementing the AngularJS 1.x Datagrid</h1>

    <p>
        When using AngularJS 1.x, you have the choice of using the bundled version of ag-Grid
        or the CommonJS version.
    </p>
    <p>
        When the ag-Grid script loads, it does not register with AngularJS 1.x. This is because
        AngularJS 1.x is an optional part of ag-Grid and you need to tell ag-Grid you
        want to use it.
    </p>

    <h3 id="pull-in-the-ag-grid-dependencies">Pull in the ag-Grid Dependencies</h3>
    <p>You'll need to ensure you refer to the ag-grid library correctly - this can be done in a number of ways, but
        but you'll need to ensure you refer to either the ag-grid or the ag-grid-enterprise
    dependency, depending on which feature set you're using (i.e. if you're using any Enterprise features you'll need ag-grid-enterprise)</p>
    <p>As an example we'll use NPM to manage our dependencies, and then refer to the dependencies in our HTML file:</p>
    <h5 id="using-ag-grid">Using ag-Grid</h5>
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
    <h5 id="using-ag-grid-enterprise">Using ag-Grid-Enterprise</h5>
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
    &lt;script src="node_modules/ag-grid/dist/styles/ag-grid.css">&lt;/script>
    &lt;script src="node_modules/ag-grid/dist/styles/theme-fresh.css">&lt;/script>
    &lt;script src="&lt;your script>.js">&lt;/script>
&lt;/head>
</pre>
</p>
    <h3 id="creating-the-angularjs-module">Creating the AngularJS 1.x Module</h3>
    Include ag-Grid as a dependency of your module like this:
    <p/>
    <pre>
<span class="codeComment">// if you're using ag-Grid-Enterprise, you'll need to provide the License Key before doing anything else</span>
<span class="codeComment">// not necessary if you're just using ag-Grid</span>
agGrid.LicenseManager.setLicenseKey("your license key goes here");

<span class="codeComment">// get ag-Grid to create an Angular module and register the ag-Grid directive</span>
agGrid.initialiseAgGridWithAngular1(angular);

<span class="codeComment">// create your module with ag-Grid as a dependency</span>
var module = angular.module("example", ["agGrid"]);</code></pre>

    <h4 id="ag-grid-div">ag-Grid Div</h4>

    <p>
        To include a grid in your html, add the <i>ag-grid</i> attribute to a div. The value
        of the div should be the provided grid options on the scope.
    </p>

    <p>
        It is also usual to provide a styling theme to
        the grid. Three themes come with the grid, ag-fresh, ag-dark and ag-blue. Each one is
        set by applying the corresponding class of the same name to the div. In the
        example, ag-fresh is used.
    </p>

    <p>
        You must provide <b>width and height</b> to your grid. The grid is programmed to fill
        the width and height you give it.
    </p>

    <pre>&lt;div <b>ag-grid="gridOptions" class="ag-fresh" style="height: 100%;"</b>>&lt;/div></pre>

    <p>
        (note: a div by default has 100% width, so the width is not specified explicitly above).
    </p>

    <h4 id="grid-options">Grid Options</h4>
    <p>
        The grid options provide ag-Grid with the details needed to render. At a
        minimum you should provide the columns (columnDefs) and the rows (rowData).
    </p>

    <h2 id="basic-angularjs-1-x-example">Basic AngularJS 1.x Example</h2>
    <show-example example="example1" example-height="200px"></show-example>

    <h2 id="advanced-angularjs-1-x-example">Advanced AngularJS 1.x Example</h2>

    <p>
        The below example has much more details. The mechanism for setting up the grid
        is the same as above. Don't worry about the finer details for now, how all the
        different options are configured is explained in the relevant parts of the documentation.
    </p>

    <show-example example="basic"></show-example>

    <h2 id="angular-compiling">Angular Compiling</h2>

    <p>
        Angular 1.x is great. It allows us to build large end-to-end single page web apps with relative ease.
        However the author of ag-Grid is of the opinion that not everything should be
        built in Angular. Angular 1.x does come with a disadvantage, it can slow things down.
        ag-Grid does not use Angular 1.x (or any other framework) underneath the hood, it is all
        blazing fast raw Javascript.
    </p>
    <p>
        But maybe you are not worried about performance. Maybe you are not displaying
        that many rows and columns. And maybe you want to provide your own cell renderers
        and use Angular here. For whatever reason, it is possible to turn Angular on for
        Angular version 1.x.
    </p>
    <p>
        When Angular is turned on in ag-Grid, every time a row is inserted, a new child
        Angular Scope is created for that row. This scope gets the row attached to it
        so it's available to any Angular logic inside the cell.
    </p>
    <p>
        Each cell within the row does not get a new child scope. So if placing item inside the
        child scope for the row, be aware that it is shared across all cells for that row.
        If you want a cell to have it's own private scope, consider using a directive
        for the renderer that will introduce a new scope.
    </p>

    <h4 id="turn-on-angular-compile">Turn On Angular Compile</h4>
    <p>
        Angular compiling is turned on by setting the grid options attribute angularCompileRows to true.
    </p>

    <ul>
        <li><b>angularCompileRows:</b> Whether to compile the rows for Angular.</li>
        <li><b>angularCompileFilters:</b> Whether to compile provided custom filters.</li>
        <li><b>angularCompileHeaders:</b> Whether to compile the customer headers for AngularJS 1.x.</li>
    </ul>

    <p>The default is always to have Angular compiling off for performance reasons.</p>

    <h4 id="example-using-angular-compile">Example using Angular Compile</h4>

    <p>
        Below then uses three columns rendered using custom Angular renderers.
    </p>
    <ul>
        <li><b>Athlete:</b> Uses simple binding to display text.</li>
        <li><b>Age:</b> Uses simple binding to display a button, with a button click event using ng-click.</li>
        <li><b>Country:</b> Uses a custom Angular directive to display the country.</li>
    </ul>

    <show-example example="exampleAngularCompiling"></show-example>

    <note>
        When scrolling the example above up and down, the cells rendered using Angular are blank
        initially, and filled in during the next Angular digest cycle. This behaviour the author
        has observed in other Angular grid implementations. This is another reason why the author
        prefers non-Angular rendering for large grids.
    </note>

    <h2 id="cell-templates">Cell Templates</h2>

    <p>
        Cell Templates allow you to specify templates to use to render your cells. This is handy
        if you want to put JavaScript markup with AngularJS 1.x bindings as the cells.
        Cell templates are specified in the column definition by providing a template as a
        string or a templateUrl to load the template from the server.
    </p>

    <p>
        If using templateUrl, then the html is cached. The server is only hit once per template and
        it is reused.
    </p>

    <p>
        The example below uses cell templates for the first three columns.
    <ul>
        <li><b>Col 1 - </b> The first column uses a static template. Pretty pointless as you can't change
            the content between rows.
        </li>
        <li><b>Col 2 - </b> The second column uses an inline template. AngularJS 1.x is then used to fetch
            the content from the scope via ng-bind.
        </li>
        <li><b>Col 3 - </b> The third column is similar to the second, with the difference that it loads
            the template from the server.
        </li>
    </ul>
    </p>

    <note>
        In the example, as you scroll up and down, the redraw on the AngularJS 1.x columns has a lag.
        This is waiting for the AngularJS 1.x digest cycle to kick in to populate the values into these rows.
    </note>

    <show-example example="exampleCellTemplates"></show-example>


    <h2 id="destroy">Destroy</h2>

    <p>
        You do not need to manually clean up the grid. The grid ties in with the AngularJS 1.x lifecycle
        and releases all resources when the directive is destroyed.
    </p>

    <h2 id="next-steps">Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

--><?php /*include '../documentation-main/documentation_footer.php';*/?>
