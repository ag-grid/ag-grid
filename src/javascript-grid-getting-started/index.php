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

    <h1 class="first-h framework-select-big-title">Choose Your Framework</h1>

    <p class="framework-select-small-title">
        Some 'more simple' data grids support one framework.
    </p>

    <p class="framework-select-small-title">
        ag-Grid has you covered when you move between frameworks.
    </p>

    <div class="row framework-select-list">
        <div class="col-md-3">
            <a href="../best-javascript-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/javascript_large.png" alt="JavaScript Datagrid" title="JavaScript"/>
                    <div class="framework-select-label">
                        JavaScript
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-3">
            <a href="../best-react-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/react_large_home.png" alt="React Datagrid" title="React"/>
                    <div class="framework-select-label">
                        React
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-3">
            <a href="../best-angular-2-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/angular2_large.png" alt="Angular 2 Datagrid" title="Angular"/>
                    <div class="framework-select-label">
                        Angular 2+
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-3">
            <a href="../best-angularjs-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/angularjs_large.png" alt="Angular Datagrid" title="Angular"/>
                    <div class="framework-select-label">
                        Angular
                    </div>
                </div>
            </a>
        </div>
    </div>

    <div class="row framework-select-list">
        <div class="col-md-3">
            <a href="../best-polymer-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/polymer-large.png" alt="Polymer Datagrid" title="Polymer"/>
                    <div class="framework-select-label">
                        Polymer
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-3">
            <a href="../best-vuejs-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/vue_large_home.png" alt="VueJS Datagrid" title="VueJS"/>
                    <div class="framework-select-label">
                        VueJS
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-3">
            <a href="../best-aurelia-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/aurelia_large.png" alt="Aurelia Datagrid" title="Aurelia"/>
                    <div class="framework-select-label">
                        Aurelia
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-3">
            <a href="../best-web-component-data-grid/">
                <div class="framework-select-item">
                    <img src="../images/webComponents_large.png" alt="Web Components Datagrid" title="Web Components"/>
                    <div class="framework-select-label">
                        Web Components
                    </div>
                </div>
            </a>
        </div>
    </div>

    <p class="framework-select-small-title">
        You can select your chosen framework in the menu (top left) to tailor the documentation for your selection.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
