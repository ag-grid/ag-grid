<?php
$pageTitle = "React Datagrid | Packed with features and performance.";
$pageDescription = "ag-Grid is feature-rich datagrid designed for React 16. Lots of features with Enterprise grade performance. Version 18 is out now and our product is available in two versions. ag-Grid Community is free and open source while ag-Grid Enterprise can be trialled for two months without obligation.";
$pageGroup = "basics";
include '../landing-pages/header.php';
?>

<script type="text/javascript" src="//downloads.mailchimp.com/js/signup-forms/popup/embed.js" data-dojo-config="usePlainJson: true, isDebug: false"></script><script type="text/javascript">require(["mojo/signup-forms/Loader"], function(L) { L.start({"baseUrl":"mc.us11.list-manage.com","uuid":"9b44b788c97fa5b498fbbc9b5","lid":"b7d8f8f05f"}) })</script>

<div>

    <h1> Our React Datagrid </h1>
    <hr>
    
    <p class="lead">ag-Grid is designed to integrate deeply into React. Use our grid as a React component to quickly add a datagrid or datatables to your application. We support the latest version - React 16 - and always quickly release when new versions come out. This page covers the versions of our product, some of the key benefits and outlines the resources available to quickly add a datgrid or datatable to your React application.   
</p>

<h2>Two Versions - Which is the Best Fit for you?</h2>

<div class="">
    <div class="row">
        <div class="col-md-6">
            <h3>ag-Grid Community Edition</h3>
            <p>
                Free and Open Source datagrid designed to meet all of your core requirements. Available via Github or NPM. To keep up to date with our releases, you can join our mailing list or follow us on <a href="https://medium.com/ag-grid">Medium.</a>
            </p>
            <a href="https://github.com/ag-grid"><button type="button" class="btn btn-outline-primary btn-lg">Community Edition</button></a>
        </div>

        <div class="col-md-6">
            <h3>ag-Grid Enterprise Edition</h3>
            <p>
                Built on ag-Grid CE, our commercial version contains more features designed for Enterprise Applications. This version also includes Technical Support and Feature Requests. Sign up now for a free two month, fully functional trial.
            </p>
              <a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg">Start Free Trial</button></a>
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

<p>We have put together a detailed React tutorial on <a href="../react-getting-started/">Getting Started with React and ag-Grid</a>. This covers getting up and running with ag-Grid Community and then adding ag-Grid Enterprise.</p>

<h2>What About Detailed Guides and Examples?</h2>

<p>We have created a number of more detailed guides as follows:</p>

<ul>
    <li><a href="../react-more-details/">ag-Grid React Overview</a></li>
    <li><a href="../react-redux-integration-pt1/">Redux Integration - Part 1</a></li>
    <li><a href="../react-redux-integration-pt2/">Redux Integration - Part 2</a></li>
</ul>

<p>In addition to the above, you can find a <a href="../example-react-redux/">live example of ag-Grid / Redux integration</a> in our examples section.</p>

</div>

<a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg" style="margin-left: 400px;padding: 13px;margin-bottom: -30px">Start Your Free Trial</button></a>
<a href="https://www.ag-grid.com/react-getting-started/"><button type="button" class="btn btn-outline-primary btn-lg" style="margin-left: 150px;margin-bottom: -30px;padding: 13px">Learn More</button></a>


<?php include '../landing-pages/footer.php'; ?>
