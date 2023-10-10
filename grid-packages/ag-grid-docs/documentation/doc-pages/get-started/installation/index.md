---
title: "Get Started"
---

<!-- Start JS -->
<framework-specific-section frameworks="javascript">

<video-section id="j-Odsb0EjVo" title="Video Tutorial for Getting Started with AG Grid Community">
<p style='font-size: 22px'>
Follow this guide to get started with AG Grid or watch our introductory tutorial on YouTube. If you're looking for specific examples, take a look at our <a href='(../../quick-starts/basic-example'>Quick Starts</a> instead.
</p>
</video-section>

## Key Concepts

Before working with the Grid, there a few key concepts to familiarize yourself with:

- [__Row Data__](/../../row-ids) ___TODO: Needs a dedicated page on Row Data?___
  - Defines the data that will be shown in the grid in JSON format
- [__Column Definitions__](../../column-definitions/)
  - Defines the columns displayed within your grid and can be used to enable column-specific features such as sorting, filtering, and grouping
- [__Grid Options__](../../grid-options/)
  - Configures the grid and contains the Column Definitions & Row Data. Can be used to enable grid features that work accross the whole grid, such as pagination, pivoting, exporting, etc...
- [__Grid API__](../../grid-api/)
  - Provides control over the grid through an extensive range of APIs
- [__Theme__](../../themes/)
  - Defines the look & feel of the Grid. Use one of five [AG Grid templates](); Customize for your brand by [modifying CSS](), or via our [Figma Design System]()

## Demo

Here is a very basic demo using AG Grid, which we will show you how to put together in this tutorial:

TODO: Basic Demo

## Installation

In order to start using the Grid, you'll need to import the Community or Enterprise JS libraries, the core CSS and your chosen Theme:

### Import Libraries

You can import all of the required JS and CSS with `ag-grid-community.min.js`:

<snippet transform={false} language="html">
&lt;!-- Include the JS and CSS (all themes) for AG Grid. Larger download than needed -->
&lt;!-- as it will include themes you don't use -->
&lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js" />
</snippet>

Or you can be selective and import just the JS `ag-grid-community.min.noStyle.js` and the theme you'll be using, e.g. `ag-theme-alpine`:

<snippet transform={false} language="html">
&lt;!-- Include the JS for AG Grid -->
&lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js" />
&lt;!-- Include the core CSS, this is needed by the grid -->
&lt;link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css"/>
&lt;!-- Include the theme CSS, only need to import the theme you are going to use -->
&lt;link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css"/>
</snippet>

<note>
If you want to use Enterprise features, you'll need to [include the Enterprise library](#upgrading-to-enterprise) instead. [Compare features](../../introduction/overview/#feature-comparison) or review our [pricing](https://ag-grid.com/license-pricing) page for more info.
</note>

### Add the Grid

Finally, to add the Grid to your application, create a parent `<div>` to contain the grid (making sure to specify the dimensions and theme):

<snippet transform={false} language="html">
&lt;div id="myGrid" style="height: 200px; width:500px;" class="ag-theme-alpine">
    &lt;!-- TODO: Add Grid -->
&lt;/div>
</snippet>

<note>
You must specify a dimension and theme or the Grid will not be displayed
</note>

Then, add your Grid to the parent `<div>`:

<snippet transform={false} language="js">
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
</snippet>

## Configuring the Grid

You'll notice when creating the grid, we passed through `gridOptions` as the second param. The [Grid Options]() object contains:
- Grid-wide settings, like pagination, etc...
- Row Data (the data to be displayed in the Grid)
- Column Defintions (the columns to be displayed in the Grid), for example:

<snippet transform={false} language="js">
|const gridOptions = {
|    // Define Columns in Grid (Each object represents a column)
|    columnDefs: [
|        { field: "make" },
|        { field: "model" },
|        { field: "price" },
|    ],
|    // Define Data Shown in Grid (Each object represents a row)
|    rowData: [
|       { make: "Toyota", model: "Celica", price: 35000 },
|       { make: "Ford", model: "Mondeo", price: 32000 },
|       { make: "Porsche", model: "Boxster", price: 72000 }
|    ]
|    // Grid-wide settings
|    pagination: true, // Enables Pagination
|    animateRows: true, // Enables Row Animation
|    rowSelection: 'multiple' // Allows multiple Row selection
|    ...
|};
</snippet>

## Accessing the API

Once the Grid has been created, you may need to interact with it to, for example, [Update Row Data]() or [Change Column Defintions](). You can do this by using the `gridApi`, which is accessed via the `gridOptions` object. Once created, the grid places an API object on the Grid Options for you.

### Updating the Grid

Your use-case may require you to update the grid from time to time which can be done via the API. For example, to update Row Data simply pass the new dataset to the `gridOptions.api.setRowData()` API. The following example shows how to use the API to update Row Data based on a response from a server:

<snippet transform={false} language="js">
|// Fetch data from server
|fetch("https://www.ag-grid.com/example-assets/row-data.json")
|  .then(response => response.json())
|  .then(data => {
|    // load fetched data into grid
|    gridOptions.api.setRowData(data);
|});
</snippet>

<note>
You can modify rows, columns, and grid settings at any time using the API. Review our [API Reference]() for an exhaustive list of APIs.
</note>

## Consuming Grid Events

Sometimes you may need to respond to events that are triggered by the grid. You can do this by registering callbacks for through `gridOptions`. For example, to handle Cell Click events, add the onCellClicked hanlder to your `gridOptions` object, like so:

<snippet transform={false} language="js">
|const gridOptions = {
|    // Event Handlers
|    onCellClicked: params => {
|        console.log('cell was clicked', params)
|    }
|    ...
|};
</snippet>

<note>
Review [Grid Events]() to see a full list of events that the Grid raises
</note>

## Themes and Styling

AG Grid comes with 5 Themes that can be used out-of-the-box:

- Alpine
- Alpine Dark
- Material
- Balham
- Balham Dark

These themes can be modified using CSS, or replaced entirely with your own custom CSS.

## Upgrading to Enterprise

To use AG Grid Enterprise instead of AG Grid Community, use the imports `ag-grid-enterprise.min.noStyle.js` and `ag-grid-enterprise.min.js` instead of `ag-grid-community.min.noStyle.js` and `ag-grid-community.min.js`. Read our [installation](#installation) instructions for more info.

For example if you were using ag-grid-community.min.js then make the follow change to enable all the Enterprise features.

<snippet transform={false} language="diff">
|- &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community@@AG_GRID_VERSION@/dist/ag-grid-community.min.js">&lt;/script>
|+ &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@@AG_GRID_VERSION@/dist/ag-grid-enterprise.min.js">&lt;/script>
</snippet>

<note>
You do not need a lisence to test Enterprise features. Review our [licensing](../../introduction/overview/#lisencing) docs for more information.
</note>

### Setting the License Key

Set the license key via the JavaScript method as described below. AG Grid checks the license key without making any network calls. The license key is set once for the grid library. You do not need to set the license key for each instance of AG Grid that you create, it is just set once statically into the AG Grid library. You must set the license key before you create an instance of AG Grid, otherwise AG Grid will complain upon creation that no license key is set.

Note that you must pass the key exactly as provided by AG Grid - do not modify the key in any way.

<note>
If you are distributing your product and including AG Grid Enterprise, we realise that your license key will be visible to others. We appreciate that this is happening and just ask that you don't advertise it. Given our product is JavaScript, there is little we can do to prevent this.
</note>

#### Via CommonJS

Use this if you are using CommonJS to load AG Grid.

<snippet transform={false}>
|var enterprise = require("@ag-grid-enterprise/core");
|enterprise.LicenseManager.setLicenseKey("your license key");
</snippet>

#### Via Grid UMD Bundles

If you are using the bundled version of AG Grid (e.g. you are using `ag-grid-enterprise/dist/ag-grid-enterprise.js`) set the license like this.

<snippet transform={false}>
|agGrid.LicenseManager.setLicenseKey("your license key");
</snippet>

#### Via Grid Packages

If you are using grid packages (e.g. you are using `import ag-grid-enterprise`) set the license like this.

<snippet transform={false}>
|import { LicenseManager } from  'ag-grid-enterprise'
|LicenseManager.setLicenseKey("your license key")
</snippet>

#### Via Grid Modules

If you are using grid modules (e.g. you are using `import { RowGroupingModule } from @ag-grid-enterprise/row-grouping`) set the license like this.

<snippet transform={false}>
|import { LicenseManager } from '@ag-grid-enterprise/core'
|LicenseManager.setLicenseKey("your license key")
</snippet>

<note>
If you mix the methods above (eg if you are using CommonJS in your application, but use the JavaScript approach above to set license key) then it will not work. This is because the AG Grid library will be loaded twice, one will have the license key and the other will be used in your application without the license key.
</note>

## Next Steps

Now you have a basic grasp of AG Grid, we'd encourage you to take a look at our quick-starts for some inspiration:

- Community 
  - Basic Example
  - Custom Cell Renderers
  - Value Formatters
  - ...
- Enterprise
  - Server Side Row Model
  - Export to Excel
  - ...

</framework-specific-section>
<!-- End JS -->

<!-- Start React -->
<framework-specific-section frameworks="react">

Install the core library:

<snippet transform={false} lineNumbers="false">
npm install --save ag-grid-community
</snippet>

<note>
If you want to use Enterprise features, you'll need to [include the Enterprise library](#upgrading-to-enterprise) as well. [Compare features](../../introduction/overview/#feature-comparison) or review our [pricing](https://ag-grid.com/license-pricing) page for more info.
</note>

Install the framework-specific library:

<framework-specific-section frameworks="react">
<snippet transform={false} lineNumbers="false">
npm install --save ag-grid-react
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} lineNumbers="false">
npm install --save ag-grid-angular
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} lineNumbers="false">
npm install --save ag-grid-vue
</snippet>
</framework-specific-section>

To confirm the installation has been successful, please check the Grid Dependencies in your `package.json`:

<snippet transform={false}>
"dependencies": {
    "ag-grid-community": "30.2.0",
    "ag-grid-react": "30.2.0",
    ...
</snippet>

You can now import the library and theme to your application

<framework-specific-section frameworks="react">
<snippet transform={false} lineNumbers="false">
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} lineNumbers="false">
import { AgGridAngular } from 'ag-grid-angular'; // the AG Grid Angular Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} lineNumbers="false">
import { AgGridVue } from 'ag-grid-vue'; // the AG Grid Vue Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
</snippet>
</framework-specific-section>

</framework-specific-section>
<!-- End NPM Installation -->

<!-- React Add Grid -->
<framework-specific-section frameworks="react">

Finally, to add the Grid to your application, create a parent `<div>` to hold the grid, making sure to specify the dimensions and theme, and add the AgGridReact component inside the parent `<div>`

<snippet transform={false} language="html">
&lt;div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
    &lt;AgGridReact rowData={rowData} columnDefs={columnDefs} />
&lt;/div>
</snippet>

</framework-specific-section>
<!-- End React Add Grid -->

<!-- Angular Add Grid -->
<framework-specific-section frameworks="angular">

Finally, to add the Grid to your application, create a parent `<div>` to hold the grid, making sure to specify the dimensions and theme, and add the AgGridReact component inside the parent `<div>`

<snippet transform={false} language="html">
&lt;div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
    &lt;AgGridReact rowData={rowData} columnDefs={columnDefs} />
&lt;/div>
</snippet>

</framework-specific-section>
<!-- End Angular Add Grid -->