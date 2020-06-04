<?php
$pageTitle = "ag-Grid Reference: Setting the License Key";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page explains how to set the License Key in ag-Grid Enterprise";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel License Key";
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

function doLevel1Features() {
    $lev1Items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

    foreach($lev1Items as $lev1Item) {
        doLevel2Features($lev1Item);
    }
}

function doLevel2Features($parentItem) {
    $lev2Items = $parentItem['items'];

    foreach($lev2Items as $lev2Item) {

        $lev2ItemName = $lev2Item['title'];

        $matrixExclude = $lev2Item['matrixExclude'];
        if ($matrixExclude) {
            continue;
        }

        echo "<tr>";
        echo "<td colspan='3'><span class='feature-group-title'>$lev2ItemName</span></td>";
        echo "</tr>";

        printFeatureRecursive($lev2Item, 0);
    }

}


function printFeatureRecursive($parentItem, $indent) {

    $items = $parentItem['items'];

    foreach($items as $index=>$item) {
        $itemTitle = $item['title'];
        $itemUrl = $item['url'];

        if ($itemTitle=='See Also') {
            continue;
        }

        echo "<tr>";
        echo "<td><span class='feature-title feature-title-indent-$indent'><a href='../$itemUrl'>$itemTitle</a> ";
        if ($item['enterprise']) {
            echo "<img src=\"../_assets/svg/enterprise.svg\" style=\"max-width: 16px;\"/>";
        }
        echo "</span></td>";
        if ($item['enterprise']) {
            echo "<td><i class=\"fas fa-times\" style='color: red;'></i></td>";
        } else {
            echo "<td><i class=\"fas fa-check\" style='color: green;'></i></td>";
        }
        echo "<td><i class=\"fas fa-check\" style='color: green;'></i></td>";
        echo "</tr>";

        $matrixExcludeChildren = $item['matrixExcludeChildren'];
        if (!$matrixExcludeChildren) {
            printFeatureRecursive($item, $indent+1);
        }
    }

}


?>

    <h1 class="heading-enterprise">Community and Enterprise</h1>

    <p class="lead">
        ag-Grid comes in two forms: ag-Grid Community (free for everyone, including production use) and ag-Grid
        Enterprise (you need a license to use).
    </p>

    <div style="display: inline-block;">
        <p>
            <img style="float: right; border: 1px solid grey; box-shadow: 5px 10px #888888; padding: 6px; margin: 10px 10px 10px 20px;" src="../_assets/homepage/enterprise-features.png"/>

            The Enterprise version of ag-Grid comes with more grid features and
            <a href="https://ag-grid.zendesk.com/">Support via Zendesk</a>.
            The features that are available in agGrid Enterprise only are marked with the
            Enterprise icon <img src="../_assets/svg/enterprise.svg" style="max-width: 16px;"/> as demonstrated
            in the image to the right.
            See <a href="../license-pricing.php">Pricing</a> for details on purchasing an ag-Grid Enterprise license.
        </p>

    </div>

    <h2>Trial ag-Grid Enterprise for Free</h2>

    <p>
        It is free to try out ag-Grid Enterprise. Please take ag-Grid Enterprise for a test run.
        You do not need to contact us. All that we ask
        when trialing is that you don't use ag-Grid Enterprise in a project intended for production.
    </p>


    <h2>Feature Comparison</h2>

    <p>
        The below table summarizes the features included in ag-Grid Community and ag-Grid Enterprise. Note
        that ag-Grid Enterprise builds on ag-Grid Community, it offers everything ag-Grid Community offers
        plus more.
    </p>

    <table class="properties">
        <tr>
            <th></th>
            <th>Community</th>
            <th>Enterprise <img src="../_assets/svg/enterprise.svg" style="max-width: 16px;"/></th>
        </tr>

        <?php doLevel1Features(); ?>

    </table>

    <h2>Installing ag-Grid Enterprise</h2>

    <p>
        Each of the <a href="../javascript-grid-getting-started/">Getting Started</a> guides gives step by step instructions on how
        to get started using ag-Grid Enterprise for the framework in question. In most cases, you do one of
        the following:
    </p>

    <ol>
        <li>
            <p>
                If using node modules and ES6 imports, firstly reference the <code>@ag-grid-enterprise/all-modules</code>
                module in your <code>package.json</code>:
            </p>
            <snippet>
"dependencies": {
    "@ag-grid-enterprise/all-modules": "21.0.x"
...
            </snippet>
            <p>
                Then reference the ag-Grid Enterprise module:
            </p>
            <snippet>
                import {AllModules} from '@ag-grid-enterprise/all-modules';
            </snippet>

            <p>Then depending on your choice of framework you'll need to provide the modules to the grid:</p>

<snippet>
// javascript
new Grid(&lt;dom element&gt;, gridOptions, { modules: AllModules});

// angular
public modules: Module[] = AllModules;

&lt;ag-grid-angular&gt;
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [modules]="modules"
&lt;/ag-grid-angular&gt;

// react
&lt;ag-grid-react&gt;
    rowData={rowData}
    columnDefs={columnDefs}
    modules={AllModules}
&lt;/ag-grid-react&gt;
</snippet>
            <p>Here we are including all modules provided by ag-Grid - if you want to only pull in the modules you need (and thus
            reduce your overall bundle size) then please refer to the <a href="../javascript-grid-modules">modules</a> documentation.</p>
            <p>
                How you use ag-Grid (eg how you create a grid) does not change. With the one 'import' line of code
                above the grid will have all of the enterprise features at your disposal.
            </p>
            <note>
                The versions of the modules you use (for example <code>@ag-grid-community/all-modules</code> and
                <code>@ag-grid-enterprise/all-modules</code> should match. They are released in tandem and expect the same
                version of each other.
            </note>
            <p>
                <b>-OR-</b>
            </p>
        </li>
        <li>
            <p>
                If including the bundled ag-Grid script directly into your webpage, then reference
                <code>@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js</code> instead of <code>@ag-grid-community/all-modules/dist/ag-grid-community.js</code>.
            </p>
            <p>
                As before, you use ag-Grid in the same way, but including the enterprise script
                will enable ag-Grid to have all enterprise features at your disposal.
            </p>
        </li>
    </ol>

    <h2>Trial License Key</h2>

    <p>
        When you do not have a license key installed then ag-Grid Enterprise will display a
        invalid key watermark. If you would like to remove this watermark
        so it's not in the way, please send us an e-mail <a href="mailto: info@ag-grid.com">info@ag-grid.com</a>
        and get a trial license key.
    </p>

    <h2>Support While Trialing</h2>

    <p>
        You can access <a href="https://ag-grid.zendesk.com/">Support via Zendesk</a> for help
        while trialing. Email <a href="mailto: info@ag-grid.com">info@ag-grid.com</a> to get set
        up with access.
    </p>

    <h2>Setting the License Key</h2>

    <p>
        Set the license key via the JavaScript method as described below.
        ag-Grid checks the license key without making any network calls.
        The license key is set once for the grid library. You do not need to set the license key for each instance of
        ag-Grid that you create, it is just set once statically into the ag-Grid library.
        You must set the license key before you create an instance of ag-Grid, otherwise ag-Grid will complain
        upon creation that no license key is set.
    </p>

    <p>
        Note that you must pass the key exactly as provided by ag-Grid - do not modify the key in any way.
    </p>

    <note>
        If you are distributing your product and including ag-Grid Enterprise, we realise that your license key will be
        visible to others. We appreciate that this is happening and just ask that you don't advertise it. Given our
        product is JavaScript, there is little we can do to prevent this.
    </note>

    <h3>JavaScript</h3>

    <p>
        Use this if you are using the bundled version of ag-Grid (e.g. you are using <code>@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js</code>).
    </p>

<snippet>
agGrid.LicenseManager.setLicenseKey("your license key");
</snippet>

    <h3>CommonJS</h3>

    <note>If you're using <span style="font-style: italic">any</span> Enterprise feature then <code>@ag-grid-enterprise/core</code>
    will be available - you do not need to specify it as a dependency.</note>

    <p>Use this if you are using CommonJS to load ag-Grid.</p>
<snippet>
var enterprise = require("@ag-grid-enterprise/core");
enterprise.LicenseManager.setLicenseKey("your license key");
</snippet>

    <h3>Do Not Mix Loading Mechanisms</h3>

    <p>
        If you mix the methods above (eg if you are using CommonJS in your application, but use the JavaScript approach
        above to set license key) then it will not work. This is because the ag-Grid library will be loaded twice,
        one will have the license key and the other will be used in your application without the license key.
    </p>

    <h3>Angular</h3>

    <p>We recommend setting the license key in your main boot files (typically named either <code>main.ts</code> or
        <code>boot.ts</code>, before you bootstrap your application.</p>

    <p>For example:</p>

<snippet>
            // other imports...

import {LicenseManager} from "@ag-grid-enterprise/core";
LicenseManager.setLicenseKey("your license key");

// bootstrap your angular application. ie: platformBrowser().bootstrapModuleFactory(..)
</snippet>

    <h3>React</h3>

    <p>We recommend setting the license key in your main bootstrap file (typically named <code>index.js</code>), before you bootstrap your application.</p>

    <p>For example:</p>

<snippet>
import React from "react";
import {render} from "react-dom";

import "@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css";

import {LicenseManager} from "@ag-grid-enterprise/core";
LicenseManager.setLicenseKey("your license key");

import App from "./App";

document.addEventListener('DOMContentLoaded', () =&gt; {
    render(
        &lt;App/&gt;,
        document.querySelector('#app')
    );
});
</snippet>

    <h3>VueJS</h3>

    <p>We recommend setting the license key in your main bootstrap file (typically named <code>main.js</code>), before you bootstrap your application.</p>

    <p>For example:</p>

<snippet>
import Vue from "vue";

import "../node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
import "../node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css";

import {AllModules} from "@ag-grid-enterprise/all-modules";
import {LicenseManager} from "@ag-grid-enterprise/core";

LicenseManager.setLicenseKey("your license key");

// provide the AllModules array to the vue grid...

new Vue({
    el: "#el",
    ...
});
</snippet>

    <h3>Polymer</h3>

    <p>You have two choices as to where to set your license key in Polymer.</p>

    <p>If you have many components with agGrid in, the we suggest
        you run a separate script to reference and set the license key - for example:</p>

<snippet language="html">
&lt;script src="../bower_components/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.noStyle.js"&gt;&lt;/script&gt;

&lt;!-- ag-grid-polymer element --&gt;
&lt;link rel="import" href="../bower_components/ag-grid-polymer/ag-grid-polymer.html"&gt;

&lt;!-- your code --&gt;
&lt;!-- licenseKey.js will be responsible for setting the license key across the application --&gt;
&lt;script src="licenseKey.js"&gt;&lt;/script&gt;
&lt;link rel="import" href="grid-component-one.html"&gt;
&lt;link rel="import" href="grid-component-one.html"&gt;
</snippet>
<snippet>

// licenseKey.js
agGrid.LicenseManager.setLicenseKey("your license key")
</snippet>

    <p>If you have a single component, or a single component that in turn has the child components, you can set the license key in this parent component - for example:</p>

<snippet language="html">
&lt;script src="../bower_components/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.noStyle.js"&gt;&lt;/script&gt;

&lt;!-- ag-grid-polymer element --&gt;
&lt;link rel="import" href="../bower_components/ag-grid-polymer/ag-grid-polymer.html"&gt;

&lt;!-- your code --&gt;
&lt;link rel="import" href="main-component-one.html"&gt;
</snippet>

<snippet language="html">
&lt;dom-module id="simple-grid-example"&gt;
&lt;template id="template"&gt;
    &lt;div &gt;
        &lt;ag-grid-polymer style="width: 100%; height: 350px;"
            class="ag-theme-alpine"
            rowData="{{rowData}}"
            columnDefs="{{columnDefs}}"&gt;&lt;/ag-grid-polymer&gt;
    &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    agGrid.LicenseManager.setLicenseKey("your license key")

    class SimpleGridExample extends Polymer.Element {
    ...
}
&lt;/script&gt;

</snippet>

    <h3>Invalid License</h3>
    <p>If you have an enterprise grid running with an invalid license (no license, expired license) your console log will
        display a series of warnings and the grid will show a watermark for 5 seconds.</p>

    <?= grid_example('Invalid License', 'forceWatermark', 'vanilla', ['enterprise' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
