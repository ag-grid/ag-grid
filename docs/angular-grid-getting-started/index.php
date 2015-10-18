<?php
$key = "Getting Started";
$pageTitle = "Getting Started";
$pageDescription = "Getting Started Angular JS 1";
$pageKeyboards = "Getting Started Angular JS 1";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started</h2>

    <h3>Referencing the ag-Grid Files</h3>

    <p>
        In your html include ag-Grid's files as follows:
    </p>

        <pre>&lt;!-- This is the javascript code for ag-Grid -->
&lt;script src="pathToGrid/ag-grid.js">&lt;/script>
&lt;!-- This is the core css required for ag-Grid, manages the layout -->
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/ag-grid.css">

&lt;!-- This is the styling (not core) part of the css, include the theme you want, or create your own theme instead -->
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/theme-fresh.css">
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/theme-dark.css">
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/theme-blue.css"></pre>

    <p>
        There are minified versions of the <i>.js</i> and <i>.css</i> files if you want to use them instead.
    </p>

    <p>
        ag-Grid has no dependencies, but will use supported frameworks if it finds them loaded.
    </p>

    <h3>Examples in AngularJS 1.x</h3>

    <p>
        Most of the examples in this documentation are given in AngularJS 1.x. This does not
        mean AngularJS 1.x is the only framework that can be used. As there is only one developer
        creating this project, time does not allow to give each example in each possible framework.
    </p>

    <p>
        AngularJS was chosen as it's where the project has it roots. The only item that is not supported
        outside of AngularJS is AngularJS compiling (which doesn't make sense in other frameworks anyway).
    </p>

    <h3>Loading in Examples</h3>

    <p>
        In all the examples in this online documentation, the resources are loaded with an additional parameter <i>"ignore=notused"</i>.
        <b>You do not need to include this extra parameter</b>. It's purpose is as a dummy parameter, which the documentation
        changes every time there is a grid release, to trick the browser in getting the latest version rather than using a cached version.
        <br/>
    </p>
    <p>
        So eg, the example has this:<br/>
        <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.css?ignore=notused14"><br/></pre>
        But all you need is this:<br/>
        <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.css"></pre>
    </p>

</div>

<?php include '../documentation_footer.php';?>
