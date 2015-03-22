<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="<?php echo $pageKeyboards; ?>"/>

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>

    <script src="/documentation.js"></script>

    <link rel="stylesheet" href="/documentation.css">

    <link rel="shortcut icon" href="http://www.angulargrid.com/favicon.ico" />

    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-60553231-1', 'auto');
        ga('send', 'pageview');

    </script>
</head>

<body ng-app="documentation" ng-controller="documentationController">

    <nav class="navbar navbar-inverse navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <a class="navbar-brand" href="/index.html">Home</a>
                <a class="navbar-brand" href="/example.html">Example</a>
                <a class="navbar-brand" href="../angular-grid-getting-started/index.php">Documentation</a>
                <a class="navbar-brand" href="/forum">Forum</a>
            </div>
        </div>
    </nav>

    <div class="container" style="margin-top: 70px">

        <div class="row">

            <div class="col-sm-2">

                <?php if ($key == "Getting Started") { ?>
                    <span class="sidebarLinkSelected">Getting Started</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-getting-started/index.php">Getting Started</a>
                <?php } ?>

                <?php if ($key == "Loading Rows") { ?>
                    <span class="sidebarLinkSelected">Loading Rows</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-loading-rows/index.php">Loading Rows</a>
                <?php } ?>

                <?php if ($key == "Width & Height") { ?>
                    <span class="sidebarLinkSelected">Width & Height</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-width-and-height/index.php">Width & Height</a>
                <?php } ?>

                <?php if ($key == "Grid Options") { ?>
                    <span class="sidebarLinkSelected">Grid Options</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-grid-options/index.php">Grid Options</a>
                <?php } ?>

                <?php if ($key == "Column Definitions") { ?>
                    <span class="sidebarLinkSelected">Column Definitions</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-column-definitions/index.php">Column Definitions</a>
                <?php } ?>

                <?php if ($key == "Sorting") { ?>
                    <span class="sidebarLinkSelected">Sorting</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-sorting/index.php">Sorting</a>
                <?php } ?>

                <?php if ($key == "Filtering") { ?>
                    <span class="sidebarLinkSelected">Filtering</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-filtering/index.php">Filtering</a>
                <?php } ?>

                <?php if ($key == "Resizing") { ?>
                    <span class="sidebarLinkSelected">Resizing</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-resizing/index.php">Resizing</a>
                <?php } ?>

                <?php if ($key == "Pinning") { ?>
                    <span class="sidebarLinkSelected">Pinning</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-pinning/index.php">Pinning</a>
                <?php } ?>

                <?php if ($key == "Grouping") { ?>
                    <span class="sidebarLinkSelected">Grouping & Aggregating Rows</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-grouping/index.php">Grouping & Aggregating Rows</a>
                <?php } ?>

                <?php if ($key == "Grouping Headers") { ?>
                    <span class="sidebarLinkSelected">Grouping Headers</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-grouping-headers/index.php">Grouping Headers</a>
                <?php } ?>

                <?php if ($key == "Editing") { ?>
                    <span class="sidebarLinkSelected">Editing Cells</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-editing/index.php">Editing Cells</a>
                <?php } ?>

                <?php if ($key == "Header Rendering") { ?>
                    <span class="sidebarLinkSelected">Header Rendering</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-header-rendering/index.php">Header Rendering</a>
                <?php } ?>

                <?php if ($key == "Selection") { ?>
                    <span class="sidebarLinkSelected">Selection</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-selection/index.php">Selection</a>
                <?php } ?>

                <?php if ($key == "Angular Compiling") { ?>
                    <span class="sidebarLinkSelected">Angular Compiling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-angular-compiling/index.php">Angular Compiling</a>
                <?php } ?>

                <?php if ($key == "Styling") { ?>
                    <span class="sidebarLinkSelected">Layout & Styling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-styling/index.php">Layout & Styling</a>
                <?php } ?>

                <?php if ($key == "No Scrolls") { ?>
                    <span class="sidebarLinkSelected">No Scrolling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-no-scrolls/index.php">No Scrolling</a>
                <?php } ?>

                <?php if ($key == "API") { ?>
                    <span class="sidebarLinkSelected">API</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="/angular-grid-api/index.php">API</a>
                <?php } ?>

            </div>

            <div class="col-sm-10 blog-main">