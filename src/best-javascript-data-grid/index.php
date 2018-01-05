<?php
$pageTitle = "JavaScript Datagrid";
$pageDescription = "ag-Grid can be used as a data grid inside your plain JavaScript application. This page details how to get started.";
$pageKeyboards = "JavaScript Datagrid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>JavaScript Grid</h1>

<p class="lead">
    Here we describe how to get ag-Grid up an running inside a plain JavaScript application.
    The section is broken down into the following:
</p>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Getting Started</h2>
    <p>
    Learn how to get a simple application working using ag-Grid and JavaScript.
    Start here to get a simple grid working in your application, then follow on
    to further sections to understand how particular features work.
    </p>
    <p> <a href="/javascript-getting-started/">Go to Getting Started</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>More Details</h2>
    <p>Dive deeper in how to use ag-Grid with JavaScript, including referencing dependencies
    and an overview on interfacing.</p>
    <p> <a href="/javascript-more-details/">Go to More Details</a> </p>
    </div>
</div>


<div>
    <h2>Feature Roadshow</h2>
</div>

<?php
    $featuresRoot = '../javascript-grid-features';
    include '../javascript-grid-features/gridFeatures.php';
?>


<?php include '../documentation-main/documentation_footer.php'; ?>

