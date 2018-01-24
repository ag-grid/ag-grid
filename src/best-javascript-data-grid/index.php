<?php
$pageTitle = "ag-Grid: The Best HTML5 JavaScript Datagrid in the World";
$pageDescription = "A feature rich data grid designed for Enterprise applications. Built in Plain JavaScript to deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month trial of Enterprise Version.";
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

<?php
    $featuresRoot = '../javascript-grid-features';
    include '../javascript-grid-features/gridFeatures.php';
?>


<?php include '../documentation-main/documentation_footer.php'; ?>

