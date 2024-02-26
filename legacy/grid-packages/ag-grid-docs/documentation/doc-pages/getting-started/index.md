--- 
title: "Quick Start" 
---

Welcome to the AG Grid documentation. After reading this page you will have an overview of the key concepts of AG Grid that you will use on a daily basis.


## Your First Grid

Add AG Grid to your application in these steps:

<framework-specific-section frameworks="react,angular,vue">

<div style="height:10px;"></div>

**1. NPM Install**

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Install React -->

<snippet transform={false} language="bash">
npm install ag-grid-react
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<!-- Install Angular -->

<snippet transform={false} language="bash">
npm install ag-grid-angular
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<!-- Install Vue3 -->

<snippet transform={false} language="bash">
npm install ag-grid-vue3
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="javascript">

<div style="height:10px;"></div>

**1. Provide a Container**

<!-- Create JavaScript -->

Load the AG Grid library and create a blank container div:

<snippet transform={false} language="html">
|&lt;html lang="en">
|  &lt;head>
|    &lt;!-- Includes all JS & CSS for AG Grid -->
|    &lt;script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js">&lt;/script>
|  &lt;/head>
|  &lt;body>
|    &lt;!-- Your grid container -->
|    &lt;div id="myGrid">&lt;/div>
|  &lt;/body>
|&lt;/html>
</snippet>

<div style="height:10px;"></div>

**2. Instantiating the Grid**

Create the grid inside of your container div using `createGrid`.

<snippet transform={false} language="jsx">
|// Grid Options: Contains all of the grid configurations
|const gridOptions = {};
|
|// Your Javascript code to create the grid
|const myGridElement = document.querySelector('#myGrid');
|agGrid.createGrid(myGridElement, gridOptions);
</snippet>

<div style="height:10px;"></div>

**3. Define Rows and Columns**

<snippet transform={false} language="jsx">
|// Grid Options: Contains all of the grid configurations
|const gridOptions = {
|  // Row Data: The data to be displayed.
|  rowData: [
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ],
|  // Column Definitions: Defines the columns to be displayed.
|  columnDefs: [
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ]
|};
</snippet>

<div style="height:10px;"></div>

**4. Styling the Grid**

Add the `ag-theme-quartz` CSS class to your grid container div to apply the grid's theme.

<snippet transform={false} language="html">
|&lt;!-- Your grid container -->
|&lt;div id="myGrid" class="ag-theme-quartz" style="height: 500px">&lt;/div>
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="react">

<!-- Create React -->

<div style="height:10px;"></div>

**2. Import the Grid**

<snippet transform={false} language="jsx">
|import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
|import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
|import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
</snippet>

<div style="height:10px;"></div>

**3. Define Rows and Columns**

<snippet transform={false} language="jsx">
|const GridExample = () => {
|  // Row Data: The data to be displayed.
|  const [rowData, setRowData] = useState([
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ]);
|  
|  // Column Definitions: Defines the columns to be displayed.
|  const [colDefs, setColDefs] = useState([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ]);
|
|  // ...
|
|}
</snippet>

<div style="height:10px;"></div>

**4. Grid Component**

The `AgGridReact` component is wrapped in a parent container `div`. Style is applied to the parent container.
Rows and Columns are set as `AgGridReact` component attributes.

<snippet transform={false} language="jsx">
|return (
|  // wrapping container with theme & size
|  &lt;div
|   className="ag-theme-quartz" // applying the grid theme
|   style={{ height: 500 }} // the grid will fill the size of the parent container
|  >
|    &lt;AgGridReact
|        rowData={rowData}
|        columnDefs={colDefs}
|    />
|  &lt;/div>
|)
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<div style="height:10px;"></div>

**2. Import the Grid**

<snippet transform={false} language="jsx">
|import { Component } from '@angular/core';
|import { AgGridAngular } from 'ag-grid-angular'; // AG Grid Component
|import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface
</snippet>

<div style="height:10px;"></div>

**3. Define Rows and Columns**

<snippet transform={false} language="jsx">
|@Component({
|  selector: 'app-root',
|  standalone: true,
|  imports: [AgGridAngular], // Add AG Grid component
|  styleUrls: ['./app.component.css'],
|  template: ``
|})
|
|export class AppComponent {
|  // Row Data: The data to be displayed.
|  rowData = [
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ];
|
|  // Column Definitions: Defines the columns to be displayed.
|  colDefs: ColDef[] = [
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ];
|}
</snippet>

<div style="height:10px;"></div>

**4. Grid Component**

Rows and Columns are set as `ag-grid-angular` component attributes.

<snippet transform={false} language="jsx">
|template:
|`
|  &lt;!-- The AG Grid component -->
|  &lt;ag-grid-angular
|    [rowData]="rowData"
|    [columnDefs]="colDefs">
|  &lt;/ag-grid-angular>
|`
</snippet>

<div style="height:10px;"></div>

**5. Styling the Grid**

Import the required dependencies into your `styles.css` file.

<snippet transform={false} language="css">
|/* Core Grid CSS */
|@import 'ag-grid-community/styles/ag-grid.css';
|/* Quartz Theme Specific CSS */
|@import 'ag-grid-community/styles/ag-theme-quartz.css';
</snippet>

Add the `class` and `style` props to the `ag-grid-angular` component.

<snippet transform={false} language="jsx">
|&lt;ag-grid-angular
|  class="ag-theme-quartz"
|  style="height: 500px;"
|  ...
|>
|&lt;/ag-grid-angular>
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<div style="height:10px;"></div>

**2. Import the Grid**

<snippet transform={false} language="html">
|&lt;template>&lt;/template>
|
|&lt;script>
|import { ref } from 'vue';
|import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
|import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
|import { AgGridVue } from "ag-grid-vue3"; // AG Grid Component
|
|export default {
|  name: "App",
|  components: {
|    AgGridVue, // Add AG Grid Vue3 component
|  },
|  setup() {},
|};
|&lt;/script>
</snippet>

<div style="height:10px;"></div>

**3. Define Rows and Columns**

<snippet transform={false} language="js">
|setup() {
|  // Row Data: The data to be displayed.
|  const rowData = ref([
|    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
|    { make: "Ford", model: "F-Series", price: 33850, electric: false },
|    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
|  ]);
|
|  // Column Definitions: Defines the columns to be displayed.
|  const colDefs = ref([
|    { field: "make" },
|    { field: "model" },
|    { field: "price" },
|    { field: "electric" }
|  ]);
|
|  return {
|    rowData,
|    colDefs,
|  };
|},
</snippet>

<div style="height:10px;"></div>

**4. Grid Component**

Rows and Columns are set as `ag-grid-vue` component attributes. Styling is applied through the class and style attributes.

<snippet transform={false} language="html">
|&lt;template>
|  &lt;!-- The AG Grid component -->
|  &lt;ag-grid-vue
|    :rowData="rowData"
|    :columnDefs="colDefs"
|    style="height: 500px"
|    class="ag-theme-quartz"
|  >
|  &lt;/ag-grid-vue>
|&lt;/template>
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

**6. Finished**

</framework-specific-section>

<framework-specific-section frameworks="react,vue,javascript">

**5. Finished**

</framework-specific-section>

Below is a live example of the application running. Click `</> Code` to see the code.

<grid-example title='Quick Start Example' name='quick-start-example' type='mixed' options='{ "exampleHeight": 302 }'></grid-example>

<note>To live-edit the code, open the example in CodeSandbox or Plunker using the buttons to the lower-right.</note>

Now that you have a basic grid running, the remainder of this page explores some of the key concepts. 

<div style="height:15px;"></div>

## Showing Data


### Mapping Values

The `field` or `valueGetter` attributes map data to columns. A field maps to a field in the data. A [Value Getter](../value-getters/) is a function callback that returns the cell value.

The `headerName` provides the title for the header. If missing the title is derived from `field`.

<snippet>
const gridOptions = {
    columnDefs: [
        { headerName: "Make & Model", valueGetter: p => p.make + ' ' + p.model},
        { field: "price" },
    ],
};
</snippet>

### Formatting

Format cell content using a [Value Formatter](../value-formatters/).

<snippet>
const gridOptions = {
    columnDefs: [
        { field: "price", valueFormatter: p => '£' + Math.floor(p.value).toLocaleString() },
    ],
};
</snippet>

### Cell Components

Add buttons, checkboxes or images to cells with a [Cell Component](../component-cell-renderer/).

<framework-specific-section frameworks="react">

<snippet transform={false} language="jsx">
| const CustomButtonComponent = (props) => {
|    return &lt;button onClick={() => window.alert('clicked') }>Push Me!&lt;/button>;
|  };
|
| const [colDefs, setColDefs] = useState([
|    { field: "button", cellRenderer: CustomButtonComponent },
|    // ...
|  ]);
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="javascript">

<snippet transform={false} language="jsx">
|class CustomButtonComponent {
|  eGui;
|  eButton;
|  eventListener;
|
|  init(params) {
|    this.eGui = document.createElement("div");
|    let button = document.createElement("button");
|    button.className = "btn-simple";
|    button.innerText = "Push Me!";
|    this.eventListener = () => alert("clicked");
|    button.addEventListener("click", this.eventListener);
|    this.eGui.appendChild(button);
|  }
|
|  getGui() {
|    return this.eGui;
|  }
|
|  refresh(params) {
|    return true;
|  }
|
|  destroy() {
|    if (button) {
|      button.removeEventListener("click", this.eventListener);
|    }
|  }
|}
|
|
|const columnDefs = [
|    { field: "button", cellRenderer: CustomButtonComponent },
|    // ...
|];
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<snippet transform={false} language="jsx">
|@Component({
|  standalone: true,
|  template: `&lt;button (click)="buttonClicked()">Push Me!&lt;/button>`,
|})
|export class CustomButtonComponent implements ICellRendererAngularComp {
|  agInit(params: ICellRendererParams): void {}
|  refresh(params: ICellRendererParams) {
|    return true;
|  }
|  buttonClicked() {
|    alert("clicked");
|  }
|}
|
|columnDefs: ColDef[] = [
|    { field: "button", cellRenderer: CustomButtonComponent },
|    // ...
|];
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<snippet transform={false} language="jsx">
|// ...
|  components: {
|    "ag-grid-vue": AgGridVue,
|    CustomButtonComponent: {
|      template: `
|         &lt;button @click="buttonClicked()">Push Me!&lt;/button>
|        `,
|      methods: {
|        buttonClicked() {
|          alert("clicked");
|        },
|      },
|    },
|  },
|  data: function () {
|    return {
|    columnDefs: [
|        { field: "button", cellRenderer: CustomButtonComponent },
|        // ...
|    ],
|  };
|},
|// ...
</snippet>

</framework-specific-section>

### Resizing Columns

Columns are [Resized](../column-sizing/) by dragging the Column Header edges. Additionally assign `flex` values to 
allow columns to flex to the grid width.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: "make", flex: 2 }, //This column will be twice as wide as the others
        { field: "model", flex: 1 },
        { field: "price", flex: 1 },
        { field: "electric", flex: 1 }
    ],
};
</snippet>

<div style="height:15px;"></div>

### Example

This example demonstrates mapping and formatting values, cell components, and resizing columns.

<grid-example title='Showing Data Example' name='showing-data-example' type='mixed' options='{ "exampleHeight": 302 }'></grid-example>

## Working with Data

By default, the row data is used to infer the [Cell Data Type](../cell-data-types/). The cell data type allows grid features, such as filtering and editing, to work without additional configuration.

### Filtering

[Column Filters](../filtering/) are embedded into each column menu. These are enabled using the `filter` attribute. The filter type is inferred from the cell data type.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: "make", filter: true },
    ],
};
</snippet>

There are 5 [Provided Filters](../filtering/) which can be set through this attribute.
You can also create your own [Custom Filter](../filter-custom/).

[Floating Filters](../floating-filters/) embed the Column Filter into the header for ease of access.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: "make", filter: true, floatingFilter: true },
    ],
};
</snippet>

### Editing

Enable [Editing](../cell-editing/) by setting the `editable` attribute to `true`. The cell editor is inferred from the cell data type.

<snippet>
const gridOptions = {
    columnDefs: [
        { field: "make", editable: true },
    ],
};
</snippet>

Set the cell editor type using the `cellEditor` attribute. There are 7 [Provided Cell Editors](../provided-cell-editors/) which can be set through this attribute.
You can also create your own [Custom Editors](../cell-editors/).

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: "make",
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Tesla', 'Ford', 'Toyota'],
            },
        },
    ],
};
</snippet>

### Sorting

Data is [Sorted](../row-sorting/) by clicking the column headers. Sorting is enabled by default.

### Row Selection

[Row Selection](../row-selection/) is enabled using the `rowSelection` attribute. Use the `checkboxSelection` column definition attribute to render checkboxes for selection.

<snippet>
const gridOptions = {
    // Column Definitions: Defines the columns to be displayed.
    columnDefs: [
        { field: "make", checkboxSelection: true },
    ],
    rowSelection: 'multiple',
};
</snippet>

### Pagination

Enable [Pagination](../row-pagination/) by setting `pagination` to be true.

<snippet>
const gridOptions = {
    pagination: true,
    paginationPageSize: 500,
    paginationPageSizeSelector: [200, 500, 1000],
};
</snippet>

### Example

This example demonstrates filtering, editing, sorting, row selection, and pagination.

<grid-example title='Working With Data Example' name='working-with-data-example' type='mixed' options='{ "exampleHeight": 500 }'></grid-example>


## Themes & Style

### Themes

[Grid Themes](../themes/) define how the grid looks (colors, font, spacing etc).
The grid comes with [Provided Themes](../themes/#provided-themes) such as Quartz and Alpine.
To use a theme you need to 1) import the themes CSS and 2) apply the theme to the parent
HTML element of the grid.

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|import "ag-grid-community/styles/ag-theme-quartz.css"; // import Quartz theme
|// import "ag-grid-community/styles/ag-theme-alpine.css"; // import Alpine theme, not used here
| ...
|return (
|  &lt;div class="ag-theme-quartz"> // set Quartz Theme on parent div
|    &lt;AgGridReact rowData={...} columnDefs={...} />
|  &lt;/div>
|)
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="javascript">

<snippet transform={false} language="jsx">
|import "ag-grid-community/styles/ag-theme-quartz.css"; // import Quartz theme
|// import "ag-grid-community/styles/ag-theme-alpine.css"; // import Alpine theme, not used here
</snippet>

<snippet transform={false} language="html">
|&lt;!-- Your grid container -->
|&lt;div id="myGrid" class="ag-theme-quartz" style="height: 500px">&lt;/div>
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="angular">

<snippet transform={false} language="jsx">
|import "ag-grid-community/styles/ag-theme-quartz.css"; // import Quartz theme
|// import "ag-grid-community/styles/ag-theme-alpine.css"; // import Alpine theme, not used here
| // ...
|  template: `&lt;div style="height: 100%; box-sizing: border-box;">
|    &lt;ag-grid-angular
|      // ...
|      [class]="themeClass"
|    >&lt;/ag-grid-angular>
|  &lt;/div>`,
| // ...
| public themeClass: string = "ag-theme-quartz";
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="vue">

<snippet transform={false} language="jsx">
|import "ag-grid-community/styles/ag-theme-quartz.css"; // import Quartz theme
|// import "ag-grid-community/styles/ag-theme-alpine.css"; // import Alpine theme, not used here
|
|const VueExample = {
|  template: `
|        &lt;div style="height: 100%">
|            &lt;div style="height: 100%; box-sizing: border-box;">
|                &lt;ag-grid-vue
|                // ...
|                :class="themeClass">&lt;/ag-grid-vue>
|            &lt;/div>
|        &lt;/div>
|    `,
|// ...
|  data: function () {
|    return {
|      // ...
|      themeClass: "ag-theme-quartz",
|    };
|  },
| // ...
</snippet>

</framework-specific-section>

<div style="display: flex; margin-bottom: 40px; margin-top: 40px; text-align: center; font-weight: bold;">
    <div style="width: 50%">
        Quartz
        <image-caption
            src="getting-started/resources/themeQuartz.png"
            alt="AG Theme Quartz"
        ></image-caption>
    </div>
    <div style="width: 50%">
        Quartz Dark
        <image-caption
            src="getting-started/resources/themeQuartzDark.png"
            alt="AG Theme Quartz Dark"
        ></image-caption>
    </div>
</div>

<div style="display: flex; margin-bottom: 10px; text-align: center; font-weight: bold;">
    <div style="width: 50%">
        Alpine
        <image-caption src="getting-started/resources/themeAlpine.png" alt="AG Theme Alpine"></image-caption>
    </div>
    <div style="width: 50%">
        Alpine Dark
        <image-caption src="getting-started/resources/themeAlpineDark.png" alt="AG Theme Alpine Dark"></image-caption>
    </div>
</div>

### Customising a Theme

Customise themes using CSS variables.

<snippet transform={false} language="jsx">
.ag-theme-quartz {
    /* Changes the color of the grid text */
    --ag-foreground-color: rgb(163, 64, 64);
    /* Changes the color of the grid background */
    --ag-background-color: rgba(215, 245, 231, 0.212);
    /* Changes the background color of selected rows */
    --ag-selected-row-background-color: rgba(0, 38, 255, 0.1);
}
</snippet>

<image-caption src="getting-started/resources/customisingThemeExample.png" constrained=true centered=true alt="Customising a Theme with CSS Variables"></image-caption>

### Figma

If you are designing within Figma, you can use the [AG Grid Design System](../ag-grid-design-system/) to replicate the  Quartz and Alpine AG Grid themes within Figma. These default themes can be extended with Figma variables to match any existing visual design or create entirely new AG Grid themes. These can then be exported and generated into new AG Grid themes.

<image-caption src="getting-started/resources/FDS-Example.png" constrained=true centered=true alt="Figma Design System with AG Grid"></image-caption>

### Cell Style

Define rules to apply styling to cells using `cellClassRules`. This can be used, for example, to set cell background colour based on its value.

<div style="display: flex">
<div style="min-width: 0;flex: 3">
<snippet transform={false} language="css">
.rag-green {
  background-color: #33cc3344;
}
</snippet>

<snippet>
const gridOptions = {
    columnDefs: [{
        field: 'electric',
        cellClassRules: {
            // apply green to electric cars
            'rag-green': params => params.value === true,
        }
    }],
};
</snippet>

### Row Style

Define rules to apply styling to rows using  and `rowClassRules`. This allows changing style (e.g. row colour) based on row values.

<snippet transform={false} language="css">
.rag-red {
  background-color: #cc222244;
}
</snippet>

<snippet>
const gridOptions = {
    rowClassRules: {
        // apply red to Ford cars
        'rag-red': params => params.data.make === 'Ford',
    },
};
</snippet>

### Example

This example demonstrates cell style and row style.

<grid-example title='Theming Example' name='theming-example' type='generated'></grid-example>

## Next Steps

- Read our [Introductory Tutorial](/deep-dive/).
- Watch our [Video Tutorials](/videos/).