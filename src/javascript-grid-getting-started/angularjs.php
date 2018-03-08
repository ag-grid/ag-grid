<h2 id="implementing-the-angularjs-datagrid">
    <img src="../images/svg/docs/getting_started.svg" width="50"/>
    <img style="vertical-align: middle" src="/images/angularjs.png" height="25px"/>
    Getting Started
</h2>

<?php include 'ag-grid-dependency.php' ?>

<p>
    When the ag-Grid script loads, it does not register with AngularJS 1.x. This is because
    AngularJS 1.x is an optional part of ag-Grid and you need to tell ag-Grid you
    want to use it.
</p>

<h3 id="creating-the-angularjs-module">Creating the AngularJS 1.x Module</h3>
Include ag-Grid as a dependency of your module like this:
<p/>
<snippet>
    // if you're using ag-Grid-Enterprise, you'll need to provide the License Key before doing anything else
    // not necessary if you're just using ag-Grid
    agGrid.LicenseManager.setLicenseKey("your license key goes here");

    // get ag-Grid to create an Angular module and register the ag-Grid directive
    agGrid.initialiseAgGridWithAngular1(angular);

    // create your module with ag-Grid as a dependency
    var module = angular.module("example", ["agGrid"]);
</snippet>

<h4 id="ag-grid-div">ag-Grid Div</h4>

<p>
    To include a grid in your html, add the <i>ag-grid</i> attribute to a div. The value
    of the div should be the provided grid options on the scope.
</p>

<p>
    It is also usual to provide a styling theme to
    the grid. Five themes come with the grid, ag-theme-material, ag-theme-balham, ag-theme-fresh, ag-theme-dark and ag-theme-blue. Each one is
    set by applying the corresponding class of the same name to the div. In the
    example, ag-theme-balham is used.
</p>

<p>
    You must provide <b>width and height</b> to your grid. The grid is programmed to fill
    the width and height you give it.
</p>

<snippet>
    &lt;div &lt;b&gt;ag-grid="gridOptions" class="ag-theme-balham" style="height: 100%;"&lt;/b&gt;&gt;&lt;/div&gt;
</snippet>

<p>
    (note: a div by default has 100% width, so the width is not specified explicitly above).
</p>

<h4 id="grid-options">Grid Options</h4>
<p>
    The grid options provide ag-Grid with the details needed to render. At a
    minimum you should provide the columns (columnDefs) and the rows (rowData).
</p>

<h2 id="destroy">Destroy</h2>

<p>
    You do not need to manually clean up the grid. The grid ties in with the AngularJS 1.x lifecycle
    and releases all resources when the directive is destroyed.
</p>

