<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>Thanks!</title>
    <meta name="description" content="Thank you page for new evaluation request">
    <meta name="keywords" content="ag-Grid Javascript Grid Evaluation Request"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.0/css/font-awesome.min.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>


    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "thankYouEvaluation";
include 'includes/navbar.php'; ?>

<?php $headerTitle = "Your Request has been Received...";
include 'includes/headerRow.php'; ?>

<div class="container info-page">

    <div class="row">
        <div class="col-md-12">

            <h1>
                Thank you!
            </h1>

            <p>
                We appreciate you getting in touch. We have received your request and we will be back in touch shortly with an Evaluation license key that lets you try out the product for two months.
            </p>
            <p>
                In the meantime, why not take a look at some of the other parts of our website that might be of interest:
            <ul>
                <li>
                    You can play around with a full working demo of ag-Grid on our <a href="/example.php" >Demo Page</a>.
                </li>
                <li>
                    Browse through our extensive <a href="/documentation-main/documentation.php" >Documentation</a> which describes all of features in details.
                </li>
                <li>
                    You can read about the <a href="/about.php" >Company</a> or check out some of our <a href="/media/media.php">Blog Posts.</a>
                </li>
                <li>
                    See some of the <a href="/testimonials.php" >Testimonials</a> from our existing customers.
                </li>
            </ul>
            </p>
        </div>
    </div>

</div>

<!--         <div class="HomeSectionParent">

            <?php include 'home/intro2.php'; ?>

            <?php include 'home/features.php'; ?>

        </div> -->

<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>