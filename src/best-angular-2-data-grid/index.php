<?php
$pageTitle = "Datagrid for Angular. 63 Features and world class performance.";
$pageDescription = "A feature rich data grid designed for Enterprise applications. Easily integrate with Angular to deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month trial of Enterprise Version.";
$pageGroup = "basics";
include '../landing-pages/header.php';
?>

<div>

    <h1 class="first-h1">ag-Grid: Built for Angular</h1>
    
    <p class="lead">
        ag-Grid began life as an Angular grid. In fact, the first incarnation of the grid was AngularGrid. We have since added support for other frameworks. This means is we integrate seamlessly with Angular 2+. We also have a close working relationship with the Angular team so support the latest versions as they're released. This page outlines our products, the key benefits and features as well as the pathway to get up and running quickly. With these resources, you can quickly add a datgrid or datatable to your Angular application.
    </p>

    <h2>Pick the Best Version for You</h2>

    <div>
        <div class="row">
            <div class="col-md-6">
                <h3>ag-Grid Community Edition (CE)</h3>
                <p>
                    Free and Open Source datagrid designed to meet all of your core requirements. Available via Github or NPM. To keep up to date with our releases, you can join our mailing list or follow us on Medium.
                </p>
            </div>

            <div class="col-md-6">
                <h3>ag-Grid Enterprise Edition</h3>
                <p>
                    Built on ag-Grid CE, our commercial version contains more features designed for Enterprise Applications. This version also includes Technical Support and Feature Requests. Sign up now for a free two month, fully functional trial.
                </p>
            </div>
        </div>
    </div>

    <h2>Key Features and Benefits</h2>

    <div>
        <div class="row">
            <div class="col-md-4">
                <h3>Core and Enterprise Features</h3>
                    <ul class="content-list">
                        <li>
                            Everything you'd expect from a datagrid. Sorting, filtering, row grouping. Available in ag-Grid Community.
                        </li>
                        <li>
                            A more powerful set of advanced features designed for Enterprise Applications. Pivoting, Aggregation, Clipboard, Master/Detail, Tree Data
                        </li>
                        <li>
                            View all of our features in the Features Overview.
                        </li>
                    </ul>
            </div>

            <div class="col-md-4">
                <h3>Performance</h3>
                    <ul class="content-list">
                        <li>
                            Features are useless without performance. 
                        </li>
                        <li>
                            We find that the browser runs out of steam before the grid, easily handles 100,000 rows.
                        </li>
                        <li>
                            For larger datasets, use one of our other Row Models designed to handle Big Data.
                        </li>
                    </ul>
            </div>

            <div class="col-md-4">
                <h3>Detailed Documentation</h3>
                    <ul class="content-list">
                        <li>
                            We have created in depth guides which you can follow to implement specific features.
                        </li>
                        <li>
                            There are lots of articles covering our Row Models, Themes, Components as well a detailed reference guide.
                        </li>
                        <li>
                            Finally, we have provided a library of Examples which you can use as a basis for your implementation of ag-Grid.
                        </li>
                    </ul>
            </div>
        </div>
    </div>

    <?= example('ag-Grid in Angular', 'rich-grid-example', 'angular', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

<h2>How Do I Get Started?</h2>

<p>We have put together a detailed guide on <a href="../react-getting-started/">Getting Started with React and ag-Grid</a>. This covers getting up and running with ag-Grid Community and then adding ag-Grid Enterprise.</p>

<h2>What About Detailed Guides and Examples?</h2>

<p>We have created a number of more detailed guides as follows:</p>

<ul>
    <li><a href="../react-more-details/">ag-Grid React Overview</a></li>
    <li><a href="../react-redux-integration-pt1/">Redux Integration - Part 1</a></li>
    <li><a href="../react-redux-integration-pt2/">Redux Integration - Part 2</a></li>
</ul>

<p>In addition to the above, you can find a <a href="../example-react-redux/">live example of ag-Grid / Redux integration</a> in our examples section.</p>

</div>

<?php include '../landing-pages/footer.php'; ?>

