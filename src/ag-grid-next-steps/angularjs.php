<?php if (!isFrameworkAll()) { ?>
    <h2 id="nextsteps-the-angularjs-datagrid"><img style="vertical-align: middle" src="/images/angularjs.png" height="25px"/> Next Steps</h2>
<?php } ?>


<h2 id="advanced-angularjs-1-x-example">Advanced AngularJS 1.x Example</h2>

<p>
    The below example has much more details. The mechanism for setting up the grid
    is the same as above. Don't worry about the finer details for now, how all the
    different options are configured is explained in the relevant parts of the documentation.
</p>

<show-example example="basic-ajs"></show-example>

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
    If you want a cell to have its own private scope, consider using a directive
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

<show-example example="exampleAngularCompiling-ajs"></show-example>

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

<show-example example="exampleCellTemplates-ajs"></show-example>

<?php include '../javascript-grid-getting-started/ag-grid-bundletypes.php' ?>

<?php include '../javascript-grid-getting-started/ag-grid-commonjs.php' ?>

<?php include '../javascript-grid-getting-started/ag-grid-enterprise-dependency.php' ?>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>

