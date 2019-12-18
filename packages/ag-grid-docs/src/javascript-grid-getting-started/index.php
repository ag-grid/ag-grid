<?php
$pageTitle = "ag-Grid Getting Started: Choose Your Framework";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. We support all the najor JavaScript frameworks, this page is the jumping off point for all the individual guides.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Getting Started</h1>

<p class="lead">
    Select a framework to see getting started instructions for that framework. If you do not want to
    use ag-Grid with any framework, follow the instructions for
    <a href="../javascript-grid">Plain JavaScript</a>.
</p>

<div id="get-started-frameworks">

<div class="row no-gutters">

<div><div class="get-started-framework card-javascript">
    <a href="../javascript-grid/">JavaScript</a>
    <div>
        <p><a href="../javascript-grid/">Get Started</a></p>
    </div>
</div></div>


<div><div class="get-started-framework card-angular">
    <a href="../angular-grid/">Angular</a>
    <div>
        <p><a href="../angular-grid/">Get Started</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-react">
    <a href="../react-grid/">React</a>
    <div>
        <p><a href="../react-grid/">Get Started</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-vue-inverted">
    <a href="../vuejs-grid/">Vue.js</a>
    <div>
        <p><a href="../vuejs-grid/">Get Started</a></p>
    </div>
</div></div>

</div></div>

<p>Or maybe your are doing something a little less common...</p>

<ul>
    <li><a href="../angular-grid/">Start with AngularJS</a></li>
    <li><a href="../polymer-getting-started/">Start with Polymer</a></li>
</ul>


<h2>Framework Agnostic ag-Grid</h2>

<p>
    The "ag" part of ag-Grid stands for "agnostic". The internal ag-Grid engine is implemented in TypeScript with
    zero dependencies. It is possible to use no framework with ag-Grid and use the fully featured JavaScript only
    version. ag-Grid also supports all major frameworks by providing ag-Grid Components for
    each popular framework and allowing customization of the grid using the framework of your choice.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
