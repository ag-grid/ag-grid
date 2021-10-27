<?php
require_once "includes/html-helpers.php";
define('HOMEPAGE', true);
gtm_data_layer('home');
// variable necessary in navbar.php
$version = 'latest';
?>
<!DOCTYPE html>
<html class="stretch-html" lang="en">
<head>
    <?php
    $title = 'AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid';
    $description = 'AG Grid is a feature rich datagrid designed for the major JavaScript Frameworks. Version 25 is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source, or take a 2 month trial of AG Grid Enterprise.';
    global $keywords;
    meta_and_links($title, $keywords, $description, "", false);
    ?>

    <?= globalAgGridScript(true) ?>

    <link rel="stylesheet" href="dist/homepage.css"/>

</head>

<body>
<!-- Google Tag Manager (noscript) -->
<noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T7JG534" height="0" width="0"
            style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->

<header id="nav" class="compact">
    <?php include 'includes/navbar.php' ?>
</header>
<div class="page-content">
    <div class="stage-scenarios main">
        <h1 class="heading-scenarios">The Best JavaScript Grid in the World</h1>
        <section>
            <div class="demo">
                <div id="bestHtml5Grid" class="ag-theme-material"></div>
            </div>
        </section>
    </div>

    <style>

    </style>
    <div id="stage-frameworks">
        <section id="section-frameworks">
            <div>
                <h2>Get Started</h2>
            </div>
            <div class="framework-boxes">
                <div class="framework-box">
                    <div class="box-shadow">
                        <a href="/javascript-grid/" style="text-decoration: none;">
                            <div class="box-contents">
                                <img src="./_assets/fw-logos/javascript.svg" alt="JavaScript">
                                <div>
                                    <h3>JavaScript</h3>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="framework-box">
                    <div class="box-shadow">
                        <a href="/angular-grid/" style="text-decoration: none;">
                            <div class="box-contents">
                                <img src="./_assets/fw-logos/angular.svg" alt="Angular">
                                <div>
                                    <h3>Angular</h3>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="framework-box">
                    <div class="box-shadow">
                        <a href="/react-grid/" style="text-decoration: none;">
                            <div class="box-contents">
                                <img src="./_assets/fw-logos/react.svg" alt="React">
                                <div>
                                    <h3>React</h3>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="framework-box">
                    <div class="box-shadow">
                        <a href="/vue-grid/" style="text-decoration: none;">
                            <div class="box-contents">
                                <img src="./_assets/fw-logos/vue.svg" alt="Vue">
                                <div>
                                    <h3>Vue</h3>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <div id="stage-description">
        <section>
            <div>
                <h3>Feature Packed</h3>
                <p>
                    The performance, feature set and quality of AG Grid has not been seen before in a
                    JavaScript datagrid. Many features in AG Grid are unique to AG Grid, and simply put
                    AG Grid into a class of its own, without compromising on quality or performance.
                </p>
            </div>
            <div>
                <h3>Industry Leading</h3>
                <p>
                    Over 600,000 monthly downloads of AG Grid Community and over 50% of the Fortune 500
                    using AG Grid Enterprise. AG Grid has become the JavaScript datagrid of choice for Enterprise
                    JavaScript developers.
                </p>
            </div>
            <div>
                <h3>Community & Enterprise</h3>
                <p>
                    AG Grid Community is free and open-sourced under the MIT license. AG Grid Enterprise comes with
                    dedicated support and more enterprise style features. AG Grid gives for free what other grids
                    charge for, then provides AG Grid Enterprise where it goes above and beyond the competition.
                </p>
            </div>
        </section>
    </div>

    <div class="stage-scenarios">
        <h2 class="heading-scenarios">Live Streaming Updates</h2>

        <section>
            <div class="demo" id="demo-2" data-load="home/demo-2.php">
                <div class="loading">
                    <p>Loading Demo...</p>
                </div>
                <div class="view-code">
                    &nbsp;
                </div>
            </div>
        </section>
    </div>

    <div class="stage-scenarios">
        <h2 class="heading-scenarios">Integrated Charting</h2>

        <section>
            <div class="demo" id="demo-2" data-load="home/demo-3.php">
                <div class="loading">
                    <p>Loading Demo...</p>
                </div>
                <div class="view-code">
                    &nbsp;
                </div>
            </div>
        </section>
    </div>

    <div id="stage-sponsorships">
        <section id="sponsorships">
            <div>
                <h2>Supporting Open Source</h2>
                <h3>We are proud to sponsor the tools we use and love.</h3>
            </div>

            <div>
                <div class="media">
                    <img src="_assets/fw-logos/webpack.svg" alt="Webpack"/>
                    <div class="media-body">
                        <h3>Webpack</h3>
                        <p><a href="https://medium.com/webpack/ag-grid-partners-with-webpack-24f8cf9d890b">Read about our Partnership with webpack.</a></p>
                    </div>
                </div>

                <div class="media">
                    <img src="_assets/fw-logos/plunker.svg" alt="Plunker"/>
                    <div class="media-body">
                        <h3>Plunker</h3>
                        <p><a href="https://medium.com/ag-grid/plunker-is-now-backed-by-ag-grid-601c17440fca">Read about our Backing of Plunker.</a></p>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <script src="dist/homepage.js"></script>
    <script src="example-rich-grid/data.js"></script>
    <script src="example-rich-grid/example.js"></script>

    <?php include 'includes/footer.php' ?>
</div>
</body>
</html>
