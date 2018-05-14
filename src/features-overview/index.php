<?php
$pageTitle = "ag-Grid Reference: Getting Started with the JavaScript Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This Getting Start guide covers installing our seed repo and getting up and running with a simple JavaScript Datagrid. We also cover basisc configuration.";
$pageKeyboards = "Javascript Grid";
$pageGroup = "basics";

include_once '../example-runner/utils.php';
include_once '../includes/html-helpers.php';
include_once '../php-utils/printPropertiesTable.php';
$DONT_USE_FONT_AWESOME=true;
$version = "latest";
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links($pageTitle, $pageKeyboards, $pageDescription, false);
?>
    <link rel="stylesheet" href="../dist/docs.css">
    <style type="text/css" media="screen">
        dl {
            font-size: 0.8rem;
            position: sticky;
            height: 100vh;
            top: 0;
            overflow: auto;
        }
    </style>
</head>

<body>
<header id="nav" class="compact">
<?php 
    $navKey = "features-overview";
    include '../includes/navbar.php';
 ?>
</header>

<?php
$features_overview = json_decode(file_get_contents('items.json'), true);
function toId($str) {
    return strtolower(preg_replace('/\s+/', '-', $str));
}
?>
<div id="documentation">
    <div>
    <section id="content" class="skip-left-nav features-overview">
        <div class="container">
            <h1>Features Overview</h1>
        </div>
<?php foreach ($features_overview as $group) { ?>
            <div class="container mb-5">
            <h2 class="mt-3" id="<?=toId($group['title']) ?>"><?=$group['title'] ?></h2>
            <p class="lead mb-5"><?= $group['summary'] ?></p>
                <?php foreach ($group['items'] as $index => $item) { ?>
                <div class="row mb-5">
                    <div class="col-sm-7 <?= ($index % 2 == 0 ? 'order-1' : 'order-0') ?>">
                        <h3 class="mt-0" id="<?=toId($item['title']) ?>"><?= $item['title'] ?></h3>
                        <p class=""><?= $item['description'] ?></p>

                        <ul class="list-unstyled">
                            <?php foreach ($item['links'] as $link) { ?>
                            <li><a href="<?= $link['url'] ?>"><?= $link['title'] ?> &rarr;</a></li>
                            <? } ?>
                        </ul>
                    </div>

                    <div class="col-sm-5 <?= ($index % 2 == 0 ? 'text-left' : 'text-right') ?>">
                        <img src="<?=$item['img'] ?>" height="180" width="320">
                    </div>
                </div>
                <? } ?>
            </div>
    <?php } ?>
    </section>

    <aside>
        <dl>
            <?php foreach ($features_overview as $group) { ?>
                <dt class="mb-2 mt-4"><?=$group['title'] ?></dt>
                <?php foreach ($group['items'] as $index => $item) { ?>
                <dd>
                    <a href="#<?=toId($item['title']) ?>"><?=$item['title'] ?></a>
                </dd>
                <?php } ?>
            <?php } ?>
        </dl>
    </aside>

    </div>
</div>

<?php include_once("../includes/footer.php"); ?>
<?php include_once("../includes/analytics.php"); ?>
<?php docScripts() ?>
</body>
</html>
