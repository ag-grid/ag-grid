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
$cookieKey_framework = 'agGridFramework';
$cookieKey_expandAll = 'agGridExpandAll';
$expandAll = $_COOKIE[$cookieKey_expandAll];

// if framework url was not passed, or is invalid, set framework to all
$allFrameworks = array('javascript', 'angular', 'angularjs', 'polymer', 'react', 'vue', 'aurelia', 'webcomponents', 'all');

// check if framework exists
if (!in_array($framework, $allFrameworks)) {
    // set from cookie
    if ($_COOKIE[$cookieKey_framework]){
        $framework = $_COOKIE[$cookieKey_framework];
    } else {
        $framework = 'all';
    }
}

$oneHundredDaysFromNow = time() + 60*60*24*100;

//$domain = ($_SERVER['HTTP_HOST'] != 'localhost') ? $_SERVER['HTTP_HOST'] : false;

// delete cookie first to avoid duplicates
setcookie($cookieKey_framework, '', time()-300);

setcookie($cookieKey_framework, $framework, $oneHundredDaysFromNow, '/');

function menuItem($indent, $localKey, $name, $url, $noIndentStyling = false) {
    menuItemWithIcon(null, $indent, $localKey, $name, $url, $noIndentStyling);
}

function menuItemWithIcon($icon, $indent, $localKey, $name, $url, $noIndentStyling = false) {
    $iconHtml = $icon!==null ? '<img class="enterprise-icon" src="../images/'.$icon.'" width="15px" /> ' : '';
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $padding = ($indent == 2) ? '&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $indentClass = $noIndentStyling ? '' : 'sidebarLink-indent'.$indent;
    if ($GLOBALS[key] == $localKey) {
        print('<span class="sidebarLinkSelected">' . $padding . $iconHtml . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.'" href="' . $GLOBALS[rootFolder] . $url . '?framework=' . $GLOBALS[framework] . '">' . $padding . $iconHtml . $name . '</a>');
    }
}

function menuItemCollapsibleParent($indent, $localKey, $name, $url, $parentId) {
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $padding = ($indent == 2) ? '&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $indentClass = 'sidebarLink-indent'.$indent;

    $checked = $GLOBALS[$parentId];
    if ($GLOBALS[key] == $localKey) {
        $checked = " checked ";
        print('<span class="sidebarLinkSelected nline-block" >' . $padding . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.' nline-block" href="' . $GLOBALS[ rootFolder] . $url . '?framework=' . $GLOBALS[framework] . '">' . $padding . $name . '</a>');
    }
    print('<input collapsible id="'.$parentId.'" type="checkbox" '.$checked.'>');
    print('<label collapsible style="float: right" for="'.$parentId.'"></label>');
}

function menuItemCollapsibleChild($indent, $localKey, $name, $url, $parentId, $childId, $position = 'middle') {
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $padding = ($indent == 2) ? '&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $padding = ($indent == 3) ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $indentClass = 'sidebarLink-indent'.$indent;

    if($position == 'start') {
        print('<div id="'.$childId.'"><section>');
    }

    if ($GLOBALS[key] == $localKey) {
//        print('<script>expandCollapsibleGroup(\''.$parentId.'\')</script>');
        print('<span class="sidebarLinkSelected nline-block" >' . $padding . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.' nline-block" href="' . $GLOBALS[ rootFolder ] . $url . '?framework=' . $GLOBALS[framework] . '">' . $padding . $name . '</a>');
    }

    if($position == 'end') {
        print('</section></div>');
    }
}

function isFrameworkSelected($framework) {
    if ($framework === $GLOBALS[framework]) {
        echo 'selected="selected"';
    }
}

function isFrameworkAll() {
    return $GLOBALS[framework] === 'all';
}

function isFrameworkAngular2()
{
    return $GLOBALS[framework] === 'angular' || $GLOBALS[framework] === 'all';
}

function isFrameworkPolymer()
{
    return $GLOBALS[framework] === 'polymer' || $GLOBALS[framework] === 'all';
}

function isFrameworkJavaScript()
{
    return $GLOBALS[framework] === 'javascript' || $GLOBALS[framework] === 'all';
}

function isFrameworkAngular1()
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
    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="../dist/bootstrap/js/bootstrap.min.js"></script>

    <link inline rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../documentation-main/documentation.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

</head>

<body ng-app="documentation">
<?php include_once '../php-utils/printPropertiesTable.php' ?>
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
                    <div id="documentationSearchBox" style="opacity: 0">
                        <gcse:searchbox enableAutoComplete="true" enableHistory="true" autoCompleteMaxCompletions="5"
                                        autoCompleteMatchType="any"></gcse:searchbox>
                    </div>
                </div>
            </div>
        </div>

    </div>

</div>

<div class="container documentationContainer" style="margin-top: 20px">

    <div class="row">

        <div class="col-sm-3 col-md-2">
            <?php include 'documentation_menu.php'; ?>
        </div>

        <div class="col-sm-9 col-md-10 blog-main">

            <div id="googleSearchResults" style="display: none;">
                <gcse:searchresults></gcse:searchresults>
            </div>
