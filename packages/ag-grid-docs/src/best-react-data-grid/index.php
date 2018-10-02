<?php
$pageTitle = "React Data Grid | Packed with features and performance
.";
$pageDescription = "Worlds leading, feature rich React Data Grid. Use our grid as a React component to quickly add a data grid or a table to your application. Designed to integrate seamlessly with React to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 18 is out now.";
$pageGroup = "basics";
include '../landing-pages/header.php';
?>

<div>

    <h1 class="text-center">ag-Grid: World's Leading React Datagrid</h1>
    <hr>

    <p class="lead">ag-Grid is designed to <strong>integrate deeply into React</strong>.<br>
        Use our grid as a <strong>React component</strong> to quickly add a <strong>react data grid</strong> or a react table to your application.<br>
        Discover the versions, key benefits and resources available to quickly add a data grid or <strong>React datatable</strong> to your React application.
</p>
<hr>
<h2>Two Versions - Which is the Best Fit for you?</h2>

<div>
        <div class="row">
            <div class="col-md-6" align="text-center">
                <h2>ag-Grid Community</h2>
                <h3>Trusted by the Community</h3>
                <hr>
                                <p style="background-color: aliceblue"><strong>2M Downloads
                    <br>
                    200,000 Downloads Per Month</strong>
                </p>
                <hr>
                <p>
                    Free and Open Source React data grid.
                </p>
                <a href="../react-getting-started" target="_blank"><button type="button" class="btn btn-outline-primary btn-lg">Community Edition</button></a>
            </div>

            <div class="col-md-6">
                <h2>ag-Grid Enterprise </h2>
                <h3>Built for the Enterprise</h3>
                <hr>
                                <p style="background-color: aliceblue"><strong>Over 1,500 Companies use ag-Grid Enterprise
                    <br>
                    Over 25% of FT-500 Companies use ag-Grid Enterprise</strong>
                </p>
                <hr>
                <p>
                    Designed for Enterprise Applications.
                </p>
                <a href="https://www.ag-grid.com/start-trial.php" target="_blank"><button type="button" class="btn btn-primary btn-lg">Start Free Trial</button></a>
            </div>
        </div>

<br><hr>
<h1 class="text-center" style="background-color: aliceblue;padding-top: 30px;padding-bottom: 30px;margin-top: 30px"><strong>Key Features and Benefits</strong></h1>
<h3 class="text-center" style="background-color: #f5faff;padding-top: 10px;padding-bottom: 10px"><strong>Versions</strong></h3>
<div class="container" style="max-width: 100%">
<div class="row">
    <div class="col" style="margin-top: -20px">
<h2><strong>Core</strong></h2>
<hr>
<p>
    <strong>Everything you'd expect from an React Data grid.</strong><br>
    Available in ag-Grid Community.
    <br><br>
    <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-angular" target="_blank">Github</a> | <a href="https://www.npmjs.com/package/ag-grid" target="_blank">NPM</a>
    </p>
    </div>
    <div class="col" style="margin-top: 10px">
        <p>Sorting</p>
<img src="/best-angular-2-data-grid/sorting.gif" alt="Sorting">
    </div>
    <div class="col" style="margin-top: 10px">
        <p>Filtering</p>
<img src="/best-angular-2-data-grid/filtering.gif" alt="filtering">
    </div>
  </div>
<br>
  <div class="row">
    <div class="col" style="margin-top: -20px">
<h2><strong>Enterprise</strong></h2>
<hr>
<p>
<strong>Powerful, advanced features designed for Enterprise Applications.</strong><br>
Availalbe in ag-Grid Enterprise.
</p>
<a href="https://www.ag-grid.com/start-trial.php" target="_blank"><button type="button" class="btn-primary btn-block">Start Free Trial</button></a>
    </div>
    <div class="col" style="margin-top: 10px">
        <p>Aggregation</p>
<img src="/best-angular-2-data-grid/selection.gif" alt="aggregation">
    </div>
    <div class="col" style="margin-top: 10px">
        <p>Pivoting</p>
<img src="/best-angular-2-data-grid/pivoting.gif" alt="pivoting">
    </div>
    <div>
</div>

<div class="container" style="max-width: 100%">
<h3 class="text-center" style="background-color: #f5faff;padding-top: 10px;padding-bottom: 10px"><strong>Enterprise Grade Performance</strong></h3>
<div class="container" style="max-width: 100%"">
  <div class="row">
    <div class="col"><br><br>
      <font size="+1">ag-Grid is built to deal with <strong>large data sets</strong>.<br>
      Handles the performance required by <strong>modern day enterprise applications</strong>.<br>
Our grid can process over <strong>150,000 updates per second</strong>.
  </font>
  <br><br>
  Read more about streaming updates in ag-Grid <a href="https://medium.com/ag-grid/how-to-test-for-the-best-html5-grid-for-streaming-updates-53545bb9256a" target="_blank">here</a>.
    </div>
    <div class="col">
        <div>
            <br>
<img src="100,000 rows.gif" alt="Performance"">
</div>
<br>
    </div>
  </div>
   <a href="https://www.ag-grid.com/example.php#/performance/1" target="_blank"><button type="button" class="btn btn-outline-primary btn-block">ag-Grid Performance Demo</button></a>

<hr>
<h1 class="text-center" style="background-color: aliceblue;padding-top: 30px;padding-bottom: 30px;margin-top: 30px"><strong>ag-Grid in React</strong></h1>

<div class="container" style="max-width: 100%">
  <div class="row">
    <div class="col" style="max-width: 400px"><br><br>
<h3 class="text-center">Test ag-Grid's features and performance level in the React Data Grid Example.</h3>
<br><br>
<h6 class="text-center">
    <strong>Extensive Set of Features</strong>
</h6>
<p class="text-center">
    Designed for Core and Enterprise needs.
</p>
<br>
<h6 class="text-center">
    <strong>Features Are Useless Without Performance</strong>
</h6>
<p class="text-center">
    Built to deal with large data sets.
</p>
    </div>
    <div class="col"><br>
    <?= example('React Grid Example', 'full-rich-markup', 'react', array( "enterprise" => 1, "exampleHeight" => 300 , "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

          <a href="../example.php" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm btn-block">React Grid Demo</button></a>

    </div>
  </div>
<hr>
<div class="container" style="max-width: 100%">
  <div class="row">
    <div class="col">
<h3>How Do I Get Started?</h3>
<br>
<p>We have put together a detailed React Data Grid tutorial on <a href="../react-getting-started-getting-started/" target="_blank">Getting Started with React and ag-Grid</a>. This covers getting up and running with ag-Grid Community and then adding ag-Grid Enterprise.</p>
    </div>
    <div class="col">
<h3>What About Detailed Guides and Examples?</h3>
<br>
<div>
  <a href="../react-more-details/" class="btn btn-light" target="_blank">View our React Grid Overview</a>
  <a href="../react-redux-integration-p1" class="btn btn-light" target="_blank">React Redux integration | P1</a>
    <a href="../react-redux-integration-p2" class="btn btn-light" target="_blank">React Redux integration | P2</a>
</div>
    </div>
  </div>


<br>
<div>
  <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-react" target="_blank"><button type="button" class="btn btn-outline-primary btn-lg btn-block">Community Edition</button></a>
</div>
<br>
<div>
  <a href="https://www.ag-grid.com/start-trial.php" target="_blank"><button type="button" class="btn btn-primary btn-lg btn-block">Start Free Trial</button></a>
</div>

<hr>
<div style="background-color: aliceblue">
<h3 class="text-center" style="background-color: aliceblue;padding-top: 30px;padding-bottom: 30px;margin-top: 30px"><strong>Features Overview<hr></strong></h3>
<div class="container text-center" style="max-width: 100%;">
  <div class="row">
    <div class="col"><strong>The Headliners</strong>
<br>
<p><font size="-1">
        <a href="../example.php#/performance/1" target="_blank">Outstanding Performance</a><br>
<a href="../javascript-grid-getting-started/" target="_blank">Works With Your Framework</a><br>
<a href="../example.php#/grouping-aggregation/1" target="_blank">Grouping / Aggregation</a><br>
<a href="../example.php#/filtering/1" target="_blank">Filtering</a><br>
<a href="../example.php#/editing/1" target="_blank">Cell Editing</a><br>
<a href="../javascript-grid-infinite-scrolling/#example-infinite-scroll" target="_blank">Lazy Loading</a><br>
<a href="../features-overview/#server-side-operations" target="_blank">Server-Side Operations</a><br>
<a href="../javascript-grid-viewport/#example-viewport" target="_blank">Live Stream Updates</a><br>
<a href="../javascript-grid-tree-data/#example-org-hierarchy" target="_blank">Tree Data</a><br>
<a href="../features-overview/#customisable-appearance" target="_blank">Customisable Appearance</a><br>
<a href="../features-overview/#convenient-licensing" target="_blank">Convenient Licensing</a><br>
<a href="../license-pricing.php" target="_blank">Commercial Grade Support</a><br>
</font></p>
    </div>

    <div class="col"><strong>The Runner Ups</strong>
<br><p><font size="-1">
<a href="../example.php#/pivoting/1" target="_blank">Pivoting</a><br>
<a href="https://www.ag-grid.com/javascript-grid-master-detail/" target="_blank">Master / Detail</a><br>
<a href="https://www.ag-grid.com/javascript-grid-column-definitions/#saving-and-restoring-column-state" target="_blank">State Persistence</a><br>
<a href="https://www.ag-grid.com/features-overview/#rich-ui" target="_blank">Rich UI</a><br>
<a href="https://www.ag-grid.com/javascript-grid-keyboard-navigation/" target="_blank">Enables Productivity</a><br>
<a href="https://www.ag-grid.com/features-overview/#wide-audience-support" target="_blank">Wide Audience Support</a><br>
<a href="https://www.ag-grid.com/features-overview/#data-export" target="_blank">Data Export</a><br>
<a href="https://www.ag-grid.com/javascript-grid-cell-rendering-components/" target="_blank">Customisable Cell Contents</a><br>
<a href="https://www.ag-grid.com/example.php#/row-reordering/1" target="_blank">Row Reordering</a><br>
<a href="https://www.ag-grid.com/javascript-grid-clipboard/" target="_blank">Copy / Paste</a><br>
</font></p>
    </div>
    <div class="w-100"></div>
    <div class="col"><strong>The Basics</strong>
<br><p><font size="-1">
<a href="https://www.ag-grid.com/features-overview/#column-interactions" target="_blank">Column Interactions</a><br>
<a href="https://www.ag-grid.com/javascript-grid-pagination/#example-client-paging" target="_blank">Pagination</a><br>
<a href="https://www.ag-grid.com/javascript-grid-sorting/#example-custom-sorting" target="_blank">Sorting</a><br>
<a href="https://www.ag-grid.com/features-overview/#selection" target="_blank">Selection</a>
</font></p>
</div>
    <div class="col"><strong>The Rares</strong>
<br><p><font size="-1">
<a href="https://www.ag-grid.com/javascript-grid-column-spanning/#example-column-spanning-simple" target="_blank">Column Spanning</a><br>
<a href="https://www.ag-grid.com/javascript-grid-row-pinning/#example-row-pinning" target="_blank">Pinned Rows</a><br>
<a href="https://www.ag-grid.com/javascript-grid-full-width-rows/#example-simple-full-width" target="_blank">Full Width Rows</a><br>
<a href="https://www.ag-grid.com/javascript-grid-aligned-grids/#example-aligned-grids" target="_blank">Aligned Grids</a>
</font></p>
    </div>
  </div>
</div>
</div>
<br>
  <a href="https://www.ag-grid.com/start-trial.php" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm btn-block">Start Free Trial</button></a>

<?php include '../landing-pages/footer.php'; ?>
