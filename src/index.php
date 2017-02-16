
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
                        </h1>

                        <h1 style="padding-bottom: 10px; padding-top: 10px;">The JavaScript Datagrid for Enterprise</h1>

                        <h2>
                            <a class="btn btn-primary btn-large" href="/javascript-grid-getting-started/">
                                Use Free Version
                            </a>
                            <a class="btn btn-primary btn-large" href="/start-trial.php">
                                Trial Enterprise Version
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

<script inline src="dist/ag-grid-enterprise/ag-grid-enterprise.js"></script>

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

    </body>
</html>