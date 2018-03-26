<?php 
$navKey = "community-enterprise";
include_once 'includes/html-helpers.php';
gtm_data_layer('community-enterprsie');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links("Ag-Grid Community / Enterprise Edition", "Ag-Grid Community / Enterprise Edition", "Ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. The document explains the differences between the two.", true);
?>
<link rel="stylesheet" href="dist/homepage.css">
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

            <h1>Community / Enterprise Edition</h1>

            <p class="lead"> Ag-Grid comes in two versions &ndash; <strong>Community</strong> and <strong>Enterprise</strong>. </p>
                <p class="lead">The Community eddition is <strong>MIT licensed</strong>, supports all major JavaScript frameworks, includes all essential datagrid features and can be used free of charge.</p> 
                <p class="lead">The enterprise version is <strong>commercially licensed</strong>, includes everything from the community edition, adds a set of advanced features that target scenarios commonly found in the enterprise, and includes dedicated private support with 24h response time SLA.</p>

            <div class="mb-5">
                <div class="row">
                    <div class="col-sm-6">
                        <div class="card h-100">
                          <div class="card-body">
                            <h2 class="card-title">Ag-Grid Community</h2>
                            <h3 class="h5 card-subtitle mb-2 text-muted">MIT License</h3>


                            <ul class="card-text">
                                <li>All essential grid features</li>
                                <li>Support for all major JS frameworks</li>
                                <li>Community support</li>
                            </ul> 

                            <br />

                            <p class="text-right">
                                <a href="/javascript-grid-getting-started/" class="btn btn-primary">Get Started</a>
                            </p>
                          </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="card h-100">
                          <div class="card-body">
                            <h2 class="card-title">Ag-Grid Enterprise</h2>
                            <h3 class="h5 card-subtitle mb-2 text-muted">Commercial License</h3>
                            <ul class="card-text">
                                <li>All essential grid features</li>
                                <li>Support for all major JS frameworks</li>
                                <li><strong>Dedicated support</strong></li> 
                                <li><strong>A premium set of enteprise oriented features</strong></li>
                            </ul>

                            <p class="text-right"><a href="#" class="btn btn-primary">Sign up for a free trial</a></p>
                          </div>
                        </div>
                    </div>
                </div>
            </div>

<h2>Features Exclusive to ag-Grid Enterprise</h2>

<p>
   To review all features exclusive to the enterprise, check our <a href="documentation-main/documentation.php">documentation overview</a>. The enterprise features are marked with <span class="enterprise-icon ng-scope">e</span>.
</p>

<h2>Community Support</h2>

<p>If you are using the community version of ag-Grid, you can follow the <a href="http://stackoverflow.com/questions/tagged/ag-grid">Stack Overflow <code>ag-grid</code> tag</a>. 
We also accept bug reports with reproduction in the <a href="https://github.com/ag-grid/ag-grid/issues">ag-grid/ag-grid GitHub repository issues - follow the issue template.</a>.</p>
            
<h2>Dedicated Support <span class="enterprise-icon ng-scope">e</span></h2>

<p>Purchasing a license for ag-Grid Enterprise grands you access to our ticketing system, which means guaranteed response in a 24 hour during weekdays.</p>


        </section>
    </div>
</div>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>
