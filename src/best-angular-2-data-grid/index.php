<?php
$pageTitle = "ag-Grid: The Best Angular Datagrid in the World";
$pageDescription = "A feature rich data grid designed for Enterprise applications. Easily integrate with Angular to deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month trial of Enterprise Version.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1"> Angular Datagrid </h1>

    <?= example('ag-Grid in Angular', 'rich-grid-example', 'angular', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Getting Started</h2>
    <p>

                    Learn how to get a simple application working using ag-Grid and Angular 2
                    Start here to get a simple grid working in your application, then follow on
                    to further sections to understand how particular features work.
                
    </p>

    <p> <a href="/angular-getting-started/">Go to Getting Started</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>More Details</h2>
    <p> Dive deeper in how to use ag-Grid with Angular 2.x/4.x, including referencing dependencies, an overview on interfacing and documenting using Webpack & SystemJS.
    </p>
    <p> <a href="/angular-more-details/">Go to More Details</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Building</h2>
    <p> Documenting using Angular CLI, Webpack, Webpack 2, ngTools & Webpack and SystemJS to build your ag-Grid application.</p>
    <p> <a href="/angular-building/">Go to Building</a> </p>
    </div>
</div>

<?php
$featuresRoot = '../javascript-grid-features';
include '../javascript-grid-features/gridFeatures.php';
?>

</div>


<?php include '../documentation-main/documentation_footer.php'; ?>

