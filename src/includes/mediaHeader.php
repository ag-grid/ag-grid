<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="<?php echo $pageKeyboards; ?>"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta property="og:image" content="<?php echo $socialImage; ?>" />
    <meta name="twitter:image" content="<?php echo $socialImage; ?>" />
    <meta property="og:site_name" content="www.ag-grid.com" />
    <meta property="og:type" content="website" />
    <meta name="twitter:site" content="@ceolter" />
    <meta name="twitter:creator" content="@ceolter" />
    <meta property="og:url" content="<?php echo $socialUrl; ?>" />
    <meta property="twitter:url" content="<?php echo $socialUrl; ?>" />
    <meta property="og:title" content="<?php echo $pageTitle; ?>" />
    <meta name="twitter:title" content="<?php echo $pageTitle; ?>" />
    <meta property="og:description" content="<?php echo $pageDescription; ?>" />
    <meta name="twitter:description" content="<?php echo $pageDescription; ?>" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../dist/prism/prism.css">


    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>



    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular-cookies.min.js"></script>
    <script src="../documentation-main/documentation.js"></script>
    <script src="../dist/site.js"></script>

</head>

<body  class="big-text" ng-app="documentation">
<!--<body ng-app="index" class="big-text">-->

<?php $navKey = "blog"; include 'navbar.php'; ?>

<?php $headerTitle = "ag-Grid Blog"; include 'headerRow.php'; ?>

<?php include '../example-runner/utils.php'; ?>

<div class="container">