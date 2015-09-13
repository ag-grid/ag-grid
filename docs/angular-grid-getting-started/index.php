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
        In your html include Angular Grid's resources as follows:
    </p>

        <pre>&lt;script src="../dist/angular-grid.js">&lt;/script>
&lt;link rel="stylesheet" type="text/css" href="../dist/angular-grid.css">
&lt;link rel="stylesheet" type="text/css" href="../dist/theme-fresh.css"></pre>

    <p>
        If you want non-minified versions, you need to include: angular-grid.js, angular-grid.css, theme-fresh.css
        (optional if you want bundled fresh theme) and theme-dark.css (optional if you want bundled dark theme).
    </p>
    <p>
        If you want minified versions, download the equivalent '.min' files of the same names.
    </p>

    <p>
        AngularGrid has no dependencies. If you are using AngularJS, then it will register as a directive
        with AngularJS, however that is optional, it is an optional dependency.
    </p>

    <note>
        In all he examples in this online documentation, the resources are loaded with an additional parameter <i>"ignore=notused"</i>.
        <b>You do not need to include this extra parameter</b>. It's purpose is as a dummy parameter, which the documentation
        changes every time there is a grid release, to trick the browser in getting the latest version rather than using a cached version.
        <br/>
        So eg, the example has this:<br/>
        <i>&lt;link rel="stylesheet" type="text/css" href="../dist/angular-grid.css?ignore=notused8"><br/></i>
        But all you need is this:<br/>
        <i>&lt;link rel="stylesheet" type="text/css" href="../dist/angular-grid.css"></i>
    </note>

    <h4>Creating the AngularJS Module</h4>
    If using AngularJS, while creating your AngularJS module, include Angular Grid as a dependency of your module. Eg:
    <p/>
    <pre><code>var module = angular.module("example", <b>["angularGrid"]</b>);</code></pre>

    <h4>Angular Grid Div</h4>

    <p>
        To include a grid in your html, add the Angular Grid attribute to a div. The value
        of the div should be the provided grid options on the scope.
    </p>

    <p>
        It is also usual (although not necessary) to provide a styling theme to
        the grid. Two themes come with the grid, ag-fresh and ag-dark. Each one is
        set by applying the corresponding class of the same name to the div. In the
        example, ag-fresh is used.
    </p>

    <p>
        You must provide <b>width and height</b> to your grid. The grid is programmed to fill
        the width and height you give it.
    </p>

    <pre>&lt;div <b>ag-grid="gridOptions" class="ag-fresh" style="height 100%"</b>>&lt;/div></pre>

    <p>
        (note: a div by default has 100% width, so the width is not specified explicitly above).
    </p>

    <h4>Grid Options</h4>
    <p>
        The grid options provide AngularGrid with the details needed to render. At a
        minimum you provide the columns (columnDefs) and the rows (rowData).
    </p>

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
