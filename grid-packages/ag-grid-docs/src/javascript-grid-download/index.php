<?php
$pageTitle = "ag-Grid Reference: JavaScript Datagrid - Download";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Download ag-Grid</h1>
    <p class="lead">
        If your project does not use package manager and you don't want to refer ag-Grid from CDN, you can download the ag-Grid's source files and keep them in your project structure.
    </p>

    <note>
        <strong>Disclaimer:</strong> This makes upgrading more complex and prone to errors. We recommend using ag-Grid from an NPM package or from CDN.
    </note>

    <h2>Download ag-Grid bundle</h2>

    <p>
        You can download ag-Grid from the <code>dist</code> folder of the ag-Grid
        <a href="https://github.com/ag-grid/ag-grid/tree/master/community-modules/all-modules/dist">GitHub Repository</a>.
        There are four bundle files in the distribution:
    </p>

    <ul class="content">
        <li><code>dist/ag-grid-community.js</code> &mdash; standard bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid-community.min.js</code> &mdash; minified bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid-community.noStyle.js</code> &mdash; standard bundle containing JavaScript without CSS</li>
        <li><code>dist/ag-grid-community.min.noStyle.js</code> &mdash; minified bundle containing JavaScript without CSS</li>
    </ul>

    <p>
        Should you decide to use the <code>noStyle</code> versions of the bundle, the stylesheet files are
        present in the <code>dist/styles</code> folder.
    </p>


<h2>Download ag-Grid Enterprise bundle</h2>

    <p>
        You can download ag-Grid Enterprise from the <code>dist</code> folder of the ag-Grid Enterprise
        <a href="https://github.com/ag-grid/ag-grid/tree/master/enterprise-modules/all-modules/dist">Github Repository</a>.
        Again there are four bundle files in the distribution:
    </p>

    <ul class="content">
        <li><code>dist/ag-grid-enterprise.js</code> &mdash; standard bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid-enterprise.min.js</code> &mdash; minified bundle containing JavaScript and CSS</li>
        <li><code>dist/ag-grid-enterprise.noStyle.js</code> &mdash; standard bundle containing JavaScript without CSS</li>
        <li><code>dist/ag-grid-enterprise.min.noStyle.js </code> &mdash; minified bundle containing JavaScript without CSS</li>
    </ul>

    <p>
        Should you decide to use the <code>noStyle</code> versions of the bundle, you should use the
        style files from the ag-Grid bundle (all the styles needed for community and enterprise are in the
        community CSS files).
    </p>

    <p>
        After downloading the bundles, you can refer to the files in the same way as you would from CDN.
        Refer <a href="../javascript-grid/">the getting started section</a> for step-by-step guide on that.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>

