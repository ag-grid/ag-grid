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
$cookieKey = 'agGridFramework';

// if framework url was not passed, or is invalid, set framework to all
$allFrameworks = array('javascript', 'angular', 'angularjs', 'react', 'vue', 'aurelia', 'webcomponents', 'all');

// check if framework exists
if (!in_array($framework, $allFrameworks)) {
    // set from cookie
    if ($_COOKIE[$cookieKey]){
        $framework = $_COOKIE[$cookieKey];
    } else {
        $framework = 'all';
    }
}

$oneHundredDaysFromNow = time() + 60*60*24*100;

$domain = ($_SERVER['HTTP_HOST'] != 'localhost') ? $_SERVER['HTTP_HOST'] : false;

// delete cookie first to avoid duplicates
setcookie($cookieKey, '', time()-300);  

setcookie($cookieKey, $framework, $oneHundredDaysFromNow, '/', $domain, false);

function menuItem($indent, $localKey, $name, $url) {
    menuItemWithIcon(null, $indent, $localKey, $name, $url);
}

function menuItemWithIcon($icon, $indent, $localKey, $name, $url) {
    $iconHtml = $icon!==null ? '<img class="enterprise-icon" src="../images/'.$icon.'"/> ' : '';
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $indentClass = 'sidebarLink-indent'.$indent;
    if ($GLOBALS[key] == $localKey) {
        print('<span class="sidebarLinkSelected">' . $padding . $iconHtml . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.'" href="' . $GLOBALS[rootFolder] . $url . '?framework=' . $GLOBALS[framework] . '">' . $padding . $iconHtml . $name . '</a>');
    }
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

<body ng-app="documentation">

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

          <div class="dropdown frameworkBox">
            <div class="frameworkContainer">
                <h4 class="frameworkHeading">Framework</h4><button class="btn btn-default frameworkDropdownButton dropdown-toggle<?php if (isFrameworkAll()) { ?> frameworkAllButton<?php } ?>" type="button" onclick="this.classList.toggle('active');" data-toggle="dropdown">
                        <?php if (isFrameworkAll()) { ?>
                            All Frameworks
                        <?php } elseif (isFrameworkAngular()) { ?>
                            <img src="/images/angular2_small.png" alt="Angular" />
                            Angular
                        <?php } elseif (isFrameworkAngularJS()) { ?>
                            <img src="/images/angularjs_small.png" alt="Angular 1" />
                            Angular JS
                        <?php } elseif (isFrameworkAurelia()) { ?>
                            <img src="/images/aurelia_small.png" alt="Aurelia" />
                            Aurelia
                        <?php } elseif (isFrameworkReact()) { ?>
                            <img src="/images/svg/react.alt.svg" width="22" alt="React" />
                            React
                        <?php } elseif (isFrameworkVue()) { ?>
                            <img src="/images/vue_small.png" alt="Vue" />
                            Vue JS
                        <?php } elseif (isFrameworkJavaScript()) { ?>
                            <img src="/images/javascript_small.png" alt="JavaScript" />
                            JavaScript
                        <?php } elseif (isFrameworkWebComponents()) { ?>
                            <img src="/images/webComponents_small.png" alt="Web Components" />
                            <span class="web-components">Web Components</span>
                        <?php } ?>

                <span class="caret"></span></button>
                <ul class="dropdown-menu" role="menu" aria-labelledby="menu1">
                  <li class="frameworkDropdownText">Documentation not relevant to your framework choice will be filtered out.</li>
                  <li class="divider"></li>
                  <li><a class="frameworkDropdown-link" data-id="javascript" href="#"><img src="/images/javascript_small.png" alt="JavaScript" /> Just JavaScript (no framework)</a></li>
                  <li><a class="frameworkDropdown-link" data-id="angular" href="#"><img src="/images/angularjs_small.png" alt="Angular 1" /> Angular (Angular 2 and later)</a></li>
                  <li><a class="frameworkDropdown-link" data-id="angularjs" href="#"><img src="/images/angularjs_small.png" alt="Angular 1" /> Angular JS (Angular 1)</a></li>
                  <li><a class="frameworkDropdown-link" data-id="aurelia" href="#"><img src="/images/aurelia_small.png" alt="Aurelia" /> Aurelia</a></li>
                  <li><a class="frameworkDropdown-link" data-id="react" href="#"><img src="/images/svg/react.alt.svg" width="22" alt="React" /> React</a></li>
                  <li><a class="frameworkDropdown-link" data-id="vue" href="#"><img src="/images/vue_small.png" width="22" alt="Vue" /> Vue JS</a></li>
                  <li><a class="frameworkDropdown-link" data-id="webcomponents" href="#"><img src="/images/webComponents_small.png" alt="Web Components" /> Web Components</a></li>
                  <li><a class="frameworkDropdown-link all-frameworks" data-id="all" href="#">All Frameworks (show everything)</a></li>
                </ul>
            </div>
          </div>

            <div class="docsMenu-header <?php if ($pageGroup == "basics") { ?> active<?php } ?>" data-id="getting_started">
                <h4>
                    <img src="../images/svg/docs/getting_started.svg" />
                    &nbsp;
                    Getting Started
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">

                <?php
                menuItem(0, 'Getting Started', 'Overview', 'javascript-grid-getting-started/');

                if (isFrameworkAngular()) {
                    menuItem(1, 'Angular SystemJS', 'SystemJS', 'ag-grid-angular-systemjs/');
                    menuItem(1, 'Angular Webpack', 'Webpack', 'ag-grid-angular-webpack/');
                    menuItem(1, 'Angular Webpack 2', 'Webpack 2', 'ag-grid-angular-webpack-2/');
                }
                menuItem(0, 'Next Steps', 'Next Steps', 'ag-grid-next-steps/');
                ?>

            </div>

            <div class="docsMenu-header <?php if ($pageGroup == "interfacing") { ?> active<?php } ?>" data-id="interfacing">
                <h4>
                    <img src="../images/svg/docs/interfacing.svg" />
                    &nbsp;
                    Interfacing
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                menuItem(0, 'Interfacing Overview', 'Overview', 'javascript-grid-interfacing-overview/');
                menuItem(0, 'Properties', 'Properties', 'javascript-grid-properties/');
                menuItem(0, 'columnDefs', 'Columns', 'javascript-grid-column-definitions/');
                menuItem(0, 'Events', 'Events', 'javascript-grid-events/');
                menuItem(0, 'Callbacks', 'Callbacks', 'javascript-grid-callbacks/');
                menuItem(0, 'Grid API', 'Grid API', 'javascript-grid-api/');
                menuItem(0, 'Column API', 'Column API', 'javascript-grid-column-api/');
                ?>
            </div>

            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "feature") { ?> active<?php } ?>" data-id="features">
                <h4>
                    <img src="../images/svg/docs/features.svg" />
                    &nbsp;
                    Features
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                menuItem(0, 'Features', 'Overview', 'javascript-grid-features/');
                menuItem(0, 'Width & Height', 'Grid Size', 'javascript-grid-width-and-height/');
                menuItem(0, 'Sorting', 'Sorting', 'javascript-grid-sorting/');
                menuItem(0, 'Column Filter', 'Column Filter', 'javascript-grid-filtering/');

                menuItem(1, 'Text Filter', 'Text Filter', 'javascript-grid-filter-text/');
                menuItem(1, 'Number Filter', 'Number Filter', 'javascript-grid-filter-number/');
                menuItem(1, 'Date Filter', 'Date Filter', 'javascript-grid-filter-date/');
                menuItemWithIcon('enterprise.png', 1, 'Set Filtering', 'Set Filter', 'javascript-grid-filter-set/');
                menuItem(1, 'Custom Filter', 'Custom Filter', 'javascript-grid-filter-custom/');

                menuItem(0, 'Quick Filter', 'Quick Filter', 'javascript-grid-filter-quick/');
                menuItem(0, 'External Filter', 'External Filter', 'javascript-grid-filter-external/');

                menuItem(0, 'Selection', 'Selection', 'javascript-grid-selection/');
                menuItemWithIcon('enterprise.png', 0, 'Range Selection', 'Range Selection', 'javascript-grid-range-selection/');
                menuItem(0, 'Resizing', 'Column Resizing', 'javascript-grid-resizing/');
                menuItem(0, 'Pinning', 'Column Pinning', 'javascript-grid-pinning/');
                menuItem(0, 'Grouping Columns', 'Grouping Columns', 'javascript-grid-grouping-headers/');
                menuItem(0, 'Tree Data', 'Tree Data', 'javascript-grid-tree/');
                menuItem(0, 'Row Height', 'Row Height', 'javascript-grid-row-height/');
                menuItem(0, 'Floating', 'Floating Rows', 'javascript-grid-floating/');
                menuItem(0, 'Value Getters', 'Value Getters', 'javascript-grid-value-getters/');
                menuItem(0, 'Cell Expressions', 'Cell Expressions', 'javascript-grid-cell-expressions/');
                menuItem(0, 'Cell Styling', 'Cell Styling', 'javascript-grid-cell-styling/');
                menuItem(0, 'Context', 'Context', 'javascript-grid-context/');
                menuItem(0, 'InsertRemove', 'Insert & Remove', 'javascript-grid-insert-remove/');
                menuItem(0, 'Refresh', 'Data Refresh', 'javascript-grid-refresh/');
                menuItem(0, 'Animation', 'Animation', 'javascript-grid-animation/');
                menuItem(0, 'Keyboard Navigation', 'Keyboard Navigation', 'javascript-grid-keyboard-navigation/');
                menuItem(0, 'Internationalisation', 'Internationalisation', 'javascript-grid-internationalisation/');
                menuItem(0, 'Full Width Rows', 'Full Width Rows', 'javascript-grid-full-width-rows/');
                menuItem(0, 'Master Detail', 'Master Detail', 'javascript-grid-master-detail/');
                menuItem(0, 'Master / Slave', 'Master / Slave', 'javascript-grid-master-slave/');
                menuItem(0, 'Touch', 'Touch', 'javascript-grid-touch/');
                menuItem(0, 'Row Model', 'Row Model', 'javascript-grid-model/');
                menuItem(0, 'Data Export', 'CSV Export', 'javascript-grid-export/');
                menuItemWithIcon('enterprise.png', 0, 'Excel Export', 'Excel Export', 'javascript-grid-excel/');
                menuItem(0, 'RTL', 'RTL', 'javascript-grid-rtl/');
                menuItem(0, 'Icons', 'Icons', 'javascript-grid-icons/');
                menuItem(0, 'Overlays', 'Overlays', 'javascript-grid-overlays/');
                menuItem(0, 'For Print', 'For Print', 'javascript-grid-for-print/');

                menuItemWithIcon('enterprise.png', 0, 'Data Functions', 'Data Functions', 'javascript-grid-data-functions/');
                menuItemWithIcon('enterprise.png', 1, 'Grouping', 'Grouping Rows', 'javascript-grid-grouping/');
                menuItemWithIcon('enterprise.png', 1, 'Aggregation', 'Aggregation', 'javascript-grid-aggregation/');
                menuItemWithIcon('enterprise.png', 1, 'Pivoting', 'Pivoting', 'javascript-grid-pivoting/');

                menuItemWithIcon('enterprise.png', 0, 'Tool Panel', 'Tool Panel', 'javascript-grid-tool-panel/');
                menuItemWithIcon('enterprise.png', 0, 'Clipboard', 'Clipboard', 'javascript-grid-clipboard/');
                menuItemWithIcon('enterprise.png', 0, 'Column Menu', 'Column Menu', 'javascript-grid-column-menu/');
                menuItemWithIcon('enterprise.png', 0, 'Context Menu', 'Context Menu', 'javascript-grid-context-menu/');
                menuItemWithIcon('enterprise.png', 0, 'Status Bar', 'Status Bar', 'javascript-grid-status-bar/');
                menuItemWithIcon('enterprise.png', 0, 'License Key', 'License Key', 'javascript-grid-set-license/');

                ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "row_models") { ?> active<?php } ?>" data-id="row_models">
                <h4>
                    <img src="../images/svg/docs/row_models.svg" />
                    &nbsp;
                    Row Models
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                menuItem(0, 'Row Models', 'Overview', 'javascript-grid-row-models/');
                menuItem(0, 'Datasource', 'Datasource', 'javascript-grid-datasource/');
                menuItem(0, 'Pagination', 'Pagination', 'javascript-grid-pagination/');
                menuItem(0, 'Infinite Scrolling', 'Infinite Scrolling', 'javascript-grid-virtual-paging/');
                menuItemWithIcon('enterprise.png', 0, 'Viewport', 'Viewport', 'javascript-grid-viewport/');
                ?>
            </div>
            
            <div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "themes") { ?> active<?php } ?>" data-id="themes">
                <h4>
                    <img src="../images/svg/docs/themes.svg" />
                    &nbsp;
                    Themes
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">

                <?php
                menuItem(0, 'Styling', 'Overview', 'javascript-grid-styling/');
                menuItem(0, 'Fresh Theme', 'Fresh Theme', 'javascript-grid-themes/fresh-theme.php');
                menuItem(0, 'Blue Theme', 'Blue Theme', 'javascript-grid-themes/blue-theme.php');
                menuItem(0, 'Dark Theme', 'Dark Theme', 'javascript-grid-themes/dark-theme.php');
                menuItem(0, 'Material Theme', 'Material Theme', 'javascript-grid-themes/material-theme.php');
                menuItem(0, 'Bootstrap Theme', 'Bootstrap Theme', 'javascript-grid-themes/bootstrap-theme.php');
                ?>

            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "components") { ?> active<?php } ?>" data-id="components">
                <h4>
                    <img src="../images/svg/docs/components.svg" />
                    &nbsp;
                    Components
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-content">
                <?php
                menuItem(0, 'Components', 'Overview', 'javascript-grid-components/');
                menuItem(0, 'Date Component', 'Date Component', 'javascript-grid-date-component/');
                menuItem(0, 'Cell Rendering', 'Cell Renderer', 'javascript-grid-cell-rendering/');
                menuItem(0, 'Cell Editor', 'Cell Editor', 'javascript-grid-cell-editor/');
                menuItem(0, 'Filter Component', 'Filter Component', 'javascript-grid-filter-component/');
                menuItem(0, 'Header Rendering', 'Header Component', 'javascript-grid-header-rendering/');
                ?>
            </div>

            <div class="docsMenu-header<?php if ($pageGroup == "examples") { ?> active<?php } ?>" data-id="examples">
                <h4>
                    <img src="../images/svg/docs/examples.svg" />
                    &nbsp;
                    Examples
                </h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="docsMenu-examples">
                <?php

                if (isFrameworkAngular() || isFrameworkAll()) {
                    menuItemWithIcon('angular2_small.png', 0, 'Angular Examples', 'Angular Examples', 'example-angular/');
                    menuItem(1, 'Angular Rich Grid', 'Rich Grid', 'example-angular-rich-grid/');
                    menuItem(1, 'Angular Markup', 'Grid via Markup', 'example-angular-rich-grid-markup/');
                    menuItem(1, 'Angular Dynamic', 'Cell Renderers', 'example-angular-dynamic/');
                    menuItem(1, 'Angular Editor', 'Editor Component', 'example-angular-editor/');
                    menuItem(1, 'Angular Filter', 'Filter Component', 'example-angular-filter/');
                    menuItem(1, 'Angular Floating Row', 'Floating Rows', 'example-angular-floating-row/');
                    menuItem(1, 'Angular Full Width', 'Full Width Rows', 'example-angular-full-width-rows/');
                    menuItem(1, 'Angular Group Row', 'Group Rows', 'example-angular-grouped-row/');
                    menuItem(1, 'Angular MasterDetail', 'Master/Detail', 'example-angular-master-detail/');
                    menuItem(1, 'Angular Third Party', 'Third Party', 'example-angular-third-party/');
                }
                menuItem(0, 'Styled Report', 'Styled Report', 'example-account-report/');
                menuItem(0, 'File Browser', 'File Browser', 'example-file-browser/');
                menuItem(0, 'Expressions and Context', 'Expressions and Context', 'example-expressions-and-context/');
                ?>
            </div>

            <?php if ($version == 'latest') { ?>
                <div class="docsMenu-header<?php if ($pageGroup == "misc") { ?> active<?php } ?>" data-id="misc">
                    <h4>Misc</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div class="docsMenu-content">
                    <?php
                    menuItem(0, 'Change Log', 'Change Log', 'change-log/changeLogIndex.php');
                    menuItem(0, 'Roadmap', 'Roadmap', 'javascript-grid-roadmap');
                    menuItem(0, 'Intermediate Tutorial', 'Tutorials', 'ag-grid-tutorials/');
                    ?>
                    <a class="sidebarLink" href="/archive/">Archive Docs</a>
                </div>
            <?php } ?>

            <div style="border: 1px solid #eee; margin-top: 30px; margin-bottom: 50px;">
            </div>

            <div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px;">
                <table>
                    <tr>
                        <td>
                            <img src="../images/github100.png" style="width: 50px"/>
                        </td>
                        <td>
                            <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true"
                                    frameborder="0" scrolling="0" width="120px" height="20px"
                                    style="position: relative; top: 3px;" class="hide-when-medium">
                            </iframe>
                        </td>
                    </tr>
                </table>
                <div style="padding-top: 6px;">
                    <a href="https://github.com/ceolter/ag-grid">Github</a>
                    stars make projects look great. Please help, donate a star.
                </div>
            </div>

            <div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px; margin-top: 10px;">

                <div style="float: left; margin-right: 12px; margin-top: 5px;">
                    <img src="../images/email.png"/>
                </div>
                <div>
                    Get informed on releases and other ag-Grid news only - never spam.
                </div>

                <!-- Begin MailChimp Signup Form -->
                <link href="//cdn-images.mailchimp.com/embedcode/classic-081711.css" rel="stylesheet" type="text/css">
                <style type="text/css">
                    #mc_embed_signup {
                        clear: left;
                        font: 14px Helvetica, Arial, sans-serif;
                    }

                    /* Add your own MailChimp form style overrides in your site stylesheet or in this style block.
                       We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
                </style>

                <div id="mc_embed_signup">
                    <form action="//angulargrid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=8b9aa91988"
                          method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate"
                          target="_blank" novalidate
                          style="padding: 0px">
                        <div id="mc_embed_signup_scroll">
                            <input style="width: 140px; margin-top: 4px;" placeholder="Email Address..." type="email" value="" name="EMAIL"
                                   class="required email" id="mce-EMAIL">
                            <input style="width: 140px; margin-top: 4px;" placeholder="First Name" type="text" value="" name="FNAME" class=""
                                   id="mce-FNAME">
                            <input style="width: 140px; margin-top: 4px;" placeholder="Last Name" type="text" value="" name="LNAME" class=""
                                   id="mce-LNAME">
                            <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"
                                   style="padding-left: 10px; padding-right: 10px; margin: 0px; ; margin-top: 4px; height: 20px; line-height: 20px;">
                            <div id="mce-responses" class="clear">
                                <div class="response" id="mce-error-response" style="display:none"></div>
                                <div class="response" id="mce-success-response" style="display:none"></div>
                            </div>
                            <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                            <div style="position: absolute; left: -5000px;"><input type="text"
                                                                                   name="b_9b44b788c97fa5b498fbbc9b5_8b9aa91988"
                                                                                   tabindex="-1" value=""></div>
                        </div>
                    </form>
                </div>

            </div>

            <div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px; margin-top: 10px;">
                Follow on Twitter

                <a href="http://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="medium"></a>
                <a href="http://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false" data-size="medium"></a>

                <script>!function (d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                        if (!d.getElementById(id)) {
                            js = d.createElement(s);
                            js.id = id;
                            js.src = p + '://platform.twitter.com/widgets.js';
                            fjs.parentNode.insertBefore(js, fjs);
                        }
                    }(document, 'script', 'twitter-wjs');</script>

            </div>

        </div>

        <div class="col-sm-10 blog-main">

            <div id="googleSearchResults" style="display: none;">
                <gcse:searchresults></gcse:searchresults>
            </div>