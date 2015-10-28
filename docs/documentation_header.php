<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="<?php echo $pageKeyboards; ?>"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>

    <script src="/documentation.js"></script>

    <link rel="stylesheet" href="/documentation.css">
    <link rel="stylesheet" href="/style.css">

    <link rel="shortcut icon" href="http://www.ag-grid.com/favicon.ico" />

</head>

<?php
$version = 'latest';

$rootFolder;
if (strcmp($version , 'latest') == 0) {
    $rootFolder = '/';
} else {
    $rootFolder = '/archive/'.$version.'/';
}
?>

<body ng-app="documentation">

    <nav class="navbar-inverse">
        <div class="container">
            <div class="row">
                <div class="col-md-12 top-header big-text">
                    <?php if ($version=='latest') { ?>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/"> <i class="fa fa-home"></i> Home</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/example.php"> <i class="fa fa-bicycle"></i> Test Drive</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button-selected" href="/documentation.php">  <i class="fa fa-book"></i> Documentation</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/media.php"> <i class="fa fa-road"></i> Media</a>
                        </span>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="/forum"> <i class="fa fa-users"></i> Forum</a>
                        </span>
                    <?php } else { ?>
                        <span class="top-button-wrapper">
                            <a class="top-button" href="<?php print($rootFolder) ?>"> <i class="fa fa-users"></i> ag-Grid Archive Documentation <?php print($version) ?></a>
                        </span>
                    <?php } ?>
                </div>
            </div>

        </div>
    </nav>

    <div class="container" style="margin-top: 20px">

        <div class="row">

            <div class="col-sm-2">

                <div style="display: inline-block;">
                    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                        <input type="hidden" name="cmd" value="_s-xclick">
                        <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
                        <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal – The safer, easier way to pay online.">
                    </form>
                </div>

                <h4>
                    The Basics
                </h4>

                <?php if ($key == "Install") { ?>
                    <span class="sidebarLinkSelected">Install</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-install/index.php">Install</a>
                <?php } ?>

                <?php if ($key == "Getting Started") { ?>
                    <span class="sidebarLinkSelected">Getting Started</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-getting-started/index.php">Getting Started</a>
                <?php } ?>

                <?php if ($key == "Getting Started Javascript") { ?>
                    <span class="sidebarLinkSelected childItem"><img src="/images/javascript.png" width="20px">Javascript</span>
                <?php } else { ?>
                    <a class="sidebarLink childItem" href="<?php print($rootFolder) ?>best-javascript-grid/index.php"><img src="/images/javascript.png" width="20px">Javascript</a>
                <?php } ?>

                <?php if ($key == "Getting Started ng1") { ?>
                    <span class="sidebarLinkSelected childItem"><img src="/images/angularjs.png" width="20px">AngularJS 1.x</span>
                <?php } else { ?>
                    <a class="sidebarLink childItem" href="<?php print($rootFolder) ?>best-angularjs-grid/index.php"><img src="/images/angularjs.png" width="20px">AngularJS 1.x</a>
                <?php } ?>

                <?php if ($key == "Getting Started ng2") { ?>
                    <span class="sidebarLinkSelected childItem"><img src="/images/angular2.png" width="20px">AngularJS 2.0</span>
                <?php } else { ?>
                    <a class="sidebarLink childItem" href="<?php print($rootFolder) ?>best-angularjs-2-grid/index.php"><img src="/images/angular2.png" width="20px">AngularJS 2.0</a>
                <?php } ?>

                <?php if ($key == "Getting Started Web Components") { ?>
                    <span class="sidebarLinkSelected childItem"><img src="/images/webComponents.png" width="20px">Web Components</span>
                <?php } else { ?>
                    <a class="sidebarLink childItem" href="<?php print($rootFolder) ?>best-web-component-grid/index.php"><img src="/images/webComponents.png" width="20px">Web Components</a>
                <?php } ?>

                <?php if ($key == "Width & Height") { ?>
                    <span class="sidebarLinkSelected">Width & Height</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-width-and-height/index.php">Width & Height</a>
                <?php } ?>

                <?php if ($key == "Upgrading to 2.0") { ?>
                    <span class="sidebarLinkSelected">Upgrading to 2.0</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>upgrading_to_2.x/index.php">Upgrading to 2.0</a>
                <?php } ?>

                <h4>
                    Interfacing
                </h4>

                <?php if ($key == "Interfacing Overview") { ?>
                    <span class="sidebarLinkSelected">Overview</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>javascript-grid-interfacing-overview/index.php">Overview</a>
                <?php } ?>

                <?php if ($key == "Properties") { ?>
                    <span class="sidebarLinkSelected">Properties</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>javascript-grid-properties/index.php">Properties</a>
                <?php } ?>

                <?php if ($key == "Events") { ?>
                    <span class="sidebarLinkSelected">Events</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>javascript-grid-events/index.php">Events</a>
                <?php } ?>

                <?php if ($key == "Callbacks") { ?>
                    <span class="sidebarLinkSelected">Callbacks</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>javascript-grid-callbacks/index.php">Callbacks</a>
                <?php } ?>

                <?php if ($key == "Grid API") { ?>
                    <span class="sidebarLinkSelected">Grid API</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-api/index.php">Grid API</a>
                <?php } ?>

                <?php if ($key == "Column API") { ?>
                    <span class="sidebarLinkSelected">Column API</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-column-api/index.php">Column API</a>
                <?php } ?>

                <h4>
                    Columns & Cells
                </h4>

                <?php if ($key == "Column Definitions") { ?>
                    <span class="sidebarLinkSelected">Column Definitions</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-column-definitions/index.php">Column Definitions</a>
                <?php } ?>

                <?php if ($key == "Sorting") { ?>
                    <span class="sidebarLinkSelected">Sorting</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-sorting/index.php">Sorting</a>
                <?php } ?>

                <?php if ($key == "Filtering") { ?>
                    <span class="sidebarLinkSelected">Filtering</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-filtering/index.php">Filtering</a>
                <?php } ?>

                <?php if ($key == "Resizing") { ?>
                    <span class="sidebarLinkSelected">Resizing</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-resizing/index.php">Resizing</a>
                <?php } ?>

                <?php if ($key == "Pinning") { ?>
                    <span class="sidebarLinkSelected">Pinning</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-pinning/index.php">Pinning</a>
                <?php } ?>

                <?php if ($key == "Selection") { ?>
                    <span class="sidebarLinkSelected">Selection</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-selection/index.php">Selection</a>
                <?php } ?>

                <?php if ($key == "Value Getters") { ?>
                    <span class="sidebarLinkSelected">Value Getters</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-value-getters/index.php">Value Getters</a>
                <?php } ?>

                <?php if ($key == "Cell Expressions") { ?>
                    <span class="sidebarLinkSelected">Cell Expressions</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-cell-expressions/index.php">Cell Expressions</a>
                <?php } ?>

                <?php if ($key == "Cell Styling") { ?>
                    <span class="sidebarLinkSelected">Cell Styling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-cell-styling/index.php">Cell Styling</a>
                <?php } ?>

                <?php if ($key == "Cell Rendering") { ?>
                    <span class="sidebarLinkSelected">Cell Rendering</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-cell-rendering/index.php">Cell Rendering</a>
                <?php } ?>

                <?php if ($key == "Cell Templates") { ?>
                    <span class="sidebarLinkSelected">Cell Templates</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-cell-template/index.php">Cell Templates</a>
                <?php } ?>

                <?php if ($key == "Editing") { ?>
                    <span class="sidebarLinkSelected">Editing Cells</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-editing/index.php">Editing Cells</a>
                <?php } ?>

                <?php if ($key == "Context") { ?>
                    <span class="sidebarLinkSelected">Context</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-context/index.php">Context</a>
                <?php } ?>

                <?php if ($key == "Refresh") { ?>
                    <span class="sidebarLinkSelected">Refresh</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-refresh/index.php">Refresh</a>
                <?php } ?>

                <?php if ($key == "Grouping Headers") { ?>
                    <span class="sidebarLinkSelected">Grouping Headers</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-grouping-headers/index.php">Grouping Headers</a>
                <?php } ?>

                <?php if ($key == "Header Rendering") { ?>
                    <span class="sidebarLinkSelected">Header Rendering</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-header-rendering/index.php">Header Rendering</a>
                <?php } ?>

                <?php if ($key == "Keyboard Navigation") { ?>
                    <span class="sidebarLinkSelected">Keyboard Navigation</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-keyboard-navigation/index.php">Keyboard Navigation</a>
                <?php } ?>

                <?php if ($key == "Internationalisation") { ?>
                    <span class="sidebarLinkSelected">Internationalisation</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-internationalisation/index.php">Internationalisation</a>
                <?php } ?>

                <?php if ($key == "Master / Slave") { ?>
                    <span class="sidebarLinkSelected">Master / Slave</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-master-slave/index.php">Master / Slave</a>
                <?php } ?>

                <h4>
                    Working with Data
                </h4>

                <?php if ($key == "Row Model") { ?>
                    <span class="sidebarLinkSelected">Row Model</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-model/index.php">Row Model</a>
                <?php } ?>

                <?php if ($key == "Floating") { ?>
                    <span class="sidebarLinkSelected">Floating Rows</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-floating/index.php">Floating Rows</a>
                <?php } ?>

                <?php if ($key == "Grouping") { ?>
                    <span class="sidebarLinkSelected">Grouping & Aggregating Rows</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-grouping/index.php">Grouping & Aggregating Rows</a>
                <?php } ?>

                <?php if ($key == "Tool Panel") { ?>
                    <span class="sidebarLinkSelected">Tool Panel</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-tool-panel/index.php">Tool Panel</a>
                <?php } ?>

                <?php if ($key == "Data Export") { ?>
                    <span class="sidebarLinkSelected">Data Export</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-export/index.php">Data Export</a>
                <?php } ?>

                <h4>
                    Paging
                </h4>

                <?php if ($key == "Datasource") { ?>
                    <span class="sidebarLinkSelected">Datasource</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-datasource/index.php">Datasource</a>
                <?php } ?>

                <?php if ($key == "Pagination") { ?>
                    <span class="sidebarLinkSelected">Pagination</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-pagination/index.php">Pagination</a>
                <?php } ?>

                <?php if ($key == "Virtual Paging / Infinite Scrolling") { ?>
                    <span class="sidebarLinkSelected">Virtual Paging / Infinite Scrolling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-virtual-paging/index.php">Virtual Paging<br/>& Infinite Scrolling</a>
                <?php } ?>

                <h4>
                    Other Bits
                </h4>

                <?php if ($key == "Angular Compiling") { ?>
                    <span class="sidebarLinkSelected">Angular Compiling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-angular-compiling/index.php">Angular Compiling</a>
                <?php } ?>

                <?php if ($key == "Styling") { ?>
                    <span class="sidebarLinkSelected">Layout & Styling</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-styling/index.php">Layout & Styling</a>
                <?php } ?>

                <?php if ($key == "Icons") { ?>
                    <span class="sidebarLinkSelected">Icons</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-icons/index.php">Icons</a>
                <?php } ?>

                <?php if ($key == "Overlays") { ?>
                    <span class="sidebarLinkSelected">Overlays</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-overlays/index.php">Overlays</a>
                <?php } ?>

                <?php if ($key == "For Print") { ?>
                    <span class="sidebarLinkSelected">For Print</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>angular-grid-for-print/index.php">For Print</a>
                <?php } ?>

                <?php if ($version=='latest') { ?>
                    <?php if ($key == "Change Log") { ?>
                        <span class="sidebarLinkSelected">Change Log</span>
                    <?php } else { ?>
                        <a class="sidebarLink" href="<?php print($rootFolder) ?>changeLog.php">Change Log</a>
                    <?php } ?>
                    <a class="sidebarLink" href="/archive/">Archive Docs</a>
                <?php } ?>

                <h4>
                    Examples
                </h4>

                <?php if ($key == "Styled Report") { ?>
                    <span class="sidebarLinkSelected">Styled Report</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>example-account-report/index.php">Styled Report</a>
                <?php } ?>

                <?php if ($key == "File Browser") { ?>
                    <span class="sidebarLinkSelected">File Browser</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>example-file-browser/index.php">File Browser</a>
                <?php } ?>

                <?php if ($key == "Expressions and Context") { ?>
                    <span class="sidebarLinkSelected">Expressions and Context</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>example-expressions-and-context/index.php">Expressions and Context</a>
                <?php } ?>

                <h4>
                    Tutorials
                </h4>

                <?php if ($key == "Intermediate Tutorial") { ?>
                    <span class="sidebarLinkSelected">Intermediate</span>
                <?php } else { ?>
                    <a class="sidebarLink" href="<?php print($rootFolder) ?>ag-grid-tutorials/index.php">Intermediate</a>
                <?php } ?>

            </div>

            <div class="col-sm-10 blog-main">