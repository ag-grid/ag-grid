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

// framework is passed in as url parameter
$framework = $_GET['framework'];

// if framework url was not passed, or is invalid, set framework to all
$allFrameworks = array('javascript', 'angular', 'angularjs', 'react', 'vue', 'aurelia', 'webcomponents');
if (!in_array($framework, $allFrameworks)) {
    $framework = 'all';
}

function normalItem($indent, $localKey, $name, $url)
{
    menuItem($indent, $localKey, $name, $url, false);
}

function menuItem($indent, $localKey, $name, $url, $enterprise)
{
    $enterpriseIcon = $enterprise ? '<img class="enterprise-icon" src="../images/enterprise.png"/> ' : '';
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    if ($GLOBALS[key] == $localKey) {
        print('<span class="sidebarLinkSelected">' . $padding . $enterpriseIcon . $name . '</span>');
    } else {
        print('<a class="sidebarLink" href="' . $GLOBALS[rootFolder] . $url . '?framework=' . $GLOBALS[framework] . '">' . $padding . $enterpriseIcon . $name . '</a>');
    }
}

function enterpriseItem($indent, $localKey, $name, $url)
{
    menuItem($indent, $localKey, $name, $url, true);
}

function isFrameworkSelected($framework)
{
    if ($framework === $GLOBALS[framework]) {
        echo 'selected="selected"';
    }
}

function isFrameworkAll()
{
    return $GLOBALS[framework] === 'all';
}

function isFrameworkAngular()
{
    return $GLOBALS[framework] === 'angular' || $GLOBALS[framework] === 'all';
}

function isFrameworkJavaScript()
{
    return $GLOBALS[framework] === 'javascript' || $GLOBALS[framework] === 'all';
}

function isFrameworkAngularJS()
{
    return $GLOBALS[framework] === 'angularjs' || $GLOBALS[framework] === 'all';
}

function isFrameworkReact()
{
    return $GLOBALS[framework] === 'react' || $GLOBALS[framework] === 'all';
}

function isFrameworkVue()
{
    return $GLOBALS[framework] === 'vue' || $GLOBALS[framework] === 'all';
}

function isFrameworkAurelia()
{
    return $GLOBALS[framework] === 'aurelia' || $GLOBALS[framework] === 'all';
}

function isFrameworkWebComponents()
{
    return $GLOBALS[framework] === 'webcomponents' || $GLOBALS[framework] === 'all';
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

<!-- this is passed to the javascript, so it knows the framework -->
<span id="frameworkAttr" style="display: none;"><?= $framework ?></span>

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

            <div class="frameworkBox">
                <h4 class="frameworkHeading">Framework

                    <?php if (isFrameworkAll()) { ?>

                    <?php } elseif (isFrameworkAngular()) { ?>
                        <img src="/images/angular2_small.png" alt="Angular" />

                    <?php } elseif (isFrameworkAngularJS()) { ?>
                        <img src="/images/angularjs_small.png" alt="Angular 1" />

                    <?php } elseif (isFrameworkAurelia()) { ?>
                        <img src="/images/aurelia_small.png" alt="Aurelia" />

                    <?php } elseif (isFrameworkReact()) { ?>
                        <img src="/images/react_small.png" alt="React" />

                    <?php } elseif (isFrameworkVue()) { ?>
                        <img src="/images/vue_small.png" alt="Vue" />

                    <?php } elseif (isFrameworkJavaScript()) { ?>
                        <img src="/images/javascript_small.png" alt="JavaScript" />

                    <?php } elseif (isFrameworkWebComponents()) { ?>
                        <img src="/images/webComponents_small.png" alt="Web Components" />
                    <?php } ?>

                </h4>

                <div class="form-group">
                    <select id="framework" class="form-control" ng-change="model.onFrameworkChanged()" ng-model="model.framework">
                        <option value="all">All</option>
                        <option value="javascript">JavaScript</option>
                        <option value="angular">Angular</option>
                        <option value="angularjs">AngularJS 1.x</option>
                        <option value="react">ReactJS</option>
                        <option value="vue">VueJS</option>
                        <option value="aurelia">AureliaJS</option>
                        <option value="webcomponents">Web Components</option>
                    </select>
                </div>
            </div>

            <div class="docsMenu-header <?php if ($pageGroup == "basics") { ?> active<?php } ?>" data-id="getting_started">
                <h4>
                    <img src="../images/gettingStarted.png" style="width: 20px; float: left;"/>
                    &nbsp;
                    Getting Started
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">

                <?php
                normalItem(0, 'Getting Started', 'Overview', 'javascript-grid-getting-started/');

                if (isFrameworkAngular()) {
                    normalItem(1, 'Angular SystemJS', 'SystemJS', 'ag-grid-angular-systemjs/');
                    normalItem(1, 'Angular Webpack', 'Webpack', 'ag-grid-angular-webpack/');
                    normalItem(1, 'Angular Webpack 2', 'Webpack 2', 'ag-grid-angular-webpack-2/');
                    normalItem(0, 'Next Steps', 'Next Steps', 'ag-grid-next-steps/');
                }
                ?>

            </div>

            <div class="docsMenu-header <?php if ($pageGroup == "interfacing") { ?> active<?php } ?>" data-id="interfacing">
                <h4>
                    <img src="../images/interfacing.jpg" style="width: 20px; float: left;"/>
                    &nbsp;
                    Interfacing
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                normalItem(0, 'Interfacing Overview', 'Overview', 'javascript-grid-interfacing-overview/');
                normalItem(0, 'Properties', 'Properties', 'javascript-grid-properties/');
                normalItem(0, 'columnDefs', 'Columns', 'javascript-grid-column-definitions/');
                normalItem(0, 'Events', 'Events', 'javascript-grid-events/');
                normalItem(0, 'Callbacks', 'Callbacks', 'javascript-grid-callbacks/');
                normalItem(0, 'Grid API', 'Grid API', 'javascript-grid-api/');
                normalItem(0, 'Column API', 'Column API', 'javascript-grid-column-api/');
                ?>
            </div>

            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "feature") { ?> active<?php } ?>" data-id="features">
                <h4>
                    <img src="../images/features.png" style="width: 20px; float: left;"/>
                    &nbsp;
                    Features
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                normalItem(0, 'Features', 'Overview', 'javascript-grid-features/');
                normalItem(0, 'Width & Height', 'Width & Height', 'javascript-grid-width-and-height/');
                normalItem(0, 'Sorting', 'Sorting', 'javascript-grid-sorting/');
                normalItem(0, 'Column Filter', 'Column Filter', 'javascript-grid-filtering/');

                normalItem(1, 'Date Filter', 'Date Filter', 'javascript-grid-filter-date/');
                normalItem(1, 'Text Filter', 'Text Filter', 'javascript-grid-filter-text/');
                normalItem(1, 'Number Filter', 'Number Filter', 'javascript-grid-filter-number/');
                enterpriseItem(1, 'Set Filtering', 'Set Filter', 'javascript-grid-set-filtering/');
                normalItem(1, 'Custom Filter', 'Custom Filter', 'javascript-grid-filter-custom/');

                normalItem(0, 'Selection', 'Selection', 'javascript-grid-selection/');
                enterpriseItem(0, 'Range Selection', 'Range Selection', 'javascript-grid-range-selection/');
                normalItem(0, 'Resizing', 'Resizing', 'javascript-grid-resizing/');
                normalItem(0, 'Pinning', 'Pinning', 'javascript-grid-pinning/');
                normalItem(0, 'Grouping Columns', 'Grouping Columns', 'javascript-grid-grouping-headers/');
                normalItem(0, 'Tree Data', 'Tree Data', 'javascript-grid-tree/');
                normalItem(0, 'Row Height', 'Row Height', 'javascript-grid-row-height/');
                normalItem(0, 'Floating', 'Floating Rows', 'javascript-grid-floating/');
                normalItem(0, 'Value Getters', 'Value Getters', 'javascript-grid-value-getters/');
                normalItem(0, 'Cell Expressions', 'Cell Expressions', 'javascript-grid-cell-expressions/');
                normalItem(0, 'Cell Styling', 'Cell Styling', 'javascript-grid-cell-styling/');
                normalItem(0, 'Context', 'Context', 'javascript-grid-context/');
                normalItem(0, 'InsertRemove', 'Insert & Remove', 'javascript-grid-insert-remove/');
                normalItem(0, 'Refresh', 'Refresh', 'javascript-grid-refresh/');
                normalItem(0, 'Animation', 'Animation', 'javascript-grid-animation/');
                normalItem(0, 'Keyboard Navigation', 'Keyboard Navigation', 'javascript-grid-keyboard-navigation/');
                normalItem(0, 'Internationalisation', 'Internationalisation', 'javascript-grid-internationalisation/');
                normalItem(0, 'Full Width', 'Full Width Rows & Master Detail', 'javascript-grid-master-detail/');
                normalItem(0, 'Master / Slave', 'Master / Slave', 'javascript-grid-master-slave/');
                normalItem(0, 'Touch', 'Touch', 'javascript-grid-touch/');
                normalItem(0, 'Row Model', 'Row Model', 'javascript-grid-model/');
                normalItem(0, 'Data Export', 'CSV Export', 'javascript-grid-export/');
                enterpriseItem(0, 'Excel Export', 'Excel Export', 'javascript-grid-excel/');
                normalItem(0, 'RTL', 'RTL', 'javascript-grid-rtl/');
                normalItem(0, 'Icons', 'Icons', 'javascript-grid-icons/');
                normalItem(0, 'Overlays', 'Overlays', 'javascript-grid-overlays/');
                normalItem(0, 'For Print', 'For Print', 'javascript-grid-for-print/');

                enterpriseItem(0, 'Data Functions', 'Data Functions', 'javascript-grid-data-functions/');
                enterpriseItem(1, 'Grouping', 'Grouping Rows', 'javascript-grid-grouping/');
                enterpriseItem(1, 'Aggregation', 'Aggregation', 'javascript-grid-aggregation/');
                enterpriseItem(1, 'Pivoting', 'Pivoting', 'javascript-grid-pivoting/');

                enterpriseItem(0, 'Tool Panel', 'Tool Panel', 'javascript-grid-tool-panel/');
                enterpriseItem(0, 'Clipboard', 'Clipboard', 'javascript-grid-clipboard/');
                enterpriseItem(0, 'Column Menu', 'Column Menu', 'javascript-grid-column-menu/');
                enterpriseItem(0, 'Context Menu', 'Context Menu', 'javascript-grid-context-menu/');
                enterpriseItem(0, 'Status Bar', 'Status Bar', 'javascript-grid-status-bar/');
                enterpriseItem(0, 'License Key', 'License Key', 'javascript-grid-set-license/');

                ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "row_models") { ?> active<?php } ?>" data-id="row_models">
                <h4>
                    <img src="../images/rowModel.png" style="width: 20px; float: left;"/>
                    &nbsp;
                    Row Models
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                normalItem(0, 'Row Models', 'Overview', 'javascript-grid-row-models/');
                normalItem(0, 'Datasource', 'Datasource', 'javascript-grid-datasource/');
                normalItem(0, 'Pagination', 'Pagination', 'javascript-grid-pagination/');
                normalItem(0, 'Infinite Scrolling', 'Infinite Scrolling', 'javascript-grid-virtual-paging/');
                enterpriseItem(0, 'Viewport', 'Viewport', 'javascript-grid-viewport/');
                ?>
            </div>
            
            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "themes") { ?> active<?php } ?>" data-id="themes">
                <h4>
                    <img src="../images/themes.png" style="width: 20px; float: left;"/>
                    &nbsp;
                    Themes
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">

                <?php
                normalItem(0, 'Styling', 'Overview', 'javascript-grid-styling/');
                normalItem(0, 'Fresh Theme', 'Fresh Theme', 'javascript-grid-themes/fresh-theme.php');
                normalItem(0, 'Blue Theme', 'Blue Theme', 'javascript-grid-themes/blue-theme.php');
                normalItem(0, 'Dark Theme', 'Dark Theme', 'javascript-grid-themes/dark-theme.php');
                normalItem(0, 'Material Theme', 'Material Theme', 'javascript-grid-themes/material-theme.php');
                normalItem(0, 'Bootstrap Theme', 'Bootstrap Theme', 'javascript-grid-themes/bootstrap-theme.php');
                ?>

            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "components") { ?> active<?php } ?>" data-id="components">
                <h4>
                    <img src="../images/components.png" style="width: 20px; float: left;"/>
                    &nbsp;
                    Components
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                normalItem(0, 'Components', 'Overview', 'javascript-grid-components/');
                normalItem(0, 'Cell Rendering', 'Cell Renderer', 'javascript-grid-cell-rendering/');
                normalItem(0, 'Cell Editor', 'Cell Editor', 'javascript-grid-cell-editor/');
                normalItem(0, 'Filter Component', 'Filter Component', 'javascript-grid-filter-component/');
                normalItem(0, 'Header Rendering', 'Header Component', 'javascript-grid-header-rendering/');
                ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "examples") { ?> active<?php } ?>" data-id="examples">
                <h4>
                    <img src="../images/examples.jpg" style="width: 20px; float: left;"/>
                    &nbsp;
                    Examples
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-examples">
                <?php

                if (isFrameworkAngular() || isFrameworkAll()) {
                    normalItem(0, 'Angular Examples', 'Angular Examples', 'example-angular/');
                    normalItem(1, 'Angular Rich Grid', 'Rich Grid', 'example-angular-rich-grid/');
                    normalItem(1, 'Angular Markup', 'Rich Grid via Markup', 'example-angular-rich-grid-markup/');
                    normalItem(1, 'Angular Dynamic', 'Cell Renderers', 'example-angular-dynamic/');
                    normalItem(1, 'Angular Editor', 'Editor Component', 'example-angular-editor/');
                    normalItem(1, 'Angular Filter', 'Filter Component', 'example-angular-filter/');
                    normalItem(1, 'Angular Floating Row', 'Floating Rows', 'example-angular-floating-row/');
                    normalItem(1, 'Angular Full Width', 'Full Width Rows', 'example-angular-full-width-rows/');
                    normalItem(1, 'Angular Group Row', 'Group Rows', 'example-angular-grouped-row/');
                    normalItem(1, 'Angular MasterDetail', 'Master/Detail', 'example-angular-master-detail/');
                    normalItem(1, 'Angular Third Party', 'Third Party', 'example-angular-third-party/');
                }
                normalItem(0, 'Styled Report', 'Styled Report', 'example-account-report/');
                normalItem(0, 'File Browser', 'File Browser', 'example-file-browser/');
                normalItem(0, 'Expressions and Context', 'Expressions and Context', 'example-expressions-and-context/');
                ?>
            </div>

            <?php if ($version == 'latest') { ?>
                <div class="docsMenu-header<?php if ($pageGroup == "misc") { ?> active<?php } ?>" data-id="misc">
                    <h4>Misc</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div class="docsMenu-content">
                    <?php
                    normalItem(0, 'Change Log', 'Change Log', 'change-log/changeLogIndex.php');
                    normalItem(0, 'Roadmap', 'Roadmap', 'javascript-grid-roadmap');
                    normalItem(0, 'Intermediate Tutorial', 'Tutorials', 'ag-grid-tutorials/');
                    ?>
                    <a class="sidebarLink" href="/archive/">Archive Docs</a>
                </div>
            <?php } ?>

        </div>

        <div class="col-sm-10 blog-main">

            <div id="googleSearchResults" style="display: none;">
                <gcse:searchresults></gcse:searchresults>
            </div>