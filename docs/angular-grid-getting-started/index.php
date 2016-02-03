<?php
$key = "Getting Started";
$pageTitle = "Getting Started";
$pageDescription = "Getting Started Angular JS 1";
$pageKeyboards = "Getting Started Angular JS 1";
include '../documentation_header.php';
?>

<div>

    <h2>Download & Install</h2>

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

    <h3>Referencing ag-Grid Files</h3>

    <p>
        If you are not using a packaging tool to bundle, you need to include the JavaScript and CSS files
        for ag-Grid as follows:
    </p>

        <pre>&lt;!-- This is the javascript code for ag-Grid -->
&lt;script src="pathToGrid/ag-grid.js">&lt;/script>
&lt;!-- This is the core css required for ag-Grid, manages the layout -->
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/ag-grid.css">

&lt;!-- This is the styling (not core) part of the css, include the theme you want, or create your own theme instead -->
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/theme-fresh.css">
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/theme-dark.css">
&lt;link rel="stylesheet" type="text/css" href="pathToGrid/theme-blue.css"></pre>

    <h4>Online Examples</h4>
    <p>
        Almost all the examples in this online documentation use this simple way of loading ag-Grid and do not use a
        framework like React or AngularJS. This is to make the examples as easy to follow (focusing only on what the example
        is about) and easy to copy and run locally.
    </p>

    <p>
        Also in the examples, ag-Grid is loaded with an additional parameter <i>"ignore=notused"</i>.
        <b>You do not need to include this extra parameter</b>. It's purpose is as a dummy parameter, which the documentation
        changes every time there is a grid release, to trick the browser in getting the latest version rather than using a cached version.
        <br/>
    </p>
    <p>
        So eg, the example has this:<br/>
    <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.css?ignore=notused17"><br/></pre>
    But all you need is this:<br/>
    <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.css"></pre>
    </p>

    <h2>List of Loading / Building Examples</h2>

    <p>It is not really possible for me to give an example of every combination of build tool, module loading
    mechanism and framework. There are smple to many combinations. Instead I've tried to demonstrate at least
    one example of each in one combination. Here is a list of all the examples demonstrating different ways
    of building.</p>
    <ul>
        <li><a href="https://github.com/ceolter/ag-grid-commonjs-example">NPM, Gulp and Browersify</a> - Project on Github</li>
        <li><a href="https://github.com/ceolter/ag-grid-react-example">NPM, React, Webpack, Babel</a> - Project on Github</li>
        <li><a href="https://github.com/helix46/ag-grid-angular2-beta-ts">JSPM, Angular 2, Typescript</a> - Project on Github</li>
    </ul>

    <h2>Choosing a Framework and What Next</h2>

    <p>
        ag-Grid does not favor any framework. It's agnostic. It doesn't give a rats arse what framework you use. ag-Grid supports
        5 flavours: React, AngularJS, Angular 2, Web Components and Native Javascript. Every ag-Grid
        feature is fully available in each framework, there is no bias. You choose which framework you
        want. So continue now to the section on the framework you are interested in to continue, then jump to the
        details of how to use the grid.
    </p>

    <h2>
        The ag-Grid License
    </h2>

    <p class="license">
        The MIT License (MIT)
    </p>

    <p class="license">
        Copyright (c) 2015 Niall Crosby
    </p>

    <p class="license">
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
    </p>

    <p class="license">
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
    </p>

    <p class="license">
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE.
    </p>

</div>

<?php include '../documentation_footer.php';?>
