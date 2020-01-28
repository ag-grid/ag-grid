<?php
$pageTitle = "Polymer Datagrid | Packed with features and performance";
$pageDescription = "A feature rich data grid designed for Enterprise applications. Easily integrate with Polymer to 
deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month 
trial of Enterprise Version.";
$pageKeyboards = "Polymer Grid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>
<div>

    <h1>Polymer 3 Datagrid</h1>

    <note>With release 20 of <code>ag-grid-polymer</code> supports Polymer 3.<br/><br/>
    For Polymer 2.x support please use version 19 (and before) of <code>ag-grid-polymer</code>. Archived documentation for this
    version can be found <a href="">here</a>.</note>

    <p class="lead">
        Here we explain how to use ag-Grid inside an Polymer application.
        It is broken down into the following sections:
    </p>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Getting Started</h2>
    <p>
        Learn how to get a simple application working using ag-Grid and Polymer 3
        Start here to get a simple grid working in your application, then follow on
        to further sections to understand how particular features work.
    </p>
    <p> <a href="/polymer-getting-started/">Go to Getting Started</a> </p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
    <h2>More Details</h2>
    <p>
        Dive deeper in how to use ag-Grid with Polymer 3, including more examples and
        an overview on interfacing.
    </p>
    <p> <a href="/polymer-more-details/">Go to More Details</a> </p>
    </div>
</div>

    <?php
    $featuresRoot = '../javascript-grid-features';
    include '../javascript-grid-features/gridFeatures.php';
    ?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
