<?php
$pageTitle = "ag-Grid Reference: ag-Grid Modules";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page explains how to set the License Key in ag-Grid Enterprise";
$pageKeywords = "ag-Grid JavaScript Data Grid Modules";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>ag-Grid Packages</h1>

<p class="lead">
    ag-Grid <code>packages</code> are the easiest way to get started with ag-Grid, but the trade-off will be a larger overall bundle size may be
    larger than required if you don't need all features within a given package.
</p>

<h2>Introduction</h2>

<p>The following artifacts are "<code>packages</code>" and are designed to work to together:</p>

<table class="properties">
    <tr>
        <th>Package Name</th>
        <th>Contents</th>
    </tr>
    <tr>
        <td><code>ag-grid-community</code></td>
        <td>All Community Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-enterprise</code></td>
        <td>All Enterprise Features</td>
    </tr>
    <tr>
        <td><code>ag-grid-angular</code></td>
        <td>Angular Support</td>
    </tr>
    <tr>
        <td><code>ag-grid-react</code></td>
        <td>React Support</td>
    </tr>
    <tr>
        <td><code>ag-grid-vue</code></td>
        <td>Vue Support</td>
    </tr>
    <tr>
        <td><code>ag-grid-polymer</code></td>
        <td>Polymer Support</td>
    </tr>
</table>

<p>When using <code>packages</code> you get all of the code within that package and cannot pick and choose which features you require. You also don't need
to register these packages in the same way you do with <code>modules</code>.</p>

<p>This means that it is easier to use <code>packages</code> but the trade-off will be you'll end up with a larger bundle size if you don't require all features
within a given package.</p>

<p>If you do decide to use <code>packages</code> you'll need to specify <code>ag-grid-community</code> as a minimum dependency:</p>
<snippet>
"dependencies": {
    "ag-grid-community": "^23.0.0"
    ...other dependencies...
</snippet>

<p>You can then (optionally) specify <code>ag-grid-enterprise</code> if you require Enterprise features:</p>

<snippet language="diff">
"dependencies": {
    "ag-grid-community": "^23.0.0"
+   "ag-grid-enterprise": "^23.0.0"
    ...other dependencies...
</snippet>

<p>If you do require Enterprise features you'll additionally need to import the <code>ag-grid-enterprise</code> package
    for it to be included in your application:</p>

<snippet>
import 'ag-grid-enterprise';
</snippet>


<p>Finally, if you're using a framework you'll need to specify <strong>one</strong> of the framework packages - for example assuming you're using
Angular you'd add the <code>ag-grid-angular</code> package:</p>

<snippet language="diff">
"dependencies": {
    "ag-grid-community": "^23.0.0"
    "ag-grid-enterprise": "^23.0.0"
+   "ag-grid-angular": "^23.0.0"
    ...other dependencies...
</snippet>

<p>The rest of this page will discuss the use of packages. Please refer to the <a href="../javascript-grid-modules">modules</a>
    documentation for more information on that side of things.</p>

<p>Please refer to the Getting Started guides for a walkthrough on how to install and use these packages from the ground up:</p>

<div id="get-started-frameworks">

    <div class="row no-gutters">

        <div>
            <div class="get-started-framework card-javascript">
                <a href="../javascript-grid/">JavaScript</a>
                <div>
                    <p><a href="../javascript-grid/">Get Started</a></p>
                </div>
            </div>
        </div>


        <div>
            <div class="get-started-framework card-angular">
                <a href="../angular-grid/">Angular</a>
                <div>
                    <p><a href="../angular-grid/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-react">
                <a href="../react-grid/">React</a>
                <div>
                    <p><a href="../react-grid/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-vue-inverted">
                <a href="../vuejs-grid/">Vue.js</a>
                <div>
                    <p><a href="../vuejs-grid/">Get Started</a></p>
                </div>
            </div>
        </div>

    </div>
</div>

<p>Or maybe you are using something a little less common...</p>

<ul>
    <li><a href="../best-angularjs-grid/">Start with AngularJS</a></li>
    <li><a href="../polymer-getting-started/">Start with Polymer</a></li>
</ul>


<?php include '../documentation-main/documentation_footer.php'; ?>
