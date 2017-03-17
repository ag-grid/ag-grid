<?php
$key = "Getting Started";
$pageTitle = "Getting Started";
$pageDescription = "Getting Started ag-Grid and ag-Grid Enterprise";
$pageKeyboards = "Getting Started ag-Grid Enterprise";
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
    $linkHref = "<a href='".$link."'>here</a>";
?>
<div>

    <h3>ag-Grid - Getting Started</h3>

    <p>Learn how to get a simple
        application working using ag-Grid with your preferred framework.
        <?php if(!isFrameworkAll()) { ?>
        Start <?= $linkHref?> to get a simple grid working in your application, then follow on
        to further sections to understand how particular features work.
    <?php } ?></p>

    <?php if (isFrameworkAll()) { ?>

    <p>On the left hand menu there are Getting Started entries for JavaScript, as well as all the major Frameworks. Please select
    the item you're interested in to get started.</p>

            <h2>
                <img src="../images/svg/docs/getting_started.svg" width="50" />

                <img style="vertical-align: middle" src="../images/javascript_small.png"/>
                <img style="vertical-align: middle" src="../images/angularjs_small.png"/>
                <img style="vertical-align: middle" src="../images/angular2_small.png"/>
                <img style="vertical-align: middle" src="../images/react_small.png"/>
                <img style="vertical-align: middle" src="../images/vue_small.png"/>
                <img style="vertical-align: middle" src="../images/aurelia_small.png"/>
                <img style="vertical-align: middle" src="../images/webComponents_small.png"/>
                Viewing All Frameworks
            </h2>
            <div>
                You are viewing all frameworks. It is probable you are only
                interested in one framework. Consider selecting a framework from the side menu.
            </div>
        <?php } ?>

        <h2>Browser Support/Compatibility</h2>

        <p>ag-Grid is compatible with IE 9+, Firefox, Chrome and Safari.</p>
</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
