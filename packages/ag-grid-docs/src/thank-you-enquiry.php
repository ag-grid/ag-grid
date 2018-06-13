<?php
include_once 'includes/html-helpers.php';
gtm_data_layer('pricing', array('state' => 'end'));
?>
<!DOCTYPE html>
<html class="stretch-html">
<head lang="en">
<?php
meta_and_links("Thanks!", "ag-Grid Javascript Grid Enquiry", "Thank you page for new enquiry", true);
?>
<link rel="stylesheet" href="dist/homepage.css">
</head>

<body>
<div class="stretch-contents">
<header id="nav" class="compact">
<?php 
    $version = 'latest';
    include './includes/navbar.php';
?>
</header>

<div class="info-page">
    <div class="row">
        <section>
            <h1>Thank You for Your Enquiry</h1>

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
        </section>
    </div>
</div>
<?php include("includes/footer.php"); ?>
<?php include_once("includes/analytics.php"); ?>
</div>
</body>
</html>