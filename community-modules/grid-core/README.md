

![alt text](./github-banner.png "Logo Title Text 1")

[![CDNJS](https://img.shields.io/cdnjs/v/ag-grid.svg)](https://cdnjs.com/libraries/ag-grid)
[![npm](https://img.shields.io/npm/dm/ag-grid.svg)](https://www.npmjs.com/package/ag-grid)
[![npm](https://img.shields.io/npm/dt/ag-grid.svg)](https://www.npmjs.com/package/ag-grid)

ag-Grid
------

ag-Grid is a fully-featured and highly customizable JavaScript data grid.
It delivers [outstanding performance](https://www.ag-grid.com/example.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github#/performance/1), has no 3rd party dependencies and [integrates smoothly with all major JavaScript frameworks](https://www.ag-grid.com/javascript-grid-getting-started?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github). Here's how our grid looks like with multiple filters and grouping enabled:

![alt text](./github-grid-demo.jpg "Logo Title Text 1")


Features
--------------

Besides the standard set of features you'd expect from any grid:

* Column Interactions (resize, reorder, and pin columns)
* Pagination
* Sorting
* Row Selection

Here are some of the features that make ag-Grid stand out:

* Grouping / Aggregation*
* Custom Filtering
* In-place Cell Editing
* Records Lazy Loading *
* Server-Side Records Operations *
* Live Stream Updates
* Hierarchical Data Support & Tree View *
* Customizable Appearance
* Customizable Cell Contents
* Excel-like Pivoting *
* State Persistence
* Keyboard navigation
* Data Export to CSV
* Data Export to Excel *
* Row Reordering
* Copy / Paste 
* Column Spanning
* Pinned Rows
* Full Width Rows

\* The features marked with an asterisk are available in the [enterprise version](https://www.ag-grid.com/license-pricing.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) only.

Check out [developers documentation](https://www.ag-grid.com/documentation-main/documentation.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) for a complete list of features or visit [our official docs](https://www.ag-grid.com/features-overview?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) for tutorials and feature demos. 

Looking for a framework specific solution?
--------------
* [Get Started with AngularJS](https://www.ag-grid.com/angular-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Get Started with Angular](https://www.ag-grid.com/angular-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Get Started with React](https://www.ag-grid.com/react-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Get Started with Vue](https://www.ag-grid.com/vue-getting-started?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Get Started with WebComponents](https://www.ag-grid.com/best-web-component-data-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)

Usage Overview
--------------

#### Install dependencies

    $ npm i --save ag-grid

### Add a placeholder to HTML

    <div id="myGrid" style="height: 150px;width: 600px" class="ag-theme-balham"></div>


#### Import the grid and styles

    import {Grid} from "ag-grid/main";

    import "ag-grid/dist/styles/ag-grid.css";
    import "ag-grid/dist/styles/ag-theme-balham.css";

### Set configuration

    const gridOptions = {
    	columnDefs: [
    		{headerName: 'Make', field: 'make'},
    		{headerName: 'Model', field: 'model'},
    		{headerName: 'Price', field: 'price'}
    	],
    	rowData: [
    		{make: 'Toyota', model: 'Celica', price: 35000},
    		{make: 'Ford', model: 'Mondeo', price: 32000},
    		{make: 'Porsche', model: 'Boxter', price: 72000}
    	]
    };

### Initialize the grid

    let eGridDiv = document.querySelector('#myGrid');
    new Grid(eGridDiv, this.gridOptions);

For more information on how to integrate the grid into your project see [TypeScript - Building with Webpack 2](https://www.ag-grid.com/ag-grid-typescript-webpack-2?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github).

Issue Reporting
----------
If you have found a bug, please report them at this repository `issues` section. If you're using Enterprise version please use the private ticketing system to do that. For more information on support check out our [dedicated page](https://www.ag-grid.com/support.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github).


Asking Questions
-------------

Look for similar problems on [StackOverflow](https://stackoverflow.com/questions/tagged/ag-grid) using the `ag-grid` tag. If nothing seems related, post a new message there. Do not use GitHub issues to ask questions.

Contributing
------------
ag-Grid is developed by a team of co-located developers in London. If you want to join the team check out our [jobs listing](https://www.ag-grid.com/ag-grid-jobs-board?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) or send your application to info@ag-grid.com.

License
------------------
This project is licensed under the MIT license. See the [LICENSE file](./LICENSE.txt) for more info.
