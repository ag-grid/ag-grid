<?php
include_once '../example-runner/utils.php';
include_once '../includes/html-helpers.php';
include_once '../php-utils/printPropertiesTable.php';
$DONT_USE_FONT_AWESOME=true;
$version = 'latest';

$rootFolder;
if (strcmp($version, 'latest') == 0) {
    $rootFolder = '/';
} else {
    $rootFolder = '/archive/' . $version . '/';
}
?>
<!DOCTYPE html>
<html lang="en">
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
        <button id="side-nav-toggle" type="button" data-toggle="collapse" data-target="#side-nav-container" aria-controls="side-nav-container" aria-expanded="false" aria-label="Toggle navigation"><span>&nbsp;</span></button>

        <div id="search-wrapper">
            <input type="text" id="search-input" placeholder="Search Docs" />
        </div>

    <div id="side-nav-container" class="collapse">
        <?php include 'documentation_menu.php'; ?>
        <?php include 'documentation_sidebar.php'; ?>
    </div>
    </aside>

    <section id="content" class="<?php echo defined('skipInPageNav') ? 'skip-in-page-nav' : '' ?>">
