<?php
$navKey = "licenseAndPricing";
include_once 'includes/html-helpers.php';
gtm_data_layer('community-enterprise');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php
    meta_and_links("ag-Grid: License and Pricing", "ag-Grid Javascript Grid License and Pricing", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page describes the License and Pricing details for ag-Grid Enterprise.", true);
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

<header id="nav">
    <?php
    $version = 'latest';
    include './includes/navbar.php';
    ?>
</header>

<div class="page-content">
    <div class="license-pricing">
        <div id="content">
            <section class="page-info">
                <h1 style="margin-bottom: 3.5rem;">ag-Grid Licensing & Pricing</h1>
            </section>
            <section class="packages">
                <div>
                    <div>
                        <img src="./images/coronavirus.png" style="max-width: 50px;" alt="Coronavirus Update">
                    </div>
                    <div>
                        <h3>Coronavirus Update</h3>
                        <p>
                            ag-Grid is open for business. We have activated our
                            contingency plan which is to allow all staff to work from home.
                            Please continue to get in touch with your interest.
                        </p>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/Community.svg" style="max-width: 50px;" alt="MIT">
                    </div>
                    <div>
                        <h3>ag-Grid Community</h3>
                        <p>
                            ag-Grid Community is a free to use product distributed under the
                            <a href="./eula/AG-Grid-Community-License.html">MIT License</a>.
                            It is free to use in your production environments.
                        </p>
                        <h3 style="margin-top: 26px;">ag-Charts Community</h3>
                        <p>
                            ag-Charts Community (a.k.a. <a href="./javascript-charts-overview/">Standalone Charts</a>)
                            is a free to use product distributed under the
                            <a href="./eula/AG-Grid-Community-License.html">MIT License</a>.
                            It is free to use in your production environments.
                        </p>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/svg/enterprise.svg" style="max-width: 50px;" alt="Enterprise">
                    </div>
                    <div>
                    <h3>ag-Grid Enterprise</h3>
                        <p>
                            ag-Grid Enterprise is a commercial product distributed under our
                            <a href="./eula/AG-Grid-Enterprise-License-Latest.html">EULA</a> and supported by our
                            technical staff. It has advanced functionality like Row Grouping, Range Selection,
                            Master / Detail, Server Side Row Model and <a href="./javascript-grid-set-license/">more</a>.
                            ag-Grid Enterprise also comes with <a href="./javascript-grid-charts-integrated-overview/">Integrated Charts</a>, allowing users to create charts
                            using the grid's UI.
                        </p>
                        <p>
                            To evaluate ag-Grid Enterprise you don’t need our permission – all features are unlocked.
                            To temporarily hide the watermark and browser console errors e-mail
                            <a href="mailto:info@ag-grid.com>">info@ag-grid.com</a> to
                            get a temporary evaluation key.
                        </p>
                        <p>
                            Once you’re ready to begin development, please purchase an appropriate license key from the
                            options below.
                        </p>
                        <p>
                            Expanded definitions and FAQ responses are available further down the page. You can e-mail
                            us at any time on <a href="mailto:info@ag-grid.com>">info@ag-grid.com</a>.
                        </p>
                </div>
            </section>
            <section id="licenses">
                <div class="license-container">
                    <div class="license" style="border-color: #009ede;">
                        <div>
                            <img src="./images/pricing/SA.svg" alt="Single Application">
                            <h3>ag-Grid Enterprise</h3>
                            <h2>Single Application</h2>
                            <h3>Development License</h3>

                        </div>
                        <h4>
                            <div style="font-size: 0.9rem;">Starting at</div>
                            &dollar;750.<span style="font-size: small">00</span>
                            <p>Per Developer</p>
                        </h4>
                        <div>
                            <a class="btn" style="color: #009ede; border-color: #009ede" href="../ecommerce/#/ecommerce/?licenseType=single">BUY</a>
<!--
                            <a class="btn" style="color: #009ede; border-color: #009ede" href="mailto:info@ag-grid.com">CONTACT US</a>
-->
                        </div>
                    </div>
                    <div class="license" style="border-color: #009d70;">
                        <div>
                            <img src="./images/pricing/MA.svg" alt="Multiple Applications">
                            <h3>ag-Grid Enterprise</h3>
                            <h2>Multiple Applications</h2>
                            <h3>Development License</h3>
                        </div>
                        <h4>
                            <div style="font-size: 0.9rem;">Starting at</div>
                            &dollar;1,200.<span style="font-size: small">00</span>
                            <p>Per Developer</p>
                        </h4>
                        <div>
                            <a class="btn" style="color: #009d70; border-color: #009d70" href="../ecommerce/#/ecommerce/?licenseType=multi">BUY</a>
<!--
                            <a class="btn" style="color: #009d70; border-color: #009d70" href="mailto:info@ag-grid.com">CONTACT US</a>
-->
                        </div>
                    </div>
                    <div class="license" style="border-color: #fbad18;">
                        <div>
                            <img src="./images/pricing/Deployment%20Add-on.svg" alt="Deployment License">
                            <h3>ag-Grid Enterprise</h3>
                            <h2>Deployment License</h2>
                            <h3>Add-on</h3>
                        </div>
                        <h4>
                            <div style="font-size: 0.9rem;">Starting at</div>
                            &dollar;750.<span style="font-size: small">00</span>
                            <p>Per Application Production Environment</p>
                        </h4>
                        <div>
                            <span style="display: inline-block; padding: 0.5rem 1rem; font-size: 1.25rem; line-height: 1.5; border-radius: 0.3rem; ">
                                Buy with a Development License
                            </span>
<!--
                            <a class="btn" style="color: #fbad18;border-color: #fbad18" href="mailto:info@ag-grid.com">CONTACT US</a>
-->
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div>
                    <div style="text-align: center;">
                        <div style="max-width: 800px; display: inline-block;">
                            Bulk pricing available. For up to 10 developers please use our e-commerce configurator to see pricing.
                            For more than 10 developers or any questions with regards your purchase, please email
                            <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="definitions">
                <div>
                    <div>&nbsp;</div>
                    <div style="text-decoration: underline; color: orange;">
                        <h1 style="color: black">DEFINITIONS</h1>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/SA.svg">
                    </div>
                    <div>
                        <h3>Single Application Development License</h3>
                        <p/>
                        <p>
                            Licenses <b>one application</b>, developed for internal use, to embed ag-Grid
                            Enterprise in perpetuity.
                        </p>
                        <ul>
                            <li>
                                Includes a 1-year subscription to new versions, support
                                and maintenance.
                            </li>
                            <li>
                                For customer-facing applications you will also need a Deployment
                                License add-on.
                            </li>
                            <li>
                                All concurrent, front-end, JavaScript developers working on the Application
                                would need to be added to the license count, not just the ones working with
                                ag-Grid.
                            </li>
                            <li>
                                Developers within the Single Application Development License count are
                                unnamed, so long as the total licensed count isn’t exceeded.
                            </li>
                            <li>
                                Single Application Development Licenses are bound to an application name
                                and can’t be reused on other applications.
                            </li>
                        </ul>

<!--
                        <div class="example card">
                            <div class="card-header">Detail</div>
                            <div class="card-body">
                                <div class="card-text">

                                </div>
                            </div>
                        </div>
-->
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/MA.svg">
                    </div>
                    <div>

                        <h3>Multiple Application Development License</h3>
                        <p/>

                        <p>
                            Licenses <b>unlimited number of applications</b>, developed for internal use, to embed ag-Grid
                            Enterprise in perpetuity.
                        </p>

                        <ul>
                            <li>
                                Includes a 1-year subscription to new versions, support
                                and maintenance.
                            </li>
                            <li>
                                For customer-facing applications you will also need a Deployment
                                License add-on.
                            </li>
                            <li>
                                All concurrent, front-end, JavaScript developers working across the
                                licensed Applications would need to be added to the license count,
                                not just the ones working with ag-Grid.
                            </li>
                            <li>
                                Developers within the Multiple Application Development License count are
                                unnamed, so long as the total licensed count isn’t exceeded.
                            </li>
                            <li>
                                Single Application Development Licenses are bound to named pool of
                                developers can be applied to an unlimited number of applications.
                            </li>
                        </ul>

<!--
                        <div class="example card">
                            <div class="card-header">Detail</div>
                            <div class="card-body">
                                <div class="card-text">

                                </div>
                            </div>
                        </div>
-->
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/Deployment%20Add-on.svg">
                    </div>
                    <div>
                        <h3>Deployment License Add-on</h3>
                        <p>
                            Allows licensed developers to sub-license ag-Grid for one application on one production
                            environment in perpetuity. Includes a 1-year subscription to new versions, support and
                            maintenance. Only available with a Developer License.
                        </p>

                        <ul>
                            <li>
                                A Deployment License Add-on allows making a project available
                                to individuals (eg your customers) outside of your orginisation
                                (sub-license).
                            </li>
                            <li>
                                One Deployment License Add-on covers one production environment
                                for one project.
                            </li>
                            <li>
                                Only production environments require licensing. All other environments
                                (eg development, test, pre-production) do not require a license.
                            </li>
                            <li>
                                We do not charge per server. A cluster of many servers
                                part of one application installation is considered one deployment
                                and requires one Deployment License. This is true so long as the
                                application instances within the cluster are replicas of each other
                                and server to provide load balancing and fail over only.
                            </li>
                            <li>
                                Production failover deployments do not need to be licensed separately.
                                They are considered part of the overall application production deployment.
                            </li>
                            <li>
                                Multi-tennent deployments, where one application instance is serving
                                many customers over different URLs, is considered one deployment, as
                                each tennent is getting serviced by the same application instance.
                            </li>
                            <li>
                                Different instances of the same application, where the instances
                                are not part of a cluster for fail over or load balancing, are considered
                                independent deployments and need a Deployment License for each
                                individual application instance.
                            </li>
                            <li>
                                Deploying an application to a cloud service (eg AWS or Docker) requires
                                one Deployment License, regardless of how many virtual containers
                                or servers the cloud application spawns for that one single instance
                                of the application.
                            </li>
                        </ul>

                        <p>
                            If you have a deployment that doesn't fit within our licensing model,
                            please start a conversation with us through
                            <a href="mailto:info@ag-grid.com>">info@ag-grid.com</a> and we will do our
                            best to get to something that works.
                        </p>

<!--
                        <div class="example card">
                            <div class="card-header">Detail</div>
                            <div class="card-body">
                                <div class="card-text">

                                </div>
                            </div>
                        </div>
-->
                    </div>
                </div>
            </section>

            <section id="timeline">
                <div>
                    <div>&nbsp;</div>
                    <div style="text-decoration: underline; color: magenta;">
                        <h1 style="color: black">LICENSE TIMELINE</h1>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/Perpetual.svg">
                    </div>
                    <div>
                        <span>Perpetual License</span>
                        <p>
                            When you purchase ag-Grid Enterprise you are granted a license to use a version of the product in
                            perpetuity. There are no further charges until you choose to extend your license to cover newer
                            versions (see next point).
                        </p>
                        <p>Please note that while use of the software is perpetual, Support and Corrective Maintenance are not. We
                            do not provide issue resolution to versions of ag-Grid Enterprise older than 12 months. We roll bug fixes,
                            performance enhancements and other improvements into new releases; we don't patch, fix or in any way
                            alter older versions.
                        </p>
                        <div class="example card">
                            <div class="card-header">Example</div>
                            <div class="card-body">
                                <div class="card-text">
                                    Company &lsquo;A&rsquo; is developing an application named &lsquo;MyApp&rsquo;. The app needs to render 10K rows of data
                                    in a table and allow users to group, filter and sort. The dev team adds ag-Grid Enterprise to the project to satisfy that
                                    requirement. 5 Front-End and 10 Back-End developers are working on &lsquo;MyApp&rsquo;.
                                    Only 1 Front-End developer is tasked with configuring and modifying the data grid. The benefit to
                                    the UI is project wide however and all developers contributing to it need to be licensed. Company
                                    &lsquo;A&rsquo; purchases 5 licenses for ag-Grid Enterprise.
                                </div>
                            </div>
                        </div>
                        <div>
                            <img src="./images/pricing/Version%201.svg">
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/1-year.svg">
                    </div>
                    <div>
                        <span>1-year Subscription to New Versions (included)</span>
                        <p>When you make a purchase you get a Subscription to license new versions of ag-Grid Enterprise for 365 days.
                            You can see our release list <a href="./ag-grid-changelog/">here</a>. After 365 days you will no longer be able to license the latest versions
                            of ag-Grid Enterprise without renewing your subscription. You can continue to use your licensed versions
                            in perpetuity.
                        </p>
                        <p>
                            Please note that while use of the software is perpetual, Support and Corrective Maintenance are not. We
                            do not provide issue resolution to versions of ag-Grid Enterprise older than 12 months. We roll bug fixes,
                            performance enhancements and other improvements into new releases; we don't patch, fix or in any way
                            alter older versions.
                        </p>
                        <div>
                            <img src="./images/pricing/Versions%202.svg">
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/Renewal%20icon.svg">
                    </div>
                    <div>
                        <span>Subscription Renewal (optional)</span>
                        <p>
                            At the end of your subscription period you will no longer be able to license the latest
                            versions of ag-Grid Enterprise or access support without renewing. This could range from
                            365 days up to a 5-year term. Renewal pricing starts as follows: Single Application Developer
                            License, $350; Multiple Applications Developer License, $560;
                            Deployment License Add-on, $350.
                        </p>
                        <p>
                            Please note that while use of the software is perpetual Support and Corrective Maintenance
                            are not. We do not provide issue resolution to versions of ag-Grid Enterprise older than
                            12 months. We roll bug fixes, performance enhancements and other improvements into new
                            releases; we don’t patch, fix or in any way alter older versions.
                        </p>
                        <div>
                            <img src="./images/pricing/Versions%203.svg">
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        &nbsp;
                    </div>
                    <div>
                        <span>Support (only with an active subscription)</span>
                        <p>
                            We offer a log-in protected support portal that has a vast knowledge base and access to
                            our ticketing system. We aim to respond to support requests within 24 hours. We operate on business days
                            only, between 9am and 5pm GMT.
                        </p>
                    </div>
                </div>
                <div>
                    <div>

                    </div>
                    <div>
                        <span>Corrective maintenance (only with an active subscription)</span>
                        <p>
                            We roll bug fixes, performance enhancements and other improvements into new releases and
                            expect customers to upgrade to a version of ag-Grid that resolves their issue. Starting
                            with version 22.0 we will also aim to release Patches for critical issues on a bi-weekly
                            schedule.
                        </p>
                    </div>
                </div>
            </section>

            <section id="deeper-dive">
                <div>
                    <div>&nbsp;</div>
                    <div style="text-decoration: underline; color: red;">
                        <h1 style="color: black">DEEPER DIVE</h1>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/Dependency.svg">
                    </div>
                    <div>
                        <span>Project Dependency</span>
                        <p>A software project will have a dependency on ag-Grid Enterprise if it requires our software to
                            perform some of its functions. Every Front-End JavaScript developer working on the project will need
                            to be licensed.
                        </p>
                        <div class="example card">
                            <div class="card-header">Example</div>
                            <div class="card-body">
                                <div class="card-text">
                                    Company &lsquo;A&rsquo; is developing an application named &lsquo;MyApp&rsquo;. The app needs to render
                                    10K rows of data in a table and allow users to group, filter and sort. The dev team adds ag-Grid Enterprise
                                    to the project to satisfy that requirement. 5 Front-End and 10 Back-End developers are working on
                                    &lsquo;MyApp&rsquo;. Only 1 Front-End developer is tasked with configuring and modifying the data grid.
                                    The benefit to the UI is project-wide however and all developers contributing to it need to be licensed.
                                    Company &lsquo;A&rsquo; purchases 5 licenses for ag-Grid Enterprise.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="./images/pricing/Indirect.svg">
                    </div>
                    <div>
                        <span>Indirect Project Dependency</span>
                        <p>
                            A software project will have an indirect dependency on ag-Grid Enterprise even if it's wrapped into
                            another framework, file, library, etc. Every Front-End JavaScript developer working on a project using
                            a library that wraps ag-Grid Enterprise will need to be licensed.
                        </p>
                        <p>Please note: You are not allowed to wrap ag-Grid Enterprise in a framework, library, component, etc. and
                            make it available as a development tool outside of your organisation.
                        </p>
                        <div class="example card">
                            <div class="card-header">Example</div>
                            <div class="card-body">
                                <div class="card-text">
                                    A UI development team at Company &lsquo;A&rsquo; creates its own UI library for internal development
                                    and includes ag-Grid Enterprise as a component. The team working on &lsquo;MyApp&rsquo; uses the new
                                    library and so does the team working on &lsquo;NewApp&rsquo;. &lsquo;MyApp&rsquo; has 5 Front-End
                                    JavaScript developers and &lsquo;NewApp&rsquo; has 3. There are 2 Front-End JavaScript developers on
                                    the UI development team. Company &lsquo;A&rsquo; purchases 10 licenses for ag-Grid Enterprise.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </div>
    <?php include_once("./includes/footer.php"); ?>
</div>
<?php include_once("./includes/analytics.php"); ?>
<script src="dist/homepage.js"></script>
</body>
</html>
