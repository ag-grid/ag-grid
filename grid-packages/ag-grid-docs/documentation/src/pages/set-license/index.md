---
title: "Community and Enterprise"
---

ag-Grid comes in two forms: ag-Grid Community (free for everyone, including production use) and ag-Grid
Enterprise (you need a license to use).

<div style="display: flex;">
    <div>
        The Enterprise version of ag-Grid comes with more grid features and <a href="https://ag-grid.zendesk.com/" target="_blank">Support via Zendesk</a>. The features that are available in agGrid Enterprise only are marked with the Enterprise icon<enterprise-icon></enterprise-icon> as demonstrated in the image to the right. See <a href="../../license-pricing.php">Pricing</a> for details on purchasing an ag-Grid Enterprise license.
    </div>
    <image-caption src="set-license/resources/enterprise-features.png" alt="Enterprise Features" width="15rem" maxwidth="15rem" constrained="true"></image-caption>
</div>

## Trial ag-Grid Enterprise for Free

It is free to try out ag-Grid Enterprise. Please take ag-Grid Enterprise for a test run. You do not need to contact us. All that we ask when trialing is that you don't use ag-Grid Enterprise in a project intended for production.

## Feature Comparison

The below table summarizes the features included in ag-Grid Community and ag-Grid Enterprise. Note that ag-Grid Enterprise builds on ag-Grid Community, it offers everything ag-Grid Community offers plus more.


## Installing ag-Grid Enterprise

Each of the [Getting Started](../getting-started/) guides gives step by step instructions on how
to get started using ag-Grid Enterprise for the framework in question. In most cases, you do one of
the following:

1. If using node modules and ES6 imports, firstly reference the `@ag-grid-enterprise/all-modules` module in your `package.json`:

    ```js
    "dependencies": {
        "@ag-grid-enterprise/all-modules": "21.0.x"
        ...
    }
    ```

    Then reference the ag-Grid Enterprise module:

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

    Here we are including all modules provided by ag-Grid - if you want to only pull in the modules you need (and thus reduce your overall bundle size) then please refer to the [modules](../grid-modules) documentation. How you use ag-Grid (eg how you create a grid) does not change. With the one 'import' line of code above the grid will have all of the enterprise features at your disposal.

    [[note]]
    | The versions of the modules you use (for example `@ag-grid-community/all-modules` and `@ag-grid-enterprise/all-modules` should match. They are released in tandem and expect the same version of each other.

    **-OR-**

1. If including the bundled ag-Grid script directly into your webpage, then reference `@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js` instead of `@ag-grid-community/all-modules/dist/ag-grid-community.js`.

    As before, you use ag-Grid in the same way, but including the enterprise script will enable ag-Grid to have all enterprise features at your disposal.

## Trial License Key

When you do not have a license key installed then ag-Grid Enterprise will display a invalid key watermark. If you would like to remove this watermark so it's not in the way, please send us an e-mail <a href="mailto: info@ag-grid.com">info@ag-grid.com</a> and get a trial license key.

## Support While Trialing

You can access [Support via Zendesk](https://ag-grid.zendesk.com/) for help while trialing. Email <a href="mailto: info@ag-grid.com">info@ag-grid.com</a> to get set up with access.


## Setting the License Key

Set the license key via the JavaScript method as described below. ag-Grid checks the license key without making any network calls. The license key is set once for the grid library. You do not need to set the license key for each instance of ag-Grid that you create, it is just set once statically into the ag-Grid library. You must set the license key before you create an instance of ag-Grid, otherwise ag-Grid will complain upon creation that no license key is set.

Note that you must pass the key exactly as provided by ag-Grid - do not modify the key in any way.

[[note]]
| If you are distributing your product and including ag-Grid Enterprise, we realise that your license key will be
| visible to others. We appreciate that this is happening and just ask that you don't advertise it. Given our
| product is JavaScript, there is little we can do to prevent this.

[[only-javascript]]
| Use this if you are using the bundled version of ag-Grid (e.g. you are using `@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`).
| 
| ```js
| agGrid.LicenseManager.setLicenseKey("your license key");
| ```

### CommonJS

[[note]]
| If you're using _any_ Enterprise feature then `@ag-grid-enterprise/core` will be available - you do not need to specify it as a dependency.

Use this if you are using CommonJS to load ag-Grid.

```js
var enterprise = require("@ag-grid-enterprise/core");
enterprise.LicenseManager.setLicenseKey("your license key");
```

### Do Not Mix Loading Mechanisms

If you mix the methods above (eg if you are using CommonJS in your application, but use the JavaScript approach above to set license key) then it will not work. This is because the ag-Grid library will be loaded twice, one will have the license key and the other will be used in your application without the license key.

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
| import "../node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css";
| import "../node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css";
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

[[only-javascript]]
| ### Polymer
| 
| You have two choices as to where to set your license key in Polymer.
| 
| If you have many components with agGrid in, the we suggest you run a separate script to reference and set the license key - for example:
|
| ```html
| <script src="../bower_components/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.noStyle.js"></script>
| 
| <!-- ag-grid-polymer element -->
| <link rel="import" href="../bower_components/ag-grid-polymer/ag-grid-polymer.html">
| 
| <!-- your code -->
| <!-- licenseKey.js will be responsible for setting the license key across the application -->
| <script src="licenseKey.js"></script>
| <link rel="import" href="grid-component-one.html">
| <link rel="import" href="grid-component-one.html">
| ```
|
| ```js
| // licenseKey.js
| agGrid.LicenseManager.setLicenseKey("your license key")
| ```
|
| If you have a single component, or a single component that in turn has the child components, you can set the 
| license key in this parent component - for example:
|
| ```html
| <script src="../bower_components/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.noStyle.js"></script>
|
| <!-- ag-grid-polymer element -->
| <link rel="import" href="../bower_components/ag-grid-polymer/ag-grid-polymer.html">
| 
| <!-- your code -->
| <link rel="import" href="main-component-one.html">
| ```
|
| ```html
| <dom-module id="simple-grid-example">
|     <template id="template">
|         <div>
|             <ag-grid-polymer style="width: 100%; height: 350px;"
|                              class="ag-theme-alpine"
|                              rowData="{{rowData}}"
|                              columnDefs="{{columnDefs}}">
|             </ag-grid-polymer>
|         </div>
|     </template>
|
| <script>
|     agGrid.LicenseManager.setLicenseKey("your license key")
| 
|     class SimpleGridExample extends Polymer.Element {
|         ...
|     }
| </script>
| ```

### Invalid License
If you have an enterprise grid running with an invalid license (no license, expired license) your console log will display a series of warnings and the grid will show a watermark for 5 seconds.

<grid-example title='Invalid License' name='forceWatermark' type='vanilla' options='{ "enterprise": true }'></grid-example>
