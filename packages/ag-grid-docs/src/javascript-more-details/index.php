<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - More Details";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise and setting up the correct modules for use.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>JavaScript Grid</h1>

    <h2>Download ag-Grid</h2>

    <p>ag-Grid is distributed as both a self contained bundle and also via a JavaScript module package.</p>

    <p>You can reference the ag-Grid library directly via a CDN (for example, <a href="https://unpkg.com/ag-grid">unpkg</a> or <a href="https://cdnjs.com/libraries/ag-grid">cloudflare</a>):</p>

<snippet language="html">
&lt;script src="_url_to_your_chosen_cdn_/ag-grid.js"&gt;&lt;/script&gt;
</snippet>

    <p>You can also download the library in the following ways:</p>

    <table class="content">
        <tr>


            <td style="padding: 10px;"><img src="../images/npm.png" alt="NPM install ag-Grid" /></td>
            <td>
                <b>NPM</b><br/>
                <code>npm install ag-grid-community</code>
            </td>

            <td style="width: 20px;">&nbsp;</td>

            <td style="padding: 10px;"><img src="../images/github.png" alt="Github install ag-Gridinstall ag-Grid" /></td>
            <td>
                <b>Github</b><br/>
                Download from <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid">Github</a>
            </td>

            <td style="width: 20px;">&nbsp;</td>

            <td style="padding: 10px;"><img src="../images/bower.png" alt="Bower install ag-Grid" /></td>
            <td>
                <b>Bower</b><br/>
                <code>bower install ag-grid-community</code>
            </td>
        </tr>
    </table>

    <p>You could then reference the ag-Grid library in a similar way to the CDN method above, but from a local
        filesystem:</p>

<snippet language="html">
&lt;script src="node_modules/ag-grid/dist/ag-grid.js"&gt;&lt;/script&gt;
</snippet>

    <p>Here we're illustrating how you can reference the ag-Grid library when using npm, but the same principle would
        apply when using bower.</p>

    <h3>ag-Grid Bundle Types</h3>
    <p>
        There are four bundle files in the distribution:
</p>
    <ul class="content">
        <li><code>dist/ag-grid.js</code> &mdash; standard bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid.min.js</code> &mdash; minified bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid.noStyle.js</code> &mdash; standard bundle containing JavaScript without CSS</li>
        <li><code>dist/ag-grid.min.noStyle.js</code> &mdash; minified bundle containing JavaScript without CSS</li>
    </ul>

    <h3>JavaScript modules</h3>

    <p>
        To consume ag-Grid as a module, it's best to download the packages via NPM and then either <code>require</code> (ECMA 5) or
        <code>import</code> (ECMA 6)
        them into your project.
    </p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid-community';
</snippet>

    <h2>Download ag-Grid-Enterprise</h2>

    <p>As with the main ag-Grid library above, the ag-Grid-Enterprise library is also distributed as both a self
        contained bundle and also via a JavaScript module package. </p>

    <p>If you're using the bundled version you only need the bundled version (i.e. <code>ag-grid-enterprise.js</code>), but
    if you're using the module package then you'll require both the <code>ag-grid</code> and <code>ag-grid-enterprise</code>
        dependency.</p>

    <p>If you're using the bundled version, you can reference the ag-Grid-Enterprise library via CDN:</p>

<snippet language=html>
&lt;script src="_url_to_your_chosen_cdn_/ag-grid-enterprise.js"&gt;&lt;/script&gt;
</snippet>

    <p>But you can also download the library in the following ways:</p>

    <table class="content">
        <tr>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                <code>npm install ag-grid-enterprise</code>
            </td>

            <td style="width: 20px;">&nbsp;</td>

            <td style="padding: 10px;"><img src="../images/github.png"/></td>
            <td>
                <b>Github</b><br/>
                Download from <a href="https://github.com/ag-grid/ag-grid-enterprise">Github</a>
            </td>

            <td style="width: 20px;">&nbsp;</td>

            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                <code>bower install ag-grid-enterprise</code>
            </td>
        </tr>
    </table>

    <p>You could then reference the ag-Grid library in a similar way to the CDN method above, but from a local
        filesystem:</p>

<snippet language=html>
&lt;script src="node_modules/ag-grid/dist/ag-grid-enterprise.js"&gt;&lt;/script&gt;
</snippet>

    <h3>ag-Grid Enterprise Bundle Types</h3>

    <p>
        Again similar to ag-Grid, ag-Grid-Enterprise has 4 bundles:
    </p>
    <ul class="content">
        <li><code>dist/ag-grid-enterprise.js</code> &mdash; standard bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid-enterprise.min.js</code> &mdash; minified bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid-enterprise.noStyle.js</code> &mdash; standard bundle containing JavaScript without CSS</li>
        <li><code>dist/ag-grid-enterprise.min.noStyle.js </code> &mdash; minified bundle containing JavaScript without CSS</li>
    </ul>

    <h3>JavaScript modules</h3>
    <p>
        If using modules, you only need to include ag-Grid-Enterprise into your project. You do not need to
        import anything from the package. When ag-Grid-Enterprise loads, it will register with ag-Grid such that the
        enterprise features are available when you use ag-Grid.
    </p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');
// only include this line if you want to use ag-grid-enterprise
require('ag-grid-enterprise');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid-community';
// only include this line if you want to use ag-grid-enterprise
import 'ag-grid-enterprise';
</snippet>


    <p>The Enterprise dependency has to be made available before any Grid related component, so we suggest including it
        as soon as possible.</p>

    <h2 id="aggrid-javascript-testing">Testing ag-Grid Applications with Jasmine</h2>

    <p>In our <a href="https://github.com/ag-grid/ag-grid-seed">Javascript Seed Repo</a> we provide working
        examples of how to test your project with Jasmine (under the <code>javascript</code> project).</p>

    <p>In order to test your application you need to ensure that the Grid API is available - the best way to do this
    is to set a flag when the Grid's <code>gridReady</code> event fires, but this requires an application code change.</p>

    <p>An alternative is to use a utility function that polls until the API has been set on the <code>GridOptions</code>:</p>

    <snippet>
function waitForGridApiToBeAvailable(gridOptions, success) {
    // recursive without a terminating condition, 
    // but jasmines default test timeout will kill it (jasmine.DEFAULT_TIMEOUT_INTERVAL)
    if(gridOptions.api) {
        success()
    } else {
        setTimeout(function () {
            waitForGridApiToBeAvailable(gridOptions, success);
        }, 500);
    }
}   </snippet>

    <p>Once the API is ready, we can then invoke Grid <code>API</code> and <code>ColumnApi</code> methods:</p>

<snippet>
it('select all button selects all rows', () => {
    selectAllRows();                    // selectAllRows is a global function created in the application code 
    expect(gridOptionsUnderTest.api.getSelectedNodes().length).toEqual(3);
});
</snippet>

    <h2 id="next-steps">Next Steps</h2>

    <p>
        Now you can go to <a href="../javascript-grid-reference-overview/">reference</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>

