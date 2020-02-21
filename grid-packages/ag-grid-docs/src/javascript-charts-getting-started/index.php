<?php
$pageTitle = "ag-Charts Getting Started: Choose Your Framework";
$pageDescription = "ag-Charts is a feature-rich charts library. We support all the major JavaScript frameworks, this page is the jumping off point for all the individual guides.";
$pageKeywords = "JavaScript Charts";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Getting Started</h1>

<p class="lead">
    Select a framework to see getting started instructions for that framework. If you do not want to
    use ag-Charts with any framework, follow the instructions for
    <a href="../javascript-charts">Plain JavaScript</a>.
</p>

<div id="get-started-frameworks">

<div class="row no-gutters">

<div><div class="get-started-framework card-javascript">
    <a href="../javascript-charts/">JavaScript</a>
    <div>
        <p><a href="../javascript-charts/">Get Started</a></p>
    </div>
</div></div>


<div><div class="get-started-framework card-angular">
    <a href="../angular-charts/">Angular</a>
    <div>
        <p><a href="../angular-charts/">Get Started</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-react">
    <a href="../react-charts/">React</a>
    <div>
        <p><a href="../react-charts/">Get Started</a></p>
    </div>
</div></div>

<div><div class="get-started-framework card-vue-inverted">
    <a href="../vuejs-charts/">Vue.js</a>
    <div>
        <p><a href="../vuejs-charts/">Get Started</a></p>
    </div>
</div></div>

</div></div>

<h2>Framework Agnostic ag-Charts</h2>

<p>
    The "ag" part of ag-Charts stands for "agnostic". The internal ag-Charts engine is implemented in TypeScript with
    zero dependencies. It is possible to use no framework with ag-Charts and use the fully featured JavaScript only
    version. ag-Charts also supports all major frameworks by providing ag-Charts Components for
    each popular framework and allowing customization of the grid using the framework of your choice.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
