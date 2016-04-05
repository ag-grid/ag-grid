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

        <link inline rel="stylesheet" href="dist/bootstrap/css/bootstrap.css">

        <link inline rel="stylesheet" type="text/css" href="style.css">

        <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

    </head>

    <body class="big-text">

        <?php $navKey = "home"; include 'navbar.php'; ?>

        <div class="Hero">
            <div class="Hero-grid">
                <div class="container">
                    <div class="row text-center">
                        <h1>Enterprise JavaScript Data Grid</h1>
                        <h2>'ag' stands for Agnostic - not bound to any framework but integrates with <a href="/best-javascript-data-grid/index.php">JavaScript</a>, <a href="/best-react-data-grid/index.php">React</a>, <a href="/best-angularjs-data-grid/index.php">Angular</a>, <a href="/best-angular-2-data-grid/index.php">Angular 2</a> &amp; <a href="/best-web-component-data-grid/index.php">Web Components</a>.</h2>
                        <p><a class="btn btn-primary btn-large" href="/angular-grid-getting-started/index.php"><span class="glyphicon glyphicon-download-alt"></span> Download</a></p>
                        <div class="Hero-share">
                            <a class='share-link' href="https://www.facebook.com/sharer/sharer.php?u=www.ag-grid.com">
                                <img inline width="32" height="32" src="/images/social-icons/facebook-logo.svg" alt="Share on Facebook" title="Share on Facebook"/>
                            </a>
                            <a class='share-link' href="https://twitter.com/home?status=http://www.ag-Grid.com,%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers%20%23aggrid%20">
                                <img inline width="32" height="32" src="/images/social-icons/twitter-social-logotype.svg" alt="Share on Twitter" title="Share on Twitter"/>
                            </a>
                            <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com">
                                <img inline width="32" height="32" src="/images/social-icons/google-plus-social-logotype.svg" alt="Share on Google Plus" title="Share on Google Plus"/>
                            </a>
                            <a class='share-link' href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers&source=">
                                <img inline width="32" height="32" src="/images/social-icons/linkedin-logo.svg" alt="Share on LinkedIn" title="Share on LinkedIn"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        

        <div class="HomeDemo">

            <div class="container">
                <div class="row">
                    <h2 class="text-center">ag-Grid in action&hellip;</h2>
                    <div class="row hide-when-small HomeDemo-main">
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

                    <div class="HomeDemo-sub row hide-when-small">
                        <div class="col-md-4">
                            <h2 class="text-right pull-right">Bake your own look and feel to get differently styled grids</h2>
                        </div>
                        <div class="col-md-8">
                            <div id="exampleAccountGrid" class="ag-account" style="display: inline-block; padding: 4px;"></div>
                            <span style="float: right; position: relative; top: 20px; left: -20px;"><a href="./example-account-report/">(view code)</a></span>
                        </div>
                    </div>

                    <div class="HomeDemo-sub row hide-when-small">
                        <div class="col-md-8 hide-when-small">
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
                        <div class="col-md-4">
                            <h2 style="padding-left: 30px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit</h2>
                        </div>
                    </div>


                </div>
            </div>

        </div>

        <div class="HomeFeatures">
            <div class="container">
                <div class="row">
                    <h2 class="text-center">ag-Grid has every feature under the sun&hellip;</h2>
                    <div class="row text-center">
                        <div class="col-md-4 col-sm-4 col-xs-12">
                            <span class="glyphicon glyphicon-star gi-5x"></span>
                            <h4>Core Feature 1</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                 Curabitur nec nisl odio. Mauris vehicula at nunc id posuere.
                                Curabitur nec nisl odio. Mauris vehicula at nunc id posuere.
                            </p>
                        </div>
                         <div class="col-md-4 col-sm-4 col-xs-12">
                            <span class="glyphicon glyphicon-list-alt gi-5x"></span>
                            <h4>Core Feature 2</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                 Curabitur nec nisl odio. Mauris vehicula at nunc id posuere.
                                Curabitur nec nisl odio. Mauris vehicula at nunc id posuere.
                            </p>
                        </div>
                         <div class="col-md-4 col-sm-4 col-xs-12">
                            <span class="glyphicon glyphicon-cog gi-5x"></span>
                            <h4>Core Feature 3</h4>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                 Curabitur nec nisl odio. Mauris vehicula at nunc id posuere.
                                Curabitur nec nisl odio. Mauris vehicula at nunc id posuere.
                            </p>
                        </div>
                    </div>

                    <ul class="list-unstyled text-center">
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Column Pinning Left & Right</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Column Resizing</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Column Auto-Size to Fit Contents</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Variable Row Height</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Tree Data</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Data CSV Export</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> In Grid Sorting</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Server Side Sorting</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> In Grid Filtering</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Server Side Filtering</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Data Editing</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Keyboard Navigation</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Quick Search</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Column Grouping</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Row Selection</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Checkbox Selection</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Grid Data Context</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Value Getters</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Expressions</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Cell Styling</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> CSS Themes</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Custom Rendering</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Frozen / Floating Rows</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Multi Level Header Grouping</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Header Templates</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Events</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Internationalisation</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Cross Browser</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Printable</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Grid API</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Sorting API</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Filtering API</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Column API</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Pagination</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Infinite Scrolling</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Floating Footers</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Master / Slave</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Cell Range Selection</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Status Panel with Aggregation</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Grouping and Aggregation of Data</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Excel-like Filtering</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Advanced Column Menu</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Context Menu</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Clipboard Copy & Paste</li>
                        <li><span class="glyphicon glyphicon glyphicon-ok"></span> Tool Panel for Column Management</li>
                    </ul>

                </div>
            </div>
        </div>

        <div class="HomeTestimonials">
            <div class="container">
                <div class="row">
                    <h2 class="text-center">Testimonials&hellip;</h2>

                    <figure class="HomeTestimonials-item col-md-4 col-sm-4 col-xs-12">
                      <blockquote>We love Ag-grid for its simple integration, blazing-fast performance, and friendly community.</blockquote>
                      <div class="author">
                        <h5>Lucas Val</h5><span>VP of Product Development at Hexonet Services Inc</span>
                      </div>
                    </figure>
                    <figure class="HomeTestimonials-item col-md-4 col-sm-4 col-xs-12">
                      <blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</blockquote>
                      <div class="author">
                        <h5>Joe Bloggs</h5><span>Disney World</span>
                      </div>
                    </figure>
                    <figure class="HomeTestimonials-item col-md-4 col-sm-4 col-xs-12">
                      <blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</blockquote>
                      <div class="author">
                        <h5>John Smith</h5><span>Disney World</span>
                      </div>
                    </figure>

                </div>
            </div>
        </div>

        <?php $navKey = "home"; include 'footer.php'; ?>

    </body>
</html>

<script inline src="dist/ag-grid-enterprise.js"></script>

<link inline href="example-file-browser/fileBrowser.css" rel="stylesheet">
<link inline href="best-angularjs-data-grid/basic.css" rel="stylesheet">
<link inline href="example-account-report/account.css" rel="stylesheet">

<script inline src="best-javascript-data-grid/html5grid.js"></script>
<script inline src="example-account-report/account.js"></script>
<script inline src="example-file-browser/fileBrowser.js"></script>

<?php include_once("analytics.php"); ?>

<!-- UI JavaScript (will move into seperate file later) -->
<script>

var navToggle = document.getElementById('nav-toggle');

var toggleClass = function() {
    console.log('Open Menu.');
    navToggle.classList.toggle('open');
};

navToggle.addEventListener('click', toggleClass, false);


</script>