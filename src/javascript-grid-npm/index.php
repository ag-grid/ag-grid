<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - Install with NPM";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Install ag-Grid and ag-Grid Enterprise with NPM</h1>
    <p>Both ag-Grid and ag-Grid Enterprise are available as NPM packages, even if you don't intend to use them with a particular JavaScript framework. To install ag-Grid, run</p>

<snippet language="sh">
npm install --save ag-grid
</snippet>

<p>To install ag-Grid Enterprise, run:</p>

<snippet language="sh">
npm install --save ag-grid-enterprise
</snippet>

<p>Afterwards, depending on your project setup, you can either <code>require</code> or <code>import</code> the module. For ag-grid, you need the ag-grid module:</p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid';
</snippet>

<p>for ag-Grid Enterprise, you need to import ag-Grid first, and add ag-grid enterprise after it:</p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');
require('ag-grid-enterprise');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid';
import 'ag-grid-enterprise';
</snippet>

<p>After you have loaded the scripts, you should include the styles in your project. There are several ways to do it, depending on your module bundler and the specifics of your project. The stylesheet files reside in <code>dist/styles/</code> directory of the ag-grid package - you should include <code>ag-grid.css</code> and the theme of your choice. </p> 
<?php include '../documentation-main/documentation_footer.php'; ?>

