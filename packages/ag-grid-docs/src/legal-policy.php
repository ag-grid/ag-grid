<?php 
$navKey = "about";
include_once 'includes/html-helpers.php';
gtm_data_layer('about');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links("Our Mission, Our Principles and Our Team at ag-Grid", "About ag-Grid", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is the story of ag-Grid and explains our mission, where we came from and who we are.", true);
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

            <!DOCTYPE html>
<html>

<h1 class="text-center">Legal Policy</h1>

<hr>

<body class="text-center">

<p>Welcome to ag-Grid's legal policies page.</p>

<p>Here you can navigate through our legal policies, including our <strong>Privacy Policy</strong> and <strong>Cookies Policy</strong>.

<hr>
</body>

<body class="text-center">

<p>Welcome to ag-Grid's Privacy Policy.<br>
<strong>Your privacy is important to us.</strong><br> 
At ag-grid, we are fully committed to protecting your personal data and complying with all data privacy laws. 
<br>
This policy serves as a guide and reference point for how we may collect and use personal information, and the rights and choices available to all our visitors and customers.
<br><br>
We strongly recommend you read our policy and understand what we collect, how we collect it, what we do with it, how we protect it, and your rights regarding information, <strong>before</strong> you use or access any of our services. 
</p>

</body>

<a href="privacy.php"><button type="button" class="btn btn-primary btn-lg btn-block">Privacy Policy</button></a>
<hr>
<p class="text-center">
Welcome to ag-Grid's Cookie Policy.
<br>
<strong>Your choice is important to us.</strong>
<br><br>
    This site uses cookies – small text files that are placed on your machine to help the site provide a better user experience. In general, cookies are used to retain user preferences, store information for things like shopping baskets, and provide anonymised tracking data to third party applications like Google Analytics. As a rule, cookies will make your browsing experience better. However, you may prefer to disable cookies on this site and on others. 
    <br><br>
    We strongly recommend you read our policy and understand what a cookie is, how we use them and your rights in relation to them.

    <br><br>
<a href="cookies.php"><button type="button" class="btn btn-primary btn-lg btn-block" href="cookies.php">Cookies Policy</button></a>
</p>
<hr>

</html> 



        </section>
    </div>
</div>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>
