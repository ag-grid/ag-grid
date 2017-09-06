<?php
$key = "Getting Started";
$pageTitle = "JavaScript Grid";
$pageDescription = "JavaScript Grid";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<?php

$link = NULL;
switch ($GLOBALS[framework]) {
    case 'angular':
        $link = '../best-angular-2-data-grid/';
        break;
    case 'javascript':
        $link = '../best-javascript-data-grid/';
        break;
    case 'angularjs':
        $link = '../best-angularjs-data-grid/';
        break;
    case 'react':
        $link = '../best-react-data-grid/';
        break;
    case 'vue':
        $link = '../best-vuejs-data-grid/';
        break;
    case 'aurelia':
        $link = '../best-aurelia-data-grid/';
        break;
    case 'webcomponents':
        $link = '../best-web-component-data-grid/';
        break;
    default:
}
$linkHref = "<a href='" . $link . "'>here</a>";
?>
<div>

    <h1><img src="../images/svg/docs/getting_started.svg" width="50" /> Getting Started</h1>

    <p>
        <?php if (!isFrameworkAll()) { ?>
            Start <?= $linkHref ?> to get a simple grid working in your application, then follow on
            to further sections to understand how particular features work.
        <?php } ?></p>

    <?php if (isFrameworkAll()) { ?>

        <p>
            On the left hand menu there are Getting Started entries for JavaScript,
            as well as all the major Frameworks.
        </p>

        <p>The suggested reading order is:</p>
        <ul>
            <li>Try and get a simple grid working using plain JavaScript - learn the very basics.</li>
            <li>Then get a simple grid working using the framework of your choice, eg Angular or React.</li>
            <li>Jump into the features section, to find out about the features that you are interested in.</li>
        </ul>

        <h2>
            Selecting A Framework
        </h2>
        <div>
            You are currently viewing all frameworks. This is fine. However you might want to consider
            selecting a framework from the top left side menu - this will ensure you
            are only shown documentation relevant to the framework you're interested in.
        </div>
    <?php } ?>

    <h2>Browser Support/Compatibility</h2>

    <p>ag-Grid is compatible with IE 9+, Firefox, Chrome and Safari.</p>
</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
