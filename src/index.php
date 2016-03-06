<!DOCTYPE html>
<html style="height: 100%">
    <head lang="en">
    <meta charset="UTF-8">
        <title>ag-Grid - Enterprise Javascript Data Grid</title>
        <meta name="description"
              content=
              "Enterprise Javascript data grid that's feature rich, blazing fast and with a brilliant API. Supports Plain Javascript, React, AngularJS 1 & 2 and Web Components.">
        <meta name="keywords" content="javascript data grid react angularjs angular 2 web components"/>
        <meta property="og:image" content="https://www.ag-grid.com/images/ag-Grid2-200.png"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link inline rel="stylesheet" href="dist/bootstrap.css">
        <link inline rel="stylesheet" href="dist/bootstrap-theme.css">
        <link inline rel="stylesheet" href="dist/font-awesome/css/font-awesome.css">
<!--        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.css" rel="stylesheet">-->
        <link inline rel="stylesheet" type="text/css" href="style.css">

        <script inline src="dist/ag-grid-enterprise.js"></script>

        <link inline href="example-file-browser/fileBrowser.css" rel="stylesheet">
        <link inline href="best-angularjs-data-grid/basic.css" rel="stylesheet">
        <link inline href="example-account-report/account.css" rel="stylesheet">

        <script inline src="best-javascript-data-grid/html5grid.js"></script>
        <script inline src="example-account-report/account.js"></script>
        <script inline src="example-file-browser/fileBrowser.js"></script>

        <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

        <!-- For example datagrid, should reuse whats in the example -->
        <style>
            .div-percent-bar { display: inline-block;  height: 100%; position: relative; }
            .div-percent-value { position: absolute; z-index: 1; padding-left: 4px; font-weight: bold; font-size: 13px; }
            .div-outer-div { display: inline-block; height: 100%; width: 100%; }
        </style>

    </head>

    <body class="big-text">

        <?php $navKey = "home"; include 'navbar.php'; ?>

        <div class="header-row index-header-row">
            <div class="container">

                <div class="row">
                    <div class="col-md-6" style="text-align: center;">

                        <div style="padding-top: 20px; padding-bottom: 20px;">
                            <span style="font-size: 90px; font-weight: bold; font-family: Impact, Charcoal, sans-serif; display: block;">
                                <span style="color: #b00000; ">ag</span>-Grid
                            </span>
                        </div>

                    </div>
                    <div class="col-md-6" style="text-align: center; font-style: italic;">

                        <h2 style="font-weight: bold; margin-top: 50px;">
                            JavaScript Data Grid
                        </h2>
                        <div style="font-size: 16px;">
                            Built for Enterprise
                        </div>
                    </div>

                </div>

            </div>

        </div>

        <div class="container">
            <div class="row" style="text-align: center; padding-top: 80px;">
                <div class="col-md-2"></div>
                <div class="col-md-8">
                    <div style="font-style: italic; margin-left: 20px; margin-right: 20px;">
                        ag-Grid is a Javascript data grid for building professional
                        applications.
                        Your user's experience depends on your choice of data grid.
                        Allow your users an enterprise experience, give them ag-Grid.
<!--                        "ag-Grid is an Enterprise Grade Javascript Data Grid.
                        The purpose of ag-Grid is to provide a data grid that enterprise
                        software can use for building applications such as
                        reporting and data analytics, business workflow and data entry.
                        Having spent years building applications in C++, Java and Javascript
                        I found the choice of grids in JavaScript lacking, especially in
                        comparison to what I was used to in other languages. ag-Grid is
                        the result of turning my frustration into answers,
                        providing a grid worthy of enterprise development."
-->                    </div>
<!--                    <div style="margin-top: 10px;">
                        Niall Crosby, ag-Grid Creator
                    </div>
-->
                </div>
                <div class="col-md-2"></div>
            </div>

            <div class="horizontal-rule">
                <hr/>
            </div>

            <div class="row" style="margin-top: 20px;">
                <div class="col-md-3" style="text-align: center;">
                    Choosing a JavaScript data grid component and choosing a JavaScript framework should be separate choices.
                    'ag' stands for <b>Ag</b>nostic - ag-Grid is not bound to any framework
                </div>

                <div class="col-md-9">
                    <div style="row">
                        <div class="col-md-1" style="text-align: center;">
                        </div>
                        <div class="col-md-2" style="text-align: center;">
                            <a href="/best-javascript-data-grid/index.php">
                                <div>
                                    <img style="height: 100px;" src="images/javascript_large.png" alt="Best Javascript Data Grid" title="Best Javascript Data Grid"/>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-2" style="text-align: center;">
                            <a href="/best-react-data-grid/index.php">
                                <div>
                                    <img style="height: 100px;" src="images/react_large.png" alt="Best React Data Grid" title="Best React Data Grid"/>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-2" style="text-align: center;">
                            <a href="/best-angularjs-data-grid/index.php">
                                <div>
                                    <img style="height: 100px;" src="images/angularjs_large.png" alt="Best AngularJS Data Grid" title="Best AngularJS Data Grid"/>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-2" style="text-align: center;">
                            <a href="/best-angular-2-data-grid/index.php">
                                <div>
                                    <img style="height: 100px;" src="images/angular2_large.png" alt="Best Angular 2 Data Grid" title="Best Angular 2 Data Grid"/>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-2" style="text-align: center;">
                            <a href="/best-web-component-data-grid/index.php" alt="Best Web Component Data Grid" title="Best Web Component Data Grid">
                                <div>
                                    <img style="height: 100px;" src="images/webComponents_large.png"/>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <div class="horizontal-rule">
                <hr/>
            </div>

            <div class="row">
                <div class="col-md-12">

                    <h4 style="padding-bottom: 30px; text-align: center;">
                        ag-Grid has every grid feature under the sun
                    </h4>

                    <ul class="diamond-separated-list">

                        <li>Column Pinning Left & Right</li>
                        <li>Column Resizing</li>
                        <li>Column Auto-Size to Fit Contents</li>
                        <li>Variable Row Height</li>
                        <li>Tree Data</li>
                        <li>Data CSV Export</li>
                        <li>In Grid Sorting</li>
                        <li>Server Side Sorting</li>
                        <li>In Grid Filtering</li>
                        <li>Server Side Filtering</li>
                        <li>Data Editing</li>
                        <li>Keyboard Navigation</li>
                        <li>Quick Search</li>
                        <li>Column Grouping</li>
                        <li>Row Selection</li>
                        <li>Checkbox Selection</li>
                        <li>Grid Data Context</li>
                        <li>Value Getters</li>
                        <li>Expressions</li>
                        <li>Cell Styling</li>
                        <li>CSS Themes</li>
                        <li>Custom Rendering</li>
                        <li>Frozen / Floating Rows</li>
                        <li>Multi Level Header Grouping</li>
                        <li>Header Templates</li>
                        <li>Events</li>
                        <li>Internationalisation</li>
                        <li>Cross Browser</li>
                        <li>Printable</li>
                        <li>Grid API</li>
                        <li>Sorting API</li>
                        <li>Filtering API</li>
                        <li>Column API</li>
                        <li>Pagination</li>
                        <li>Infinite Scrolling</li>
                        <li>Floating Footers</li>
                        <li>Master / Slave</li>

                        <li>Cell Range Selection</li>
                        <li>Grouping and Aggregation of Data</li>
                        <li>Excel-like Filtering</li>
                        <li>Advanced Column Menu</li>
                        <li>Context Menu</li>
                        <li>Clipboard Copy & Paste</li>
                        <li>Tool Panel for Column Management</li>
                    </ul>

                </div>
            </div>

            <div class="horizontal-rule">
                <hr/>
            </div>

            <h4 style="padding-bottom: 30px; text-align: center;">
                Using the default look and feel, get a feature rich grid with minimal coding.
            </h4>

            <div class="row hide-when-small" style="padding: 30px;">
                <div class="col-md-12">
                    <div style="padding: 4px;">
                        <div style="width: 40%; display: inline-block;">
                            <input type="text" id="quickFilterInput" placeholder="Type text to filter..."/>
                        </div>
                        <div style="width: 40%; display: inline-block; padding: 4px;">
                            Example Dataset Showing <span id="rowCount"></span> rows(s)
                        </div>
                    </div>
                    <div style="width: 100%; height: 400px;"
                         id="bestHtml5Grid"
                         class="ag-fresh ag-basic">
                    </div>
                </div>
                <div class="col-md-12">
                    <span style="float: right;"><a href="./best-javascript-data-grid/">(view code)</a></span>
                </div>
            </div>

            <div class="horizontal-rule">
                <hr/>
            </div>

            <h4 style="padding-bottom: 30px; text-align: center;">
                Bake your own look and feel to get differently styled grids
            </h4>

            <div class="row hide-when-small" style="padding: 30px">

                <div class="col-md-9">
                    <div id="exampleAccountGrid" class="ag-account" style="display: inline-block; padding: 4px;">
                    </div>
                    <span style="float: right; position: relative; top: 20px; left: -20px;"><a href="./example-account-report/">(view code)</a></span>
                </div>
                <div class="col-md-3">
                    <div style="margin-top: 50px; padding-left: 20px;">
                        Give a custom style for grids that will end up as presentations.
                    </div>
                </div>

            </div>

            <div class="container">

                <div class="row" style="padding: 30px">

                    <div class="col-md-3">
                        <div style="margin-top: 50px">
                            Customise the look and feels and create complex widgets, beyond what's expected of HTML tables.
                        </div>
                    </div>

                    <div class="col-md-9 hide-when-small">
                        <div style="border: 1px solid darkgrey;
                                width: 800px;
                                background-color: lightgrey;
                                border-radius: 5px;
                                padding: 3px;">
                            <div style="border: 1px solid darkgrey; padding-left: 10px; margin-bottom: 2px; background-color: white;" id="selectedFile">Select a file below...</div>
                            <div style="width: 100%; height: 400px;"
                                 id="exampleFileBrowser"
                                 class="ag-file-browser">
                            </div>
                            <span style="float: right; position: relative; top: 10px;"><a href="./example-file-browser/">(view code)</a></span>
                        </div>
                    </div>

                </div>

            </div>

            <hr>

            <footer class="license">
                © ag-Grid Ltd 2015-2016
            </footer>
        </div>

        </div>
    </body>
</html>

<?php include_once("analytics.php"); ?>
