<?php
$pageTitle = "ag-Grid Reference: ag-Grid Modules";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page provides an overview of ag-Grid modules";
$pageKeywords = "ag-Grid JavaScript Data Grid Modules";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>ag-Grid Modules - More Details</h1>

<p class="lead">
    ag-Grid <code>modules</code> allow you to pick and choose which features you require, resulting in a smaller application size overall,
    with the trade-off being that you need to register the modules you require.
</p>

<h2>Introduction</h2>

<h2><code>@ag-grid-community/all-modules</code></h2>

<p><code>@ag-grid-community/all-modules</code> can be considered to be equivalent to <code>ag-grid-community</code>, but
    with the additional
    need to register modules within. If using this module you might be better off using <code>ag-grid-community</code>
    as the bundle size
    will be similar and will reduce the need to register modules.</p>

<img class="img-fluid" style="display:block; margin-left: auto; margin-right: auto" src="./community-all-modules.png"
     alt="@ag-grid-community/all-modules">

<h2><code>@ag-grid-enterprise/all-modules</code></h2>

<p><code>@ag-grid-enterprise/all-modules</code> can be considered to be equivalent to <code>ag-grid-enterprise</code>,
    but with the additional
    need to register modules within. If using this module you might be better off using <code>ag-grid-enterprise</code>
    (along with <code>ag-grid-enterprise)</code> as the bundle size will be similar and will reduce the need to register
    modules.</p>

<img class="img-fluid" style="display:block; margin-left: auto; margin-right: auto" src="./enterprise-all-modules.png"
     alt="@ag-grid-enterprise/all-modules">


<note>If you decide to use <code style="white-space: nowrap">@ag-grid-enterprise/all-modules</code> then you do <strong>not</strong>
    need to
    specify <code style="white-space: nowrap">@ag-grid-community/all-modules</code> too. <code
            style="white-space: nowrap">@ag-grid-enterprise/all-modules</code>
    will contain all Community modules.
</note>

<h2><code>@ag-grid-community/core</code></h2>

<p>This module contains the core code required by the Grid and all modules (Enterprise or Community) depend on it.
    As such <code>@ag-grid-community/core</code> will always be available no matter what module you specify in your <code>package.json</code>.</p>

<img class="img-fluid" style="display:block; margin-left: auto; margin-right: auto" src="./community-hierarchy.png"
     alt="Community Hierarchy">

<p>For example, let's assume you specify the following in your <code>package.json</code>:</p>

<snippet>
"dependencies": {
    "@ag-grid-community/client-side-row-model": "22.0.0"
}
</snippet>

<p>You can then use <code>@ag-grid-community/core</code> as this will be implicitly available to you:</p>

<snippet>
import {Grid, GridOptions} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";

... the rest of your code
</snippet>

<h2><code>@ag-grid-enterprise/core</code></h2>

<p>All Enterprise modules depend on <code>@ag-grid-enterprise/core</code> as such will always be available no matter what
    Enterprise module you specify in your <code>package.json</code>.</p>

<p>The main functionality you'll want to import from the <code>@ag-grid-enterprise/core</code> is the <code>LicenceManager</code>.</p>

<img class="img-fluid" style="display:block; margin-left: auto; margin-right: auto" src="./enterprise-hierarchy.png"
     alt="Enterprise Hierarchy">

<p><span style="font-style: italic">The above is a truncated hierarchy of Entreprise modules for illustrative purposes.</span></p>

<p>For example, let's assume you specify the following in your <code>package.json</code>:</p>

<snippet>
"dependencies": {
    "@ag-grid-enterprise/filter-tool-panel": "22.0.0"
}
</snippet>

<p>You can then use <code>@ag-grid-enterprise/core</code> as this will be implicitly available to you:</p>

<snippet>
    import {Grid, GridOptions} from '@ag-grid-community/core';
    import {LicenseManager} from '@ag-grid-enterprise/core';
    import {FiltersToolPanelModule} from "@ag-grid-enterprise/filter-tool-panel";

    LicenseManager.setLicenseKey(...your key...);

    ... the rest of your code
</snippet>

<?php include '../documentation-main/documentation_footer.php'; ?>
