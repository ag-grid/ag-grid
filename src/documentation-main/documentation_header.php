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

function normalItem($key, $rootFolder, $localKey, $name, $url) {
    menuItem($key, $rootFolder, $localKey, $name, $url, false);
}

function menuItem($key, $rootFolder, $localKey, $name, $url, $enterprise) {
    $enterpriseIcon = $enterprise ? '<img src="../images/enterprise.png"/> ' : '';
    if ($key == $localKey) {
        print('<span class="sidebarLinkSelected">'.$name.'</span>');
    } else {
        print('<a class="sidebarLink" href="'.$rootFolder.$url.'">'.$enterpriseIcon.$name.'</a>');
    }
}

function enterpriseItem($key, $rootFolder, $localKey, $name, $url) {
    menuItem($key, $rootFolder, $localKey, $name, $url, true);
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
                <?php normalItem($key, $rootFolder, 'Interfacing Overview"', 'Overview', 'javascript-grid-interfacing-overview/'); ?>
                <?php normalItem($key, $rootFolder, 'Properties"', 'Properties', 'javascript-grid-properties/'); ?>
                <?php normalItem($key, $rootFolder, 'columnDefs"', 'Columns', 'javascript-grid-column-definitions/'); ?>
                <?php normalItem($key, $rootFolder, 'Events', 'Events', 'javascript-grid-events/'); ?>
                <?php normalItem($key, $rootFolder, 'Callbacks', 'Callbacks', 'javascript-grid-callbacks/'); ?>
                <?php normalItem($key, $rootFolder, 'Grid API', 'Grid API', 'javascript-grid-callbacks/'); ?>
                <?php normalItem($key, $rootFolder, 'Column API', 'Column API', 'javascript-grid-column-api/'); ?>
            </div>

            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "feature") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Features</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php normalItem($key, $rootFolder, 'Features', 'Overview', 'javascript-grid-features/'); ?>
                <?php normalItem($key, $rootFolder, 'Width & Height', 'Width & Height', 'javascript-grid-width-and-height/'); ?>
                <?php normalItem($key, $rootFolder, 'Sorting', 'Sorting', 'javascript-grid-sorting/'); ?>
                <?php normalItem($key, $rootFolder, 'Filtering', 'Filtering', 'javascript-grid-filtering/'); ?>
                <?php normalItem($key, $rootFolder, 'Selection', 'Selection', 'javascript-grid-selection/'); ?>
                <?php normalItem($key, $rootFolder, 'Resizing', 'Resizing', 'javascript-grid-resizing/'); ?>
                <?php normalItem($key, $rootFolder, 'Pinning', 'Pinning', 'javascript-grid-pinning/'); ?>
                <?php normalItem($key, $rootFolder, 'Grouping Columns', 'Grouping Columns', 'javascript-grid-grouping-headers/'); ?>
                <?php normalItem($key, $rootFolder, 'Tree Data', 'Tree Data', 'javascript-grid-tree/'); ?>
                <?php normalItem($key, $rootFolder, 'Row Height', 'Row Height', 'javascript-grid-row-height/'); ?>
                <?php normalItem($key, $rootFolder, 'Floating Rows', 'Floating Rows', 'javascript-grid-floating/'); ?>
                <?php normalItem($key, $rootFolder, 'Value Getters', 'Value Getters', 'javascript-grid-value-getters/'); ?>
                <?php normalItem($key, $rootFolder, 'Cell Expressions', 'Cell Expressions', 'javascript-grid-cell-expressions/'); ?>
                <?php normalItem($key, $rootFolder, 'Cell Styling', 'Cell Styling', 'javascript-grid-cell-styling/'); ?>
                <?php normalItem($key, $rootFolder, 'Context', 'Context', 'javascript-grid-context/'); ?>
                <?php normalItem($key, $rootFolder, 'InsertRemove', 'Insert & Remove', 'javascript-grid-insert-remove/'); ?>
                <?php normalItem($key, $rootFolder, 'Refresh', 'Refresh', 'javascript-grid-refresh/'); ?>
                <?php normalItem($key, $rootFolder, 'Animation', 'Animation', 'javascript-grid-animation/'); ?>
                <?php normalItem($key, $rootFolder, 'Keyboard Navigation', 'Keyboard Navigation', 'javascript-grid-keyboard-navigation/'); ?>
                <?php normalItem($key, $rootFolder, 'Internationalisation', 'Internationalisation', 'javascript-grid-internationalisation/'); ?>
                <?php normalItem($key, $rootFolder, 'Full Width', 'Full Width Rows & Master Detail', 'javascript-grid-master-detail/'); ?>
                <?php normalItem($key, $rootFolder, 'Master / Slave', 'Master / Slave', 'javascript-grid-master-slave/'); ?>
                <?php normalItem($key, $rootFolder, 'Touch', 'Touch', 'javascript-grid-touch/'); ?>
                <?php normalItem($key, $rootFolder, 'Row Model', 'Row Model', 'javascript-grid-model/'); ?>
                <?php normalItem($key, $rootFolder, 'Data Export', 'CSV Export', 'javascript-grid-export/'); ?>
                <?php normalItem($key, $rootFolder, 'RTL', 'RTL', 'javascript-grid-rtl/'); ?>
                <?php normalItem($key, $rootFolder, 'Icons', 'Icons', 'javascript-grid-icons/'); ?>
                <?php normalItem($key, $rootFolder, 'Overlays', 'Overlays', 'javascript-grid-overlays/'); ?>
                <?php normalItem($key, $rootFolder, 'For Print', 'For Print', 'javascript-grid-for-print/'); ?>


                <? /* BEGIN ENTERPRISE FEATURES */ ?>

                <?php enterpriseItem($key, $rootFolder, 'Excel Export', 'Excel Export', 'javascript-grid-excel/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Viewport', 'Viewport', 'javascript-grid-viewport/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Data Functions', 'Data Functions', 'javascript-grid-data-functions/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Grouping', 'Grouping Rows', 'javascript-grid-grouping/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Aggregation', 'Aggregation', 'javascript-grid-aggregation/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Pivoting', 'Pivoting', 'javascript-grid-pivoting/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Tool Panel', 'Tool Panel', 'javascript-grid-tool-panel/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Clipboard', 'Clipboard', 'javascript-grid-clipboard/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Column Menu', 'Column Menu', 'javascript-grid-column-menu/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Context Menu', 'Context Menu', 'javascript-grid-context-menu/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Range Selection', 'Range Selection', 'javascript-grid-range-selection/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Status Bar', 'Status Bar', 'javascript-grid-status-bar/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'Set Filtering', 'Set Filtering', 'javascript-grid-set-filtering/'); ?>
                <?php enterpriseItem($key, $rootFolder, 'License Key', 'License Key', 'javascript-grid-set-license/'); ?>
 
            </div>

            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "themes") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Themes</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php normalItem($key, $rootFolder, 'Styling', 'Overview', 'javascript-grid-styling/'); ?>
                <?php normalItem($key, $rootFolder, 'Fresh Theme', 'Fresh Theme', 'javascript-grid-themes/fresh-theme.php'); ?>
                <?php normalItem($key, $rootFolder, 'Blue Theme', 'Blue Theme', 'javascript-grid-themes/blue-theme.php'); ?>
                <?php normalItem($key, $rootFolder, 'Dark Theme', 'Dark Theme', 'javascript-grid-themes/dark-theme.php'); ?>
                <?php normalItem($key, $rootFolder, 'Material Theme', 'Material Theme', 'javascript-grid-themes/material-theme.php'); ?>
                <?php normalItem($key, $rootFolder, 'Bootstrap Theme', 'Bootstrap Theme', 'javascript-grid-themes/bootstrap-theme.php'); ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "components") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Components</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php normalItem($key, $rootFolder, 'Components', 'Overview', 'ag-grid-components/'); ?>
                <?php normalItem($key, $rootFolder, 'Cell Rendering', 'Cell Rendering', 'javascript-grid-cell-rendering/'); ?>
                <?php normalItem($key, $rootFolder, 'Cell Editor', 'Cell Editor', 'javascript-grid-cell-editor/'); ?>
                <?php normalItem($key, $rootFolder, 'Filter Component', 'Filter Component', 'javascript-grid-filter-component/'); ?>
                <?php normalItem($key, $rootFolder, 'Header Rendering', 'Header Components', 'javascript-grid-header-rendering/'); ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "row_models") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Row Models</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php normalItem($key, $rootFolder, 'Row Models', 'Overview', 'javascript-grid-row-models/'); ?>
                <?php normalItem($key, $rootFolder, 'Datasource', 'Datasource', 'javascript-grid-datasource/'); ?>
                <?php normalItem($key, $rootFolder, 'Pagination', 'Pagination', 'javascript-grid-pagination/'); ?>
                <?php normalItem($key, $rootFolder, 'Virtual Paging / Infinite Scrolling', 'Virtual Paging & Infinite Scrolling', 'javascript-grid-virtual-paging/'); ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "examples") { ?> active<?php } ?>"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Examples</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-examples">
                <?php normalItem($key, $rootFolder, 'Styled Report', 'Styled Report', 'example-account-report/'); ?>
                <?php normalItem($key, $rootFolder, 'File Browser', 'File Browser', 'example-file-browser/'); ?>
                <?php normalItem($key, $rootFolder, 'Expressions and Context', 'Expressions and Context', 'example-expressions-and-context/'); ?>
            </div>

            <?php if ($version == 'latest') { ?>
                <div class="docsMenu-header<?php if ($pageGroup == "misc") { ?> active<?php } ?>"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4>Misc</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div class="docsMenu-content">
                    <?php normalItem($key, $rootFolder, 'Change Log', 'Change Log', 'change-log/changeLogIndex.php'); ?>
                    <?php normalItem($key, $rootFolder, 'Roadmap', 'Roadmap', 'change-log/changeLogIndex.php'); ?>
                    <?php normalItem($key, $rootFolder, 'Intermediate Tutorial', 'Tutorials', 'ag-grid-tutorials/'); ?>
                    <a class="sidebarLink" href="/archive/">Archive Docs</a>
                </div>
            <?php } ?>

        </div>

        <div class="col-sm-10 blog-main">

            <gcse:searchresults></gcse:searchresults>