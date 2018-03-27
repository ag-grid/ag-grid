<?php 
$navKey = "licenseAndPricing";
include_once 'includes/html-helpers.php';
gtm_data_layer('community-enterprise');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links("ag-Grid: License and Pricing", "ag-Grid Javascript Grid License and Pricing", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows adescribes the License and Pricing details for ag-Grid Enterprise.", true);
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

            <h1>ag-Grid Pricing</h1> 

            <p class="lead">Ag-Grid comes in two versions &ndash; <strong>Community</strong> and <strong>Enterprise</strong>. Let's go over the differences between the two, so you can pick the one that is most suitable for your project.</p>
<!--
            <p class="lead">Ag-Grid comes in two versions &ndash; <strong>Community</strong> and <strong>Enterprise</strong>. The document outlines the important differences between the two.</p>
                <p class="lead">The Community eddition is <strong>MIT licensed</strong>, supports all major JavaScript frameworks, includes all essential datagrid features and can be used free of charge.</p> 
                <p class="lead">The enterprise version is <strong>commercially licensed</strong>, includes everything from the community edition, adds a set of advanced features that target scenarios commonly found in the enterprise, and includes dedicated private support with 24h response time SLA.</p>
-->

            <div class="mb-5">
                <div class="row">
                    <div class="col-sm-6">
                        <div class="card h-100">
                          <div class="card-body">
                            <h2 class="card-title">ag-Grid Community</h2>
                            <h3 class="h5 card-subtitle mb-2 text-muted">MIT License</h3>


                            <ul class="card-text">
                                <li>All essential datagrid features</li>
                                <li>Community support</li>
                            </ul> 

                            <br />


                          </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="card h-100">
                          <div class="card-body">
                            <h2 class="card-title">ag-Grid Enterprise</h2>
                            <h3 class="h5 card-subtitle mb-2 text-muted">Commercial License</h3>
                            <ul class="card-text">
                                <li>All Community features + </li>
                                <li><strong>A premium set of enteprise oriented features</strong></li>
                                <li><strong>Dedicated support</strong></li> 
                            </ul>
                          </div>
                        </div>
                    </div>
                </div>
            </div>


            <h2>License and Pricing for ag-Grid Enterprise</h2>

            <p>
                ag-Grid Enterprise is our commercial product that is designed for Enterprise development teams. 
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
                        <p><a href="start-trial.php">Sign up for a free trial</a></p>
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
                        <p><a href="start-trial.php">Sign up for a free trial</a></p>
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
                        <p><a href="start-trial.php">Sign up for a free trial</a></p>
                    </div>

                    <div class="card-footer">
                        <a class="btn" data-product-type="single-developer" href="#" data-toggle="modal" data-target=".orderForm-saasAndOEM">Enquire</a>
                    </div>
                </div>

                </div>
                </div>
                </div>

                <h2 class="small-block">Which License Should You Choose? </h2>

                <p>To pick the correct license, answer these simple questions: </p>

                <h3 class="license-question">&mdash; Are you using ag-Grid Enterprise in one application? </h3>

                <p>If it's one application, a Single Application License is correct. Otherwise a Multiple Application License is best.</p>

                <h3 class="license-question">&mdash; Is your application for an internal or external end-user?</h3>

                <p>If external, then you also need SaaS or OEM licensing.</p>

                <p>If you still need help figuring out which one of the above is most suitable for your case, <a href="mailto:info@ag-grid.com?Subject=ag-Grid%20Enquiry">contact us.</a></p>

                <h2>Features Exclusive to ag-Grid Enterprise</h2>

                <p>
                   To review all features exclusive to the enterprise, check our <a href="documentation-main/documentation.php">documentation overview</a>. The enterprise features are marked with <span class="enterprise-icon ng-scope">e</span>.
                </p>

                <h2>Community / Enterprise Support</h2>

                <p>Purchasing a license for ag-Grid Enterprise grands you access to our ticketing system, which means guaranteed response in a 24 hour during weekdays.</p>

                <p>If you are using the community version of ag-Grid, you can follow the <a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow <code>ag-grid</code> tag</a>. 
                We also accept bug reports with reproduction in the <a href="https://github.com/ag-grid/ag-grid/issues">ag-grid/ag-grid GitHub repository issues - follow the issue template</a>.</p>

                <hr>

                <h2>Frequently Asked Questions</h2>

                <dl id="faq">
                <dt>What is the difference between Single Application Developer License and Multiple Application Developer License?</dt>
                <dd>
                    <p>
                        Single Application developer license ties the license to <strong>one particular application</strong> within your organisation.
                        A typical example is <strong>5 licenses</strong> to cover an application with <strong>5 developers</strong> working concurrently on it.
                        This is best if you a) have only one (or a fixed number) of applications you need to license or b) you
                        want to <strong>charge the license</strong> to a particular project(s).
                    </p>

                    <p>
                        Multiple Application developer license allows unlimited applications to be developed by a fixed number of developers.
                        A typical example is 5 license to cover an <strong>unlimited number of applications</strong> with 5 developers working
                        across all applications concurrently. Use site license if you want to cover a group
                        of developers developing any number of applications.
                    </p>
                </dd>

                <dt>What are OEM and SaaS Licenses?</dt>
                <dd>
                    <p>
                        SaaS is <a href="https://en.wikipedia.org/wiki/Software_as_a_service">Software as a Service</a>.
                        If you will be <strong>selling
                        ag-Grid</strong> as part of a SaaS then you require an additional SaaS license.
                    </p>

                    <p>
                        OEM is <a href="https://en.wikipedia.org/wiki/Original_equipment_manufacturer">Original Equipment
                            Manufacturer</a>. If you will be <strong>selling
                        ag-Grid</strong> as part of your product then you require additional OEM license.
                    </p>
                </dd>

                <dt>Do developers have to be named?</dt>
                <dd>
                    <p>
                        No. If you license an application you provide the number of developers working on that application.
                        We trust that you do not go over the number of concurrent developers on that application at any
                        given time. Developers moving on and off projects is expected to be normal.
                    </p>
                </dd>

                <dt>What does perpetual mean?</dt>
                <dd>
                    <p>
                        The perpetual nature of the Enterprise license means you can continue to use the version of
                        <strong>ag-Grid Enterprise</strong>, plus any release for one year, indefinitely. There is no requirement to
                        pay again to continue using the software. However if you wish to keep up to date with the
                        latest versions of <strong>ag-Grid</strong> after one year and continue with support, you must extend the
                        license.
                    </p>
                </dd>

                <dt>Do you provide bulk or other license types?</dt>
                <dd>
                    <p>
                        Yes. Get in touch and tell us what you are looking for. We are always open to dicussion and will propose what we think is fair.
                    </p>
                </dd>
                </dl>

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
<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
<script>
if(window.location.href.indexOf("/community-support.php?submitted=true") !=-1)
{
(new Image()).src="//www.googleadservices.com/pagead/conversion/873243008/?label=8TOnCM7BnWsQgMOyoAM&guid=ON&script=0";
}
</script>
<script src="dist/homepage.js"></script>
</body>
</html>
