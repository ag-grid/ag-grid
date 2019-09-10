<?php
$navKey = "licenseAndPricing";
include_once 'includes/html-helpers.php';
gtm_data_layer('community-enterprise');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php
    meta_and_links("ag-Grid: License and Pricing", "ag-Grid Javascript Grid License and Pricing", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows adescribes the License and Pricing details for ag-Grid Enterprise.", true);
    ?>

    <!-- Facebook Pixel Code -->
    <script>
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ?
                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window,
            document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '512303249109564'); // Insert your pixel ID here.
        fbq('track', 'PageView');
    </script>
    <noscript><img style="display:none; width: 1px; height: 1px;"
                   src="https://www.facebook.com/tr?id=512303249109564&ev=PageView&noscript=1"
        /></noscript>
    <!-- DO NOT MODIFY -->
    <!-- End Facebook Pixel Code -->

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

    <link rel="stylesheet" href="dist/homepage.css">
    <link rel="stylesheet" href="dist/docs.css">
</head>

<body ng-app="index">

<!-- trackers -->
<script>
    fbq('track', 'ViewContent');
</script>

<script type="text/javascript">
    _linkedin_data_partner_id = "71830";
</script>
<script type="text/javascript">
    (function () {
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";
        b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);
    })();
</script>

<noscript>
    <img style="display:none; width: 1px; height: 1px;" alt=""
         src="https://dc.ads.linkedin.com/collect/?pid=71830&fmt=gif"/>
</noscript>

<header id="nav" class="compact">
    <?php
    $version = 'latest';
    include './includes/navbar.php';
    ?>
</header>

<div id="documentation" class="new" style="-webkit-font-smoothing: antialiased;">
        <section id="content">
            <div class="info-page">
                <div class="row">
                    <section>
                        <div id="thankyou" style="display: none"> Thank you for contacting ag-Grid. We'll be in contact
                            shortly.
                        </div>

                        <h1 style="color: black">AG-GRID PRICING</h1>
                        <p class="lead">ag-Grid comes in two versions – <strong>ag-Grid Community</strong> and <strong>ag-Grid Enterprise</strong>.
                            You can <b>evaluate ag-Grid Enterprise without contacting us</b>. A license is only
                            required when you start developing for production.</p>

                        <div class="mb-5">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h2 class="card-title">
                                                <img src="./images/pricing/Community.svg" style="max-width: 50px;" alt="MIT">
                                                ag-Grid Community
                                            </h2>
                                            <h3 class="h5 card-subtitle mb-2 text-muted">Open Source MIT License (Free for Everyone)</h3>
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
                                            <h2 class="card-title">
                                                <img src="./images/enterprise_50.png" style="width: 50px;" alt="MIT">
                                                ag-Grid Enterprise
                                            </h2>
                                            <h3 class="h5 card-subtitle mb-2 text-muted">Commercial License</h3>
                                            <ul class="card-text">
                                                <li>All Community features + </li>
                                                <li><strong>A premium set of enterprise oriented features</strong></li>
                                                <li><strong>Dedicated support</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="inline-container">
                            <div class="row" id="licenses" style="margin-bottom: 0.25rem">
                                <div class="col-md-4">
                                    <div class="license">
                                        <div class="card-body">
                                            <img src="./images/pricing/Community.svg" style="max-width: 75px;" alt="MIT">
                                            <section style="margin-top: 25px">&nbsp;</section>
                                            <section style="">ag-Grid Community Developer License</section>
                                            <section>&nbsp;</section>
                                            <h4>FREE<span>&nbsp;</span></h4>
                                        </div>
                                        <div class="card-footer">
                                            <a class="btn" href="../javascript-grid-getting-started/">Get Started</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="license">
                                        <div class="card-body">
                                            <img src="./images/pricing/SA.svg" style="max-width: 75px;" alt="Single Application">
                                            <section style="margin-top: 25px">ag-Grid Enterprise</section>
                                            <section style="font-size: larger;font-weight: bolder">Single Application
                                            </section>
                                            <section>Developer License</section>
                                            <h4>&dollar;750.<span
                                                        style="display:inline-block;font-size: small">00</span>
                                                <span>per app/per Developer</span>
                                            </h4>
                                        </div>
                                        <div class="card-footer">
                                            <a class="btn" style="color: turquoise;border-color: turquoise" href="..">BUY</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="license">
                                        <div class="card-body">
                                            <img src="./images/pricing/MA.svg" style="max-width: 75px;" alt="Multiple Applications">
                                            <section style="margin-top: 25px">ag-Grid Enterprise</section>
                                            <section style="font-size: larger;font-weight: bolder">Multiple
                                                Applications
                                            </section>
                                            <section>Developer License</section>
                                            <h4>&dollar;1,200.<span
                                                        style="display:inline-block;font-size: small">00</span>
                                                <span>per Developer</span>
                                            </h4>
                                        </div>
                                        <div class="card-footer">
                                            <a class="btn" style="color: turquoise;border-color: turquoise" href="..">BUY</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!--                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem" id="nav-buttons">
                                                            <div class="col-md-12">
                                                                <div style="display: flex;flex-direction: column">
                                                                    <a class="btn"
                                                                       style=";color: lightgrey;border-color: lightgrey;background-color: darkgray"
                                                                       href="#definitions">DEFINITIONS</a>
                                                                    <a class="btn"
                                                                       style="margin-top:5px;color: lightgrey;border-color: lightgrey;background-color: darkgray"
                                                                       href="#deeper-dive">DEEPER DIVE</a>
                                                                    <a class="btn"
                                                                       style="margin-top:5px;color: lightgrey;border-color: lightgrey;background-color: darkgray"
                                                                       href="#timeline">LICENSE TIMELINE</a>
                                                                    <a class="btn"
                                                                       style="margin-top:5px;color: lightgrey;border-color: lightgrey;background-color: darkgray"
                                                                       href="faq">FAQ</a>
                                                                </div>
                                                            </div>
                                                        </div>
                            -->
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex"
                                 id="definitions">
                                <div style="flex: 1">&nbsp;</div>
                                <div style="flex: 11; text-decoration: underline; color: orange;">
                                    <h1 style="color: black">
                                        DEFINITIONS</h1>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/Community.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Community License</span>
                                    </div>
                                    <div>
                                        <span>Licenses use of ag-Grid Community – which contains all of our Core features – without charge under the MIT license.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    &nbsp;
                                </div>
                                <div style="flex: 11">
                                    <div style="margin-top: 0.5rem">
                                        <span style="font-weight: bold">Enterprise License</span>
                                    </div>
                                    <div>
                                        <span>Licenses use of ag-Grid Enterprise – which contains all of our Core and Enterprise Features, such as; aggregating row/column data, grouping rows/columns, pivot tables, master/detail layout, etc – for internal use, as a Perpetual, Concurrent, per Licensed Developer, per Application Commercial License with 1-year subscription to New Versions, Support and Maintenance.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/SA.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Single Application Developer License (Enterprise)</span>
                                    </div>
                                    <div>
                                        <span>Allows One Licensed Developer to use ag-Grid Enterprise in One Application, for internal use, in perpetuity. Includes a 1-year subscription to New Versions, Support and Maintenance. For customer-facing (external) applications see Deployment License Add-on.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">Example<br/>
                                A development team in company ‘A’ working on an application named ‘MyApp’ decides to use ag-Grid Multiple Applications Developer License. They need to purchase the number of developer license ‘seats’ that equals the count of concurrent, Front-End, JavaScript developers working on ‘MyApp’, say 5. If company ‘A’ starts working on a new application named ‘NewApp’ they can freely move developers between the two projects, assuming the concurrent count of ‘seats’ is not exceeded. That means that company ‘A’ ownes 5 ag-Grid Multiple Application Developer Licenses available to use with ‘MyApp’, ‘NewApp’ and any other project so long as the concurrent licensed developer count is not exceeded.
                            </span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/MA.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Multiple Applications Developer License (Enterprise)</span>
                                    </div>
                                    <div>
                                        <span>Allows One Licensed Developer to use ag-Grid Enterprise in Unlimited Applications, for internal use, in perpetuity. Includes a 1-year subscription to New Versions, Support and Maintenance. For customer-facing (external) applications see Deployment License.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">Example<br/>
                                A development team in company ‘A’ working on an application named ‘MyApp’ decides to use
                                <span style="white-space: nowrap;">ag-Grid</span> Single Application Developer License. They need to purchase the number of developer license ‘seats’ that equals the count of concurent, Front-End, JavaScript developers working on ‘MyApp’, say 5. These 5 ‘seats’ will only be available with ‘MyApp’. If company ‘A’ starts working on a new application named ‘NewApp’ they need to purchase a number of developer license ‘seats’ that equals the count of concurrent, Front-End, JavaScript developers working on ‘NewApp’, say 3. That means that company ‘A’ now owns 8
                                <span style="white-space: nowrap;">ag-Grid</span> Single Application Developer Licenses – 5 for use with ‘MyApp’ only and 3 for use with ‘NewApp’ only.
                            </span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/Deployment%20Add-on.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Deployment License Add-on (Enterprise)</span>
                                    </div>
                                    <div>
                                        <span>Allows Licensed Developers to sub-license ag-Grid for One Application on One Production Environment in perpetuity. Includes a 1-year subscription to New Versions, Support and Maintenance. Only available with a Developer License.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">Example 1<br/>
Company ‘A’ deploys ‘MyApp’ as a SaaS offering on a multi-tenant cloud instance. It’s replicated for performance across 5 Availability Zones and accessed by hundreds of thousands of customers. Company ‘A’ needs a single Deployment License Add-on to cover a single Production Environment, irrespective of the quantity of resources available to the app. Development, Testing, Build, Integration, Staging, etc. environments are not counted.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">Example 2<br/>
A customer of company ‘A’, company ‘B’, requests a version of ‘MyApp’ to run on their private infrastructure. Company ‘A’ deploys ‘MyApp’ to a datacenter controlled by Company ‘B’. Company ‘A’ needs One Deployment License Add-on to cover its SaaS offering (Example 1) and One Deployment License Add-on to cover the ‘on-premise’ deployment to Company ‘B’, irrespective of the quantity of resources available to the app. Development, Testing, Build, Integration, Staging, etc. environments are not counted.
                            </span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">Example 3<br/>
Company ‘C’ approaches company ‘A’ with a request to deploy ‘MyApp’ across 50 locations, each with their own infrastructure. Company ‘A’ would need One Deployment License Add-on to cover its SaaS offering (Example 1), One Deployment License Add-on to cover the ‘on-premise’ deployment to Company ‘B’ (Example 2) and Fifty Deployment License Add-ons to cover the ‘on-premise’ deployment to Company ‘C’, irrespective of the quantity of resources available to the app in a location. Development, Testing, Build, Integration, Staging, etc. environments are not counted.                            </span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 1rem;margin-bottom: 0.25rem;display: flex"
                                 id="deeper-dive">
                                <div style="flex: 1">&nbsp;</div>
                                <div style="flex: 11; text-decoration: underline; color: red;">
                                    <h1 style="color: black">DEEPER DIVE</h1>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/Dependency.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Project Dependency</span>
                                    </div>
                                    <div>
                                        <span>A software project will have a dependency on ag-Grid Enterprise if it requires our software to perform some of its functions. Every Front-End JavaScript developer working on the project will need to be licensed.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">Example<br/>
                                Company ‘A’ is developing an application named ‘MyApp’. The app needs to render 10K rows of data in a table and allow users to group, filter and sort. The dev team adds ag-Grid Enterprise to the project to satisfy that requirement. 5 Front-End and 10 Back-End developers are working on ‘MyApp’. Only 1 Front-End developer is tasked with configuring and modifying the data grid. The benefit to the UI is project wide however and all developers contributing to it need to be licensed. Company ‘A’ purchases 5 licenses for ag-Grid Enterprise.
                            </span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/Indirect.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Indirect Project Dependency</span>
                                    </div>
                                    <div>
                            <span>A software project will have an indirect dependency on ag-Grid Enterprise even if it’s wrapped into another framework, file, library, etc. Every Front-End JavaScript developer working on a project using a library that wraps ag-Grid Enterprise will need to be licensed.
                            </span>
                                        <br/>
                                        <span style="color: grey">Please note: You are not allowed to wrap ag-Grid Enterprise in a framework, library, component, etc. and make it available as a development tool outside of your organisation.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">
                                Example<br/>
                                A UI development team at Company ‘A’ creates its own UI library for internal development and includes ag-Grid Enterprise as a component. The team working on ‘MyApp’ uses the new library and so does the team working on ‘NewApp’. ‘MyApp’ has 5 Front-End JavaScript developers and ‘NewApp’ has 3. There are 2 Front-End JavaScript developers on the UI development team. Comnpany ‘A’ purchases 10 licenses for ag-Grid Enterprise.
                            </span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Production Environment</span>
                                    </div>
                                    <div>
                                        <span>To follow</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">
                            </span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 1rem;margin-bottom: 0.25rem;display: flex"
                                 id="timeline">
                                <div style="flex: 1">&nbsp;</div>
                                <div style="flex: 11; text-decoration: underline; color: magenta;">
                                    <h1 style="color: black">LICENSE TIMELINE</h1>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/Perpetual.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Perpetual License</span>
                                    </div>
                                    <div>
                            <span>When you purchase ag-Grid Enterprise you are granted a license to use a version of the product in perpetuity. There are no further charges until you choose to extend your license to cover newer versions (see next point).
                            </span>
                                        <br/>
                                        <span style="color: grey">Please note that while use of the software is perpetual Support and Corrective Maintenance are not. We do not provide issue resolution to versions of ag-Grid Enterprise older than 12m. We roll bug fixes, performance enhancements and other improvements into new releases – we don’t patch, fix or in any way alter older versions.</span>
                                    </div>
                                    <div style="margin-top: 0.75rem">
                            <span style="color: grey">
                                Example<br/>
                                Company ‘A’ is developing an application named ‘MyApp’. The app needs to render 10K rows of data in a table and allow users to group, filter and sort. The dev team adds ag-Grid Enterprise to the project to satisfy that requirement. 5 Front-End and 10 Back-End developers are working on ‘MyApp’. Only 1 Front-End developer is tasked with configuring and modifying the data grid. The benefit to the UI is project wide however and all developers contributing to it need to be licensed. Company ‘A’ purchases 5 licenses for ag-Grid Enterprise.
                            </span>
                                    </div>
                                    <div style="padding: 2rem">
                                        <img src="./images/pricing/Version%201.svg" style="display:block; margin-left: 1rem;">
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem; margin-bottom: 0.25rem; display: flex;">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/1-year.svg" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">1-year Subscription to New Versions (included)</span>
                                    </div>
                                    <div>
                                        <span>When you make a purchase you get a Subscription to license New Versions of ag-Grid Enterprise for 365 days. You can see our release list here. After 365 days you will no longer be able to license the latest versions of ag-Grid Enterprise without renewing your subscription. You can continue to use your licensed versions in perpetuity.</span>
                                        <br/>
                                        <span style="color: grey">Please note that while use of the software is perpetual Support and Corrective Maintenance are not. We do not provide issue resolution to versions of ag-Grid Enterprise older than 12m. We roll bug fixes, performance enhancements and other improvements into new releases – we don’t patch, fix or in any way alter older versions.</span>
                                    </div>
                                    <div style="padding: 2rem">
                                        <img src="./images/pricing/Versions%202.svg" style="display:block; margin-left: 1rem">
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="./images/pricing/Renewal%20icon.svg" style="display:block; max-width: 40px; margin-left: 1rem;">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Subscription Renewal (optional)</span>
                                    </div>
                                    <div>
                                        <span>You can choose to renew your Subscription to license New Versions of ag-Grid Enterprise at a discounted rate. This could range from 365 days up to a 5-year term. At the end of your subscription period you will no longer be able to license the latest versions of ag-Grid Enterprise without renewing. You can continue to use your licensed versions in perpetuity.</span>
                                        <br/>
                                        <span style="color: grey">Please note that while use of the software is perpetual Support and Corrective Maintenance are not. We do not provide issue resolution to versions of ag-Grid Enterprise older than 12m. We roll bug fixes, performance enhancements and other improvements into new releases – we don’t patch, fix or in any way alter older versions.</span>
                                    </div>
                                    <div style="padding: 2rem">
                                        <img src="./images/pricing/Versions%203.svg"
                                             style="display:block;margin-left: 1rem">
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Support (only with an active subscription)</span>
                                    </div>
                                    <div>
                                        <span>We offer a log-in protected support portal that has a vast knowledge base library and access to our ticketing system. We aim to respond to support requests within 24h. We operate on Business Days only, between 9am and 5pm GMT.</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row" style="padding-top: 0.25rem;margin-bottom: 0.25rem;display: flex">
                                <div style="flex: 1;">
                                    <img src="" style="display:block; max-width: 40px; margin-left: 1rem">
                                </div>
                                <div style="flex: 11">
                                    <div>
                                        <span style="font-weight: bold">Corrective maintenance (only with an active subscription)</span>
                                    </div>
                                    <div>
                                        <span>To follow</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </section>
<!--        <div id="side-bar">-->
        <div id="side-bar" style="display: none">
            <div style="margin: 1rem; position: fixed; top: 65px;">
                <div style="border: 1px solid rgba(0, 0, 0, 0.125); border-radius: 0.25rem; background-color: #f8f9fa;display: flex; flex-direction: column; align-items: center">
                    <div style="flex: 1 1 auto; margin: 1rem">
                        <img src="./images/pricing/SA.svg" style="min-width: 50px; max-width: 50px;">
                    </div>
                    <div style="flex: 1 1 auto;">
                        &dollar;750
                    </div>
                    <div style="flex: 1 1 auto; margin: 1rem">
                        <a class="btn" style="color: turquoise;border-color: turquoise" href="..">BUY</a>
                    </div>
                </div>
                <div style="border: 1px solid rgba(0, 0, 0, 0.125); border-radius: 0.25rem; background-color: #f8f9fa;display: flex; flex-direction: column; align-items: center; margin-top: 1rem">
                    <div style="flex: 1 1 auto; margin: 1rem">
                        <img src="./images/pricing/MA.svg" style="min-width: 55px; max-width: 55px;">
                    </div>
                    <div style="flex: 1 1 auto;">
                        &dollar;1,200
                    </div>
                    <div style="flex: 1 1 auto; margin: 1rem">
                        <a class="btn" style="color: turquoise;border-color: turquoise" href="..">BUY</a>
                    </div>
                </div>
                <div style="border: 1px solid rgba(0, 0, 0, 0.125); border-radius: 0.25rem; background-color: #f8f9fa; margin-top: 1rem">
                    <a class="btn" style="color: turquoise;border-color: turquoise; width: 100%" href="..">CONTACT US</a>
                </div>
            </div>
        </div>
</div>

<!-- The Order Form Modal -->
<!--<div class="modal fade orderForm-applicationDeveloper" tabindex="-1" role="dialog" aria-labelledby="orderFormLabel">-->
<!--    <div class="modal-dialog modal-lg" role="document">-->
<!--        <div class="modal-content">-->
<!--            <div class="modal-header">-->
<!--                <h4 class="modal-title">Order Enquiry</h4>-->
<!--                <button type="button" class="close" data-dismiss="modal" aria-label="Close">-->
<!--                    <span aria-hidden="true">&times;</span>-->
<!--                </button>-->
<!--            </div>-->
<!--            <div class="modal-body">-->
<!--                --><?php
//                $formKey = "applicationDeveloper";
//                include("includes/orderForm.php"); ?>
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</div>-->

<!-- The Order Form Modal -->
<!--<div class="modal fade orderForm-siteDeveloper" tabindex="-1" role="dialog" aria-labelledby="orderFormLabel">-->
<!--    <div class="modal-dialog modal-lg" role="document">-->
<!--        <div class="modal-content">-->
<!--            <div class="modal-header">-->
<!--                <h4 class="modal-title">Order Enquiry</h4>-->
<!--                <button type="button" class="close" data-dismiss="modal" aria-label="Close">-->
<!--                    <span aria-hidden="true">&times;</span>-->
<!--                </button>-->
<!--            </div>-->
<!--            <div class="modal-body">-->
<!--                --><?php
//                $formKey = "siteDeveloper";
//                include("includes/orderForm.php"); ?>
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</div>-->
<!-- The Order Form Modal -->
<!--<div class="modal fade orderForm-saasAndOEM" tabindex="-1" role="dialog" aria-labelledby="orderFormLabel">-->
<!--    <div class="modal-dialog modal-lg" role="document">-->
<!--        <div class="modal-content">-->
<!--            <div class="modal-header">-->
<!--                <h4 class="modal-title">Order Enquiry</h4>-->
<!--                <button type="button" class="close" data-dismiss="modal" aria-label="Close">-->
<!--                    <span aria-hidden="true">&times;</span>-->
<!--                </button>-->
<!--            </div>-->
<!--            <div class="modal-body">-->
<!--                --><?php
//                $formKey = "saasAndOEM";
//                include("includes/orderForm.php"); ?>
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</div>-->
<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
<script>
    if (window.location.href.indexOf("/community-support.php?submitted=true") !== -1) {
        (new Image()).src = "//www.googleadservices.com/pagead/conversion/873243008/?label=8TOnCM7BnWsQgMOyoAM&guid=ON&script=0";
    }

    function getRect(element) {
        const bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return bounds;
    }

    function getCurrentViewPort() {
        const viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft(),
            right: NaN,
            bottom: NaN
        };

        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        return viewport;
    }

    var win = jQuery(window);

    function trackIfInViewPort(element, leeway, callback) {
        function comparePosition() {
            var viewPort = getCurrentViewPort();
            var box = getRect(element);
            var inViewPort = viewPort.bottom >= box.top && viewPort.top <= (box.bottom - leeway);

            callback(inViewPort);
        }

        comparePosition();
        window.addEventListener('scroll', comparePosition);
    }

    function positionAndToggleSideBar(inViewPort) {
        var pricingNav = jQuery('#side-bar');
        var licenses = jQuery('#licenses');

        var viewPort = getCurrentViewPort();

        pricingNav.offset({top: viewPort.top, left: licenses.offset().left + licenses.width() + 100});
        inViewPort ? pricingNav.fadeOut() : pricingNav.fadeIn();
    }

    // allow for a little margin leeway - looks nicer
    var leeway = 25;
    trackIfInViewPort(jQuery('#licenses'), leeway, positionAndToggleSideBar);
</script>
<script src="dist/homepage.js"></script>
</body>
</html>
