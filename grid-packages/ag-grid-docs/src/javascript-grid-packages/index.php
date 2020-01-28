<?php
$pageTitle = "ag-Grid Reference: ag-Grid Modules";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page explains how to set the License Key in ag-Grid Enterprise";
$pageKeyboards = "ag-Grid JavaScript Data Grid Modules";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<style>
    .feature-group-title {
        display: block;
        margin-top: 26px;
        font-size: 30px;
    }

    .feature-title {
        display: block;
    }

    .feature-title-indent-1 {
        padding-left: 40px;
    }

    .feature-title-indent-2 {
        padding-left: 80px;
    }

    .feature-title-indent-3 {
        padding-left: 120px;
    }

    .feature-title-indent-4 {
        padding-left: 160px;
    }
</style>
<?php
function printFeatures($enterprise, $framework)
{
    $lev1Items = json_decode(file_get_contents('../documentation-main/modules.json'), true);
    foreach ($lev1Items as $lev1Item) {
        if ($enterprise) {
            if ($lev1Item['enterprise']) {
                printFeature($lev1Item, 0);
            }
        } else if ($framework) {
            if ($lev1Item['framework']) {
                printFeature($lev1Item, 0);
            }
        } else if (!$lev1Item['enterprise'] && !$lev1Item['framework']) {
            printFeature($lev1Item, 0);
        }
    }
}

function printFeature($item)
{
    $itemTitle = $item['title'];
    $module = $item['module'];
    $exported = $item['exported'];

    echo "<tr>";
    echo "<td style='white-space: nowrap'>$itemTitle ";
    if ($item['enterprise']) {
        echo "<img src=\"../_assets/svg/enterprise.svg\" style=\"width: 16px;\"/>";
    }
    echo "</span></td>";
    echo "<td style='white-space: nowrap'>$module</td>";
    echo "<td>$exported</td>";
    echo "</tr>";
}

?>

<h1>ag-Grid Modules & Packages</h1>

<p class="lead">
    Version 22.0.0 changes the way ag-Grid is made available by providing functionality in modules, allowing you to
    pick and choose which features you require, resulting in a smaller application size overall.
</p>

<h2>Introduction</h2>

<p>There are two main ways to install ag-Grid - either by using packages (<code>ag-grid-community</code> or <code>ag-grid-enterprise</code>),
    or by using <a href="../javascript-grid-modules">modules</a>.</p>

<p>Packages are the easiest way to use ag-Grid, but by default include all code specific to each package, whereas
    modules allow you to
    cherry pick what functionality you want, which will allow for a reduced overall bundle size.</p>

<p>The rest of this page will discuss the use of packages. Please refer to the <a href="../javascript-grid-modules">modules</a>
    documentation for more information on that side of things.</p>


<h2><code>ag-grid-community</code> & <code>ag-grid-enterprise</code></h2>

<p><code>ag-grid-community</code> contains all of the Community code and is additionally "self-registering", so you
    don't need
    to provide modules to the Grid (either directly, or via <code></code>).</p>

<p><code>ag-grid-enterprise</code> adds Enterprise functionality - in order to use it you need to specify both it and
    <code>ag-grid-community</code>.</p>

<p>Please refer to the Getting Started guides for a walkthrough on how to install and use these packages from the ground up:</p>

<div id="get-started-frameworks">

    <div class="row no-gutters">

        <div>
            <div class="get-started-framework card-javascript">
                <a href="../javascript-grid/">JavaScript</a>
                <div>
                    <p><a href="../javascript-grid/">Get Started</a></p>
                </div>
            </div>
        </div>


        <div>
            <div class="get-started-framework card-angular">
                <a href="../angular-grid/">Angular</a>
                <div>
                    <p><a href="../angular-grid/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-react">
                <a href="../react-grid/">React</a>
                <div>
                    <p><a href="../react-grid/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-vue-inverted">
                <a href="../vuejs-grid/">Vue.js</a>
                <div>
                    <p><a href="../vuejs-grid/">Get Started</a></p>
                </div>
            </div>
        </div>

    </div>
</div>

<p>Or maybe your are doing something a little less common...</p>

<ul>
    <li><a href="../best-angularjs-grid/">Start with AngularJS</a></li>
    <li><a href="../polymer-getting-started/">Start with Polymer</a></li>
</ul>


<?php include '../documentation-main/documentation_footer.php'; ?>
