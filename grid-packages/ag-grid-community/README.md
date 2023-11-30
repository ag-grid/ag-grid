![AG Grid HTML5 Grid trusted by the community, built for enterprise](./github-banner.png "AG Grid")

[![CDNJS](https://img.shields.io/cdnjs/v/ag-grid)](https://cdnjs.com/libraries/ag-grid) [![Github Stars](https://img.shields.io/github/stars/ag-grid/ag-grid?style=social)](https://github.com/ag-grid/ag-grid) [![Twitter](https://img.shields.io/twitter/follow/ag_grid?style=social)](https://twitter.com/ag_grid)

| Module              | Info |
| --------------------|------------------:|
| ag-grid-community   | [![npm](https://img.shields.io/npm/dm/ag-grid-community)](https://www.npmjs.com/package/ag-grid-community) <br> [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ag-grid-community&metric=alert_status)](https://sonarcloud.io/dashboard?id=ag-grid-community) <br> |
| ag-grid-enterprise  | [![npm](https://img.shields.io/npm/dm/ag-grid-enterprise)](https://www.npmjs.com/package/ag-grid-enterprise) <br> [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ag-grid-enterprise&metric=alert_status)](https://sonarcloud.io/dashboard?id=ag-grid-enterprise) |

# AG Grid

AG Grid is a fully-featured and highly customizable JavaScript data grid.
It delivers [outstanding performance](https://www.ag-grid.com/example?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github), has no third-party dependencies and [integrates smoothly with all major JavaScript frameworks](https://www.ag-grid.com/javascript-data-grid/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github).

Here's how our grid looks with multiple filters and grouping enabled:

![Image of AG Grid showing filtering and grouping enabled.](./github-grid-demo.jpg "AG Grid demo")

## Features

In addition to the standard set of features you'd expect from any grid:

* Column Interactions (resize, reorder, and pin columns)
* Pagination
* Sorting
* Row Selection

Here are some of the features that make AG Grid stand out:

* Grouping / Aggregation *
* Accessibility support
* Custom Filtering
* In-place Cell Editing
* Records Lazy Loading *
* Server-Side Records Operations *
* Live Stream Updates
* Hierarchical Data Support & Tree View *
* Customizable Appearance
* Customizable Cell Contents
* State Persistence
* Keyboard Navigation
* Data Export to CSV
* Data Export to Excel *
* Excel-like Pivoting *
* Row Reordering
* Copy / Paste
* Column Spanning
* Pinned Rows
* Full Width Rows
* Integrated Charting
* Sparklines

\* The features marked with an asterisk are available in the [Enterprise version](https://www.ag-grid.com/license-pricing?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) only.

Check out the [developer documentation](https://www.ag-grid.com/documentation/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) for a complete list of features or visit [our official docs](https://www.ag-grid.com/features-overview/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github) for tutorials and feature demos.

## Looking for a framework specific solution?

* [Get Started with Angular](https://www.ag-grid.com/angular-data-grid/getting-started/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Get Started with React](https://www.ag-grid.com/react-data-grid/getting-started/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Get Started with Vue](https://www.ag-grid.com/vue-data-grid/getting-started/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)

## Getting started

### Install dependencies

```sh
$ npm install --save ag-grid-community
```

### Add a placeholder to HTML

```html
<div id="myGrid" style="height: 150px; width: 600px" class="ag-theme-quartz"></div>
```

### Import the grid and styles

```js
import { createGrid } from 'ag-grid-community';

import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-quartz.css';
```

### Set configuration

```js
var gridOptions = {
	columnDefs: [
		{ headerName: 'Make', field: 'make' },
		{ headerName: 'Model', field: 'model' },
		{ headerName: 'Price', field: 'price' }
	],
	rowData: [
		{ make: 'Toyota', model: 'Celica', price: 35000 },
		{ make: 'Ford', model: 'Mondeo', price: 32000 },
		{ make: 'Porsche', model: 'Boxster', price: 72000 }
	]
};
```

### Initialise the grid

```js
const eGridDiv = document.querySelector('#myGrid');
const api = createGrid(eGridDiv, this.gridOptions);
```

For more information on how to integrate the grid into your project see [Building AG Grid Applications](https://www.ag-grid.com/javascript-data-grid/building/?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github).

## Issue Reporting

If you have found a bug, please report it in this repository's [issues](https://github.com/ag-grid/ag-grid/issues) section. If you're using the Enterprise version, please use the [private ticketing](https://ag-grid.zendesk.com/) system to do that.

## Asking Questions

Look for similar problems on [StackOverflow](https://stackoverflow.com/questions/tagged/ag-grid) using the `ag-grid` tag. If nothing seems related, post a new message there. Please do not use GitHub issues to ask questions.

## Contributing

AG Grid is developed by a team of co-located developers in London. If you want to join the team send your application to info@ag-grid.com.

## License

This project is licensed under the MIT license. See the [LICENSE file](./LICENSE.txt) for more info.
