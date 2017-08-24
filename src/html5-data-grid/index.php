<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>HTML5 Data Grid</title>
    <meta name="description" content="A feature-rich data grid designed for HTML5 Enterprise Applications. Easily integrate with your framework to deliver all the grid features that you need.">
    <meta name="keywords" content="HTML5 Data Grid"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

 

<style>
    .weekly-news-paragraph {
        color: #767676;
        padding-bottom: 20px;
    }
    .weekly-news-paragraph-title {
        font-weight: bold;
        color: #767676;
        padding-bottom: 5px;
    }
    .weekly-news-section {
        overflow: hidden;
        border: 1px solid darkgrey;
        background-color: #eee;
        padding: 10px;
        margin: 30px 5px 5px 5px;
    }
    .weekly-news-title {
        font-size: 20px;
        color: #167ac6;
        float: left;
        padding-bottom: 10px;
    }
    .weekly-news-sub-title {
        float: right;
        color: #767676;
    }
    .weekly-news-image-right {
        margin-left: 15px;
        margin-bottom: 15px;
        font-size: 14px;
        font-style: italic;
        float: right;
        width: 500px;
    }
    h4 {
        margin-top: 40px;
    }

    hr {
    height: 1px;
    color: #9c3636;
    background-color: #9c3636;
    border: none;
    }

  670: .HomeSection-framework-single-line {
  671      padding: 0 15px;
  672      text-align: center;
  ...
  675  }

</style>

<div class="Hero">
    <div class="Hero-grid">
        <div class="container">
            <div class="row text-center">
                <div class="col-md-4">
                    <h1 style="" class="big-logo">
                        <?php include '../images/logo-dark-hacked.svg'; ?>
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
                    Over <span class="info-item-big">100,000 Downloads</span>
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
                        <?php include '../images/social-icons/facebook-logo-hacked.svg'; ?>
                    </a>
                    <a class='share-link'
                       href="https://twitter.com/home?status=http://www.ag-Grid.com,%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers%20%23aggrid%20"
                       alt="Share ag-Grid on Twitter" title="Share ag-Grid on Twitter">
                        <?php include '../images/social-icons/twitter-social-logotype-hacked.svg'; ?>
                    </a>
                    <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com"
                       alt="Share ag-Grid on Google Plus" title="Share ag-Grid on Google Plus">
                        <?php include '../images/social-icons/google-plus-social-logotype-hacked.svg'; ?>
                    </a>
                    <a class='share-link'
                       href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers&source="
                       alt="Share ag-Grid on LinkedIn" title="Share ag-Grid on LinkedIn">
                        <?php include '../images/social-icons/linkedin-logo-hacked.svg'; ?>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>



<div class="container">

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">
            <h2>
                About ag-Grid
            </h2>
            <hr/>
            <p>
                ag-Grid is a JavaScript datagrid designed for Enterprise Applications. It delivers a large feature set combined with Enterprise grade performance. We provide all the standard features of a datagrid as well as advanced features that no other product on the market offers. This means development time is significantly reduced for essential features. These features are highly extensible and customisable with detailed documentation and examples to support developers.
            <p/>
        </div> 
    </div>
</div>

<div class="container">

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">
            <h2>
                Supporting All Major JavaScript Frameworks
            </h2>
            <hr/>
            <p>
            ag-Grid is framework agnostic, this provides flexibility within your organisation to choose the appropriate framework for a project.
            </p>

        </div> 

    </div>
        <div class="row HomeSection-framworkContainer">
            <div class="HomeSection-framework">
                <a href="/best-angular-2-data-grid/"><img src="../images/angular2_large.png" alt="Angular 2 Datagrid" title="Angular" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-angular-2-data-grid/">Angular</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-react-data-grid/"><img src="../images/react_large_home.png" alt="React Datagrid" title="React" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-react-data-grid/">React</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-polymer-data-grid/"><img src="../images/polymer-large.png" alt="Polymer Datagrid" title="Polymer" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-polymer-data-grid/">Polymer</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-vuejs-data-grid/"><img src="../images/vue_large_home.png" alt="VueJS Datagrid" title="VueJs" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-vuejs-data-grid/">VueJs</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-angularjs-data-grid/"><img src="../images/angularjs_large.png" alt="Angular Datagrid" title="Angular 1" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-angularjs-data-grid/">Angular 1</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-javascript-data-grid/"><img src="../images/javascript_large.png" alt="JavaScript Datagrid" title="Vanilla JavaScript" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-javascript-data-grid/">JavaScript</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-aurelia-data-grid/"><img src="../images/aurelia_large.png" alt="Aurelia Datagrid" title="Aurelia" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-aurelia-data-grid/">Aurelia</a>
                </div>
            </div>
            <div class="HomeSection-framework">
                <a href="/best-web-component-data-grid/"><img src="../images/webComponents_large.png" width="100" alt="Web Components Datagrid" title="Web Components" width="75%"/></a>
                <div class="framework-name">
                    <a href="/best-web-component-data-grid/">Web Components</a>
                </div>
            </div>
        </div>
    </div>

<div class="container">
    <div class="row">

        <div class="col-md-12" style="padding-top: 20px;">

            <h2 id="tech_team">
                Further Information
            </h2>
            <hr/>

        </div> 

    </div>

    <div class="row" style="margin-top: 20px;">

        <div class="col-md-4">
            <div>
                <img src='images/landing/documatation.jpg'/>
            </div>
            <h3>Documentation - In English</h3>

            <p>
                Our Documentation takes you through how to setup your HTML5 data grid in your chosen framework (e.g. Angular or React). You can then progress to building a simple grid to adding more complex features. We have a section on each of the features of the grid with examples.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/landing/documatation.jpg'/>
            </div>
            <h3>Examples and Demonstration</h3>
            <p>
                You can find more complete examples here. Also take a look at our Demonstration page to see it all in action together.
            </p>
        </div>

        <div class="col-md-4">

            <h3>Technical Support</h3>

            <p>
                Each ag-Grid Enterprise license comes with access to our Enterprise Support Forum. This is monitored by our core development based here in London. We respond to all queries within 24 hours during UK Business hours.
            </p>
        </div>

    </div>
</div>

<div class="container">
    <div class="row">

        <div class="col-md-12" style="padding-top: 20px;">

            <h2 id="tech_team">
                Getting Started
            </h2>
            <hr/>

        </div> 

    </div>

    <div class="row" style="margin-top: 20px;">

        <div class="col-md-4">

            <h3>Documentation - In English</h3>

            <p>
                Our Documentation takes you through how to setup your HTML5 data grid in your chosen framework (e.g. Angular or React). You can then progress to building a simple grid to adding more complex features. We have a section on each of the features of the grid with examples.
            </p>
        </div>

        <div class="col-md-4">

            <h3>Examples and Demonstration</h3>
            <p>
                You can find more complete examples here. Also take a look at our Demonstration page to see it all in action together.
            </p>
        </div>

        <div class="col-md-4">

            <h3>Technical Support</h3>

            <p>
                Each ag-Grid Enterprise license comes with access to our Enterprise Support Forum. This is monitored by our core development based here in London. We respond to all queries within 24 hours during UK Business hours.
            </p>
        </div>

    </div>
</div>

<div class="container">
    <div class="row">

        <div class="col-md-12" style="padding-top: 20px;">

            <h2 id="features">
                Features
            </h2>
            <hr/>

        </div> 

    </div>

    <div class="row" style="margin-top: 20px;">

        <div class="col-md-3">
            <ul>
                <li><a href="../javascript-grid-width-and-height/">Grid Size</a></li>
                <li><a href="../javascript-grid-column-definitions//">Column Definitions</a></li>
                <li><a href="../javascript-grid-grouping-headers/">Column Groups</a></li>
                <li><a href="../javascript-grid-column-header/">Column Headers</a></li>
                <li><a href="../javascript-grid-resizing/">Column Resizing</a></li>
                <li><a href="../javascript-grid-filtering/">Column Filter</a></li>
                <li><a href="../javascript-grid-filter-text/">Text Filter</a></li>
                <li><a href="../javascript-grid-filter-number/">Number Filter</a></li>
                <li><a href="../javascript-grid-filter-date/">Date Filter</a></li>
                <li><a href="../javascript-grid-filter-set/">Set Filter</a></li>
                <li><a href="../javascript-grid-filter-custom">Custom Filter</a></li>
                <li><a href="../javascript-grid-filter-quick/">Quick Filter</a></li>
                <li><a href="../javascript-grid-filter-external/">External Filter</a></li>
                <li><a href="../javascript-grid-sorting/">Row Sorting</a></li>
                <li><a href="../javascript-grid-selection/">Row Selection</a></li>
            </ul>
        </div>

        <div class="col-md-3">
            <ul>
                <li><a href="../javascript-grid-range-selection/">Range Selection</a></li>
                <li><a href="../javascript-grid-column-spanning/">Column Spanning</a></li>
                <li><a href="../javascript-grid-pinning/">Column Pinning</a></li>
                <li><a href="../javascript-grid-row-pinning/">Row Pinning</a></li>
                <li><a href="../javascript-grid-row-height/">Row Height</a></li>
                <li><a href="../javascript-grid-cell-styling/">Cell Styling</a></li>
                <li><a href="../javascript-grid-value-handlers/">Value Handlers</a></li>
                <li><a href="../javascript-grid-value-getters/">Getters & Formatters</a></li>
                <li><a href="../javascript-grid-value-setters/">Setters and Parsers</a></li>
                <li><a href="../javascript-grid-cell-expressions/">Expressions</a></li>
                <li><a href="../javascript-grid-value-cache/">Value Cache</a></li>
                <li><a href="../javascript-grid-reference-data/">Reference Data</a></li>
                <li><a href="../javascript-grid-cell-rendering/">Cell Rendering</a></li>
                <li><a href="../javascript-grid-cell-editing/">Cell Editing</a></li>
                <li><a href="../javascript-grid-keyboard-navigation/">Keyboard Navigation</a></li>
            </ul>
        </div>

        <div class="col-md-3">
            <ul>
                <li><a href="../javascript-grid-touch/">Touch Support</a></li>
                <li><a href="../javascript-grid-animation/">Animation</a></li>
                <li><a href="../javascript-grid-accessing-data/">Accessing Data</a></li>
                <li><a href="../javascript-grid-pagination/">Pagination</a></li>
                <li><a href="../javascript-grid-tree/">Tree Data</a></li>
                <li><a href="../javascript-grid-data-update/">Updating Data</a></li>
                <li><a href="../javascript-grid-refresh/">View Refresh</a></li>
                <li><a href="../javascript-grid-change-detection/">Change Detection</a></li>
                <li><a href="../javascript-grid-internationalisation/">Internationalisation</a></li>
                <li><a href="../javascript-grid-accessibility/">Accessibility</a></li>
                <li><a href="../javascript-grid-full-width-rows/">Full Width Rows</a></li>
                <li><a href="../javascript-grid-master-detail/">Master Detail</a></li>
                <li><a href="../javascript-grid-aligned-grids/">Aligned Grids</a></li>
                <li><a href="../javascript-grid-export/">CSV Export</a></li>
                <li><a href="../javascript-grid-excel/">Excel Export</a></li>
            </ul>
        </div>

        <div class="col-md-3">
            <ul>
                <li><a href="../javascript-grid-rtl/">RTL</a></li>
                <li><a href="../javascript-grid-icons/">Custom Icons</a></li>
                <li><a href="../javascript-grid-overlays/">Overlays</a></li>
                <li><a href="../javascript-grid-for-print/">Layout For Print</a></li>
                <li><a href="../javascript-grid-data-functions/">Data Functions</a></li>
                <li><a href="../javascript-grid-grouping/">Grouping Rows</a></li>
                <li><a href="../javascript-grid-aggregation/">Aggregation</a></li>
                <li><a href="../javascript-grid-pivoting/">Pivoting</a></li>
                <li><a href="../javascript-grid-tool-panel/">Tool Panel</a></li>
                <li><a href="../javascript-grid-clipboard/">Clipboard</a></li>
                <li><a href="../javascript-grid-column-menu/">Column Menu</a></li>
                <li><a href="../javascript-grid-context-menu/">Context Menu</a></li>
                <li><a href="../javascript-grid-status-bar/">Status Bar</a></li>
                <li><a href="../javascript-grid-set-license/">License Key</a></li>
            </ul>
        </div>
    </div>
</div>

   
</div>

</div>

<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>