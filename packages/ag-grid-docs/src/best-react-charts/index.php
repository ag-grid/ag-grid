<?php
$pageTitle = "React Charts Component | ag-Grid
.";
$pageDescription = "Fastest, most feature-rich React Data Grid component from ag-Grid. Integrate seamlessly with React to deliver 63+ core and enterprise features including filtering, grouping and pagination. React Grid examples and demo on this page. Built to deal with large data sets, ease of integration, heavily customizable and a developer friendly API.
";
?>
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <style><?php include './styles.css'; ?></style>
    <title>React Charts and Graphs Component</title>
</head>
<body>
<section id="nav-bar">
<nav class="navbar navbar-expand-lg navbar-light bg-light">
<a class="navbar-brand" href="#"><img id="logo" src="../images/logo/logo-inverted.svg"></a>
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
<i class="fas fa-bars"></i>
<span class="navbar-toggler-icon"></span>
</button>
<div class="collapse navbar-collapse" id="navbarNav">
<ul class="navbar-nav ml-auto">
<li class="nav-item">
<a class="nav-link" href="../example.php">Demo<span class="sr-only">(current)</span></a>
</li>
<li class="nav-item">
<a class="nav-link" href="../documentation-main/documentation.php">Documentation</a>
</li>
<li class="nav-item">
<a class="nav-link" href="../features-overview">Features Overview</a>
</li>
<li class="nav-item">
<a class="nav-link" href="../license-pricing.php">Pricing</a>
</li>
<li class="nav-item">
<a class="nav-link" id="get-started" href="../javascript-grid-getting-started/">Get Started</a>
</li>
</ul>
</div>
</nav>
</section>
        
<!--above the fold section--->
<section id="abovefold">
<div class="row">
<div class="col-md-6">
<h1>Best React Charts and Graphs Component</h1>
<p class="snippet">
The best React grid has now integrated charting into its grid.<br>
The grid comes with charting integration allowing users to chart data directly from the grid without requiring additional developer coding.
</p>
</div>
<div class="col-md-6">
<img src="../images/charts-copy.png" class="img-fluid rounded mx-auto d-block" alt="Responsive image">
</div>
<div class="col-md-12" id="c2a-top">
    <a href="../javascript-grid-getting-started/"><button type="button" class="btn btn-light">GET STARTED</button></a>
</div>
</section>
<section id="description">
<div class="container">
<h2 class="title">
CHARTS OVERVIEW
</h2>
<p class="overview">
The charting functionality is deeply integrated with the grid. This integration gives users a seamless charting experience while keeping the coding required by developers to a minimum.
</p>
<h3>Enable Charting</h3>
<p>To enable charting in the grid set the following grid option: <code>gridOptions = {
    enableCharts: true
}</code></p>
<p>To allow users to create charts from a Range Selection and / or display the Chart Ranges in the grid, then set the following grid option: <code>gridOptions = {
    enableRangeSelection: true
}</code></p>
</section>
<section id="example">
<div class="container">
    <h2 class="title">CHARTS EXAMPLE</h2>
    <p>Once Charting is enabled you can create Charts using following two methods:</p>
    <ul class="list-unstyled">
        <li>1. Select a <a href="../javascript-grid-range-selection/">Cell Range</a> in the grid by dragging
            the mouse over a range of cells.</li>
            <li>2. Bring up the <a href="../javascript-grid-context-menu">Context Menu</a> and from the Chart Range
            sub menu, select the chart type you want to display.</li>
        </ul>
        <hr>
        <h3>
            USER CREATED CHARTS
        </h3>
        <p>
            User created charts are designed to provide an out-of-the box charting experience, similar to that found in spreadsheet applications such as Excel, but more compelling it will be integrated inside your applications.
        </p>
            <div class="row">
                <div class="col-md-4">
                    <h4>Step 1</h4>
                    <p>Select a Range of Data</p>
                </div>
                <div class="col-md-4">
                    <h4>Step 2</h4>
                    <p>
                        Right Click
                    </p>
                </div>
                <div class="col-md-4">
                    <h4>Step 3</h4>
                    <p>Select Chart Type</p>
                </div>
            </div>
    <img class="example" src="../images/user-charting-showcase.gif"></img>
    <p>
        The animation above highlights a number of charting features. More details on features below.
    </p>
</div>
</section>
    <section id="feature-examples">
    <div class="container">
    <hr>
    <h2 class="title">
        CHARTING FEATURE EXAMPLES
    </h2>
    <div class="row" id="example-section">

        <div class="col-md-6 feature-desc">
            <h4>Chart Ranges</h4>
            <p>
        When a chart is created off a selected range of cells in the grid, or via the charting api, the underlying cell range is replaced by a chart range.
    </p>
<p>
        As illustrated above, the resulting chart range can subsequently modified by dragging on the chart range handle, located at the bottom right corner of the chart range.
    </p>
    <p>
        Find out more about Chart Ranges <a href="">here</a>. 
    </p>
</div>
<div class="col-md-6">
    <img class="example" src="../images/charting-ranges.gif">
</div>
</div>
    <div class="row">
<div class="col-md-6">
    <img class="example" src="../images/contiguous-range.gif">
</div>
        <div class="col-md-6 feature-desc">
            <h4>Categories and Series</h4>
            <p>
        There are two types of charting ranges; a category range that is highlighted in green and a series range that is highlighted in blue.</p>
    <p>
        As illustrated above chart ranges can be adjusted from within the grid by dragging on the chart range handle located at the bottom right of the series range. Both the category and series ranges are connected so when the chart range is dragged in an up or down direction they will be updated together.
    </p>
    <p>
        Find out more about Categories and Series <a href="">here</a>.
    </p>
</div>
</div>
</div>
</section>
<section id="chart-toolbar">
<div class="container">
    <h2 class="title">
        CHART TOOLBAR: SETTINGS AND DATA
    </h2>
    <div class="row" id="example-section">
        <div class="col-md-6 feature-desc">
            <h4>Chart Settings</h4>
            <p>
        The chart settings toolbar item allows users to change the chart type as well as the color palette used in the chart.
    </p>
    <p>
        The toolbar allow users to switch between the 5 most commonly used charts: Grouped Bar, Stacked Bar, Line, Pie and Doughnut.
    </p>
        <p>
        Find out more about Chart Settings <a href="">here</a>.
    </p>
</div>
<div class="col-md-6">
    <img class="example" src="../images/chart-settings.gif">
</div>
</div>
    <div class="row">
<div class="col-md-6">
    <img class="example" src="../images/chart-data.gif">
</div>
        <div class="col-md-6 feature-desc">
            <h4>Chart Data</h4>
            <p>
        The chart settings toolbar item allows users to change the chart type as well as the color palette used in the chart.
    </p>
    <p>
        The toolbar allow users to switch between the 5 most commonly used charts: Grouped Bar, Stacked Bar, Line, Pie and Doughnut.
    </p>
        <p>
        Find out more about Chart Settings <a href="">here</a>.
    </p>
</div>
</div>
    
</section>
<hr>
<section id="app-charts">
<div class="container">
    <div class="row" id="mobile-order">
        <div class="col-md-6">
            <h3>APPLICATION CREATED CHARTS</h3>
            <p>
            Charts can be pre-defined or dynamically created from within applications, and as with user created charts,<br> these charts also benefit from the integration provided with the grid.
        </p>
        <p>
            A dummy financial application is presented to give a taste of what's possible.
        </p>
 <p>
            To find about more about Application Created Charts, follow the links provided below:
        </p>
        <div class="row">
            <div class="col-md-6">
                <h5><a href="https://www.ag-grid.com/javascript-grid-charts-chart-range-api/">Chart API</a></h5>
            </div>
            <div class="col-md-6">
                <h5><a href="https://www.ag-grid.com/javascript-grid-charts-chart-range-api/">Chart Customisation</a></h5>
            </div>
        </div>
</div>
<div class="col-md-6">
    <img class="example" src="../images/chart-application.gif">
</div>
</div>
<hr>
    <h3>
        CHART CUSTOMISATION
    </h3>
    <p>
        Before each chart is created, the developer can do fine grained Chart Customisation to change the charts appearance and behaviour. For example you can change the thickness of the lines, or customise the formatting of the axis labels.
    </p>
        <p>
        Find out more about Chart Customisation <a href="../javascript-grid-charts-customisation/">here</a>.
    </p>
</div>
</section>
<section id="options">
<div class="container">
<h2 class="title">
CHARTING OPTIONS
</h2>
<div class="row text-center">
<div class="col-md-6 options">
<img class="img" src="../images/chart-grid.jpg">
<h3>
Integrated into the Grid
</h3>
<p>
The grid comes with charting integration allowing users to chart data directly from the grid without requiring additional developer coding.
</p>
</div>
<div class="col-md-6 options">
<img class="img" src="../images/graph.png">
<h3>
Standalone Library(in development)
</h3>
<p> 
ag-Grid will also release it's own standalone library, which is currently in development. 
</p>
</div>
</div>
<div id="c2a-button">
<a href="../javascript-grid-getting-started/"><button type="button" class="btn btn-primary">GET STARTED</button></a>
</div>
</section>
<section id="c2a">
    <div class="container">
        <h3>GET STARTED WITH REACT CHARTS</h3>
        <p class="lead">
            "A seamless charting experience while keeping the coding required by developers to a minimum.''
        </p>
        <div id="c2a-end">
<a href="../javascript-grid-getting-started/"><button type="button" class="btn btn-light">GET STARTED</button></a>
</div>
    </div>
</section>



<footer id="site-footer">
    <div class="row">
    <div class="col-md-3">
    <h5>Documentation</h5>
    <ul>
                <li><a href="/javascript-grid-getting-started/">Getting Started</a></li>
                <li><a href="/ag-grid-changelog/">Changelog</a></li>
                <li><a href="/ag-grid-pipeline/">Pipeline</a></li>
                <li><a href="/archive/">Documentation Archive</a></li>
            </ul>     
    </div>
    <div class="col-md-3"> 
    <h5>Support & Community</h5>
    <ul class="list-unstyled">
                <li><a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow</a></li>
                <li><a href="/license-pricing.php">License &amp; Pricing</a></li>
                <li><a href="https://ag-grid.zendesk.com/">Support via Zendesk</a></li>
            </ul>      
    </div>
    <div class="col-md-3">
    <h5>The Company</h5>
    <ul class="list-unstyled">
                <li><a href="/about.php">About</a></li>
                <li><a href="/about.php#team">Team</a></li>
                <li><a href="https://blog.ag-grid.com/">Blog</a></li>
                <li><a href=/privacy.php>Privacy Policy</a><li>
                  <li><a href="/cookies.php">Cookies Policy</a><li>
            </ul>       
    </div>
    <div class="col-md-3">
    <h5>Social</h5>
                <ul>
                <li><a class="github-button" href="https://github.com/ag-grid/ag-grid" data-show-count="true" aria-label="Star ag-grid/ag-grid on GitHub">Star</a></li>
                <li><a class="twitter-follow-button"
  href="https://twitter.com/ag_grid">
Follow @ag_grid</a></li>
                
            </ul>       
    </div>
</div>
</footer>

<!-- Optional JavaScript -->
<!-- jQuery first, then Popper.js, then Bootstrap JS -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
<script async defer src="https://platform.twitter.com/widgets.js"></script>
<script async defer src="https://buttons.github.io/buttons.js"></script>
</body>
</html>