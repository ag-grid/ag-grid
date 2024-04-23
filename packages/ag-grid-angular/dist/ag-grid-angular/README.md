![AG Grid HTML5 Grid trusted by the community, built for enterprise](https://github.com/ag-grid/ag-grid/blob/HEAD/github-banner.png)

[![CDNJS](https://img.shields.io/cdnjs/v/ag-grid.svg)](https://cdnjs.com/libraries/ag-grid)
[![npm](https://img.shields.io/npm/dm/@ag-grid-community/angular.svg)](https://www.npmjs.com/package/@ag-grid-community/angular)
[![npm](https://img.shields.io/npm/dt/@ag-grid-community/angular.svg)](https://www.npmjs.com/package/@ag-grid-community/angular)

# AG Grid Angular Component

AG Grid is a fully-featured and highly customizable JavaScript data grid.
It delivers [outstanding performance](https://www.ag-grid.com/example?utm_source=@ag-grid-community/angular-readme&utm_medium=repository&utm_campaign=github), has no third-party dependencies and [integrates smoothly with Angular](https://www.ag-grid.com/angular-data-grid/getting-started/?utm_source=@ag-grid-community/angular-readme&utm_medium=repository&utm_campaign=github).

Here's how our grid looks with multiple filters and grouping enabled:

![Image of AG Grid showing filtering and grouping enabled.](./github-grid-demo.jpg "AG Grid demo")

## Supported Angular Versions

See Angular [Version Compatibility](https://ag-grid.com/angular-data-grid/angular-compatibility/) for which versions of Angular are supported by each AG Grid version.

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

\* The features marked with an asterisk are available in the [Enterprise version](https://www.ag-grid.com/license-pricing?utm_source=@ag-grid-community/angular-readme&utm_medium=repository&utm_campaign=github) only.

Check out the [developer documentation](https://www.ag-grid.com/angular-data-grid/?utm_source=@ag-grid-community/angular-readme&utm_medium=repository&utm_campaign=github) for a complete list of features or visit [our official docs](https://www.ag-grid.com/angular-data-grid/grid-features/?utm_source=@ag-grid-community/angular-readme&utm_medium=repository&utm_campaign=github) for tutorials and feature demos.

## Getting started

Use the setup instructions below or go through [a 5-minute-quickstart guide](https://www.ag-grid.com/angular-data-grid/getting-started/?utm_source=@ag-grid-community/angular-readme&utm_medium=repository&utm_campaign=github).

### Install dependencies

```sh
$ npm install --save ag-grid-community @ag-grid-community/angular
```

### Import styles in `styles.css`

```scss
@import "~@ag-grid-community/styles/ag-grid.css";
@import "~@ag-grid-community/styles/ag-theme-quartz.css";
```

### Set the grid's configuration in a parent component

```ts
import { AgGridAngular } from '@ag-grid-community/angular';

@Component({
    selector: 'app-grid',
    standalone: true,
    imports: [AgGridAngular],
    template: ` ... `
})
export class AppComponent {
	title = 'app';

	columnDefs: ColDef[] = [
		{ headerName: 'Make', field: 'make' },
		{ headerName: 'Model', field: 'model' },
		{ headerName: 'Price', field: 'price' }
	];

	rowData = [
		{ make: 'Toyota', model: 'Celica', price: 35000 },
		{ make: 'Ford', model: 'Mondeo', price: 32000 },
		{ make: 'Porsche', model: 'Boxster', price: 72000 }
	];
}
```

### Render the grid as the `ag-grid-angular` child component

```html
<ag-grid-angular
	style="width: 500px; height: 500px;"
	class="ag-theme-quartz"
	[rowData]="rowData"
	[columnDefs]="columnDefs">
</ag-grid-angular>
```

## Issue Reporting

If you have found a bug, please report it in this repository's [issues](https://github.com/ag-grid/ag-grid/issues) section. If you're using the Enterprise version, please use the [private ticketing](https://ag-grid.zendesk.com/) system to do that.

## Asking Questions

Look for similar problems on [StackOverflow](https://stackoverflow.com/questions/tagged/ag-grid) using the `ag-grid` tag. If nothing seems related, post a new message there. Please do not use GitHub issues to ask questions.

## Contributing

AG Grid is developed by a team of co-located developers in London. If you want to join the team send your application to info@ag-grid.com.

## License

This project is licensed under the MIT license. See the [LICENSE file](./LICENSE.txt) for more info.
