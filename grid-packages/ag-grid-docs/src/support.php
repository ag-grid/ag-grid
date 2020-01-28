<?php
$navKey = "support";
include_once 'includes/html-helpers.php';
gtm_data_layer('support');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links("How to get Support for ag-Grid", "ag-Grid Javascript Grid Support", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page explains the different support models for the free and Enterprise versions of ag-Grid.", false);
?>
<link rel="stylesheet" href="../dist/homepage.css">
</head>

<body>
<header id="nav" class="compact">
<?php 
$version = 'latest';
include './includes/navbar.php';
?>
</header>

<div class="info-page">
    <div class="row">
        <section>
            <h1>ag-Grid support</h1>

            <h2>Changelog and Pipeline of Work</h2>

            <p>You have encountered a bug or you have a feature request in mind? 
                Chances are that we are already aware of it. Please check the changelog and the pipeline first.</p>

            <ul class="content-list">
                <li><a href="/ag-grid-changelog">Changelog covering versions 7.x and earlier</a></li>
                <li><a href="/ag-grid-pipeline">Pipeline of up and coming features and Bug Fixes</a></li>
            </ul>

            <h2>Free Support</h2>

            <p>
                The free version of ag-Grid is distributed under <strong>MIT license</strong> and comes with no warranty or support.
                All feature requests and bugs raised by the community are taken as advice.
            </p>

            <p>
                If you are only interested in the free features of ag-Grid but require support, you can
                purchase a <strong>Enterprise license</strong> to access support. If you don't require support, you can
                "give back" to the ag-Grid project by purchasing a token license. 
                The donation will contribute towards the product future growth.
            </p>

            <h2 class="heading-enterprise">Enterprise Support</h2>

            <p>
                ag-Grid Enterprise users have access to guaranteed support through our <strong>private ticketing system</strong>.  
                Feature requests and bugs raised by Enterprise users will be given priority and serious consideration. 
                Discussions had with Enterprise users will also help dictate the ag-Grid roadmap.
            </p>


            <div class="note">
                If you are a commercial license holder and do not have the necessary credentials for the <strong>ticketing system</strong>,
                please contact us at <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
            </div>

            <h2>In Need of Help?</h2>

            <p>Following are several common question types and the recommended way to address them accordingly based on the license you are using:

            <section id="support-question-examples">
                <h3>I Got This Error, Why?</h3>

<div class="container-fluid"> <div class="row"> <div class="col-md-6">

<h4>ag-Grid (MIT)</h4>
<p>Look for similar problems in the <a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow <code>ag-grid</code> tag</a>. If nothing seems related, post a new message there.</p>

</div> <div class="col-md-6">

<h4>ag-Grid Enterprise (Commercial License)</h4>
<p>Contact us through the private ticketing system.</p>

</div> </div>  </div>


                <h3>Please Review my Code</h3>

<div class="container-fluid"> <div class="row"> <div class="col-md-6">
                <h4>ag-Grid (MIT)</h4>
                <p>You can request such assistance in the <a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow <code>ag-grid</code></a> channel.</p>

</div> <div class="col-md-6">
                <h4>ag-Grid Enterprise (Commercial License)</h4>
                <p>Contact us through the private ticketing system.</p>

</div> </div>  </div>
                <h3>I Got an Error and 99% Sure it's a Bug</h3>

<div class="container-fluid"> <div class="row"> <div class="col-md-6">
                <h4>ag-Grid (MIT)</h4>
<ul class="content-list">
<li>Browse the documentation section and find an example similar to your case.</li> 
<li>Launch a new plunker from the example and modify it so that the issue is reproducible. </li> 
<li>Post the plunker url along with the necessary steps to reproduce as a <a href="https://github.com/ag-grid/ag-grid/issues">Github issue in the ag-grid project</a>.  </li>
</ul>

</div> <div class="col-md-6">
                <h4>ag-Grid Enterprise (Commercial License)</h4>
                <p>Either follow the repro steps from the MIT version or contact us through the private ticketing system.  <br /> We will still need a reproduction to address the problem.</p>
</div> </div>  </div>

                <h3>I Have an Idea or Feature Request</h3>

<div class="container-fluid"> <div class="row"> <div class="col-md-6">
                <h4>ag-Grid (MIT)</h4>

                <p>Post it as an <a href="https://github.com/ag-grid/ag-grid/issues">Github issue in the ag-grid project</a>.</p>

</div> <div class="col-md-6">
                <h4>ag-Grid Enterprise (Commercial License)</h4>

                <p>Contact us through the private ticketing system.</p>

</div> </div>  </div>

                <h3>When Will You Implement &hellip; / Fix &hellip;?</h3>

<div class="container-fluid"> <div class="row"> <div class="col-md-6">
                <h4>ag-Grid (MIT)</h4>

                <p>The MIT license does not cover such level of assistance - in case you need such, please consider purchasing a commercial license.</p>

</div> <div class="col-md-6">
                <h4>ag-Grid Enterprise (Commercial License)</h4>

                <p>Contact us through the private ticketing system. </p>

</div> </div>  </div>

                <h3>I Have Billing Issues</h3>

<div class="container-fluid"> <div class="row"> <div class="col-md-6">
    <h4>ag-Grid (MIT)</h4>
    <p>That's unlikely - have you considered becoming an enterprise user? Please shoot an email at <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
</div> <div class="col-md-6">
                <h4>ag-Grid Enterprise (Commercial License)</h4>
                <p>Contact us through the private ticketing system.</p>
</div> </div>  </div>

            </section>

        </section> <!-- end col -->

    </div> <!-- end row -->

</div>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>