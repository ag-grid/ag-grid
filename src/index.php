<?php
require "example-runner/utils.php"
?>
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>JavaScript Grid</title>
    <meta name="description"
          content="A feature rich datagrid designed for Enterprise. Easily integrate with your framework to deliver filtering, grouping, aggregation, pivoting and much more.">
    <meta name="keywords" content="javascript data grid react angularjs angular 2 web components aurelia"/>
    <meta property="og:image" content="https://www.ag-grid.com/images/ag-Grid2-200.png"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>
    <link inline href="dist/bootstrap/css/bootstrap.css" rel="stylesheet">
    <link inline href="style.css" rel="stylesheet">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
    <?php include 'includes/meta.php'; ?>

    <style>

    </style>

</head>

<body class="big-text">

<?php $navKey = "home";
include 'includes/navbar.php'; ?>

<div class="Hero">
    <div class="Hero-grid">
        <div class="container">
            <div class="row text-center">
                <div class="col-md-4">
                    <h1 style="" class="big-logo">
                        <?php include 'images/logo-dark-hacked.svg'; ?>
                    </h1>
                </div>
                <div class="col-md-8">
                    <h1 style="padding-top: 100px;">The Best HTML 5 Grid In The World</h1>
                </div>
            </div>
        </div>

        <!--
                        <div class="container">
                            <div class="row text-center">

                                <h1 style="padding-bottom: 10px; padding-top: 10px;">The Best Grid In The World</h1>

                            </div>
                        </div>
        -->
        <div class="container">
            <div class="row text-center">
                <div class="col-md-4 info-item">
                    Over <span class="info-item-big">800 Companies</span><br/>
                    use <b>ag-Grid Enterprise</b>.
                </div>
                <div class="col-md-4 info-item">
                    Over <span class="info-item-big">15%</span> of the
                    <span class="info-item-big">Fortune 500</span><br/>
                    use <b>ag-Grid Enterprise</b>.
                </div>
                <div class="col-md-4 info-item">
                    Over <span class="info-item-big">110,000 Downloads</span>
                    per month.
                </div>
            </div>
        </div>
        <div class="container">
            <div class="row text-center">

                <h2>
                    <a class="btn btn-primary btn-large" href="/javascript-grid-getting-started/">
                        Use Free Version
                    </a>
                    <a class="btn btn-primary btn-large" href="/start-trial.php">
                        Trial Enterprise Version
                    </a>
                </h2>

            </div>
        </div>
        <div class="container">
            <div class="row text-center">
                <div class="Hero-share">
                    <a class='share-link' href="https://www.facebook.com/sharer/sharer.php?u=www.ag-grid.com"
                       alt="Share ag-Grid on Facebook" title="Share ag-Grid on Facebook">
                        <?php include 'images/social-icons/facebook-logo-hacked.svg'; ?>
                    </a>
                    <a class='share-link'
                       href="https://twitter.com/home?status=http://www.ag-Grid.com,%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers%20%23aggrid%20"
                       alt="Share ag-Grid on Twitter" title="Share ag-Grid on Twitter">
                        <?php include 'images/social-icons/twitter-social-logotype-hacked.svg'; ?>
                    </a>
                    <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com"
                       alt="Share ag-Grid on Google Plus" title="Share ag-Grid on Google Plus">
                        <?php include 'images/social-icons/google-plus-social-logotype-hacked.svg'; ?>
                    </a>
                    <a class='share-link'
                       href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers&source="
                       alt="Share ag-Grid on LinkedIn" title="Share ag-Grid on LinkedIn">
                        <?php include 'images/social-icons/linkedin-logo-hacked.svg'; ?>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

<div class="HomeSectionParent">

<!--    --><?php //include 'home/frameworks.php'; ?>
<!---->
<!--    --><?php //include 'home/demo-1.php'; ?>
<!---->
<!--    --><?php //include 'home/intro2.php'; ?>

    <!--            --><?php //include 'home/demo-3.php'; ?>

<!--    --><?php //include 'home/demo-4.php'; ?>

<!--    --><?php //include 'home/testimonials-1.php'; ?>

    <?php include 'home/demo-api.php'; ?>

<!--    --><?php //include 'home/testimonials-2.php'; ?>
<!---->
<!--    --><?php //include 'home/demo-2.php'; ?>
<!---->
<!--    --><?php //include 'home/features.php'; ?>

</div>
<script>
    $(function () {
        $('[data-toggle="popover"]').popover({
            trigger: 'focus'
        })
    });
</script>

<?php $navKey = "home";
include './includes/footer.php'; ?>

<?= globalAgGridScript(true) ?>

<link inline href="example-file-browser/fileBrowser.css" rel="stylesheet">
<link inline href="best-angularjs-data-grid/basic.css" rel="stylesheet">
<!--<link inline href="example-account-report/account.css" rel="stylesheet">-->

<script inline src="example-rich-grid/data.js"></script>
<script inline src="example-rich-grid/example.js"></script>
<!--<script inline src="example-account-report/account.js"></script>-->
<script inline src="example-file-browser/fileBrowser.js"></script>
<script inline src="javascript-grid-animation/animation/main.js"></script>
<!--<script inline src="home/example-themes.js"></script>-->

<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.9.1/d3.min.js"></script>
<script src="ag-grid-trader-dashboard/components/renderers/HorizontalBarComponent.js" ></script>
<script src="ag-grid-trader-dashboard/services/ExchangeService.js" ></script>
<script src="ag-grid-trader-dashboard/services/FxDataService.js" ></script>
<script src="ag-grid-trader-dashboard/components/StockHistoricalChart.js" ></script>
<script src="ag-grid-trader-dashboard/components/StockDetailPanel.js" ></script>
<script src="ag-grid-trader-dashboard/components/PriceChangesGrid.js" ></script>
<script src="ag-grid-trader-dashboard/components/FxQuoteMatrix.js" ></script>
<script src="ag-grid-trader-dashboard/components/TopMoversGrid.js" ></script>
<script src="ag-grid-trader-dashboard/dashboard.js" ></script>

<?php include_once("includes/analytics.php"); ?>

</body>
</html>
