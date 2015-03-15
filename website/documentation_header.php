<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="<?php echo $pageKeyboards; ?>"/>

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>

    <script src="/documentation.js"></script>

    <link rel="stylesheet" href="/documentation.css">

    <link rel="shortcut icon" href="http://www.angulargrid.com/favicon.ico" />

    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-60553231-1', 'auto');
        ga('send', 'pageview');

    </script>
</head>

<body ng-app="documentation" ng-controller="documentationController">

    <nav class="navbar navbar-inverse navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <a class="navbar-brand" href="/index.html">Angular Grid</a>
                <a class="navbar-brand" href="/example.html">Example</a>
                <a class="navbar-brand" href="../angular-grid-getting-started/index.php">Documentation</a>
                <a class="navbar-brand" href="/forum">Forum</a>
            </div>
        </div>
    </nav>

    <div class="container" style="margin-top: 70px">

        <div class="row">

            <div class="col-sm-2">
                <h4>Documentation</h4>

                <a class="sidebarLink" href="/angular-grid-getting-started/index.php">Getting Started</a>
                <a class="sidebarLink" href="/angular-grid-loading-rows/index.php">Loading Rows</a>
                <a class="sidebarLink" href="/angular-grid-width-and-height/index.php">Width & Height</a>
                <a class="sidebarLink" href="/angular-grid-grid-options/index.php">Grid Options</a>
                <a class="sidebarLink" href="/angular-grid-column-definitions/index.php">Column Definitions</a>
                <a class="sidebarLink" href="/angular-grid-sorting/index.php">Sorting</a>
                <a class="sidebarLink" href="/angular-grid-filtering/index.php">Filtering</a>
                <a class="sidebarLink" href="/angular-grid-resizing/index.php">Resizing</a>
                <a class="sidebarLink" href="/angular-grid-pinning/index.php">Pinning</a>
                <a class="sidebarLink" href="/angular-grid-grouping/index.php">Grouping & Aggregating Rows</a>
                <a class="sidebarLink" href="/angular-grid-grouping-headers/index.php">Grouping Headers</a>
                <a class="sidebarLink" href="/angular-grid-editing/index.php">Editing Cells</a>
                <a class="sidebarLink" href="/angular-grid-selection/index.php">Selection</a>
                <a class="sidebarLink" href="/angular-grid-header-rendering/index.php">Header Rendering</a>
                <a class="sidebarLink" href="/angular-grid-angular-compiling/index.php">Angular Compiling</a>
                <a class="sidebarLink" href="/angular-grid-styling/index.php">Layout & Styling</a>
                <a class="sidebarLink" href="/angular-grid-no-scrolls/index.php">No Scrolling</a>
                <a class="sidebarLink" href="/angular-grid-api/index.php">API</a>

            </div>

            <div class="col-sm-10 blog-main">