<?php
$pageTitle = "Angular Datagrid | Packed with features and performance.";
$pageDescription = "Worlds leading, feature rich Angular Datagrid. Designed to integrate seamlessly with Angular to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 18 is out now.";
$pageGroup = "basics";
include '../landing-pages/header.php';
?>

<script type="text/javascript" src="//downloads.mailchimp.com/js/signup-forms/popup/embed.js" data-dojo-config="usePlainJson: true, isDebug: false"></script><script type="text/javascript">require(["mojo/signup-forms/Loader"], function(L) { L.start({"baseUrl":"mc.us11.list-manage.com","uuid":"9b44b788c97fa5b498fbbc9b5","lid":"b7d8f8f05f"}) })</script>

<link rel="stylesheet" href="dist/homepage.css" style="max-width: 200px">   

<div>
    <h1 class="text-center" class="text-white" class="first-h1" style="background-color: #f9fcff;padding-top: 40px;padding-bottom: 40px;margin-top: -30px">ag-Grid: World's Leading Angular Datagrid</h1>
    <hr>
    <p class="lead">
ag-Grid is a feature rich datagrid designed for Angular.<br>
        Integrate seamlessly with Angular to deliver core and enterprise features with the performance that you expect.<br>
        Close relationship with the Angular team means we support Angular's latest versions. <br>
        This page covers the versions of ag-Grid, key benefits and outlines the resources available to quickly add a Angular datagrid or datatable to your Angular application.   
    </p>

</div>
<hr><br>
<h1 class="text-center" class="text-white" class="first-h1" style="background-color: #f9fcff;padding-top: 30px;padding-bottom: 30px;margin-top: -30px">ag-Grid in Angular</h1>
<br>
        <h6 class="text-center" style="margin-bottom: 15px">Test ag-Grid's features and performance level in the Angular Grid Example.</h6>
    <?= example('ag-Grid in Angular', 'rich-grid-example', 'angular', array( "enterprise" => 1, "exampleHeight" => 300 , "exampleWidth" => 300, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>
<br><hr>
<div><br>
                    <h1 class="text-center" style="background-color: #f9fcff;padding-top: 30px;padding-bottom: 30px;margin-top: -30px">Features You Need   |      Performance You Expect</h1>

        <div class="row" style="margin-top: -20px">
            <div style="margin-bottom: : 10px" class="col-md-4">
                <h2>Core and Enterprise Features</h2>
                    <ul class="content-list">
                        <li>
                            Everything you'd expect from an Angular datagrid. Sorting, filtering, row grouping. Available in ag-Grid Community.
                        </li>
                        <li>
                            A more powerful set of advanced features designed for Enterprise Applications. Pivoting, Aggregation, Clipboard, Master/Detail, Tree Data
                        </li>
                            </li><hr>
                            <button style="margin-top: 25px" type="button" class="btn btn-outline-primary btn-block">Features Overview</button>
                       
                    </ul>
            </div>
            <img src="sorting.gif" height="180" width="320">
            <div class="col-md-4">
                <h2>Performance</h2>
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
                    </ul><hr>
                    <button style="margin-top: 40px" type="button" class="btn btn-outline-primary btn-block">ag-Grid Performance Demo</button>
            </div>

            <div class="col-md-4">
                <h2>Detailed Documentation</h2>
                    <ul class="content-list">
                        <li>
                           In depth guides which you can follow to implement specific features.
                        </li>
                        <li>
                            Articles covering our Row Models, Themes and Angular Components.
                        </li>
                        <li>
                            Library of Examples which you can use as a basis for your implementation of ag-Grid.
                            <hr>
                        </li>
                    </ul>
                    <button type="button" class="btn btn-outline-primary btn-block">Documentation</button>
            </div>
        </div>
    </div>
<hr><br>
<h1 class="text-center" class="text-white" class="first-h1" style="background-color: #f9fcff;padding-top: 30px;padding-bottom: 30px;margin-top: -30px">Pick The Best Version For You</h1>
<br>
    <div style="margin-top: -25px">
        <div class="row">
            <div class="col-md-6">
                <h3>ag-Grid Community | Trusted by the Community</h3>
                <hr>
                                <p><strong>2M Downloads
                    <br>
                    150,000 Downloads Per Month</strong>
                </p>
                <hr>
                <p>
                    Free and Open Source Angular datagrid.
                    <br>
                    Designed to meet all of your core requirements.
<br>
                    Available via Github or NPM.
                </p>
                <a href="https://github.com/ag-grid/ag-grid-angular"><button type="button" class="btn btn-outline-primary btn-lg">Community Edition</button></a>
            </div>

            <div class="col-md-6">
                <h3>ag-Grid Enterprise | Built for the Enterprise</h3>
                <hr>
                                <p><strong>Over 1,500 Companies use ag-Grid Enterprise
                    <br>
                    Over 25% of FT-500 Companies use ag-Grid Enterprise</strong>
                </p>
                <hr>
                <p>
                    Designed for Enterprise Applications.<br>
                    Enterprise includes Technical Support and Feature Requests.<br>
                    Sign up now for a free two month, fully functional trial.<br>
                </p>
                <a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg">Start Free Trial</button></a>
            </div>
        </div>
    </div>
<hr>

<h2>How Do I Get Started?</h2>

<p>We have put together a detailed Angular tutorial on <a href="https://www.ag-grid.com/angular-getting-started/">Getting Started with Angular and ag-Grid</a>. This covers getting up and running with ag-Grid Community and then adding ag-Grid Enterprise.</p>

<h2>What About Detailed Guides and Examples?</h2>

<p>We have created a number of more detailed guides as follows:</p>
<br>
<div class="btn-group btn-group-justified">
    <div class="btn-group" style="margin-left: 100px">
  <a href="#" style="width: 320px" class="btn btn-light">View our Angular Grid Overview</a>
  <a href="#" style="width: 320px" class="btn btn-light">Angular Grid Demo</a>
  <a href="#" style="width: 320px" class="btn btn-light">Angular Component using RXjs example</a>
</div>
<br><br>
<div>
  <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-angular"><button type="button" class="btn btn-outline-primary btn-lg btn-block">Community Edition</button></a>
</div>
<br>
<div>
  <a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg btn-block">Start Free Trial</button></a>
</div>

<?php include '../landing-pages/footer.php'; ?>

