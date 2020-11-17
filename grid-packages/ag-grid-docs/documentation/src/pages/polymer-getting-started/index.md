---
title: "Polymer Grid"
frameworks: ["javascript"]
---

This section documents how to get started with ag-Grid and Polymer as quickly as possible. You will 
start off with a simple application and section by section add Grid features to the application ending 
up with a fully fledged application, with ag-Grid and Polymer at the heart of it.

[[note]]
| With release 20 of `ag-grid-polymer` supports Polymer 3.<br/><br/>
| For Polymer 2.x support please use version 19 (and before) of `ag-grid-polymer`. Archived documentation
| for this version can be found [here](https://www.ag-grid.com/archive).

## Prerequisites

We'll be using the Polymer CLI to scaffold and run our application.

Please refer to the [Polymer CLI](https://www.polymer-project.org/3.0/docs/tools/polymer-cli#install) 
installation instructions to get this installed.

## Scaffolding

```bash
mkdir ag-grid-polymer-app
cd ag-grid-polymer-app

# create a new Polymer Application
polymer init

** Select polymer-3-application **
** Accept default options **
```

We can now test our application with the following command:

```bash
polymer serve --open
```

This should build and serve the skeleton project that the Polymer CLI provides, 
opening your default browser at the same time.

## Adding ag-Grid

Let's add the ag-Grid related dependencies we need:

```bash
npm install ag-grid-community ag-grid-polymer --save
```

We need to reference the ag-Grid library in the root `index.html`:

```diff
  <link rel="manifest" href="/manifest.json"gt;

  <script src="/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
+ <script src="/node_modules/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
```

You'll note that we're referencing the UMD bundle without styles - we do this as we'll 
reference the styles when we define our grid in the next step.

Next we need to update the CLI generated element with our code. First we need to import 
the `ag-grid-polymer` element so that we can use it:

```diff
# src/polymer-getting-started/polymer-getting-started.js

  import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
+ import 'ag-grid-polymer';
```

Next we'll add our ag-Grid element along with the styles we'd like to use in the grid:

```diff
# src/polymer-getting-started/polymer-getting-started.js

  static get template() {
      return html`
+     <link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-grid.css">
+     <link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css">

+     <ag-grid-polymer style="width: 100%; height: 350px;"
+         class="ag-theme-alpine"
+         rowData="{{rowData}}"
+         columnDefs="{{columnDefs}}"
+         on-first-data-rendered="{{firstDataRendered}}"
+     ></ag-grid-polymer>
      `;
  }
```

The lines above import the `AgGrid` component, the grid "structure" stylesheet (`ag-grid.css`), 
and one of the available grid themes: (`ag-theme-alpine.css`). The grid ships several different 
themes; pick one that matches your project design.


We've also defined 4 bound properties - two data properties (`rowData` and `columnDefs`) and 
one event (`on-first-data-rendered)`.

The data properties define the data to render and the columns to display. We'll use the 
`firstDataRendered` event to space the columns out evenly once the data has been rendered 
within the grid.

Now let's add the data properties and event we reference above:

```js
// src/polymer-getting-started/polymer-getting-started.js

constructor() {
    super();

    this.columnDefs = [
      { headerName: "Make", field: "make" },
      { headerName: "Model", field: "model" },
      { headerName: "Price", field: "price" },
    ];

    this.rowData = [
      { make: "Toyota", model: "Celica", price: 35000 },
      { make: "Ford", model: "Mondeo", price: 32000 },
      { make: "Porsche", model: "Boxter", price: 72000 }
    ];
}

firstDataRendered(params) {
    params.api.sizeColumnsToFit()
}
```

The entire element should now look like this:

```js
// src/polymer-getting-started/polymer-getting-started.js

import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'ag-grid-polymer';

/**
 * @customElement
 * @polymer
 */
class PolymerGettingStartedApp extends PolymerElement {
  static get template() {
    return html`
        <link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-grid.css">
        <link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css">

        <ag-grid-polymer style="width: 100%; height: 350px;"
                         class="ag-theme-alpine"
                         rowData="{{rowData}}"
                         columnDefs="{{columnDefs}}"
                         on-first-data-rendered="{{firstDataRendered}}"
        ></ag-grid-polymer>
    `;
  }

  constructor() {
    super();

    this.columnDefs = [
      { headerName: "Make", field: "make" },
      { headerName: "Model", field: "model" },
      { headerName: "Price", field: "price" },
    ];

    this.rowData = [
      { make: "Toyota", model: "Celica", price: 35000 },
      { make: "Ford", model: "Mondeo", price: 32000 },
      { make: "Porsche", model: "Boxter", price: 72000 }
    ];
  }

  firstDataRendered(params) {
    params.api.sizeColumnsToFit()
  }
}

window.customElements.define('polymer-getting-started-app', PolymerGettingStartedApp);
```

With this in place if we serve the application once again (`polymer serve --open`) we 
should see our first grid:

<img src="../getting-started/resources/step1.png" alt="ag-Grid in its simplest form"/>


## Adding Features

Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help 
us see which car is the most expensive (or least!)?

### Sorting

Adding sorting to our application is very easy - all you need to do is let the Grid know 
you want sorting to be enabled by setting a Grid property to true:

```js
this.columnDefs = [
    { field: "make", sortable: true },
    { field: "model", sortable: true },
    { field: "price", sortable: true },
];
```

With a single property change we are now able to sort any column by clicking the column header (you can keep
    clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
    by `Price` in ascending order (indicated by the up arrow):

<img src="resources/js-gs-sorting.png" alt="sorting">

### Filtering

Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
    real-world
    application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
    this filtering is your friend.


As with sorting, enabling filtering is as easy as setting a single property in our Grid definition:

```js
this.columnDefs = [
    { headerName: "Make", field: "make", sortable: true, filter: true },
    { headerName: "Model", field: "model", sortable: true, filter: true },
    { headerName: "Price", field: "price", sortable: true, filter: true },
];
```

With the `filter` property set we are now able to filter any column by clicking the column
    header
    "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
    `Model`
    column by the text `Celica` - only the row with `Celica` is shown now.

<img src="resources/js-gs-filtering.png" alt="filtering" />

<grid-example title='Polymer 3 Grid' name='simple-grid' type='polymer' options='{ "noPlunker": true, "exampleHeight": 175 }'></grid-example>

## Summary

We've only scratched the surface with what you can do with the Grid - please refer to the full set 
of features on the left hand navigation for an idea of what's on offer.

Please read the [More Details](../polymer-more-details) section next to get a deeper understanding of 
how to use ag-Grid and Polymer, as well the **Enterprise Features**.

[[note]]
| A full working example of using ag-Grid with Polymer 3 can be found in our <a href="https://github.com/ag-grid/ag-grid-polymer-example">ag-Grid Polymer 3 Example Repo</a>.

