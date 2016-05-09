
<!DOCTYPE html>
<html style="height: 100%">
    <head lang="en">
    <meta charset="UTF-8">
        <title>ag-Grid - Enterprise Javascript Data Grid</title>
        <meta name="description" content="Enterprise Javascript data grid that's feature rich, blazing fast and with a brilliant API. Supports Plain Javascript, React, AngularJS 1 & 2 and Web Components.">
        <meta name="keywords" content="javascript data grid react angularjs angular 2 web components"/>
        <meta property="og:image" content="https://www.ag-grid.com/images/ag-Grid2-200.png"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link inline rel="stylesheet" href="dist/bootstrap/css/bootstrap.css">
        <link inline rel="stylesheet" type="text/css" href="style.css">
        <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />
        <?php include 'includes/meta.php'; ?>
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

                        <h1 style="padding-bottom: 10px; padding-top: 10px;">The Data Grid for Enterprise</h1>
<!--                        <h2>'ag' stands for Agnostic - not bound to any framework but integrates with <a href="/best-javascript-data-grid/index.php">JavaScript</a>, <a href="/best-react-data-grid/index.php">React</a>, <a href="/best-angularjs-data-grid/index.php">Angular</a>, <a href="/best-angular-2-data-grid/index.php">Angular 2</a> &amp; <a href="/best-web-component-data-grid/index.php">Web Components</a>.</h2>
-->

                        <h2>
                            <a class="btn btn-primary btn-large" href="/javascript-grid-getting-started/index.php">
                                <?php include 'images/download.svg'; ?>
                                Download
                            </a>
                        </h2>
                        <div class="Hero-share">
                            <a class='share-link' href="https://www.facebook.com/sharer/sharer.php?u=www.ag-grid.com" alt="Share ag-Grid on Facebook" title="Share ag-Grid on Facebook">
                                <?php include 'images/social-icons/facebook-logo-hacked.svg'; ?>
                            </a>
                            <a class='share-link' href="https://twitter.com/home?status=http://www.ag-Grid.com,%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers%20%23aggrid%20" alt="Share ag-Grid on Twitter" title="Share ag-Grid on Twitter">
                                <?php include 'images/social-icons/twitter-social-logotype-hacked.svg'; ?>
                            </a>
                            <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com" alt="Share ag-Grid on Google Plus" title="Share ag-Grid on Google Plus">
                                <?php include 'images/social-icons/google-plus-social-logotype-hacked.svg'; ?>
                            </a>
                            <a class='share-link' href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers&source=" alt="Share ag-Grid on LinkedIn" title="Share ag-Grid on LinkedIn">
                                <?php include 'images/social-icons/linkedin-logo-hacked.svg'; ?>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <?php include 'home/intro.php'; ?>

        <?php include 'home/testimonials-1.php'; ?>

        <?php include 'home/demo-1.php'; ?>

        <?php include 'home/testimonials-2.php'; ?>

        <?php include 'home/demo-2.php'; ?>

        <?php include 'home/features.php'; ?>

        <?php include 'home/free_vs_enterprise.php'; ?>

        <?php $navKey = "home"; include './includes/footer.php'; ?>

    </body>
</html>

<script inline src="dist/ag-grid-enterprise.js"></script>

<link inline href="example-file-browser/fileBrowser.css" rel="stylesheet">
<link inline href="best-angularjs-data-grid/basic.css" rel="stylesheet">
<link inline href="example-account-report/account.css" rel="stylesheet">
<link inline href="javascript-grid-viewport/exampleViewport.css" rel="stylesheet">

<script inline src="best-javascript-data-grid/html5grid.js"></script>
<script inline src="example-account-report/account.js"></script>
<script inline src="example-file-browser/fileBrowser.js"></script>
<script inline src="javascript-grid-viewport/mockServer.js"></script>
<script inline src="javascript-grid-viewport/exampleViewport.js"></script>

<?php include_once("includes/analytics.php"); ?>