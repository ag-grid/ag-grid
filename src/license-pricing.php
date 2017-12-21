<?php
$navKey = "licenseAndPricing";
include_once 'includes/html-helpers.php';
?>
<!DOCTYPE html>
<html>
<head lang="en">
<?php
meta_and_links("ag-Grid License and Pricing", "ag-Grid Javascript Grid License and Pricing", "License and Pricing details for ag-Grid", true);
?>

<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '512303249109564'); // Insert your pixel ID here.
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=512303249109564&ev=PageView&noscript=1"
/></noscript>
<!-- DO NOT MODIFY -->
<!-- End Facebook Pixel Code -->

<link rel="stylesheet" href="dist/homepage.css">

<style>
</style>

</head>

<body ng-app="index">

<!-- trackers -->
<script>
fbq('track', 'ViewContent');
</script>

<script type="text/javascript">
_linkedin_data_partner_id = "71830";
</script><script type="text/javascript">
(function(){var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})();
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://dc.ads.linkedin.com/collect/?pid=71830&fmt=gif" />
</noscript>

<!-- trackers end -->

<header id="nav" class="compact">
<?php 
$version = 'latest';
include './includes/navbar.php';
?>
</header>

<div class="info-page">
    <div class="row">
        <section>
            <div id="thankyou" style="display: none"> Thank you for contacting ag-Grid. We'll be in contact shortly.  </div>

            <h1>License and Pricing for ag-Grid Enterprise</h1>

            <p class="lead">
                <strong>ag-Grid Enterprise</strong> is our commercial product that is designed for Enterprise development teams. 
                The commercial licenses are <strong>perpetual</strong> and include <strong>one year</strong> of support, maintenance and upgrades.
We offer three flavors &ndash; <strong>Single Application Developer</strong>, <strong>Multiple Application Developer</strong> and <strong>SaaS / OEM</strong>.
            </p>   

                <div class="inline-container">

                <div class="row" id="licenses">
                <div class="col-md-4">
                <div class="license">
                    <div class="card-body">
                        <h3>Single Application Developer</h3>
                        <h4>&pound;495
                            <span>per Developer</span>
                        </h4>

                        <p>Usage of ag-Grid Enterprise in a <br><strong>single application</strong></p>
                    </div>

                    <div class="card-footer">
                        <a class="btn" 
                            data-product-type="single-developer" 
                            href="#" 
                            data-toggle="modal" 
                            data-target=".orderForm-applicationDeveloper">Enquire</a>
                    </div>
                </div>

                </div>      

                <div class="col-md-4">
                <div class="license recommended">
                    <div class="card-header"> Recommended </div>
                    <div class="card-body">
                        <h3>Multiple Application Developer</h3>
                        <h4>&pound;795
                            <span>per Developer</span>
                        </h4>


                        <p>Usage of ag-Grid Enterprise in <br><strong>multiple applications</strong></p>
                    </div>

                    <div class="card-footer">
                        <a class="btn" data-product-type="single-developer" href="#" data-toggle="modal" data-target=".orderForm-siteDeveloper">Enquire</a>
                    </div>
                </div>

                </div>

                <div class="col-md-4">
                <div class="license">
                    <div class="card-body">
                        <h3>SaaS and OEM</h3>
                        <h4>POA
                            <span>price on asking</span>
                        </h4>


                        <p>Usage of ag-Grid Enterprise in <br><strong>SaaS/OEM Applications</strong></p>
                    </div>

                    <div class="card-footer">
                        <a class="btn" data-product-type="single-developer" href="#" data-toggle="modal" data-target=".orderForm-saasAndOEM">Enquire</a>
                    </div>
                </div>

                </div>
                </div>
                </div>

                <p> <a href="/javascript-grid-getting-started/">An open source version with smaller set of features</a> is also available, free of charge.</p>

                <h2 class="small-block">Which License Should You Choose? </h2>

                <p>To pick the correct license, answer these simple questions: </p>

                <h3 class="license-question">&mdash; Are you using ag-Grid Enterprise in one application? </h3>

                <p>If it's one application, a Single Application License is correct. Otherwise a Multiple Application License is best.</p>

                <h3 class="license-question">&mdash; Is your application for an internal or external end-user?</h3>

                <p>If external, then you also need SaaS or OEM licensing.</p>

                <p>If you still need help figuring out which one of the above is most suitable for your case, <a href="mailto:accounts@ag-grid.com?Subject=ag-Grid%20Enquiry">contact us.</a></p>

                <?php include("includes/commonQuestions.php"); ?>

    </section>
    </div>
</div>


<!-- The Order Form Modal -->
<div class="modal fade orderForm-applicationDeveloper" tabindex="-1" role="dialog" aria-labelledby="orderFormLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">Order Enquiry</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <?php 
            $formKey = "applicationDeveloper";
            include("includes/orderForm.php"); ?>
        </div>
    </div>
  </div>
</div>

<!-- The Order Form Modal -->
<div class="modal fade orderForm-siteDeveloper" tabindex="-1" role="dialog" aria-labelledby="orderFormLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">Order Enquiry</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <?php 
            $formKey = "siteDeveloper";
            include("includes/orderForm.php"); ?>
        </div>
    </div>
  </div>
</div>

<!-- The Order Form Modal -->
<div class="modal fade orderForm-saasAndOEM" tabindex="-1" role="dialog" aria-labelledby="orderFormLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h4 class="modal-title">Order Enquiry</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <?php 
            $formKey = "saasAndOEM";
            include("includes/orderForm.php"); ?>
        </div>
    </div>
  </div>
</div>


<?php include("includes/footer.php"); ?>
<?php include_once("includes/analytics.php"); ?>

<script>
if(window.location.href.indexOf("/license-pricing.php?submitted=true") !=-1)
{
(new Image()).src="//www.googleadservices.com/pagead/conversion/873243008/?label=8TOnCM7BnWsQgMOyoAM&guid=ON&script=0";
}
</script>
<script src="dist/homepage.js"></script>
</body>
</html>