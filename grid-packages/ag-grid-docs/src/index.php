<?php
require "example-runner/example-runners.php";
require "includes/html-helpers.php";
define('HOMEPAGE', true);
gtm_data_layer('home');
// variable necessary in navbar.php
$version = 'latest';
?>
<!DOCTYPE html>
<html class="stretch-html" lang="en">
<head>
<?php
$title = 'ag-Grid: High-Performance React Grid, Angular Grid, JavaScript Grid';
$description = 'ag-Grid is a feature rich datagrid designed for the major JavaScript Frameworks. Version 25 is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source, or take a 2 month trial of ag-Grid Enterprise.';
meta_and_links($title, $keywords, $description, false);
?>
    <!-- Google Tag Manager -->
    <script>(function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-T7JG534');</script>
    <!-- End Google Tag Manager -->

<?= globalAgGridScript(true) ?>

<link rel="stylesheet" href="dist/homepage.css" />

</head>

<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T7JG534" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->

    <header id="nav" class="compact">
        <?php include 'includes/navbar.php' ?>
    </header>
    <div class="page-content">
        <div class="stage-scenarios main">
            <h1 class="heading-scenarios">The Best JavaScript Grid in the World</h2>
            <section>
                <div class="demo" >
                    <div id="bestHtml5Grid"  class="ag-theme-material"></div>
                </div>
            </section>
        </div>

        <section class="main-buttons">
            <a class="get-started-btn" href="/example.php" role="button">View Demo</a>
        </section>

        <div id="stage-frameworks">
            <section id="section-frameworks">
                <div>
                    <h2>Get Started With:</h2>
                </div>
                <div>
                    <ul id="frameworks">
                        <li id="fw-javascript"><a href="/documentation/javascript/getting-started/">JavaScript</a></li>
                        <li id="fw-angular"><a href="/documentation/angular/getting-started/">Angular</a></li>
                        <li id="fw-react"><a href="/documentation/react/getting-started/">React</a></li>
                        <li id="fw-vue"><a href="/documentation/vue/getting-started/">Vue.js</a></li>
                    </ul>
                </div>
            </section>
        </div>

        <div id="stage-description">
            <section>
                <div>
                    <h3>Feature Packed</h3>
                    <p>
                        The performance, feature set and quality of ag-Grid has not been seen before in a
                        JavaScript datagrid. Many features in ag-Grid are unique to ag-Grid, and simply put
                        ag-Grid into a class of its own, without compromising on quality or performance.
                    </p>
                </div>
                <div>
                    <h3>Industry Leading</h3>
                    <p>
                        Over 600,000 monthly downloads of ag-Grid Community and over 50% of the Fortune 500
                        using ag-Grid Enterprise. ag-Grid has become the JavaScript datagrid of choice for Enterprise
                        JavaScript developers.
                    </p>
                </div>
                <div>
                    <h3>Community & Enterprise</h3>
                    <p>
                        ag-Grid Community is free and open-sourced under the MIT license. ag-Grid Enterprise comes with
                        dedicated support and more enterprise style features. ag-Grid gives for free what other grids
                        charge for, then provides ag-Grid Enterprise where it goes above and beyond the competition.
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
                        <img src="_assets/fw-logos/webpack.svg" alt="Webpack" />
                        <div class="media-body">
                            <h3>Webpack</h3>
                            <p><a href="/ag-grid-partners-with-webpack/">Read about our Partnership with webpack.</a></p>
                        </div>
                    </div>

                    <div class="media">
                        <img src="_assets/fw-logos/plunker.svg" alt="Plunker" />
                        <div class="media-body">
                            <h3>Plunker</h3>
                            <p><a href="/ag-grid-proud-to-support-plunker/">Read about our Backing of Plunker.</a></p>
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
