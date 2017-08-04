<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>FAQs</title>
    <meta name="description" content="All commonly asked questions about our Javascript Datagrid">
    <meta name="keywords" content="FAQs ag-Grid Datagrid"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "support"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "FAQs"; include 'includes/headerRow.php'; ?>

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

</style>

<div class="container">

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">
            <h2>
                Our Mission:
            </h2>
            <hr/>
            <p>
                At ag-Grid, our mission is simple:
            </p>
               
            <h3>
                Build the best data grid in the world.
            </h3>
            <br/>
            </p>

            <p>
                Lorum Ipsum
            </p>

            <h2>
                Our Principles:
            </h2>
            <hr/>
            <p>
                We believe that a datagrid should be agnostic to the framework that developers choose. This allows flexibility and future-proofs your development. This is also where the 'ag' in ag-Grid comes from.
            </p>

            <p>    
                Our experience is in building Enterprise applications: we know that the datagrid is at the core of an Enterprise application, and needs to deliver performance and a rich feature set. 
            </p>

            <p>
                We give away what others charge for - ag-Grid Free provides all of the features of our competion. We only charge when we go above and beyond, with features that other grids don’t provide.
            </p>
        </div> 

    </div>



</div>

<?php include("includes/footer.php"); ?>

</body>

    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-60553231-2', 'auto');
        ga('send', 'pageview');

        // workaround script for Google Site Search
        _gaq = {}; 
        _gaq.push = function () { 
            ga('send', 'pageview', arguments[0][1]); 
        };

    </script>

</html>