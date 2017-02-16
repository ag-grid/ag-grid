<?php
$key = "Getting Started";
$pageTitle = "Getting Started";
$pageDescription = "Getting Started Angular JS 1";
$pageKeyboards = "Getting Started Angular JS 1";
include '../documentation-main/documentation_header.php';
?>
<!--include '../documentation-main/documentation_header.php';-->
<div>

    <h2>Getting Started</h2>

    <h3>Download ag-Grid Project</h3>

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
        ag-Grid is distributed as both a self contained bundle (that places ag-Grid on the global scope)
        and also via a CommonJS package.
    </p>

    <h4>Self Contained Bundle</h4>

    <p>Using the bundled version is the quickest way to get going, you just put the reference into your
        HTML page and it works.</p>

        <pre>&lt;script src="pathToGrid/ag-grid.js">&lt;/script></pre>

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
        To use CommonJS, it's best to download the packages via NPM and then either <i>require</i> (ECMA 5) or <i>import</i> (ECMA 6)
        them into your project.
    </p>

    <pre>// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid/main';
</pre>

    <p>Most single page web-apps use CommonJS and Bundling, so will use the CommonJS version of ag-Grid.</p>

    <h2>Getting ag-Grid-Enterprise</h2>

    <h3>Download ag-Grid-Enterprise Project</h3>

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

    <h3>Referencing ag-Grid-Enterprise Files</h3>

    <p>
        ag-Grid-Enterprise is also distributed as both a self contained bundle and also via a CommonJS package.
    </p>

    <h4>Self Contained Bundle</h4>

    <p>Do <b>not</b> include both ag-Grid and ag-Grid-Enterprise self contained bundles. The ag-Grid-Enterprise
    contains ag-Grid (that's the nature of Webpack bundles, they have no external dependencies).</p>

    <p>
        Reference the ag-Grid-Enterprise bundle as follows:
    </p>

    <pre>&lt;script src="pathToGrid/ag-grid-enterprise.js">&lt;/script></pre>

    <p>
        Again similar to ag-Grid, ag-Grid-Enterprise has 4 bundles:
    <ul>
        <li>dist/ag-grid-enterprise.js -> standard bundle containing JavaScript and CSS</li>
        <li>dist/ag-grid-enterprise.min.js -> minified bundle containing JavaScript and CSS</li>
        <li>dist/ag-grid-enterprise.noStyle.js -> standard bundle containing JavaScript without CSS</li>
        <li>dist/ag-grid-enterprise.min.noStyle.js -> minified bundle containing JavaScript without CSS</li>
    </ul>
    </p>

    <p>Even if you are using React, AngularJS, Angular, VueJS or Web Components, the above is all you need to do.
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

    <h2>Additional Framework Projects</h2>

    <p>If using React or Angular, you will also need to reference the additional ag-Grid project for that
    framework. Details are provided the documentation for those frameworks.</p>

    <h4>Bundled vs CommonJS & Frameworks Summary</h4>

    <p>
        If you want to use the Angular or React component of ag-Grid, then you have to
        use the commonjs distribution (not the bundled). You will also need to include
        the additional ag-Grid project for these components.
    </p>

    <p>
        If you are using the plain Javascript, Angular 1 or Web Components version
        of ag-Grid, you can use the bundled version or the commonjs version.
    </p>

    <p>
        The table below summarises these details.
    </p>

    <style>
        .blog-main td {
            padding: 2px 10px 2px 10px;
        }
        .blog-main th {
            padding: 2px 10px 2px 10px;
        }
        .blog-main table {
            margin-bottom: 10px;
        }
    </style>

    <table style="background-color: beige">
        <tr style="background-color: blanchedalmond">
            <th>Framework</th>
            <th>Works with Bundled</th>
            <th>Works with CommonJS</th>
            <th>Extra Project</th>
        </tr>
        <tr>
            <td>Pure JavaScript</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>-</td>
        </tr>
        <tr>
            <td>React</td>
            <td>No</td>
            <td>Yes</td>
            <td>ag-grid-react</td>
        </tr>
        <tr>
            <td>Angular 1</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Angular</td>
            <td>No</td>
            <td>Yes</td>
            <td>ag-grid-ng2</td>
        </tr>
        <tr>
            <td>VueJS</td>
            <td>No</td>
            <td>Yes</td>
            <td>ag-grid-vue</td>
        </tr>
        <tr>
            <td>Web Components</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>-</td>
        </tr>
    </table>

    <p>
        <b>Warning:</b> if you are using the bundled version of the grid (/dist/ag-grid-js) then you must specify this directly,
        the main files specified in package.json and bower.json point to the commonjs versions of ag-Grid.
    </p>

    <h3>List of Loading / Building Examples</h3>

    <p>
        Below is a list of the examples demonstrating the different build tools, loading mechanisms and frameworks.
        You may not see the exact stack you want, but you can grab information from all the examples. Eg you might
        want to program React and Typescript, below you can see examples of React and Typescript, just not together.
    </p>
    <ul>
        <li><a href="https://github.com/ceolter/ag-grid-commonjs-example">CommonJS, Gulp and Browersify</a> - Project on Github</li>
        <li><a href="https://github.com/ceolter/ag-grid-react-example">React, Webpack, Babel</a> - Project on Github</li>
        <li><a href="https://github.com/ceolter/ag-grid-ng2-example">Angular & Typescript - with examples using SystemJS, Webpack and Angular-CLI</a> - Project on Github</li>
    </ul>

    <h3>Documentation Examples</h3>
    <p>
        Almost all the examples in the online documentation use the self contained bundle of ag-Grid and do not use
        any framework. This is to make the examples as easy to follow (focusing only on what the example
        is about) and easy to copy and run locally.
    </p>

    <p>
        Also in the examples, ag-Grid is loaded with an additional parameter <i>"ignore=notused"</i>. If you are using
        the self contained bundle <b>you do not need to include this extra parameter</b>. It's purpose is as a dummy parameter, which the documentation
        changes every time there is a grid release, to trick the browser in getting the latest version rather than using a cached version.
        <br/>
    </p>
    <p>
        So eg, the example has this:<br/>
    <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid/ag-grid.js?ignore=notused40"><br/></pre>
    But all you need is this:<br/>
    <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.js"></pre>
    </p>

    <h3>Choosing a Framework and What Next</h3>

    <p>
        ag-Grid does not favor any framework. It's agnostic. It doesn't have a preference what framework you use. ag-Grid supports
        5 flavours: React, AngularJS, Angular, VueJS, Web Components and Native Javascript. Every ag-Grid
        feature is fully available in each framework, there is no bias. You choose which framework you
        want. So continue now to the section on the framework you are interested in, then jump to the
        details of how to use the grid.
    </p>

    <h2>Browser Support/Compatibility</h2>

    <p>ag-Grid is compatible with IE 9+, Firefox, Chrome and Safari.</p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
