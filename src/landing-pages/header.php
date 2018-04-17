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

if (basename($_SERVER['PHP_SELF']) == 'index.php') {
    $parts = explode('/', dirname($_SERVER['PHP_SELF']));
    // 'my-fancy-best-dir-name/'
    $article_id = end($parts). "/";
} else {
    // 'my-fancy-best-dir-name/file.php'
    $parts = explode('/', $_SERVER['PHP_SELF']);
    $article_id = join('/', array_slice($parts, -2, 2));
}

define('DOC_SECTION', $article_id);
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
    // $navKey = "getting-started";
    include '../includes/navbar.php';
 ?>
</header>

<div id="documentation">
    <div>
    <section id="content" class="<?php echo defined('skipInPageNav') ? 'skip-in-page-nav' : '' ?> <?php echo defined('skipLeftNav') ? 'skip-left-nav' : '' ?>">
