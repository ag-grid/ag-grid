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
        if($enterprise) {
            if($lev1Item['enterprise']) {
                printFeature($lev1Item, 0);
            }
        } else if($framework) {
            if($lev1Item['framework']) {
                printFeature($lev1Item, 0);
            }
        }
        else if(!$lev1Item['enterprise'] && !$lev1Item['framework']) {
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

<note><p>The <code>ag-grid-community</code> and <code>ag-grid-enterprise</code> packages have now been deprecated (but still supported
        for the time being).</p>
    The documentation on this page should be read, but for a quick how-to migration please see the <a href="#migrating-to-modules">Migration</a>
    section for more information.</note>
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
    <?php printFeatures(false, false) ?>

    <tr>
        <th></th>
        <th>Framework Module</th>
    </tr>
    <?php printFeatures(false, true) ?>

    <tr>
        <th></th>
        <th>Enterprise Module <img src="../_assets/svg/enterprise.svg" style="width: 16px;"/></th>
    </tr>
    <?php printFeatures(true, false) ?>
</table>

<note>The framework modules are <strong>not</strong> included in either <code>@ag-grid-community/all-modules</code> or
    <code style="white-space: nowrap">@ag-grid-enterprise/all-modules</code>. You need to explicitly import the framework module that corresponds to
your chosen framework, if using a framework.</note>

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

        // Vue
        data() {
            return {
                columnDefs: ...column defs...,
                rowData: ....row data...,
                modules: AllModules
            }
        }
        &lt;ag-grid-vue
            :columnDefs="columnDefs"
            :rowData="rowData"
            :modules="modules"&gt;
        &lt;/ag-grid-vue&gt;

        // or if choosing individual modules
        data() {
            return {
                columnDefs: ...column defs...,
                rowData: ....row data...,
                modules: [ClientSideRowModelModule]
            }
        }
        &lt;ag-grid-vue
            :columnDefs="columnDefs"
            :rowData="rowData"
            :modules="modules"&gt;
        &lt;/ag-grid-vue&gt;
    </snippet>
</ol>

<h2 id="migrating-to-modules">Migrating</h2>
<p>This section documents how to quickly migrate from the deprecated <code>ag-grid-community</code> and <code>ag-grid-enterprise</code> packages
    to the new modular based one.</p>

<p>In versions 21.x and before you would have needed to referenced the <code>ag-grid-community</code> and <code>ag-grid-enterprise</code>
    packages in <code>package.json</code>:</p>
<snippet>
    "dependencies": {
        "ag-grid-community": "21.0.0",
        "ag-grid-enterprise": "21.0.0"
    }
</snippet>

<p>And then import the <code>ag-grid-enterprise</code> package if using Enterprise features:</p>

<snippet>import "ag-grid-enterprise";</snippet>

<p>For Version 22.x onwards you need to update your <code>package.json</code> to reference the new module base package,
    depending on the feature set you require (note you no longer need to specify both Community and Enterprise - just the one will do):</p>
<snippet>
    "dependencies": {
        "@ag-grid-community/all-modules": "22.0.0"
    }

    // or, if using Enterprise features
    "dependencies": {
        "@ag-grid-enterprise/all-modules": "22.0.0"
    }
</snippet>

<p>You then need to import the modules exported by each package:</p>

<snippet>
    import {AllCommunityModules} from "@ag-grid-community/all-modules";

    // or, if using Enterprise features
    import {AllModules} from "@ag-grid-enterprise/all-modules";
</snippet>

<p>You'll now need to supply the modules used to the Grid:</p>

<snippet>
    // Javascript
    new Grid(&lt;dom element&gt;, gridOptions, { modules: AllCommunityModules});

    // Angular
    public modules: Module[] = AllCommunityModules;

    &lt;ag-grid-angular&gt;
        [rowData]="rowData"
        [columnDefs]="columnDefs"
        [modules]="modules"
    &lt;/ag-grid-angular&gt;

    // React
    &lt;ag-grid-react&gt;
        rowData={rowData}
        columnDefs={columnDefs}
        modules={AllCommunityModules}
    &lt;/ag-grid-react&gt;

    // Vue
    data() {
        return {
            columnDefs: ...column defs...,
            rowData: ....row data...,
            modules: AllCommunityModules
        }
    }
    &lt;ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
        :modules="modules"&gt;
    &lt;/ag-grid-vue&gt;

    // --------------------------------
    // or, if using Enterprise features
    // --------------------------------

    // Javascript
    new Grid(&lt;dom element&gt;, gridOptions, { modules: AllModules});

    // Angular
    public modules: Module[] = AllModules;

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

    // Vue
    data() {
        return {
            columnDefs: ...column defs...,
            rowData: ....row data...,
            modules: AllModules
        }
    }
    &lt;ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
        :modules="modules"&gt;
    &lt;/ag-grid-vue&gt;
</snippet>

<p>Finally, you'll need to update the paths of CSS or SCSS that you reference:</p>

<snippet>
    // CSS Community
    import "./node_modules/@ag-grid-community/all-modules/dist/styles/ag-grid.css";
    import "./node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";

    // or, if using Enterprise features
    import "./node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
    import "./node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-theme-balham.css";

    // SCSS Community
    @import "./node_modules/@ag-grid-community/all-modules/dist/styles/ag-grid.scss";
    @import "./node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-balham/sass/ag-theme-balham.scss";

    // or, if using Enterprise features
    @import "./node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-grid.scss";
    @import "./node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-theme-balham/sass/ag-theme-balham.scss";
</snippet>
<?php include '../documentation-main/documentation_footer.php'; ?>
