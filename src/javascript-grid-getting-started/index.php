<?php
$pageTitle = "JavaScript Grid";
$pageDescription = "JavaScript Grid";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
define('skipInPageNav', true);
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

    <h1>Choose Your Framework</h1>

<div id="get-started-frameworks" class="container-fluid"><div class="row no-gutters">

<div><div class="get-started-framework card-javascript">
    <div></div>
    <div>
        <h2>JavaScript</h2>
        <p class="card-text">Start with the vanilla flavor of the ag-Grid API.</p>
        <p><a href="../best-javascript-data-grid/">Start With JavaScript</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-react">
    <div></div>
    <div>
        <h2>React</h2>
        <p class="card-text">Integrate ag-Grid in your React-based project.</p>
        <p><a href="../best-react-data-grid/">Start With React</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-angular">
    <div></div>
    <div>
        <h2>Angular 2+</h2>
        <p class="card-text">See how ag-Grid works in the Angular 2+ context.</p>
        <p><a href="../best-angular-2-data-grid/">Start With Angular 2+</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-angularjs">
    <div></div>
    <div>
        <h2>AngularJS 1.X</h2>
        <p class="card-text">Learn how to use the AngularJS 1.X ag-Grid directive.</p>
        <p><a href="../best-angularjs-data-grid/">Start With AngularJS 1.X</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-polymer">
    <div></div>
    <div>
        <h2>Polymer</h2>
        <p class="card-text">Use ag-Grid alongside the Polymer web component suite.</p>
        <p><a href="../best-polymer-data-grid/">Start With Polymer</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-vue">
    <div></div>
    <div>
        <h2>Vue.js</h2>
        <p class="card-text">Get started with the Vue.js ag-Grid component wrapper.</p>
        <p><a href="../best-vuejs-data-grid/">Start With Vue.js</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-aurelia">
    <div></div>
    <div>
        <h2>Aurelia</h2>
        <p class="card-text">ag-Grid plays well with Aurelia, too!</p>
        <p><a href="../best-aurelia-data-grid/">Start With Aurelia</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-webcomponents">
    <div></div>
    <div>
        <h2>Web Components</h2>
        <p class="card-text">ag-Grid integrates with the emerging set of standards.</p>
        <p><a href="../best-aurelia-data-grid/">Start With Web Components</a></p>
    </div>
</div></div>

</div></div>

<?php include '../documentation-main/documentation_footer.php'; ?>
