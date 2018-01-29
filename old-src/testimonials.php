<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Testimonials</title>
    <meta name="description" content="ag-Grid comes either as free or as Enterprise with support. This page explains the different support models for the free and Enterprise versions of ag-Grid.">
    <meta name="keywords" content="ag-Grid Javascript Grid Support"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "testimonials"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "Testimonials"; include 'includes/headerRow.php'; ?>


<div class="container">

    <style>
        .quote-text {
            font-style: italic;
        }
        .quote-from {
            font-size: 10px;
            padding-top: 10px;
            text-transform: uppercase;
            font-weight: 800;
            font-family: inherit;
            color: dimgrey;
        }
        .quote-company {
            font-size: 12px;
        }
        .quote {
            margin-left: 30px;
            margin-right: 30px;
            margin-top: 30px;
            padding: 10px;
            text-align: left;
            font-style: normal;
            font-size: 14px;
            border-style: outset;
            border-width: 1px;
        }
    </style>

    <div class="row quote">
        <div class="quote-text">"We’re using ag-Grid as a major component in our enterprise analytics and reporting product and it’s incredible. Prior to ag-Grid, we tried jqGrid, jqxGrid, DataTables, and SlickGrid, which all have their strong points, but we eventually ran into a wall with certain features. ag-Grid’s grouping, aggregation, filtering, and all-around flexibility allowed us to quickly integrate it into our product. And, the performance is truly awesome!"</div>
        <div class="quote-from">Andrew Taft</div>
        <div class="quote-company">Head of Product Development at Insight Technology Group</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"We love Ag-grid for its simple integration, blazing-fast performance, and friendly community."</div>
        <div class="quote-from">Lucas Val</div>
        <div class="quote-company">VP of Product Development at Hexonet Services Inc</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"Remarkable speed and extensibility, ag-Grid is the best web feature-rich BI tool on the market."</div>
        <div class="quote-from">Robin Cote</div>
        <div class="quote-company">Senior Systems Developer, Investment Solutions Group, Healthcare of Ontario Pension Plan</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"I'm so glad you made ag-Grid!  Finally, someone has done it right.  I started using Google's Table visualizations, then tried dataTables.net and then js-Grid before I discovered your product.  Your design and implementation is brilliant."</div>
        <div class="quote-from">Graham Smith</div>
        <div class="quote-company">United Healthcare Workers West</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"For those who are just checking into this project, stop looking at others and start using agGrid.
            This is an amazing piece of work and the api is so deep, you will be thrilled to find out all it is capable of doing.
            Thanks to @ceolter for his efforts, you have helped improve our application with agGrid."</div>
        <div class="quote-from">Mike Erickson</div>
        <div class="quote-company">Code Dungeon</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"We just made the move from Kendo to ag-grid and we love it. It’s fast and very flexible."</div>
        <div class="quote-from">Jason Boorn</div>
        <div class="quote-company">Senior Architect, Roobricks</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"I just wanted to say thank you for all the hard work you have put into ag-Grid.  I have been using the free version for about a year and have to say it is definitely the best grid framework out there."</div>
        <div class="quote-from">Jordan Berry</div>
        <div class="quote-company">CTO / Co-Founder, Interloop</div>
    </div>

    <div class="row quote">
        <div class="quote-text">"Ag-grid is one of the best Grids I have ever worked with. In spite of being feature rich it is still one of the fastest grids I have ever used. This grid will be an essential part of my tool kit especially when working with extremely large datasets."</div>
        <div class="quote-from">Zach Lewis</div>
        <div class="quote-company">Senior Software Developer, Nutraceutical</div>
    </div>

    <div class="row">
        <div class="col-md-9">    
            <hr/>
            <h3>Add your own Testimonial</h3>
            <p style="display: inline">
                If you want to share your experience with ag-Grid, please send us your testimonial to
            <script language="JavaScript"><!--
            var name = "accounts";
            var domain = "ag-grid.com";
            document.write('<a href=\"mailto:' + name + '@' + domain + '\">');
            document.write(name + '@' + domain + '</a>');
            // --></script>
            </p>
        </div> <!-- end col -->
    </div> <!-- end row -->
</div>



<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>