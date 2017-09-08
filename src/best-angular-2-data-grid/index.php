<?php
$key = "Overview Angular";
$pageTitle = "Angular 2 Grid";
$pageDescription = "A feature rich data grid designed for Enterprise. Easily integrate with Angular 2 to deliver filtering, grouping, aggregation, pivoting and much more.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">
        <img style="vertical-align: middle" src="/images/angular2_large.png" height="50px"/>
        Angular 2+ Datagrid
    </h1>

    <?= example('ag-Grid in Angular', 'rich-grid-example', 'angular', array( "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

    <div class="list-group">
        <a href="/angular-getting-started/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/getting_started.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">Getting Started</h4>
                <p class="list-group-item-text">
                    Learn how to get a simple application working using ag-Grid and Angular 2.x/4.x.
                    Start here to get a simple grid working in your application, then follow on
                    to further sections to understand how particular features work.
                </p>
            </div>
        </a>
        <a href="/angular-more-details/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/more-details2.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">More Details</h4>
                <p class="list-group-item-text">
                    Dive deeper in how to use ag-Grid with Angular 2.x/4.x, including referencing dependencies,
                    an overview on interfacing and documenting using Webpack & SystemJS.
                </p>
            </div>
        </a>
        <a href="/angular-building/" class="list-group-item">
            <div class="float-parent"  style="width: 100%;">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/build-tools.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">Building</h4>
                <p class="list-group-item-text">
                    Documenting using Angular CLI, Webpack, Webpack 2, ngTools & Webpack and SystemJS to build your ag-Grid application.</p>
            </div>
        </a>
        <a href="../example-angular/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/examples.svg" width="50" />
                </div>
                <h4 class="list-group-item-heading">Full Examples with Angular</h4>
                <p class="list-group-item-text">
                    This page features examples of using ag-Grid and Angular together. It covers more of the features of ag-Grid.
                </p>
            </div>
        </a>
    </div>

    <?php include '../home/features-detail.php'; ?>
</div>


<?php include '../documentation-main/documentation_footer.php'; ?>

