<?php
$navKey = "blog";
$version = 'latest';
require_once dirname(__FILE__) . '/html-helpers.php';
require_once dirname(__FILE__) . '/../example-runner/utils.php';
?>
<!DOCTYPE html>
<html>
<head lang="en">
<?php
meta_and_links($pageTitle, $pageKeyboards, $pageDescription, false);
?>
<link rel="stylesheet" href="../dist/homepage.css">
</head>

<body ng-app="documentation">

<header id="nav" class="compact">
<?php 
    include dirname(__FILE__) . '/navbar.php';
?>
</header>

<div class="info-page">
    <div class="row">
        <section>