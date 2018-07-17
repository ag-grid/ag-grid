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
<hr style="margin-top: -20px">
            <p>
                We appreciate you getting in touch. We have received your request and we will be back in touch shortly with an Evaluation license key that lets you try out the product for two months.
            </p>

            <p>
                In the meantime, why not take a look at some of the other parts of our website that might be of interest:
                <br><br>
                <a href="../example.php"><button type="button" class="btn btn-primary btn-lg btn-block">Play with our Demo</button></a>
                    <br>
                <a href="../documentation-main/documentation.php"><button type="button" class="btn btn-primary btn-lg btn-block" style="margin-top: -20px">Browse our Documentation</button></a>
                <br>
                <a href="../features-overview"><button type="button" class="btn btn-primary btn-lg btn-block" style="margin-top: -20px">Features Overview</button></a>
                    <br>
                <a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg btn-block" style="margin-top: -20px">Read our Blog</button></a>
                    <br>
                <a href="../testimonials.php"><button type="button" class="btn btn-primary btn-lg btn-block" style="margin-top: -20px">See our Customers</button></a>
                </li>
            </ul>
            </p>
            <hr>
<div>
                   <h2>
           Survey
           </h2>
<iframe src="https://docs.google.com/a/ag-grid.com/forms/d/e/1FAIpQLSdcyy99botWQ-sNo27aPI_aJ3DHiM905sKn3z8qw9OI4BaZhw/viewform?embedded=true" width="760" height="500" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>
</div>
<hr>
<h2>ag-Grid on Social Media</h2>
<p>
Keep up to date with everything ag-Grid, from version releases, conferences, new content and much more.
</p>
<a class="btn btn-outline-primary" href="https://twitter.com/ceolter" role="button">Twitter</a>
<a class="btn btn btn-outline-primary" href="facebook.com/aggridbalham/" role="button">Facebook</a>
<a class="btn btn-outline-info" href="linkedin.com/company/ag-grid/" role="button">Linkedin</a>
<a class="btn btn-outline-danger" href="https://www.youtube.com/channel/UCerp9sZdHwofLTW8zG6Sxtw" role="button">YouTube</a>
<a class="btn btn-outline-dark" href="medium.com/ag-grid" role="button">Medium</a>
<a class="btn btn-outline-dark" href="github.com/ag-grid" role="button">Github</a>
        </section>
    </div>
</div>

<?php include("includes/footer.php"); ?>
<?php include_once("includes/analytics.php"); ?>

</div>

</body>
</html>