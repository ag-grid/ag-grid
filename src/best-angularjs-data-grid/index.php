<?php
$key = "Getting Started ng1";
$pageTitle = "AngularJS 1.x Datagrid";
$pageDescription = "A feature rich datagrid designed for Enterprise. Easily integrate with Angular 1.x to deliver filtering, grouping, aggregation, pivoting and much more.";
$pageKeyboards = "Best AngularJS 1.x Grid Datagrid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h2 id="implementing-the-angularjs-datagrid">
        <img src="../images/svg/docs/getting_started.svg" width="50" />
        <img style="vertical-align: middle" src="/images/angularjs.png" height="25px"/>
        Getting Started
    </h2>

<?php include '../javascript-grid-getting-started/ag-grid-dependency.php' ?>

<p>
    When the ag-Grid script loads, it does not register with AngularJS 1.x. This is because
    AngularJS 1.x is an optional part of ag-Grid and you need to tell ag-Grid you
    want to use it.
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
<show-example example="example-ajs" example-height="200px"></show-example>


<h2 id="destroy">Destroy</h2>

<p>
    You do not need to manually clean up the grid. The grid ties in with the AngularJS 1.x lifecycle
    and releases all resources when the directive is destroyed.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
