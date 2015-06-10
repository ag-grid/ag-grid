<?php
$key = "Getting Started";
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid Angular Compiling";
$pageKeyboards = "Angular Grid Angular Compiling";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started</h2>

    <h3>Dependencies</h3>

    <p>
        In your html, include AngularJS (1.2 or later) and AngularGrid.
    </p>

    <p>
        If you want non-minified versions, you need to include: angular-grid.js, angular-grid.css, theme-fresh.css
        (optional if you want bundled fresh theme) and theme-dark.css (optional if you want bundled dark theme).
    </p>
    <p>
        If you want minified versions, download the equivalent '.min' files of the same names.
    </p>

    <p>
        AngularGrid has no other dependencies except AngularJS.
    </p>

    <h4>Creating the Angular Module</h4>
    While creating your Angular module, include AngularGrid as a dependency of your module. Eg:
    <p/>
    <pre><code>var module = angular.module("example", <b>["angularGrid"]</b>);</code></pre>

    <h4>Angular Grid Div</h4>

    <p>
        To include a grid in your html, add the AngularGrid attribute to a div. The value
        of the div should be the provided grid options on the scope.
    </p>

    <p>
        It is also usual (although not necessary) to provide a styling theme to
        the grid. Two themes come with the grid, ag-fresh and ag-dark. Each one is
        set by applying the corresponding class of the same name to the div. In the
        example, ag-fresh is used.
    </p>

    <h4>Grid Options</h4>
    <p>
        The grid options provide AngularGrid with the details needed to render. At a
        minimum you provide the columns (columnDefs) and the rows (rowData).
    </p>

    <pre>&lt;div <b>ag-grid="gridOptions" class="ag-fresh"</b>>&lt;/div></pre>

    <h4>Very Simple Example</h4>
    <show-example example="example1" example-height="200px"></show-example>

    <h2>Loading Rows</h2>

    <h4>Calling onNewRows()</h4>

    If rows are loaded after the grid is initialised, call the grid's API function to update the rows after the load.

    <pre><code>$scope.gridOptions.api.onNewRows()</code></pre>

    <p/>

    The API is explained in full in it's own section.

    <p/>

    <show-example example="example2"></show-example>


    <h2>Width and Height</h2>

    <h4>Fixed Width and Height</h4>

    Set the width and height of the table by applying CSS to the containing div. Eg:

    <p/>

    <pre><code>style="width: 100px; height: 100px;"</code></pre>

    <h4>Percent Width and Height</h4>

    The width and / or height can also be set to a percentage. Eg:

    <pre><code>style="width: 100%; height: 100%;"</code></pre>

    <h4>Changing Width and Height</h4>

    If the width and / or height change after the grid is initialised, the grid will
    automatically resize to fill the new area.

    <show-example example="example3"></show-example>

</div>

<?php include '../documentation_footer.php';?>
