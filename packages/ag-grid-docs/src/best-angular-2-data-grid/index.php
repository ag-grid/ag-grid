<?php
$pageTitle = "Angular Data Grid | Packed with features and performance.";
$pageDescription = "Fastest, most feature-rich angular Data Grid component from ag-Grid. Integrate seamlessly with angular to deliver 63+ core and enterprise features including filtering, grouping and pagination. angular Grid examples and demo on this page. Built to deal with large data sets, ease of integration, heavily customizable and a developer friendly API.";
$pageGroup = "basics";
include '../landing-pages/convert-header.php';
?>
<style><?php include './styles.css'; ?></style>
<style><?php include './css/performance.css'; ?></style>
<style><?php include './css/api.css'; ?></style>
<script src="<?= AG_GRID_ENTERPRISE_SCRIPT_PATH ?>" defer></script>
<script src="./js/grid-performance.js" inline></script>
<script src="./js/grid-api.js" inline></script>
<div>



        <div id="head-top">
        <div class="logo">
            <img alt="ag-Grid Angular Component" src="/best-angular-2-data-grid/assets/images/angular-grid.svg">
        </a>
    </div>
    <h1>World's Leading Angular Datagrid Component</h1>
    <h2 class="overview">Overview</h2>
    <p class="lead-description" id="angular-data-grid-overview">
        ag-Grid is a feature-rich data grid built for Angular.<br> 
        Integrate seamlessly with Angular 2,4,5,6,7 to deliver core and enterprise features with the performance you expect.<br> 
        Discover key benefits and resources available to quickly add an Angular Data Grid or 
        Datatable to your Angular application.
    </p>
    <div class="container">
        <div class="row">
            <div class="col">
                <p class="lead-description">
                    &#10003; Fully Featured Data Grid<br>
                    &#10003; Deep Documentation<br>
                    &#10003; Well-Maintained
                </p>
                <br>
                <a href="https://www.ag-grid.com/example.php#/" target="_blank"><button type="button" class="btn btn-primary">View Demo</button></a>
            </div>
            <div class="col">
                <p class="lead-description">
                    &#10003; Built to deal with large data sets<br>
                    &#10003; Deep and Intuitive API<br>
                    &#10003; Ease of Integration/Customization
                </p>
                <br>
                <a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary">Get Started</button></a>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <h2>Angular Grid Example</h2>
    <br>
    <div class="container">
        <p class="lead-description">
            The Angular grid UI interactions are based on familiar Excel functionality which makes it easy for users to start with the excel like grid.<br>
            Test ag-Grid Angular's core features like sorting, filtering and enterprise features like Rich Select Filter in the Angular Grid Example below.
        </p>
        <div class="container" id="react-example">
            <div class="example">
                <p class="lead">
                    Play with ag-Grid Angular
                </p>
                <div class="arrow bounce">
                    <a class="fa fa-arrow-down fa-2x"></a>
                </div>
            </div>
            <br>
            <div class="row">
                <div class="col" id="feature-performance">
                    <p class="lead-description">
                        <strong>Extensive Set of Features</strong><br>
                        Designed for Core and Enterprise needs.
                    </p>
                </div>
                <div class="col" id="feature-performance">
                    <p class="lead-description">
                        <strong>Features Are Useless Without Performance</strong><br>
                        Built to deal with large data sets.
                    </p>
                </div>
            </div>
            <div class="col"><br>
                <?= example('ag-Grid in Angular', 'rich-grid-example', 'angular-packaged', array("enterprise" => 1, "exampleHeight" => 300, "exampleWidth" => 300)) ?>
                </div>
                <a href="../example.php" target="_blank"><button type="button" class="btn btn-outline-primary btn-sm btn-block">Angular Grid Demo</button></a>
            </div>
        </div>

         <div>
            <h2>Fully Featured Angular Grid Table</h2>
            <hr>
            <p class="lead-description">
                The most well maintained, web feature-rich Angular Data Grid component on the market.
                <br>
                Our Angular Table Grid component comes equipped with 63+ Core and Enterprise features, ready to implement out of the box!
            </p>
            <hr>
            <div class="core">
                <p class="versions">
                    ag-Grid Community
                </p>
                <div>

                    <p class="lead-description" id="core-intro"><strong>Everything you'd expect from a Angular grid.</strong><br>
                        Among the most common features of the modern grids are Sorting, Filtering and Pagination.<br>
                        Our Angular Grid component ships with the following core features:
                    </p>

                </div>
                <div class="row" id="core-features">
                    <div class="col">
                        <p class="lead-description">Sorting<br>
                        Row Spanning</p>
                    </div>
                    <div class="col">
                        <p class="lead-description">Pagination<br>
                        Row Dragging</p>
                    </div>
                    <div class="col">
                        <p class="lead-description">Cell Editing<br>
                        Cell Rendering</p>
                    </div>
                    <div class="col">
                        <p class="lead-description">Row Selection<br>
                        Row Pinning</p>
                    </div>
                </div>
                <div class="container video">
                    <div class="row">
                        <div class="col">
                            <p class="lead-description"><strong>Sorting</strong></p>
                        <video onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"><source src="/best-angular-2-data-grid/sorting.mp4" type="video/mp4" class="features">Your browser does not support the video tag.</video>
                        <br><br>
                        <p class="lead-description">
                            Enabling sorting lets your users sort a column by clicking the header and sort multiple columns by holding down shift.
                        </p>
                    </div>
                    <div class="col">
                        <p class="lead-description"><strong>Pagination</strong></p>
                    <video onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"><source src="/best-angular-2-data-grid/sorting.mp4" type="video/mp4">Your browser does not support the video tag.</video>
                    <br><br>
                    <p class="lead-description">
                        Instead of long scrolling, you can configure the grid to display paging controls that allow the users to jump to a specific page of the data set
                    </p>
                </div>
            </div>
        </div>
    </div>
    <p class="lead-description">
        ag-Grid and its Angular grid component are distributed as NPM packages, which means they’ll work with any common Angular project bundler setup.
    </p>
    <div class="row">
        <div class="col">
            <hr>
            <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-angular" target="_blank">Github</a>
            <hr>
        </div>
        <div class="col">
            <hr>
            <a href="https://www.npmjs.com/package/ag-grid-angular" target="_blank">npm</a>
            <hr>
        </div>
    </div>
    <br>
    <div class="enterprise">
        <p class="versions">
            ag-Grid Enterprise
            </h3>
            <hr>
            <p class="lead-description">
                <strong>Powerful, advanced features designed for Enterprise Applications.</strong>
                <br>
                The grid was specifically designed to handle enterprise level feature requirements and  data volumes.
                <br>
                ag-Grid Angular Enterprise ships with the following:
            </p>
            <hr>
            <div class="row" id="core-features">
                <div class="col">
                    <p class="lead-description">Aggregation<br>
                    Pivoting</p>
                </div>
                <div class="col">
                    <p class="lead-description">Grouping<br>
                    Range Selection</p>
                </div>
                <div class="col">
                    <p class="lead-description">Tree Data<br>
                    Clipboard</p>
                </div>
                <div class="col">
                    <p class="lead-description">Excel Export<br>
                    Master / Detail</p>
                </div>
            </div>
            <div class="container">
                <div class="row">
                    <div class="col">
                        <p class="lead-description"><strong>Aggregation</strong></p>
                    <video onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"><source src="/best-angular-2-data-grid/grouping-aggregation.mp4" type="video/mp4" class="features">Your browser does not support the video tag.</video>
                    <br><br>
                    <p class="lead-description">
                        Let your users explore their data. ag-Grid allows the end user to group by specific columns. Optionally, you can display various aggregate column values in the grouped row.
                    </p>
                </div>
                <div class="col">
                    <p class="lead-description"><strong>Tree Data</strong></p>
                <video onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"><source src="/best-angular-2-data-grid/tree-data.mp4" type="video/mp4" class="features">Your browser does not support the video tag.</video>
                <br><br>
                <p class="lead-description">
                    You can easily display data has parent / child relationships by passing the relationship as part of the data. For example, a folder can contain zero or more files and other folders.
                </p>
            </div>
        </div>
    </div>
     <br>
    <div class="row">
        <div class="col">
            <hr>
            <a href="https://www.ag-grid.com/features-overview/" target="_blank"><button type="button" class="btn btn-primary">Features Overview</button></a>
            <hr>
        </div>
        <div class="col">
            <hr>
            <a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary">Get Started</button></a>
            <hr>
        </div>
    </div>
</div>
</div>
</div>
<section class="performance">
<h2>Delivers outstanding performance</h2>
<div class="container" id="performance">
<div class="description">
    <h4>It's ridiculously fast</h4>
    <p>
        Our Angular Grid component is built to deal with large data sets.
        Designed to deliver the performance required by modern day
        enterprise applications.
        The grid can process over <strong>100,000 updates per second</strong> and performs smoothly with
        <strong>millions</strong> of records.
        <br><br>
        Save work and development time with the best and fastest Angular Grid.
    </p>
    <h4>And we don't stop there</h4>
    <p>
        We understand the modern need for speed, so we constantly
        working to combine the latest browsers advances and
        cutting-edge algorithms in our grid to justify the reputation of the best Angular datagrid in the
        world.
    </p>
</div>
<div class="grid-example">
    <p class="lead-description">Stress-test our Angular grid with
        <span class="underlined">100 000</span>
    records and 20 columns</p>
    <div class="grid-container ag-theme-balham"></div>
    <br>
    <p style="text-align: center;">
        *<strong>Angular Grid Example Demo</strong>*
    </p>
</div>
</div>
<div class="row">
<div class="col">
    <hr>
    <a href="https://www.ag-grid.com/example.php#/" target="_blank"><button type="button" class="btn btn-primary">Stress Test Demo</button></a>
    <hr>
</div>
<div class="col">
    <hr>
    <a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary">Get Started</button></a>
    <hr>
</div>
</div>
</section>
<section class="api">
<h2>Easy to integrate and customize</h2>
<hr>
<p class="lead-description">
Easy to deeply customize many areas of our Angular Grid component.<br>
Waste no time in integrating ag-Grid Angular into your Web Application.</p>
<hr>
<br>
<div class="container" id="dev-api">
<div class="grid-example">
    <h4>Click operation on right and see the API in action</h4>
    <div class="grid-container ag-theme-balham-dark"></div>
</div>
<div class="api-methods-container">
    <div class="api-code">
    <pre></pre>
</div>
<div>
    <img alt="Prompt to click on API links" src="./assets/images/prompt-to-click-on-api-links.png">
    <ul class="api-operations">
        <li data-action="sort-by-one-column"><a>Sort by one column (Country)</a></li>
        <li data-action="sort-by-two-columns"><a>Sort by two columns (Country & Year)</a></li>
        <li data-action="clear-sorting"><a>Clear sorting</a></li>
    </ul>
    <ul class="api-operations">
        <li data-action="set-filter-by-one-column"><a>Filter by one column (Great Britain)</a></li>
        <li data-action="remove-filter"><a>Clear filtering</a></li>
    </ul>
    <ul class="api-operations">
        <li data-action="group-by-three-columns">
            <a>Group by three columns (Country, Year & Sport)</a>
        </li>
        <li data-action="expand-top-level-rows"><a>Expand top level rows</a></li>
        <li data-action="collapse-top-level-rows"><a>Collapse top level rows</a></li>
        <li data-action="remove-grouping"><a>Remove grouping</a></li>
    </ul>
    <ul class="api-operations">
        <li data-action="set-row-height"><a>Set row height</a></li>
        <li data-action="reset-row-height"><a>Reset row height to default</a></li>
    </ul>
</div>
</div>
</div>
<div class="row">
<div class="col">
<hr>
<a href="https://www.ag-grid.com/javascript-grid-api/" target="_blank"><button type="button" class="btn btn-primary">Grid API</button></a>
<hr>
</div>
<div class="col">
<hr>
<a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary">Get Started</button></a>
<hr>
</div>
</div>
</section>


<div class="container">
<h2>
Customize Angular Grid
</h2>
<br>
<hr>
<p class="lead">
Everything is a customizable component in ag-Grid Angular<br>
</p>
<hr>
<p class="lead-description">
We believe developers should be able to easily extend default functionality to meet their business requirements.<br>
That’s why most of the functionality of our Angular grid is already component based.<br>
You can easily extend the default functionality by creating your custom Angular components and integrating them into the grid.
</p>
<br>
<div class="container">
<div class="row" id="feature-performance">
<div class="col-sm">
    <p class="lead">Custom Cell Renderer</p><hr>
    <p class="lead-description">
        If you want more complex HTML inside the cell or need to customise the value before it’s rendered, you can do it with a custom cell renderer.
    </p>
    <img src="/images/customise/cell-renderer.png" alt="angular-cell-renderer" class="center zoom">
</div>
<div class="col-sm">
    <p class="lead">Custom Cell Editor</p><hr>
    <p class="lead-description">
        Our Angular grid also provides rich inline editing experience so your users can update any record in a dataset with just a few clicks.
    </p>
    <img src="/images/customise/cell-editor.png" alt="angular-cell-editor" class="center zoom">
</div>
<div class="col-sm">
    <p class="lead">Custom Column Filter</p><hr>
    <p class="lead-description">
        Filtering is one of the most useful features of data grids. It allows users to zoom in on a particular set of records. We provide a simple string filtering out of the box.
    </p>
    <img src="/images/customise/custom-filter.png" alt="angular-custom-filter" class="center zoom">
</div>
</div>
<div class="row">
<div class="col">
    <hr>
    <a href="https://blog.ag-grid.com/learn-to-customize-angular-grid-in-less-than-10-minutes/" target="_blank"><button type="button" class="btn btn-primary">Customize Angular Grid Blog</button></a>
    <hr>
</div>
<div class="col">
    <hr>
    <a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary">Get Started</button></a>
    <hr>
</div>
</div>
<br>
</div>
</div>
<div>
<h2>
Angular Responsive Grid Layout
</h2>
<hr>
<p class="lead-description">
</p>
<hr>
<div class="container" id="layout-theme">
<div class="row">
<div class="col">
    <h3>
    Data Grid Layout
    </h3>
    <hr>
    <p class="lead-description">
        ag-Grid Angular dynamically reacts to screen changes by making use of the grid API features.<br>
    </p>
</div>
<div class="col">
    <h3>
    Themes
    </h3>
    <hr>
    <p class="lead-description">
        ag-Grid has 7 themes available straight out of the box.<br>
        Including the popular bootstrap grid layout theme and material design theme.
    </p>
</div>
</div>
<div class="row" id="images">
<div class="col">
    <img src="/images/themes/material.png" alt="ag-grid-material-theme" class="center2 zoom">
    <img src="/images/themes/bootstrap.png" alt="ag-grid-bootstrap-theme" class="center2 zoom">
    <br>
    <img src="/images/themes/balham.png" alt="ag-grid-balham-theme" class="center2 zoom">
    <img src="/images/themes/balham-dark.png" alt="ag-grid-balham-dark-theme" class="center2 zoom">
    <div class="row">
        <div class="col">
            <hr>
            <a href="https://www.ag-grid.com/javascript-grid-responsiveness/" target="_blank"><button type="button" class="btn btn-primary">Responsive Grid</button></a>
            <hr>
        </div>
        <div class="col">
            <hr>
            <a href="https://www.ag-grid.com/javascript-grid-styling/" target="_blank"><button type="button" class="btn btn-primary">ag-Grid Themes</button></a>
            <hr>
        </div>
        <div class="col">
            <hr>
            <a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary">Get Started</button></a>
            <hr>
        </div>
    </div>
</div>
</div>
</div>
<h2>Angular Grid Resources</h2>
<div class="container" id="resources">
<div class="row">
<div class="col">
    <h3>
        Documentation<hr>
    </h3>
    <img class="icons" alt="ag-grid-docs" src="/images/icons/docs.svg">
    <p class="lead-description">
        Save time up front by using our detailed documentation with live demos and evaluate the Grid’s functionality without having to build it in to your product.
    </p>
</div>

<div class="col">
    <h3>
        Angular Grid Demo<hr>
    </h3>
    <img class="icons" alt="ag-grid-demo" src="/images/icons/demo.svg">
    <p class="lead-description">
        Test our Angular Grid component's core and enterprise features ranging from sorting, filtering, paging, grouping and ability to handle large data sets with our Kitchen Sink demo.
</div>


<div class="col">
    <h3>
        Features<hr>
    </h3>
    <img class="icons" alt="ag-grid-features" src="/images/icons/features.svg">
    <p class="lead-description">
        Most fully featured Angular grid on the market.
        Run through our core and enterprise features, designed to match all your needs. Filter, Sort, Group on Large Data Sets.
    </p>
</div>
</div>
<div class="row">
    <div class="col">
        <a href="https://www.ag-grid.com/documentation-main/documentation.php"><p>
            ag-Grid Angular Documentation
        </p></a>
    </div>
        <div class="col">
            <a href="https://www.ag-grid.com/example.php#/"> <p>
                Kitchen Sink Demo
            </p></a>
        </div>
            <div class="col">
                <a href="https://www.ag-grid.com/features-overview/"><p>
                    View all Features
                </p></a>
            </div>
        </div>
</div>
<br>
<div class="container" id="guides">
<h3>
    ag-Grid Angular Guides
    <hr>
</h3>
<br>
<p class="lead">
    Head over to the Angular guides section for more in-depth information about the Angular flavor of ag-Grid.
</p>
<div class="row">
    <div class="col">
        <a href="https://www.ag-grid.com/angular-more-details/"><p class="lead-description">
            ag-Grid Angular Overview
        </p></a>
        <img class="icons" alt="ag-grid-angular-overview" src="/images/icons/overview.svg">
        <p class="lead-description">
            Every feature of ag-Grid is available when using the ag-Grid Angular Component. The Angular Component wraps the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and Angular ag-Grid when it comes to features.
        </p>
    </div>
        <div class="col">
            <a href="https://www.ag-grid.com/angular-getting-started/"> <p class="lead-description">
                Getting started with Angular Grid[Guide]
            </p></a>
            <img class="icons" alt="ag-grid-angular-guide" src="/images/icons/guide.svg">
            <p class="lead-description">
                In this article, we will walk you through the necessary steps to add ag-Grid to an existing Angular project, and configure some of the essential features of it.
            </p>
        </div>
            <div class="col">
                <a href="https://blog.ag-grid.com/tag/angular/"><p class="lead-description">
                    ag-Grid Angular[Blog]
                </p></a>
                <img class="icons" alt="ag-grid-angular-blog" src="/images/icons/blog.svg">
                <p class="lead-description">
                    Browse all our Angular and Angular Grid related blogs, ranging from depthful content to guides and tutorials surrounding ag-Grid Angular and general Angular content.
                </p>
            </div>
        </div>
</div>
<br>
<div id="end-c2a">
<div class="row">
<div class="col-md-6" align="text-center">
    <p class="closing-c2a">Trusted by the Community
        <br>
        <p class="closing-lead">
            <strong>2M Downloads
            <br>
            200,000 Downloads Per Month
            </strong>
        </p>
    </div>
    <div class="col-md-6">
        <p class="closing-c2a">Built for the Enterprise</p>
        <p class="closing-lead"><strong>Over 1,500 Companies use ag-Grid Enterprise
            <br>
            Over 25% of FT-500 Companies use ag-Grid Enterprise</strong>
        </p>
    </div>
</div>
<p class="lead-description">
    <strong>Join the <strong>millions of developers</strong> and <strong>thousands of companies</strong> who use ag-Grid.<br> Ready to give it a try?</strong>
</p>
<a href="https://www.ag-grid.com/angular-getting-started/" target="_blank"><button type="button" class="btn btn-primary btn-lg btn-block">Get Started</button></a>
</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<?php include '../landing-pages/footer.php'; ?>
