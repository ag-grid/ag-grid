
<!DOCTYPE html>
<html>
    <head lang="en">
    <meta charset="UTF-8">
        <title>Javascript Datagrid</title>
        <meta name="description" content="ag-Grid - The JavaScript Datagrid for Enterprise. Supporting Plain Javascript, React, AngularJS 1 & 2, Web Components and Aurelia.">
        <meta name="keywords" content="javascript data grid react angularjs angular 2 web components aurelia"/>
        <meta property="og:image" content="https://www.ag-grid.com/images/ag-Grid2-200.png"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />
        <link inline href="dist/bootstrap/css/bootstrap.css" rel="stylesheet" >
        <link inline href="style.css" rel="stylesheet" >
        <?php include 'includes/meta.php'; ?>
        <!-- Hotjar Tracking Code for https://www.ag-grid.com/ -->
        <script>
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:372643,hjsv:5};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
        </script>
    </head>

    <body class="big-text">

        <?php $navKey = "home"; include 'includes/navbar.php'; ?>

        <div class="Hero">
            <div class="Hero-grid">
                <div class="container">
                    <div class="row text-center">
                        <h1 style="padding-bottom: 10px; padding-top: 10px;" class="big-logo">
                            <?php include 'images/logo-dark-hacked.svg'; ?>
<!--                            <img inline alt="ag-grid" src="images/logo.png" style="width: 400px;"/>-->
                        </h1>

                        <h1 style="padding-bottom: 10px; padding-top: 10px;">The JavaScript Datagrid for Enterprise</h1>
<!--                        <h2>'ag' stands for Agnostic - not bound to any framework but integrates with <a href="/best-javascript-data-grid/index.php">JavaScript</a>, <a href="/best-react-data-grid/index.php">React</a>, <a href="/best-angularjs-data-grid/index.php">Angular</a>, <a href="/best-angular-2-data-grid/index.php">Angular 2</a> &amp; <a href="/best-web-component-data-grid/index.php">Web Components</a>.</h2>
-->

                        <h2>
                            <a class="btn btn-primary btn-large" href="mailto:accounts@ag-grid.com?Subject=ag-Grid%20Free 2 Month Trial">
                                Start Free Trial
                            </a>
                        </h2>

                        <h2>
                            <a class="btn btn-primary btn-large" href="/license-pricing.php/">
                                View Pricing
                            </a>
                        </h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="HomeSectionParent">

            <?php include 'home/intro.php'; ?>

            <?php include 'home/demo-1.php'; ?>

            <?php include 'home/intro2.php'; ?>

            <?php include 'home/frameworks.php'; ?>

            <?php include 'home/demo-3.php'; ?>

            <?php include 'home/testimonials-1.php'; ?>

            <?php include 'home/demo-api.php'; ?>

            <?php include 'home/testimonials-2.php'; ?>

            <?php include 'home/demo-2.php'; ?>

            <?php include 'home/features.php'; ?>

        </div>

        <?php $navKey = "home"; include './includes/footer.php'; ?>

    </body>
</html>

<script inline src="dist/ag-grid-enterprise.js"></script>

<link inline href="example-file-browser/fileBrowser.css" rel="stylesheet">
<link inline href="best-angularjs-data-grid/basic.css" rel="stylesheet">
<link inline href="example-account-report/account.css" rel="stylesheet">
<link inline href="javascript-grid-viewport/exampleViewport.css" rel="stylesheet">

<script inline src="best-javascript-data-grid/html5grid.js"></script>
<!--<script inline src="example-account-report/account.js"></script>-->
<script inline src="example-file-browser/fileBrowser.js"></script>
<script inline src="javascript-grid-viewport/mockServer.js"></script>
<script inline src="javascript-grid-viewport/exampleViewport.js"></script>
<script inline src="javascript-grid-animation/exampleAnimation.js"></script>
<!--<script inline src="home/example-themes.js"></script>-->

<?php include_once("includes/analytics.php"); ?>