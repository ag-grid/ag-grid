<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - Install with NPM";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Install ag-Grid with NPM</h1>

    <p class="lead">
        Both ag-Grid is available through NPM packages. Below is a code example of using ag-Grid with NPM
        and ECMA 6 imports.
    </p>

    <?php
        include './intro.php';
    ?>

    <p>
        To install ag-Grid and update your <code>package.json</code> file run:
    </p>

<snippet language="sh">
npm install --save @ag-grid-community/all-modules
</snippet>

<p>
    To install ag-Grid Enterprise and update your <code>package.json</code> file run:
</p>

<snippet language="sh">
npm install --save ag-grid-enterprise
</snippet>

<p>Afterwards, depending on your project setup, you can either <code>require</code> or <code>import</code> the module. For ag-grid, you need the ag-grid module:</p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('@ag-grid-community/all-modules');

// ECMA 6 - using the system import method
import {Grid} from '@ag-grid-community/all-modules';
</snippet>

<p>for ag-Grid Enterprise features you need to import the ag-Grid Enterprise package instead:</p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('@ag-grid-enterprise/all-modules');

// ECMA 6 - using the system import method
import {Grid} from '@ag-grid-enterprise/all-modules';
</snippet>

<p>After you have loaded the scripts, you should include the styles in your project. There are several ways to do it, depending on your module bundler and the specifics of your project. The stylesheet files reside in <code>dist/styles/</code> directory of the ag-grid package - you should include <code>ag-grid.css</code> and the theme of your choice. </p> 
<?php include '../documentation-main/documentation_footer.php'; ?>

