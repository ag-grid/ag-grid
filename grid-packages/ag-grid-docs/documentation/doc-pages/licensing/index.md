---
title: "Community and Enterprise"
---

AG Grid comes in two forms: AG Grid Community (free for everyone, including production use) and AG Grid Enterprise (you need a license to use).

<div style="display: flex;">
    <div>
        The Enterprise version of AG Grid comes with more features and <a href="https://ag-grid.zendesk.com/" target="_blank">support via Zendesk</a>. The features that are only available in AG Grid Enterprise are marked with the Enterprise icon<enterprise-icon></enterprise-icon> as demonstrated in the image to the right. See <a href="../../../license-pricing.php">Pricing</a> for details on purchasing an AG Grid Enterprise license.
    </div>
    <image-caption src="licensing/resources/enterprise-features.png" alt="Enterprise Features" minwidth="15rem" width="15rem" maxwidth="15rem" height="10rem" constrained="true"></image-caption>
</div>

## Trial AG Grid Enterprise for Free

It is free to try out AG Grid Enterprise. Please take AG Grid Enterprise for a test run. You do not need to contact us. All that we ask when trialing is that you don't use AG Grid Enterprise in a project intended for production.

## Feature Comparison

The below table summarizes the features included in AG Grid Community and AG Grid Enterprise. Note that AG Grid Enterprise builds on AG Grid Community, it offers everything AG Grid Community offers plus more.

<matrix-table src='licensing/menu.json' tree='true' childpropertyname='items' booleanonly='true' columns='{ "title": "", "not(enterprise)": "Community", "enterprise": "Enterprise<enterprise-icon></enterprise-icon>" }'></matrix-table>

## Installing AG Grid Enterprise

Each of the [Getting Started](/getting-started/) guides gives step by step instructions on how
to get started using AG Grid Enterprise for the framework in question. In most cases, you do one of
the following:

1. If using node modules and ES6 imports, firstly reference the `@ag-grid-enterprise/all-modules` module in your `package.json`:

    ```js
    "dependencies": {
        "@ag-grid-enterprise/all-modules": "~@AG_GRID_VERSION@"
        ...
    }
    ```

    Then reference the AG Grid Enterprise module:

    ```js
    import { AllModules } from '@ag-grid-enterprise/all-modules';
    ```

    Then depending on your choice of framework you'll need to provide the modules to the grid:

    [[only-javascript]]
    | ```js
    | new Grid(<dom element>, gridOptions, { modules: AllModules});
    | ```

    [[only-angular]]
    | ```tsx
    | public modules: Module[] = AllModules;
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
    |     modules={AllModules}>
    | </ag-grid-react>
    | ```

    [[only-vue]]
    | ```tsx
    | <ag-grid-vue
    |     :rowData="rowData"
    |     :columnDefs="columnDefs"
    |     :modules="AllModules"
    | </ag-grid-vue>
    | ```

    Here we are including all modules provided by AG Grid - if you want to only pull in the modules you need (and thus reduce your overall bundle size) then please refer to the [modules](/modules/) documentation. How you use AG Grid (eg how you create a grid) does not change. With the one 'import' line of code above the grid will have all of the enterprise features at your disposal.

    [[note]]
    | The versions of the modules you use (for example `@ag-grid-community/all-modules` and `@ag-grid-enterprise/all-modules` should match. They are released in tandem and expect the same version of each other.

    **-OR-**

1. If including the bundled AG Grid script directly into your webpage, then reference `@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js` instead of `@ag-grid-community/all-modules/dist/ag-grid-community.js`.

    As before, you use AG Grid in the same way, but including the enterprise script will enable AG Grid to have all enterprise features at your disposal.

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

[[only-javascript]]
| Use this if you are using the bundled version of AG Grid (e.g. you are using `@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`).
|
| ```js
| agGrid.LicenseManager.setLicenseKey("your license key");
| ```

### CommonJS

[[note]]
| If you're using _any_ Enterprise feature then `@ag-grid-enterprise/core` will be available - you do not need to specify it as a dependency.

Use this if you are using CommonJS to load AG Grid.

```js
var enterprise = require("@ag-grid-enterprise/core");
enterprise.LicenseManager.setLicenseKey("your license key");
```

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
| import "@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
| import "@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css";
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
| import "@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
| import "@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css";
|
| import { AllModules } from "@ag-grid-enterprise/all-modules";
| import { LicenseManager } from "@ag-grid-enterprise/core";
|
| LicenseManager.setLicenseKey("your license key");
|
| // provide the AllModules array to the vue grid...
|
| new Vue({
|     el: "#el",
|     ...
| });
| ```

### Invalid License
If you have an enterprise grid running with an invalid license (no license, expired license) your console log will display a series of warnings and the grid will show a watermark for 5 seconds.

<grid-example title='Invalid License' name='forceWatermark' type='typescript' options='{ "enterprise": true }'></grid-example>
