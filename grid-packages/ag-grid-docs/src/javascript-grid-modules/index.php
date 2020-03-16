<?php
$pageTitle = "ag-Grid Reference: ag-Grid Modules";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page provides an overview of ag-Grid modules";
$pageKeywords = "ag-Grid JavaScript Data Grid Modules";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

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

<h1>ag-Grid Modules - Overview</h1>

<p class="lead">
    ag-Grid <code>modules</code> allow you to pick and choose which features you require, resulting in a smaller application size overall,
    with the trade-off being that you need to register the modules you require.
</p>

<note>
    The introduction of modules in version 22.0.0 is a significant first step towards reducing the size of ag-Grid
    inside applications. As most of the new modules
    cover enterprise features, community users should not expect to see a size reduction right away. However, in the
    coming releases, we will strive to reduce
    the size of the community-core module by splitting it out into separate community modules.
</note>

<h2>Introduction</h2>

<h2>Modules</h2>

<p>
    The below table summarizes the modules provided in the ag-Grid Community and ag-Grid Enterprise packages.
</p>

<table class="properties">
    <tr>
        <th></th>
        <th>Community Module</th>
        <th>Exported</th>
    </tr>
    <?php printFeatures(false, false) ?>

    <tr>
        <th></th>
        <th>Enterprise Module <img src="../_assets/svg/enterprise.svg" style="width: 16px;"/></th>
        <th>Exported</th>
    </tr>
    <?php printFeatures(true, false) ?>
</table>

<p>Note that neither <code>@ag-grid-community/all-modules</code> nor <code>@ag-grid-enterprise/all-modules</code> contain
framework support - if you require framework support you need to explicitly specify it:</p>

<table class="properties">
    <tr>
        <th></th>
        <th>Framework Module</th>
        <th>Exported</th>
    </tr>
    <?php printFeatures(false, true) ?>
</table>

<h2><code>All Modules Bundles</code></h2>

<p><code>@ag-grid-community/all-modules</code> can be considered to be equivalent to <code>ag-grid-community</code>, but
    with the additional
    need to register modules within. If using this module you might be better off using <code>ag-grid-community</code>
    as the bundle size
    will be similar and will reduce the need to register modules.</p>

<p><code>@ag-grid-enterprise/all-modules</code> can be considered to be equivalent to <code>ag-grid-enterprise</code>,
    but with the additional
    need to register modules within. If using this module you might be better off using <code>ag-grid-enterprise</code>
    (along with <code>ag-grid-enterprise)</code> as the bundle size will be similar and will reduce the need to register
    modules.</p>

<note>If you decide to use <code style="white-space: nowrap">@ag-grid-enterprise/all-modules</code> then you do <strong>not</strong>
    need to
    specify <code style="white-space: nowrap">@ag-grid-community/all-modules</code> too. <code
            style="white-space: nowrap">@ag-grid-enterprise/all-modules</code>
    will contain all Community modules.
</note>

<h2>Mixing <code>packages</code> and <code>modules</code></h2>

<p>The following artifacts are "<code>modules</code>" and are designed to work to together:</p>

<table class="properties">
    <tr>
        <th>Module Prefix</th>
    </tr>
    <tr>
        <td><code>@ag-grid-community/xxxxx</code></td>
    </tr>
    <tr>
        <td><code>@ag-grid-enterprise/xxxxx</code></td>
    </tr>
</table>

<p>You <strong>cannot</strong> mix <code>packages</code> and <code>modules</code> - in other words you cannot have a mix of the following
    types of dependencies:</p>

<snippet>
    "dependencies": {
    "ag-grid-community": "^23.0.0" <- a package dependency
    "@ag-grid-enterprise/all-modules": "^23.0.0"  <- a module dependency
    ...other dependencies...
</snippet>

<h2>Installing ag-Grid Modules</h2>

<p>If you choose to select individual modules then at a minimum the a
    <a href="../javascript-grid-row-models/">Row Model</a> need to be specified. After that all other modules are
    optional
    depending on your requirements.</p>

<p>There are two ways to supply modules to the grid - either globally or by individual grid.</p>

<h3>Providing Modules Globally</h3>

<p>You can import and provide all modules to the Grid globally if you so desire, but you need to ensure that this is
    done
    before <span style="font-style: italic"><strong>any</strong></span> Grids are instantiated.</p>

<p>The steps required are:</p>
<ul>
<li>Specify Modules Dependencies</li>
<li>Import Modules</li>
<li>Register Modules</li>
</ul>

<p>A real-world example might be that we wish to use the <code>Client Side Row Model</code> (the default row model) together
with the <code>CSV</code>, <code>Excel</code> and <code>Master/Detail</code> features. Additionally we're writing a React application
so we need to specify the <code>@ag-grid-community/react</code> dependency:</p>

<snippet>
"dependencies": {
    "@ag-grid-community/client-side-row-model": "^23.0.0",
    "@ag-grid-community/csv-export": "^23.0.0",
    "@ag-grid-enterprise/excel-export": "^23.0.0",
    "@ag-grid-enterprise/master-detail": "^23.0.0",
    "@ag-grid-community/react": "^23.0.0",
    ...other dependencies...
</snippet>

<p>We now need to register the Grid modules we wish to use - note that this does not include <code>@ag-grid-community/react</code>
as the React support is not a Grid feature, but rather a support library:</p>

<snippet>
import {ModuleRegistry} from '@ag-grid-community/core';     // @ag-grid-community/core will always be implicitly available
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {CsvExportModule} from "@ag-grid-community/csv-export";
import {ExcelExportModule} from "@ag-grid-enterprise/excel-export";
import {MasterDetailModule} from "@ag-grid-enterprise/master-detail";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    MasterDetailModule
]);

// you can optionally register individual modules
// ModuleRegistry.register(ClientSideRowModelModule);
// ModuleRegistry.register(CsvExportModule);
// etc
</snippet>

</snippet>

<h3>Providing Modules To Individual Grids</h3>

<p>The steps required are:</p>
<ul>
    <li>Specify Modules Dependencies</li>
    <li>Import Modules</li>
    <li>Provide Modules To Each Grid</li>
</ul>

<p>Using the same real-world example above let us assume that we wish to use the <code>Client Side Row Model</code> (the default row model) together
    with the <code>CSV</code>, <code>Excel</code> and <code>Master/Detail</code> features. Additionally we're writing a React application
    so we need to specify the <code>@ag-grid-community/react</code> dependency:</p>

<snippet>
"dependencies": {
    "@ag-grid-community/client-side-row-model": "^23.0.0",
    "@ag-grid-community/csv-export": "^23.0.0",
    "@ag-grid-enterprise/excel-export": "^23.0.0",
    "@ag-grid-enterprise/master-detail": "^23.0.0",
    "@ag-grid-community/react": "^23.0.0",
    ...other dependencies...
</snippet>

<p>We now need to provide the Grid modules we wish to use - note that this does not include <code>@ag-grid-community/react</code>
as the React support is not a Grid feature, but rather a support library.</p>

<p>In our example we're writing a React application so the example will use <code>AgGridReact</code>, but the principle would apply for other frameworks too:</p>

<snippet>
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {CsvExportModule} from "@ag-grid-community/csv-export";
import {ExcelExportModule} from "@ag-grid-enterprise/excel-export";
import {MasterDetailModule} from "@ag-grid-enterprise/master-detail";

import {AgGridReact} from "@ag-grid-community/react";

export default class GridExample extends Component {
    ...rest of class..

    render() {
        return (
            &lt;div style=<span>{</span>{height: 400, width: 900}} className="ag-theme-alpine"&gt;
                &lt;AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData}
                    modules={[ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule]}

                    // events
                    onGridReady={this.onGridReady}&gt;
                &lt;/AgGridReact&gt;
            &lt;/div&gt;
        )
    }
};

</snippet>

<p>Example of using JavaScript or other Frameworks:</p>
<snippet>
// JavaScript
new Grid(&lt;dom element&gt;, gridOptions, { modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule]});

// Angular
public modules: Module[] = [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule];

&lt;ag-grid-angular&gt;
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [modules]="modules"
&lt;/ag-grid-angular&gt;

// Vue
data() {
    return {
        columnDefs: ...column defs...,
        rowData: ....row data...,
        modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule]
    }
}
&lt;ag-grid-vue
    :columnDefs="columnDefs"
    :rowData="rowData"
    :modules="modules"&gt;
&lt;/ag-grid-vue&gt;
    </snippet>
</ol>


<h2><code>Core</code> Modules</h3>

<p>If you specify <span style="font-style: italic">any</span> Community or Enterprise dependency then the corresponding <code>core</code> module will also be pulled in and
be made available to you.</p>

<p>For example, if you specify (for example) <code>@ag-grid-community/client-side-row-model</code> - a Community Module - then the corresponding <code>@ag-grid-community/core</code> will be available.</p>

<p>By the same token, if you specify (for example) <code>@ag-grid-enterprise/excel-export</code> - an Enterprise Module - then the corresponding <code>@ag-grid-enterprise/core</code> will be available.</p>

<p>This is worth knowing as you'll generally require the <code>core</code> packages for a variety of reasons - Grid related definitions for the <code>@ag-grid-community/core</code> module
and <code>LicenseManager</code> for the <code>@ag-grid-enterprise/core</code> module.</p>

<p>Let us assume we have the following modules specified:</p>

<snippet>
"dependencies": {
    "@ag-grid-community/client-side-row-model": "^23.0.0",
    "@ag-grid-community/csv-export": "^23.0.0",
    "@ag-grid-enterprise/excel-export": "^23.0.0",
    "@ag-grid-enterprise/master-detail": "^23.0.0",
    "@ag-grid-community/react": "^23.0.0",
    ...other dependencies...
</snippet>

<p>We can then assume the <code>core</code> packages are available implicitly:</p>
<snippet>
import {ColumnApi, GridApi} from "@ag-grid-community/core";
import {LicenseManager} from "@ag-grid-enterprise/core";
</snippet>

<h2>CSS/SCSS Paths</h2>

<p>CSS & SCSS will be available in the <code>@ag-grid-community/core</code> module,  which will always be available (if any Community or Enterprise module is specified):</p>

<snippet>
// CSS Community
import "./node_modules/@ag-grid-community/core/dist/styles/ag-grid.css";
import "./node_modules/@ag-grid-community/core/dist/styles/ag-theme-balham.css";

// SCSS Community
@import "./node_modules/@ag-grid-community/core/dist/styles/ag-grid.scss";
@import "./node_modules/@ag-grid-community/core/dist/styles/ag-theme-balham/sass/ag-theme-balham-mixin.scss";
</snippet>
<?php include '../documentation-main/documentation_footer.php'; ?>
