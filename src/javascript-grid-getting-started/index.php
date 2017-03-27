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
$linkHref = "<a href='" . $link . "'>here</a>";
?>
<div>

    <h3><img src="../images/svg/docs/getting_started.svg" width="50" /> ag-Grid - Getting Started</h3>

    <p>Learn how to get a simple
        application working using ag-Grid with your preferred framework.
        <?php if (!isFrameworkAll()) { ?>
            Start <?= $linkHref ?> to get a simple grid working in your application, then follow on
            to further sections to understand how particular features work.
        <?php } ?></p>

    <?php if (isFrameworkAll()) { ?>

        <p>On the left hand menu there are Getting Started entries for JavaScript, as well as all the major Frameworks.
            Please select
            the item you're interested in to get started.</p>

        <p>The suggested reading order would be:</p>
        <ul>
            <li>Select the menu entry to the left under <span style="font-style: italic">Overview</span> that corresponds to your chosen framework (or just JavaScript) to Get Started.</li>
            <li>Follow up with the <a href="../ag-grid-next-steps">Next Steps</a>, where we go into further detail, including
            guidance on how to use and configure <img src="../images/enterprise_50.png" width="20px"> ag-Grid Enteprise.</li>
            <li>Move onto the <a href="../javascript-grid-interfacing-overview">Interfacing</a> section to further explore the
            available <a href="../javascript-grid-properties">Properties</a>, <a href="../javascript-grid-events">Events</a>,
                and <a href="../javascript-grid-api">API</a> available to you.</li>
        </ul>

        <note>        <h2>
                Viewing All Frameworks
            </h2>
            <div>
                You are viewing all frameworks. It is probable you are only
                interested in one framework. Consider selecting a framework from the top left side menu - this will ensure you
                are only shown documentation relevant to the technologies you're interested in.
            </div>
        </note>
    <?php } ?>

    <h2>Browser Support/Compatibility</h2>

    <p>ag-Grid is compatible with IE 9+, Firefox, Chrome and Safari.</p>
</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
