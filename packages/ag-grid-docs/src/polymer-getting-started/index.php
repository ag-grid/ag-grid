<?php
$pageTitle = "ag-Grid Reference: Getting Started with the Polymer Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This Getting Start guide covers installing our seed repo and getting up and running with a simple Polymer Datagrid. We also cover basisc configuration.";
$pageKeyboards = "Polymer Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>

<h1> Polymer Grid </h1>

<p class="lead">This section documents how to get started with ag-Grid and Polymer as quickly as possible. You will
    start off with
    a simple application and section by section add Grid features to the application ending up with a fully fledged
    application, with ag-Grid and Polymer at the heart of it.</p>

<note>With release 20 of <code>ag-grid-polymer</code> supports Polymer 3.<br/><br/>
    For Polymer 2.x support please use version 19 (and before) of <code>ag-grid-polymer</code>. Archived documentation
    for this
    version can be found <a href="">here</a>.
</note>

<h2>Prerequisites</h2>

<p>We'll be using the Polymer CLI to scaffold and run our application.</p>

<p>Please refer to the
    <a href="https://www.polymer-project.org/3.0/docs/tools/polymer-cli#install">Polymer CLI</a> installation
    instructions
    to get this installed.</p>

<h2>Scaffolding</h2>
<snippet language="sh">
mkdir ag-grid-polymer-app
cd ag-grid-polymer-app

# create a new Polymer Application
polymer init

** Select polymer-3-application **
** Accept default options **
</snippet>

<p>We can now test our application with the following command:</p>
<snippet>polymer serve --open</snippet>

<p>This should build and serve the skeleton project that the Polymer CLI provides, opening your default browser at the
    same time.</p>

<h2>Adding ag-Grid</h2>

<p>Let's add the ag-Grid related dependencies we need:</p>

<snippet>
npm install ag-grid-community ag-grid-polymer --save
</snippet>

<p>We need to reference the ag-Grid library in the root <code>index.html</code>:</p>

<snippet language="diff">
&lt;link rel="manifest" href="/manifest.json"gt;

&lt;script src="/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"&gt;&lt;/script&gt;
+&lt;script src="/node_modules/ag-grid-community/dist/ag-grid-community.min.noStyle.js"&gt;&lt;/script&gt;
</snippet>

<p>You'll note that we're referencing the UMD bundle without styles - we do this as we'll reference the styles when we
    define our grid in the next step.</p>

<p>Next we need to update the CLI generated element with our code. First we need to import the
    <code>ag-grid-polymer</code>
    element so that we can use it:</p>

<snippet language="diff">
# src/polymer-getting-started/polymer-getting-started.js

import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
+import 'ag-grid-polymer';
</snippet>

<p>Next we'll add our ag-Grid element along with the styles we'd like to use in the grid:</p>

<snippet language="diff">
# src/polymer-getting-started/polymer-getting-started.js

static get template() {
  return html`
+    &lt;link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-grid.css"&gt;
+    &lt;link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css"&gt;

+    &lt;ag-grid-polymer style="width: 100%; height: 350px;"
+                     class="ag-theme-balham"
+                     rowData="{{rowData}}"
+                     columnDefs="{{columnDefs}}"
+                     on-first-data-rendered="{{firstDataRendered}}"
+    &gt;&lt;/ag-grid-polymer&gt;
    `;
}
</snippet>

<p>The lines above import the <code>AgGrid</code> component, the grid "structure" stylesheet (<code>ag-grid.css</code>),
    and one of the available grid themes: (<code>ag-theme-balham.css</code>). The grid ships several different themes;
    pick one that matches your project design.</p>


<p>We've also defined 4 bound properties - two data properties (<code>rowData</code> and <code>columnDefs</code>) and
    one event (<code>on-first-data-rendered)</code>.</p>

<p>The data properties define the data to render and the columns to display. We'll use the
    <code>firstDataRendered</code>
    event to space the columns out evenly once the data has been rendered within the grid.</p>

<p>Now let's add the data properties and event we reference above:</p>

<snippet language="js">
# src/polymer-getting-started/polymer-getting-started.js

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
</snippet>

<p>The entire element should now look like this:</p>

<snippet language="js">
# src/polymer-getting-started/polymer-getting-started.js

import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'ag-grid-polymer';

/**
 * @customElement
 * @polymer
 */
class PolymerGettingStartedApp extends PolymerElement {
  static get template() {
    return html`
        &lt;link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-grid.css"&gt;
        &lt;link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css"&gt;

        &lt;ag-grid-polymer style="width: 100%; height: 350px;"
                         class="ag-theme-balham"
                         rowData="{{rowData}}"
                         columnDefs="{{columnDefs}}"
                         on-first-data-rendered="{{firstDataRendered}}"
        &gt;&lt;/ag-grid-polymer&gt;
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
</snippet>

<p>With this in place if we serve the application once again (<code>polymer serve --open</code>) we should
    see our first grid:</p>

<img class="img-fluid" src="../getting-started/step1.png" alt="ag-Grid in its simplest form"/>

<h2>Adding Features</h2>

<p>Ok, great - so far so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
    most expensive (or least!)?</p>

<h3>Sorting</h3>

<p>Adding sorting to our application is very easy - all you need to do is let the Grid know you want sorting to be
    enabled by setting a Grid property to true:</p>

<snippet language="diff">
&lt;ag-grid-polymer style="width: 500px; height: 120px;"
                 class="ag-theme-balham"
                 rowData="{{rowData}}"
                 columnDefs="{{columnDefs}}"
+                enableSorting
                 on-first-data-rendered="{{firstDataRendered}}"&gt;&lt;/ag-grid-polymer&gt;</snippet>

<p>With a single property change we are now able to sort any column by clicking the column header (you can keep
    clicking and it will cycle through ascending, descending and no sort). Note that in this example we're sorting
    by <code>Price</code> in ascending order (indicated by the up arrow):</p>

<img src="../images/js-gs-sorting.png" style="display: block;margin: auto;height: 170px;">

<h3>Filtering</h3>

<p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a
    real-world
    application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like
    this filtering is your friend.
</p>

<p>As with sorting, enabling filtering is as easy as setting a single property in our Grid definition:</p>

<snippet language="diff">
&lt;ag-grid-polymer style="width: 500px; height: 120px;"
                 class="ag-theme-balham"
                 rowData="{{rowData}}"
                 columnDefs="{{columnDefs}}"
+                enableFilter
                 on-first-data-rendered="{{firstDataRendered}}"&gt;&lt;/ag-grid-polymer&gt;</snippet>

<p>With the <code>enableFilter</code> property set we are now able to filter any column by clicking the column
    header
    "hamburger" to the right of a column (visible when hovered over). Note that in this example we're filtering the
    <code>Model</code>
    column by the text <code>Celica</code> - only the row with <code>Celica</code> is shown now.</p>

<img src="../images/js-gs-filtering.png" style="display: block;margin: auto;height: 170px;">

<?= example('Polymer 3 Grid', 'simple-grid', 'as-is', array("noPlunker" => 1, "usePath" => "/", "exampleHeight" => 175)) ?>

<h2>Summary</h2>

<p id="polymer-rich-grid-example">We've only scratched the surface with what you can do with the Grid - please refer to
    the full set of features on
    the left hand navigation for an idea of what's on offer.</p>

<p>Please read the <a href="../polymer-more-details">More Details</a> section next to get a deeper understanding of
    how to
    use ag-Grid and Polymer, as well the <strong>Enterprise Features</strong>.</p>

<note>A full working example of using ag-Grid with Polymer 3 can be found in our <a
            href="https://github.com/ag-grid/ag-grid-polymer-example">ag-Grid Polymer 3 Example Repo</a>.
</note>

<?php include '../getting-started/footer.php'; ?>
