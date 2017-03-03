<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>Thanks!</title>
    <meta name="description" content="Thank you page for new enquiry">
    <meta name="keywords" content="ag-Grid Javascript Grid Enquiry"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.0/css/font-awesome.min.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>


    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>
    <!-- Hotjar Tracking Code for https://www.ag-grid.com/ -->
    <script>
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:372643,hjsv:5};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
    </script>
</head>

<body ng-app="index" class="big-text">

<?php $navKey = "thankYouEnquiry";
include 'includes/navbar.php'; ?>

<?php $headerTitle = "Enquiry Received...";
include 'includes/headerRow.php'; ?>

<div class="container info-page">

    <div class="row">
        <div class="col-md-12">

            <h1>
                Thank you for your enquiry.
            </h1>

            <p>
                We appreciate you getting in touch. We have received your enquiry and we will be back in touch shortly. 
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