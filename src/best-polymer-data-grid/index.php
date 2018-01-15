<?php
$pageTitle = "Polymer Grid";
$pageDescription = "A feature rich data grid designed for Enterprise. Easily integrate with Polymer to deliver filtering, grouping, aggregation, pivoting and much more.";
$pageKeyboards = "Polymer Grid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>
<div>

    <h1>Polymer Datagrid</h1>

    <p class="lead">
        Here we explain how to use ag-Grid inside an Polymer application.
        It is broken down into the following sections:
    </p>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Getting Started</h2>
    <p>

                    Learn how to get a simple application working using ag-Grid and Polymer 2
                    Start here to get a simple grid working in your application, then follow on
                    to further sections to understand how particular features work.
                
    </p>
    <p> <a href="/polymer-getting-started/">Go to Getting Started</a> </p>
    </div>
</div><div class="docs-homepage-section-preview">
    <div>
    <h2>More Details</h2>
    <p>
        Dive deeper in how to use ag-Grid with Polymer 2, including more examples and
        an overview on interfacing.
    </p>
    <p> <a href="/polymer-more-details/">Go to More Details</a> </p>
    </div>
</div>

    <h2>Feature Roadshow</h2>

    <?php
    $featuresRoot = '../javascript-grid-features';
    include '../javascript-grid-features/gridFeatures.php';
    ?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
