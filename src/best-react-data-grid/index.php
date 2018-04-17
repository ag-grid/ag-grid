<?php
$pageTitle = "A React Datagrid with 63 Features delivered at speed";
$pageDescription = "ag-Grid is designed for React 16. 63 features with Enterprise grade performance. We have just launched Version 17 and our product is available in two versions. ag-Grid Community is free and open source while ag-Grid Enterprise can be trialled for two months without obligation. We have detailed React tutorials and How To guides and sample code for all of our features.";
$pageGroup = "basics";
include '../landing-pages/header.php';
?>

<div>

    <h1> Our React Datagrid </h1>
    
    <p class="lead">ag-Grid is designed to integrate deeply into the React. Use our grid as a React component to quickly add a datagrid or datatables to your application. We support the latest version of React and always quickly release when new versions come out. This page covers the versions of our product, some of the key benefits and outlines the resources available to quickly add a datgrid or datatable to your React application.	
</p>

<h2>Two Versions - Which is the Best Fit for you?</h2>

<div class="">
    <div class="row">
        <div class="col-md-6">
            <h3>ag-Grid Community Edition</h3>
            <p>
                Free and Open Source datagrid designed to meet all of your core requirements. Available via Github or NPM. To keep up to date with our releases, you can join our mailing list or follow us on Medium.
            </p>
        </div>

        <div class="col-md-6">
            <h3>ag-Grid Enterprise Edition</h3>
            <p>
                Built on ag-Grid Community Edition, our commercial version contains more features designed for Enterprise Applications. This version also includes Technical Support and Feature Requests. Sign up now for a free two month, fully functional trial.
            </p>
        </div>
    </div>
</div>

    <h2>Key Features and Benefits</h2>

    <div class="">
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

<h2>React Example</h2>
    <?= example('ag-Grid in React', 'full-rich-markup', 'react', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

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
