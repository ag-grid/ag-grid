<?php
$pageTitle = "ag-Grid Reference: ag-Grid Modules";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page explains how to set the License Key in ag-Grid Enterprise";
$pageKeywords = "ag-Grid JavaScript Data Grid Modules";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>ag-Grid Packages & Modules</h1>

<p class="lead">
    Version 22.0.0 changes the way ag-Grid is made available by providing functionality in modules, allowing you to
    pick and choose which features you require, resulting in a smaller application size overall.
</p>

<h2>Introduction</h2>

<p>There are two main ways to install ag-Grid - either by using <code>packages</code> ,
    or by using <code>modules</code>.</p>

<p><a href="../javascript-grid-packages">packages</a> are the easiest way to use ag-Grid, but by default include all code specific to each package, whereas
    <a href="../javascript-grid-modules">modules</a> allow you to cherry pick what functionality you want, which will allow for a reduced overall bundle size.</p>

<p>If you're unsure whether to use <code>packages</code> or <code>modules</code> then we'd recommend starting with <code>packages</code> and migrate to <code>modules</code>
if you wish to reduce overall bundle size.</p>

<div id="get-started-packages-modules">
    <div class="row no-gutters" style="justify-content: space-evenly">
        <div>
            <div class="get-started-published package-card">
                <a href="../javascript-grid-packages/">Packages</a>
                <div>
                    <p><a href="../javascript-grid-packages/">Packages Overview</a></p>
                </div>
            </div>
        </div>
        <div>
            <div class="get-started-published module-card">
                <a href="../javascript-grid-modules/">Modules</a>
                <div>
                    <p><a href="../javascript-grid-modules/">Modules Overview</a></p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
