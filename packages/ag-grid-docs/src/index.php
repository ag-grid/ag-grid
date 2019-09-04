<?php 
require "example-runner/utils.php";
require "includes/html-helpers.php";
define('HOMEPAGE', true);
gtm_data_layer('home');
// variable necessary in navbar.php
$version = 'latest';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<?php
$title = 'ag-Grid: Datagrid packed with features that your users need with the performance you expect.';
$description = 'ag-Grid is feature rich datagrid designed for the major JavaScript Frameworks. Version 19 is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source or take a 2 month trial of ag-Grid Enterprise.';
meta_and_links($title, $keywords, $description, false);
?>

</head><link rel="stylesheet" href="dist/homepage.css">

<body>
    <header id="nav" class="compact" style="position: fixed; position: sticky; top: 0; width: 100%; z-index: 999999;"">
        <?php include 'includes/navbar.php' ?>
    </header>
    <div class="stage-scenarios" style="background-color: #125082;">
        <h2 class="heading-scenarios" style="color: white;">The Best Grid in the World!</h2>

        <section>
            <div class="demo" id="demo-1" data-load="home/demo-1.php">
                <div class="loading">
                    <img src="_assets/doodles/checkbox-selection.svg" alt="Loading..." />
                    <p>Loading Demo...</p>
                </div>
            </div>
        </section>

        <section style="display: flex; justify-content: center; margin-top: 2rem;">
            <a class="get-started-btn" href="/javascript-grid-getting-started/" role="button">Get Started</a>
        </section>
    </div>

    <div id="stage-frameworks">
        <section id="news-flash">
            <div>
                30th Aug 2019: <a href="./ag-grid-changelog/?fixVersion=21.2.0">Version 21.2.0</a> Pivot Chart, Pagination Enhancements, Scatter / Bubble Charts, Accessibility Enhancements ...
            </div>
        </section>

        <section id="section-frameworks">
            <div>
                <h2>
                    Works With All<br />
                    Major JavaScript<br />
                    Frameworks<br />
                    <small></small>
                </h2>
                <p>With Zero Dependencies.</p>
                <a class="btn btn-outline-primary" href="../javascript-grid-getting-started/" role="button" style="margin-left: 320px">Choose Your Framework</a>
            </div>

            <div>
                <ul id="frameworks">
                    <li id="fw-javascript"><a href="./javascript-getting-started/">JavaScript</a></li>
                    <li id="fw-angular"><a href="./angular-getting-started/">Angular</a></li>
                    <li id="fw-react"><a href="./react-getting-started/">React</a></li>
                    <li id="fw-vue"><a href="./vue-getting-started/">Vue.js</a></li>
                    <li id="fw-angularjs"><a href="./best-angularjs-data-grid/">AngularJS 1.x</a></li>
                    <li id="fw-polymer"><a href="./polymer-getting-started/">Polymer</a></li>
                    <li id="fw-webcomponents"><a href="./best-web-component-data-grid/">Web Components</a></li>
                </ul>
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

    <div class="stage-scenarios">
        <h2 class="heading-scenarios">Live Streaming Updates</h2>

        <section>
            <div class="demo" id="demo-2" data-load="home/demo-2.php">
                <div class="loading">
                    <img src="_assets/doodles/checkbox-selection.svg" alt="Loading..." />
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
                    <img src="_assets/doodles/checkbox-selection.svg" alt="Loading..." />
                    <p>Loading Demo...</p>
                </div>
                <div class="view-code">
                    &nbsp;
                </div>
            </div>
        </section>
    </div>

    <div class="stage-scenarios">
        <h2 class="heading-scenarios">Developer Friendly API</h2>

        <section>
            <div class="demo" data-load="home/demo-api.php">
                <div class="loading">
                    <img src="_assets/doodles/checkbox-selection.svg" alt="Loading..." />
                    <p>Loading Demo...</p>
                </div>
                <div class="view-code">
                    <a href="/javascript-grid-animation/">View Code</a>
                </div>
            </div>
        </section>
    </div>

    <?= globalAgGridScript(true, true) ?>
    <script src="dist/homepage.js"></script>
    <!-- Used by the dashboard demo -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.9.1/d3.min.js"></script>
    <?php include 'includes/footer.php' ?>
</body>
</html>
