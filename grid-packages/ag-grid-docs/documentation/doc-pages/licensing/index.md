---
title: "Community and Enterprise"
enterprise: true
---

AG Grid comes in two forms: AG Grid Community (free for everyone, including production use) and AG Grid Enterprise (you need a license to use).

<div style="display: flex;">
    <div>
        The Enterprise version of AG Grid comes with more features and <a href="https://ag-grid.zendesk.com/" target="_blank">support via Zendesk</a>. The features that are only available in AG Grid Enterprise are marked with the Enterprise icon<enterprise-icon></enterprise-icon> as demonstrated in the image to the right and in the <a href="https://www.ag-grid.com/license-pricing/">feature comparison</a> on the Pricing page.
        <br/>
        <br/>
        See <a href="https://www.ag-grid.com/license-pricing" target="_blank">Pricing</a> for details on purchasing an AG Grid Enterprise license.
    </div>
    <image-caption src="licensing/resources/enterprise-features.png" alt="Enterprise Features" minwidth="15rem" width="15rem" maxwidth="15rem" height="10rem" constrained="true" filterdarkmode="true"></image-caption>
</div>

## Trial AG Grid Enterprise for Free

It is free to try out AG Grid Enterprise. Please take AG Grid Enterprise for a test run. You do not need to contact us. All that we ask when trialing is that you don't use AG Grid Enterprise in a project intended for production.

## Installing AG Grid Enterprise

Each of the [Getting Started](/getting-started/) guides gives step by step instructions on how
to get started using AG Grid Enterprise for the framework in question. In most cases, you do one of
the following:

### Via Bundled Script

If including the bundled AG Grid script directly into your webpage, then reference `ag-grid-enterprise/dist/ag-grid-enterprise.js` instead of `ag-grid-community/dist/ag-grid-community.js`.

As before, you use AG Grid in the same way, but including the enterprise script will enable AG Grid to have all enterprise features at your disposal.

### Via Grid Packages

If using node modules and grid packages include the enterprise package `ag-grid-enterprise`.

<snippet transform={false}>
"dependencies": {
    "ag-grid-community": "~@AG_GRID_VERSION@",
    "ag-grid-enterprise": "~@AG_GRID_VERSION@"
    ...
}
</snippet>

Then import the AG Grid Enterprise package in your application before any grid instance is created.

<snippet transform={false}>
import 'ag-grid-enterprise';
</snippet>

<note>
The versions of `ag-grid-community` and `ag-grid-enterprise` should match. They are released in tandem and expect to be on the same version.
</note>


### Via Grid Modules

If using node modules and grid modules, include the enterprise feature modules for the features that you require. For example to add the enterprise Row Grouping feature along with Server Side row model add the following packages to your `package.json` file:

<snippet transform={false}>
"dependencies": {    
    "@ag-grid-enterprise/row-grouping": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/server-side-row-model": "~@AG_GRID_VERSION@",
    ...
}
</snippet>

Then reference and import the AG Grid Enterprise modules:

<snippet transform={false}>
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
</snippet>

Then depending on your choice of framework you'll need to provide the modules to the grid or register them globally (see [Installing Grid Modules](/modules/#installing-ag-grid-modules) for full details.). Please refer to the [Modules](/modules/) documentation for all the enterprise modules.

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|createGrid(&lt;dom element>, gridOptions, { modules: [ServerSideRowModelModule, RowGroupingModule]});
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|public modules: Module[] = [ServerSideRowModelModule, RowGroupingModule];
|&lt;ag-grid-angular
|    [rowData]="rowData"
|    [columnDefs]="columnDefs"
|    [modules]="modules">
|&lt;/ag-grid-angular>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|&lt;ag-grid-react
|    rowData={rowData}
|    columnDefs={columnDefs}
|    modules={[ServerSideRowModelModule, RowGroupingModule]}>
|&lt;/ag-grid-react>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|&lt;ag-grid-vue
|    :rowData="rowData"
|    :columnDefs="columnDefs"
|    :modules="[ServerSideRowModelModule, RowGroupingModule]"
|&lt;/ag-grid-vue>
</snippet>
</framework-specific-section>

<note>
The versions of the modules you use, `@ag-grid-community/**` and `@ag-grid-enterprise/**` should match. They are released in tandem and expect to be on the same version.
</note>

## Trial License Key

When you do not have a license key installed then AG Grid Enterprise will display a invalid key watermark. If you would like to remove this watermark so it's not in the way, please send us an e-mail <a href="mailto: info@ag-grid.com" target="_blank">info@ag-grid.com</a> and get a trial license key.

## Support While Trialing

You can access <a href="https://ag-grid.zendesk.com/" target="_blank">Support via Zendesk</a> for help while trialing. Email <a href="mailto: info@ag-grid.com" target="_blank">info@ag-grid.com</a> to get set up with access.


## Setting the License Key

Set the license key via the JavaScript method as described below. AG Grid checks the license key without making any network calls. The license key is set once for the grid library. You do not need to set the license key for each instance of AG Grid that you create, it is just set once statically into the AG Grid library. You must set the license key before you create an instance of AG Grid, otherwise AG Grid will complain upon creation that no license key is set.

Note that you must pass the key exactly as provided by AG Grid - do not modify the key in any way.

<note>
If you are distributing your product and including AG Grid Enterprise, we realise that your license key will be
visible to others. We appreciate that this is happening and just ask that you don't advertise it. Given our
product is JavaScript, there is little we can do to prevent this.
</note>

### Via CommonJS
Use this if you are using CommonJS to load AG Grid.

<snippet transform={false}>
|var enterprise = require("@ag-grid-enterprise/core");
|enterprise.LicenseManager.setLicenseKey("your license key");
</snippet>

<framework-specific-section frameworks="javascript">
|### Via Grid UMD Bundles
|
|If you are using the bundled version of AG Grid (e.g. you are using `ag-grid-enterprise/dist/ag-grid-enterprise.js`) set the license like this.
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|agGrid.LicenseManager.setLicenseKey("your license key");
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
|### Via Grid Packages
|
|If you are using grid packages (e.g. you are using `import ag-grid-enterprise`) set the license like this.
|
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
<snippet transform={false}>
|import { LicenseManager } from  'ag-grid-enterprise'
|
|LicenseManager.setLicenseKey("your license key")
</snippet>
</framework-specific-section>

### Via Grid Modules

If you are using grid modules (e.g. you are using `import { RowGroupingModule } from @ag-grid-enterprise/row-grouping`) set the license like this.

<snippet transform={false}>
|import { LicenseManager } from '@ag-grid-enterprise/core'
|
|LicenseManager.setLicenseKey("your license key")
</snippet>

<note>
If you're using _any_ Enterprise feature then `@ag-grid-enterprise/core` will be available - you do not need to specify it as a dependency.
</note>

### Do Not Mix Loading Mechanisms

If you mix the methods above (eg if you are using CommonJS in your application, but use the JavaScript approach above to set license key) then it will not work. This is because the AG Grid library will be loaded twice, one will have the license key and the other will be used in your application without the license key.

<framework-specific-section frameworks="angular">
|We recommend setting the license key in your main boot files (typically named either `main.ts` or `boot.ts`, before you
|bootstrap your application.
|
|For example:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|// other imports...
|
|import {LicenseManager} from "@ag-grid-enterprise/core";
|LicenseManager.setLicenseKey("your license key");
|
|// bootstrap your angular application. ie: platformBrowser().bootstrapModuleFactory(..)
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|We recommend setting the license key in your main bootstrap file (typically named `index.js`), before you bootstrap your application.
|
|For example:
|
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
|import React from "react";
|import {render} from "react-dom";
|
|import "@ag-grid-enterprise/core/styles/ag-grid.css";
|import "@ag-grid-enterprise/core/styles/ag-theme-quartz.css";
|
|import {LicenseManager} from "@ag-grid-enterprise/core";
|LicenseManager.setLicenseKey("your license key");
|
|import App from "./App";
|
|document.addEventListener('DOMContentLoaded', () => {
|    render(
|        &lt;App/>,
|        document.querySelector('#app')
|    );
|});
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| We recommend setting the license key in your main bootstrap file (typically named `main.js`), before you bootstrap your application.
|
| For example:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|import Vue from "vue";
|
|import "@ag-grid-enterprise/styles/ag-grid.css";
|import "@ag-grid-enterprise/styles/ag-theme-quartz.css";
|
|import { LicenseManager } from "@ag-grid-enterprise/core";
|
|LicenseManager.setLicenseKey("your license key");
|
|new Vue({
|    el: "#el",
|    ...
|});
</snippet>
</framework-specific-section>

### Invalid License
If you have an enterprise grid running with an invalid license (no license, expired license) your console log will display a series of warnings and the grid will show a watermark for 5 seconds.
 
<grid-example title='Invalid License' name='forceWatermark' type='generated' options='{ "enterprise": true, "licenseKey":true, "modules": ["clientside",  "rowgrouping"] }'></grid-example>
