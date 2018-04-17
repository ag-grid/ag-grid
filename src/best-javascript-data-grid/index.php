<?php
$pageTitle = "JavaScript Datagrid with 63 features and breakneck performance";
$pageDescription = "ag-Grid is built in plain JavaScript so it is the natural choice for a datagrid or datatables in your application. Easily deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month trial of Enterprise Version. We've just released Version 17 - take it for a test drive.";
$pageKeyboards = "JavaScript Datagrid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>JavaScript Grid</h1>

<p class="lead">
    ag-Grid is built in plain JavaScript so it is the natural choice for a datagrid or datatables in your application. Leverage our 
    63 <a href="/javascript-grid-features/">features</a> for your users with the performance that you require. This section contains links to How To guides and 
    tutorials in our <a href="/javascript-getting-started/">Getting Started</a> page for JavaScript.
    Each page in our documentation contains a working example with code examples and a link to <a href="https://plnkr.co/"> Plunker</a>.   
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

