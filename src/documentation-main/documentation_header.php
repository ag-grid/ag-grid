<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="<?php echo $pageKeyboards; ?>"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link inline rel="stylesheet" href="../dist/bootstrap/css/bootstrap.css">

    <link inline rel="stylesheet" href="../style.css">
    <link inline rel="stylesheet" href="../documentation-main/documentation.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular-cookies.min.js"></script>
    <script src="../documentation-main/documentation.js"></script>

    <!-- Hotjar Tracking Code for https://www.ag-grid.com/ -->
    <script>
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () {
                    (h.hj.q = h.hj.q || []).push(arguments)
                };
            h._hjSettings = {hjid: 372643, hjsv: 5};
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');
    </script>


</head>

<?php

$version = 'latest';

$rootFolder;
if (strcmp($version, 'latest') == 0) {
    $rootFolder = '/';
} else {
    $rootFolder = '/archive/' . $version . '/';
}

function menuItem($key, $rootFolder, $localKey, $name, $url) {
    if ($key == $localKey) {
        print('<span class="sidebarLinkSelected">'.$name.'</span>');
    } else {
        print('<a class="sidebarLink" href="'.$rootFolder.$url.'">'.$name.'</a>');
    }
}

function menuItemEnterprise($key, $rootFolder, $localKey, $name, $url) {
    if ($key == $localKey) {
        print('<span class="sidebarLinkSelected"><img src="../images/enterprise.png"/> '.$name.'</span>');
    } else {
        print('<a class="sidebarLink" href="'.$rootFolder.$url.'"><img src="../images/enterprise.png"/> '.$name.'</a>');
    }
}

?>

<body ng-app="documentation" ng-controller="DocumentationController">

<?php if ($version == 'latest') {
    $navKey = "documentation";
    include '../includes/navbar.php';
} else { ?>
    <nav class="navbar-inverse">
        <div class="container">
            <div class="row">
                <div class="col-md-12 top-header big-text">
                        <span class="top-button-wrapper">
                            <a class="top-button" href="<?php print($rootFolder) ?>"> <i class="fa fa-users"></i> ag-Grid Archive Documentation <?php print($version) ?></a>
                        </span>
                </div>
            </div>

        </div>
    </nav>
<?php } ?>

<div class="header-row">

    <div class="container">

        <div class="row">
            <div class="col-md-12">
                <div style="float: right;">
                    <h2>
                        <a class="btn btn-primary btn-large" href="../start-trial.php">
                            Try ag-Grid Enterprise for Free
                        </a>
                    </h2>
                </div>
                <div id="documentationSearch">
                    <img src="/images/spinner.svg" class="documentationSearch-spinner active" width="24" height="24"/>
                    <gcse:searchbox enableAutoComplete="true" enableHistory="true" autoCompleteMaxCompletions="5"
                                    autoCompleteMatchType="any"></gcse:searchbox>
                </div>
            </div>
        </div>

    </div>

</div>

<div class="container" style="margin-top: 20px">

    <div class="row">

        <div class="col-sm-2">

            <h4>Framework</h4>
            <select name="frameworkContext" id="frameworkContext" ng-change="onFrameworkContextChanged()"
                    ng-model="frameworkContext">
                <option value="all">All</option>
                <option value="javascript">JavaScript</option>
                <option value="angular">Angular</option>
                <option value="angularjs">AngularJS 1.x</option>
                <option value="react">ReactJS</option>
                <option value="vue">VueJS</option>
                <option value="aurelia">AureliaJS</option>
                <option value="webcomponents">Web Components</option>
            </select>


            <div class="docsMenu-header<?php if ($pageGroup == "basics") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Getting Started</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php if ($key == "Getting Started") { ?>
                    <span class="sidebarLinkSelected">Overview</span>
                <?php } else { ?>
                    <a class="sidebarLink"
                       href="<?php print($rootFolder) ?>javascript-grid-getting-started/">Overview</a>
                <?php } ?>

                <div ng-if="frameworkContext==='angular'" ng-show="docsControllerReady" class="ng-hide">
                    <?php if ($key == "Angular SystemJS") { ?>
                        <span ng-if="isFramework('angular')" class="sidebarLinkSelected"
                              style="padding-left: 20px">SystemJS</span>
                    <?php } else { ?>
                        <a ng-if="isFramework('angular')" class="sidebarLink"
                           href="<?php print($rootFolder) ?>ag-grid-angular-systemjs/"
                           style="padding-left: 20px">SystemJS</a>
                    <?php } ?>

                    <?php if ($key == "Angular Webpack") { ?>
                        <span ng-if="isFramework('angular')" class="sidebarLinkSelected"
                              style="padding-left: 20px">Webpack</span>
                    <?php } else { ?>
                        <a ng-if="isFramework('angular')" class="sidebarLink"
                           href="<?php print($rootFolder) ?>ag-grid-angular-webpack/"
                           style="padding-left: 20px">Webpack</a>
                    <?php } ?>

                    <?php if ($key == "Next Steps") { ?>
                        <span class="sidebarLinkSelected">Next Steps</span>
                    <?php } else { ?>
                        <a class="sidebarLink" href="<?php print($rootFolder) ?>ag-grid-next-steps/">Next Steps</a>
                    <?php } ?>

                </div>

            </div>
            <div class="docsMenu-header<?php if ($pageGroup == "interfacing") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Interfacing</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php menuItem($key, $rootFolder, 'Interfacing Overview"', 'Overview', 'javascript-grid-interfacing-overview'); ?>
                <?php menuItem($key, $rootFolder, 'Properties"', 'Properties', 'javascript-grid-properties'); ?>
                <?php menuItem($key, $rootFolder, 'Column Definitions"', 'Columns', 'javascript-grid-column-definitions'); ?>
                <?php menuItem($key, $rootFolder, 'Events', 'Events', 'javascript-grid-events'); ?>
                <?php menuItem($key, $rootFolder, 'Callbacks', 'Callbacks', 'javascript-grid-callbacks'); ?>
                <?php menuItem($key, $rootFolder, 'Grid API', 'Grid API', 'javascript-grid-callbacks'); ?>
                <?php menuItem($key, $rootFolder, 'Column API', 'Column API', 'javascript-grid-column-api'); ?>
            </div>

            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "feature") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Features</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php menuItem($key, $rootFolder, 'Features', 'Overview', 'ag-grid-features'); ?>
                <?php menuItem($key, $rootFolder, 'Width & Height', 'Width & Height', 'javascript-grid-width-and-height'); ?>
                <?php menuItem($key, $rootFolder, 'Sorting', 'Sorting', 'javascript-grid-sorting'); ?>
                <?php menuItem($key, $rootFolder, 'Filtering', 'Filtering', 'javascript-grid-filtering'); ?>
                <?php menuItem($key, $rootFolder, 'Selection', 'Selection', 'javascript-grid-selection'); ?>
                <?php menuItem($key, $rootFolder, 'Resizing', 'Resizing', 'javascript-grid-resizing'); ?>
                <?php menuItem($key, $rootFolder, 'Pinning', 'Pinning', 'javascript-grid-pinning'); ?>
                <?php menuItem($key, $rootFolder, 'Grouping Columns', 'Grouping Columns', 'javascript-grid-grouping-headers'); ?>
                <?php menuItem($key, $rootFolder, 'Tree Data', 'Tree Data', 'javascript-grid-tree'); ?>
                <?php menuItem($key, $rootFolder, 'Row Height', 'Row Height', 'javascript-grid-row-height'); ?>
                <?php menuItem($key, $rootFolder, 'Floating Rows', 'Floating Rows', 'javascript-grid-floating'); ?>
                <?php menuItem($key, $rootFolder, 'Value Getters', 'Value Getters', 'javascript-grid-value-getters'); ?>
                <?php menuItem($key, $rootFolder, 'Cell Expressions', 'Cell Expressions', 'javascript-grid-cell-expressions'); ?>
                <?php menuItem($key, $rootFolder, 'Cell Styling', 'Cell Styling', 'javascript-grid-cell-styling'); ?>
                <?php menuItem($key, $rootFolder, 'Context', 'Context', 'javascript-grid-context'); ?>
                <?php menuItem($key, $rootFolder, 'InsertRemove', 'Insert & Remove', 'javascript-grid-insert-remove'); ?>
                <?php menuItem($key, $rootFolder, 'Refresh', 'Refresh', 'javascript-grid-refresh'); ?>
                <?php menuItem($key, $rootFolder, 'Animation', 'Animation', 'javascript-grid-animation'); ?>
                <?php menuItem($key, $rootFolder, 'Keyboard Navigation', 'Keyboard Navigation', 'javascript-grid-keyboard-navigation'); ?>
                <?php menuItem($key, $rootFolder, 'Internationalisation', 'Internationalisation', 'javascript-grid-internationalisation'); ?>
                <?php menuItem($key, $rootFolder, 'Full Width', 'Full Width Rows & Master Detail', 'javascript-grid-master-detail'); ?>
                <?php menuItem($key, $rootFolder, 'Master / Slave', 'Master / Slave', 'javascript-grid-master-slave'); ?>
                <?php menuItem($key, $rootFolder, 'Touch', 'Touch', 'javascript-grid-touch'); ?>
                <?php menuItem($key, $rootFolder, 'Row Model', 'Row Model', 'javascript-grid-model'); ?>
                <?php menuItem($key, $rootFolder, 'Data Export', 'CSV Export', 'javascript-grid-export'); ?>
                <?php menuItem($key, $rootFolder, 'RTL', 'RTL', 'javascript-grid-rtl'); ?>
                <?php menuItem($key, $rootFolder, 'Icons', 'Icons', 'javascript-grid-icons'); ?>
                <?php menuItem($key, $rootFolder, 'Overlays', 'Overlays', 'javascript-grid-overlays'); ?>
                <?php menuItem($key, $rootFolder, 'For Print', 'For Print', 'javascript-grid-for-print'); ?>


                <? /* BEGIN ENTERPRISE FEATURES */ ?>

                <?php menuItemEnterprise($key, $rootFolder, 'Excel Export', 'Excel Export', 'javascript-grid-excel'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Viewport', 'Viewport', 'javascript-grid-viewport'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Data Functions', 'Data Functions', 'javascript-grid-data-functions'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Grouping', 'Grouping Rows', 'javascript-grid-grouping'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Aggregation', 'Aggregation', 'javascript-grid-aggregation'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Pivoting', 'Pivoting', 'javascript-grid-pivoting'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Tool Panel', 'Tool Panel', 'javascript-grid-tool-panel'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Clipboard', 'Clipboard', 'javascript-grid-clipboard'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Column Menu', 'Column Menu', 'javascript-grid-column-menu'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Context Menu', 'Context Menu', 'javascript-grid-context-menu'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Range Selection', 'Range Selection', 'javascript-grid-range-selection'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Status Bar', 'Status Bar', 'javascript-grid-status-bar'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'Set Filtering', 'Set Filtering', 'javascript-grid-set-filtering'); ?>
                <?php menuItemEnterprise($key, $rootFolder, 'License Key', 'License Key', 'javascript-grid-set-license'); ?>
 
            </div>

            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "themes") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Themes</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php menuItem($key, $rootFolder, 'Styling', 'Overview', 'javascript-grid-styling'); ?>
                <?php menuItem($key, $rootFolder, 'Fresh Theme', 'Fresh Theme', 'javascript-grid-themes/fresh-theme.php'); ?>
                <?php menuItem($key, $rootFolder, 'Blue Theme', 'Blue Theme', 'javascript-grid-themes/blue-theme.php'); ?>
                <?php menuItem($key, $rootFolder, 'Dark Theme', 'Dark Theme', 'javascript-grid-themes/dark-theme.php'); ?>
                <?php menuItem($key, $rootFolder, 'Material Theme', 'Material Theme', 'javascript-grid-themes/material-theme.php'); ?>
                <?php menuItem($key, $rootFolder, 'Bootstrap Theme', 'Bootstrap Theme', 'javascript-grid-themes/bootstrap-theme.php'); ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "components") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Components</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php menuItem($key, $rootFolder, 'Components', 'Overview', 'ag-grid-components'); ?>
                <?php menuItem($key, $rootFolder, 'Cell Rendering', 'Cell Rendering', 'javascript-grid-cell-rendering'); ?>
                <?php menuItem($key, $rootFolder, 'Cell Editor', 'Cell Editor', 'javascript-grid-cell-editor'); ?>
                <?php menuItem($key, $rootFolder, 'Filter Component', 'Filter Component', 'javascript-grid-filter-component'); ?>
                <?php menuItem($key, $rootFolder, 'Header Rendering', 'Header Components', 'javascript-grid-header-rendering'); ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "row_models") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Row Models</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php menuItem($key, $rootFolder, 'Row Models', 'Overview', 'javascript-grid-row-models'); ?>
                <?php menuItem($key, $rootFolder, 'Datasource', 'Datasource', 'javascript-grid-datasource'); ?>
                <?php menuItem($key, $rootFolder, 'Pagination', 'Pagination', 'javascript-grid-pagination'); ?>
                <?php menuItem($key, $rootFolder, 'Virtual Paging / Infinite Scrolling', 'Virtual Paging & Infinite Scrolling', 'javascript-grid-virtual-paging'); ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "examples") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Examples</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-examples">
                <?php menuItem($key, $rootFolder, 'Styled Report', 'Styled Report', 'example-account-report'); ?>
                <?php menuItem($key, $rootFolder, 'File Browser', 'File Browser', 'example-file-browser'); ?>
                <?php menuItem($key, $rootFolder, 'Expressions and Context', 'Expressions and Context', 'example-expressions-and-context'); ?>
            </div>

            <?php if ($version == 'latest') { ?>
                <div class="docsMenu-header<?php if ($pageGroup == "misc") { ?> active<?php } ?>"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4>Misc</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div class="docsMenu-content">
                    <?php menuItem($key, $rootFolder, 'Change Log', 'Change Log', 'change-log/changeLogIndex.php'); ?>
                    <?php menuItem($key, $rootFolder, 'Roadmap', 'Roadmap', 'change-log/changeLogIndex.php'); ?>
                    <?php menuItem($key, $rootFolder, 'Intermediate Tutorial', 'Tutorials', 'ag-grid-tutorials'); ?>
                    <a class="sidebarLink" href="/archive/">Archive Docs</a>
                </div>
            <?php } ?>

        </div>

        <div class="col-sm-10 blog-main">

            <gcse:searchresults></gcse:searchresults>