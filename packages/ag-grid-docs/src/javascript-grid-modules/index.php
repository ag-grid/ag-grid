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
function printFeatures($enterprise = false)
{
    $lev1Items = json_decode(file_get_contents('../documentation-main/modules.json'), true);
    foreach ($lev1Items as $lev1Item) {
        if($enterprise) {
            if($lev1Item['enterprise']) {
                printFeature($lev1Item, 0);
            }
        } else if(!$lev1Item['enterprise']) {
            printFeature($lev1Item, 0);
        }
    }
}

function printFeature($item, $indent)
{
    $itemTitle = $item['title'];
    $module = $item['module'];

    echo "<tr>";
    echo "<td>$itemTitle ";
    if ($item['enterprise']) {
        echo "<img src=\"../_assets/svg/enterprise.svg\" style=\"width: 16px;\"/>";
    }
    echo "</span></td>";
    echo "<td><i class=\"\" style=';'></i>$module</td>";
    echo "</tr>";
}
?>

<h1 class="heading-enterprise">ag-Grid Modules</h1>

<p class="lead">
    Version 22.0.0 changes the way ag-Grid is made available by providing functionality in modules, allowing you to
    pick and choose which features you require, resulting in a smaller application size overall.
</p>

<note>If you use the UMD versions of ag-Grid (<code>ag-grid-community.js</code> or <code>ag-grid-enterprise.js</code>)
    then the
    application size will remain the same and all modules will automatically be included and the following documentation
    does not apply.
</note>

<h2>Introduction</h2>

<p>
    In previous releases all Community functionality was provided in a single dependency (<code>ag-grid-community</code>)
    and all Enterprise functionality in another dependency (<code>ag-grid-enterprise</code>).
</p>

<p>With Version 22.0.0 the ag-Grid can now be consumed by feature module which will result in a resulting in a smaller
    application size overall.</p>

<h2>Modules</h2>

<p>
    The below table summarizes the modules provided in the ag-Grid Community and ag-Grid Enterprise packages.
</p>

<table class="properties">
    <tr>
        <th></th>
        <th>Community Module</th>
    </tr>
    <?php printFeatures() ?>

    <tr>
        <th></th>
        <th>Enterprise Module <img src="../_assets/svg/enterprise.svg" style="width: 16px;"/></th>
    </tr>
    <?php printFeatures(true) ?>
</table>

<h2>Installing ag-Grid Modules</h2>

<p>If you wish to pull in all Community or all Enterprise modules as you did before you can specify the corresponding
    packages (<code>@ag-grid-community/all-modules</code> and <code>@ag-grid-enterprise/all-modules</code>) and reference them later.</p>

<p>If you choose to select modules based on requirements then at a minimum the a
    <a href="../javascript-grid-row-models/">Row Model</a> need to be specified. After that all other modules are optional
    depending on your requirements.</p>

<p>Regardless of your choice you'll need to do the following:</p>

<ol>
    <li>Specify the Grid Modules you wish to import:</li>

<snippet>
// pull in all community modules
"dependencies": {
    "@ag-grid-community/all-modules": "22.0.0"
}

// or just specify the minimum you need - in this case we're choosing the Client Side Row Model

"dependencies": {
    "@ag-grid-community/client-side-row-model": "22.0.0"
}
</snippet>

    <p>Note that if you specify an Enterprise module you do not need to specify Community module(s) unless you require them.
    For example if you use the <code>ServerSideRowModelModule</code> then you only need to specify
        <span style="white-space: nowrap"><code>@ag-grid-enterprise/server-side-row-model</code></span>
    as a dependency.</p>

    <li>Import the module(s) you need</li>
<snippet>
import {AllCommunityModules} from '@ag-grid-community/all-modules';

// or if using ag-Grid Enterprise
import {AllModules} from '@ag-grid-enterprise/all-modules';

// or if choosing individual modules
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
</snippet>

    <li>Provide the module(s) to the Grid</li>
<snippet>
// Javascript
new Grid(&lt;dom element&gt;, gridOptions, { modules: AllModules});
// or if choosing individual modules
new Grid(&lt;dom element&gt;, gridOptions, { modules: [ClientSideRowModelModule]});

// Angular
public modules: Module[] = AllModules;
// or if choosing individual modules
public modules: Module[] = [ClientSideRowModelModule];

&lt;ag-grid-angular&gt;
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [modules]="modules"
&lt;/ag-grid-angular&gt;

// React
&lt;ag-grid-react&gt;
    rowData={rowData}
    columnDefs={columnDefs}
    modules={AllModules}
&lt;/ag-grid-react&gt;
// or if choosing individual modules
&lt;ag-grid-react&gt;
    rowData={rowData}
    columnDefs={columnDefs}
    modules={[ClientSideRowModelModule]}
&lt;/ag-grid-react&gt;
</snippet>
</ol>
<p>
    Each of the <a href="../javascript-grid-getting-started/">Getting Started</a> guides gives step by step instructions
    on how to get started using ag-Grid for each framework in question. In most cases, you do one of the following:
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
