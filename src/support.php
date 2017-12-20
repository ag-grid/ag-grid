<?php
$navKey = "support";
include_once 'includes/html-helpers.php';
?>
<!DOCTYPE html>
<html class="stretch-html">
<head lang="en">
<?php
meta_and_links("ag-Grid Support", "ag-Grid Javascript Grid Support", "ag-Grid comes either as free or as Enterprise with support. This page explains the different support models for the free and Enterprise versions of ag-Grid.", false);
?>
<link rel="stylesheet" href="../dist/homepage.css">

</head>

<body>
<div >
<header id="nav" class="compact">
<?php 
    $version = 'latest';
    include './includes/navbar.php';
?>
</header>

<div class="info-page">
    <div class="row">
        <div class="col-md-12">
            <h1>ag-Grid support</h1>

            <h2>Changelog and Pipeline of Work</h2>

            <p>You have encountered a bug or you have a feature request in mind? Chances are that we are already aware of it; please check the changelog and the pipeline first.</p>

            <p> For the Changelog covering versions 7.x and earlier please go to <a href="/change-log/changeLogIndex.php">here</a>.  </p>

            <p> To see our Pipeline of up and coming Features and Bug Fixes, please go <a href="/ag-grid-pipeline">here</a>.  </p>

            <h2>Free Support</h2>

            <p>
                The free version of ag-Grid is distributed under <strong>MIT license</strong> and comes with no warranty or support.
                All feature requests and bugs raised by the community are taken as advice.
            </p>

            <p>
                If you are only interested in the free features of ag-Grid but require support, you can
                purchase a Enterprise license to access support. If you don't require support, you can
                "give back" to the ag-Grid project by purchasing a token license. 
                The donation will contribute towards the product future growth.
            </p>

            <h2>Enterprise Support</h2>

            <p>
                ag-Grid Enterprise users have access to guaranteed support through our private ticketing system.  
                Feature requests and bugs raised by Enterprise users will be given priority and serious consideration. 
                Discussions had with Enterprise users will also help dictate the ag-Grid roadmap.
            </p>

            <h2>I Need Some Help!</h2>

            <p>Following are several common question types and the recommended way to address them accordingly based on the license you are using:

            <section id="support-question-examples">
                <h3>I Got This Error, Why?</h3>

                <h4>ag-Grid (MIT)</h4>
                <p>Look for similar problems in the <a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow <code>ag-grid</code> tag</a>. If nothing seems related, post a new message there.</p>

                <h4>ag-Grid Enterprise (Commercial License)</h4>
                <p>Contact us through the private ticketing system. If you are a commercial license holder and do not have the necessary credentials, please contact us as <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.</p>

                <h3>Please Review my Code</h3>

                <h4>ag-Grid (MIT)</h4>
                <p>You can request such assistance in the <a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow <code>ag-grid</code></a> channel.</p>

                <h4>ag-Grid Enterprise (Commercial License)</h4>
                <p>Contact us through the private ticketing system. If you are a commercial license holder and do not have the necessary credentials, please contact us as <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.</p>

                <h3>I Got an Error and 99% Sure it's a Bug</h3>

                <h4>ag-Grid (MIT)</h4>
                <p>Browse the documentation section and find an example similar to your case. 
                    Launch a new plunker instance from it and modify it so that the issue is reproducible. 
                    Send the plunker url along with the necessary steps to reproduce as a <a href="https://github.com/ag-grid/ag-grid/issues">Github issue in the ag-grid project</a>.
                </p>

                <h4>ag-Grid Enterprise (Commercial License)</h4>

                <p>Either follow the steps above or contact us through the private ticketing system - we will still need a reproduction in order to address the problem further. 
                    If you are a commercial license holder and do not have the necessary credentials, please contact us as <a href="mailto:info@ag-grid.com">info@ag-grid.com</a></p>

                <h3>I Have an Idea/Request</h3>

                <h4>ag-Grid (MIT)</h4>

                <p>Post it as an <a href="https://github.com/ag-grid/ag-grid/issues">Github issue in the ag-grid project</a>.</p>

                <h4>ag-Grid Enterprise (Commercial License)</h4>

                <p>Contact us through the private ticketing system. If you are a commercial license holder and do not have the necessary credentials, please contact us as <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.</p>

                <h3>When Will You Implement &hellip; / Fix &hellip;?</h3>

                <h4>ag-Grid (MIT)</h4>

                <p>The MIT license does not cover such level of assistance - in case you need such, please consider purchasing a commercial license.</p>

                <h4>ag-Grid Enterprise (Commercial License)</h4>

                <p>Contact us through the private ticketing system. If you are a commercial license holder and do not have the necessary credentials, please contact us as <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.</p>

                <h3>I Have Billing Issues</h3>

                <h4>ag-Grid Enterprise (Commercial License)</h4>

                <p>Contact us through the private ticketing system. If you are a commercial license holder and do not have the necessary credentials, please contact us as <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.</p>

            </section>

        </div> <!-- end col -->

    </div> <!-- end row -->

</div>

<?php include_once("./includes/footer.php"); ?>

<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular-cookies.min.js"></script>
<script src="../documentation-main/documentation.js"></script>

<?php include_once("./includes/analytics.php"); ?>
</body>
</html>