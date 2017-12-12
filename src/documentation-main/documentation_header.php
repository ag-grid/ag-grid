<?php
include_once '../example-runner/utils.php';
include_once '../includes/html-helpers.php';
include_once '../php-utils/printPropertiesTable.php';

$version = 'latest';

$rootFolder;
if (strcmp($version, 'latest') == 0) {
    $rootFolder = '/';
} else {
    $rootFolder = '/archive/' . $version . '/';
}

$cookieKey_expandAll = 'agGridExpandAll';
$expandAll = $_COOKIE[$cookieKey_expandAll];

$oneHundredDaysFromNow = time() + 60*60*24*100;

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
        print('<a class="sidebarLink '.$indentClass.'" href="' . $GLOBALS[rootFolder] . $url  . '">' . $padding . $iconHtml . $name . '</a>');
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
        print('<a class="sidebarLink '.$indentClass.' nline-block" href="' . $GLOBALS[ rootFolder] . $url  . '">' . $padding . $name . '</a>');
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
        print('<span class="sidebarLinkSelected nline-block" >' . $padding . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.' nline-block" href="' . $GLOBALS[ rootFolder ] . $url  . '">' . $padding . $name . '</a>');
    }

    if($position == 'end') {
        print('</section></div>');
    }
}
?>
<!DOCTYPE html>
<html>
<head lang="en">
<?php
meta_and_links($pageTitle, $pageKeyboards, $pageDescription, false);
?>
<link rel="stylesheet" href="../dist/docs.css">
</head>

<body ng-app="documentation">
<header id="nav" class="compact">
<?php 
    $navKey = "documentation";
    include '../includes/navbar.php';
 ?>
</header>

<div id="documentation">
    <div>
    <aside id="side-nav">
        <?php include 'documentation_menu.php'; ?>
    </aside>

    <section id="content">
