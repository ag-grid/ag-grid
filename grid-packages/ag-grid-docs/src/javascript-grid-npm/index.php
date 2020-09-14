<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - Install with NPM";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Install ag-Grid with NPM</h1>

<p class="lead">
    ag-Grid is available through NPM packages. Below is a code example of using ag-Grid with NPM
    and ECMA 6 imports.
</p>

<?php include './intro.php'; ?>

<p>
    To install ag-Grid and update your <code>package.json</code> file run:
</p>

<?= createSnippet('npm install --save ag-grid-community', 'sh') ?>

<p>
    To install ag-Grid Enterprise and update your <code>package.json</code> file run:
</p>

<?= createSnippet('npm install --save ag-grid-enterprise', 'sh') ?>

<p>Afterwards, depending on your project setup, you can either <code>require</code> or <code>import</code> the module. For ag-grid, you need the ag-grid module:</p>

<?= createSnippet(<<<SNIPPET
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid-community');

// ECMA 6 - using the system import method
import { Grid } from 'ag-grid-community';
SNIPPET
) ?>

<p>For ag-Grid Enterprise features, import the <code>ag-grid-enterprise</code> package for it to be included in your
    application:</p>

<?= createSnippet("import 'ag-grid-enterprise';") ?>

<p>After you have loaded the scripts, you should include the styles in your project. There are several ways to do it, depending on your module bundler and the specifics of your project. The stylesheet files reside in <code>dist/styles/</code> directory of the ag-grid package - you should include <code>ag-grid.css</code> and the theme of your choice. </p>
<?php include '../documentation-main/documentation_footer.php'; ?>

