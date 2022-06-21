---
title: "Community and Enterprise"
---

AG Grid comes in two forms: AG Grid Community (free for everyone, including production use) and AG Grid Enterprise (you need a license to use).

<div style="display: flex;">
    <div>
        The Enterprise version of AG Grid comes with more features and <a href="https://ag-grid.zendesk.com/" target="_blank">support via Zendesk</a>. The features that are only available in AG Grid Enterprise are marked with the Enterprise icon<enterprise-icon></enterprise-icon> as demonstrated in the image to the right and in the <a href="/licensing/#feature-comparison">feature comparison</a> below. 
        <br/>
        <br/>
        See <a href="https://www.ag-grid.com/license-pricing">Pricing</a> for details on purchasing an AG Grid Enterprise license.
    </div>
    <image-caption src="licensing/resources/enterprise-features.png" alt="Enterprise Features" minwidth="15rem" width="15rem" maxwidth="15rem" height="10rem" constrained="true"></image-caption>
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
    
```js
"dependencies": {
    "ag-grid-community": "~@AG_GRID_VERSION@",
    "ag-grid-enterprise": "~@AG_GRID_VERSION@"
    ...
}
```
Then import the AG Grid Enterprise package in your application before any grid instance is created.

```js
import 'ag-grid-enterprise';
```

[[note]]
| The versions of `ag-grid-community` and `ag-grid-enterprise` should match. They are released in tandem and expect to be on the same version.


### Via Grid Modules

If using node modules and grid modules, include the enterprise feature modules for the features that you require. For example to add the enterprise Row Grouping feature along with Server Side row model add the following packages to your `package.json` file:

```js
"dependencies": {    
    "@ag-grid-enterprise/row-grouping": "~@AG_GRID_VERSION@",
    "@ag-grid-enterprise/server-side-row-model": "~@AG_GRID_VERSION@",
    ...
}
```

Then reference and import the AG Grid Enterprise modules:

```js
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
```

Then depending on your choice of framework you'll need to provide the modules to the grid or register them globally (see [Installing Grid Modules](/modules/#installing-ag-grid-modules) for full details.). Please refer to the [modules](/modules/) documentation for all the enterprise modules.

[[only-javascript]]
| ```js
| new Grid(<dom element>, gridOptions, { modules: [ServerSideRowModelModule, RowGroupingModule]});
| ```

[[only-angular]]
| ```tsx
| public modules: Module[] = [ServerSideRowModelModule, RowGroupingModule];
| <ag-grid-angular
|     [rowData]="rowData"
|     [columnDefs]="columnDefs"
|     [modules]="modules">
| </ag-grid-angular>
| ```

[[only-react]]
| ```tsx
| <ag-grid-react
|     rowData={rowData}
|     columnDefs={columnDefs}
|     modules={[ServerSideRowModelModule, RowGroupingModule]}>
| </ag-grid-react>
| ```

[[only-vue]]
| ```tsx
| <ag-grid-vue
|     :rowData="rowData"
|     :columnDefs="columnDefs"
|     :modules="[ServerSideRowModelModule, RowGroupingModule]"
| </ag-grid-vue>
| ```

[[note]]
| The versions of the modules you use, `@ag-grid-community/**` and `@ag-grid-enterprise/**` should match. They are released in tandem and expect to be on the same version.

## Trial License Key

When you do not have a license key installed then AG Grid Enterprise will display a invalid key watermark. If you would like to remove this watermark so it's not in the way, please send us an e-mail <a href="mailto: info@ag-grid.com">info@ag-grid.com</a> and get a trial license key.

## Support While Trialing

You can access [Support via Zendesk](https://ag-grid.zendesk.com/) for help while trialing. Email <a href="mailto: info@ag-grid.com">info@ag-grid.com</a> to get set up with access.


## Setting the License Key

Set the license key via the JavaScript method as described below. AG Grid checks the license key without making any network calls. The license key is set once for the grid library. You do not need to set the license key for each instance of AG Grid that you create, it is just set once statically into the AG Grid library. You must set the license key before you create an instance of AG Grid, otherwise AG Grid will complain upon creation that no license key is set.

Note that you must pass the key exactly as provided by AG Grid - do not modify the key in any way.

[[note]]
| If you are distributing your product and including AG Grid Enterprise, we realise that your license key will be
| visible to others. We appreciate that this is happening and just ask that you don't advertise it. Given our
| product is JavaScript, there is little we can do to prevent this.
### Via CommonJS
Use this if you are using CommonJS to load AG Grid.

```js
var enterprise = require("@ag-grid-enterprise/core");
enterprise.LicenseManager.setLicenseKey("your license key");
```

[[only-javascript]]
| ### Via Grid Packages
|
| If you are using the bundled version of AG Grid (e.g. you are using `ag-grid-enterprise/dist/ag-grid-enterprise.js`) set the license like this.
|
| ```js
| agGrid.LicenseManager.setLicenseKey("your license key");
| ```
[[only-frameworks]]
| ### Via Grid Packages
|
| If you are using grid packages (e.g. you are using `import ag-grid-enterprise`) set the license like this.
|
| ```js
| import { LicenseManager } from  'ag-grid-enterprise'
|
| LicenseManager.setLicenseKey("your license key")
| ```

### Via Grid Modules

If you are using grid modules (e.g. you are using `import { RowGroupingModule } from @ag-grid-enterprise/row-grouping`) set the license like this.

```js
import { LicenseManager } from '@ag-grid-enterprise/core'

LicenseManager.setLicenseKey("your license key")
```
[[note]]
| If you're using _any_ Enterprise feature then `@ag-grid-enterprise/core` will be available - you do not need to specify it as a dependency.


### Do Not Mix Loading Mechanisms

If you mix the methods above (eg if you are using CommonJS in your application, but use the JavaScript approach above to set license key) then it will not work. This is because the AG Grid library will be loaded twice, one will have the license key and the other will be used in your application without the license key.

[[only-angular]]
| We recommend setting the license key in your main boot files (typically named either `main.ts` or `boot.ts`, before you
| bootstrap your application.
|
| For example:
|
| ```js
| // other imports...
|
| import {LicenseManager} from "@ag-grid-enterprise/core";
| LicenseManager.setLicenseKey("your license key");
|
| // bootstrap your angular application. ie: platformBrowser().bootstrapModuleFactory(..)
| ```

[[only-react]]
| We recommend setting the license key in your main bootstrap file (typically named `index.js`), before you bootstrap your application.
|
| For example:
|
| ```js
| import React from "react";
| import {render} from "react-dom";
|
| import "@ag-grid-enterprise/core/dist/styles/ag-grid.css";
| import "@ag-grid-enterprise/core/dist/styles/ag-theme-alpine.css";
|
| import {LicenseManager} from "@ag-grid-enterprise/core";
| LicenseManager.setLicenseKey("your license key");
|
| import App from "./App";
|
| document.addEventListener('DOMContentLoaded', () => {
|     render(
|         <App/>,
|         document.querySelector('#app')
|     );
| });
| ```

[[only-vue]]
| We recommend setting the license key in your main bootstrap file (typically named `main.js`), before you bootstrap your application.
|
| For example:
|
| ```jsx
| import Vue from "vue";
|
| import "@ag-grid-enterprise/core/dist/styles/ag-grid.css";
| import "@ag-grid-enterprise/core/dist/styles/ag-theme-alpine.css";
|
| import { LicenseManager } from "@ag-grid-enterprise/core";
|
| LicenseManager.setLicenseKey("your license key");
|
| new Vue({
|     el: "#el",
|     ...
| });
| ```

### Invalid License
If you have an enterprise grid running with an invalid license (no license, expired license) your console log will display a series of warnings and the grid will show a watermark for 5 seconds.

<grid-example title='Invalid License' name='forceWatermark' type='typescript' options='{ "enterprise": true, "modules": ["clientside",  "rowgrouping"] }'></grid-example>

## Feature Comparison

The below table summarizes the features included in AG Grid Community and AG Grid Enterprise. Note that AG Grid Enterprise builds on AG Grid Community, it offers everything AG Grid Community offers plus more.

<matrix-table src='licensing/menu.json' tree='true' childpropertyname='items' booleanonly='true' columns='{ "title": "", "not(enterprise)": "Community", "enterprise": "Enterprise<enterprise-icon></enterprise-icon>" }'></matrix-table>
