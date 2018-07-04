<?php
include_once 'includes/html-helpers.php';
gtm_data_layer('trial', array('state' => 'end'));
?>
<!DOCTYPE html>
<html class="stretch-html">
<head lang="en">
<?php
meta_and_links("ag-Grid: Thanks, we will be in touch.", "ag-Grid Javascript Grid Evaluation Request", "Thank you page for new evaluation request", true);
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
            <h1>
                Thank you!
            </h1>
<hr>
            <p>
                We appreciate you getting in touch. We have received your request and we will be back in touch shortly with an Evaluation license key that lets you try out the product for two months.
            </p>
       <h2>
           Survey
       </h2>
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

<h2>Follow ag-Grid</h2>
<p>
    Twitter<br> 
    Facebook<br>
    Linkedin<br>
    Medium<br>
    Reddit<br>
    Github
</p>

        </section>
    </div>
</div>

<?php include("includes/footer.php"); ?>
<?php include_once("includes/analytics.php"); ?>

</div>

</body>
</html>