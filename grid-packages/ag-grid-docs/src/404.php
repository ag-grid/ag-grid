<?php
require_once 'includes/html-helpers.php';
gtm_data_layer('404');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php meta_and_links("AG Grid: Page Not Found", "", "", "404.php", true); ?>

    <meta name="robots" content="noindex" />
    <link rel="stylesheet" href="/dist/homepage.css">
</head>

<body ng-app="index">
    <?php include_once("./includes/analytics.php"); ?>
    <header id="nav">
        <?php
        $version = 'latest';
        include './includes/navbar.php';
        ?>
    </header>

    <div class="page-content">
        <div class="about-page">
            <div class="row">
                <section>
                    <h1>AG Grid: Page Not Found</h1>

                    <p style="height: 600px;">
                        Sorry, but it looks like you've ended up in the wrong place. Please go to the <a href="/">homepage</a> or
                        <a href="/documentation">documentation</a> to try to find what you're looking for.
                    </p>

                </section>
            </div>
        </div>

        <?php include_once("./includes/footer.php"); ?>
    </div>

    <script src="dist/homepage.js"></script>
</body>
</html>
