const quickStartReact = `
**1. Import the React Data Grid**

\`\`\`js
// Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-grid.css"; 
// Optional Theme applied to the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; 
// React Data Grid Component
import { AgGridReact } from 'ag-grid-react'; 
\`\`\`

**2. Define Rows and Columns**

\`\`\`js
const GridExample = () => {
 // Row Data: The data to be displayed.
 const [rowData, setRowData] = useState([
   { make: "Tesla", model: "Model Y", price: 64950, electric: true },
   { make: "Ford", model: "F-Series", price: 33850, electric: false },
   { make: "Toyota", model: "Corolla", price: 29600, electric: false },
 ]);
 
 // Column Definitions: Defines the columns to be displayed.
 const [colDefs, setColDefs] = useState([
   { field: "make" },
   { field: "model" },
   { field: "price" },
   { field: "electric" }
 ]);

 // ...

}
\`\`\`

**3. React Data Grid Component**

\`\`\`js
return (
 // wrapping container with theme & size
 <div
  className="ag-theme-quartz" // applying the Data Grid theme
  style={{ height: 500 }} // the Data Grid will fill the size of the parent container
 >
   <AgGridReact
       rowData={rowData}
       columnDefs={colDefs}
   />
 </div>
)
\`\`\`
`;

const quickStartReactModule = `
**1. Import the React Data Grid**

Import the required modules, and register them via the ModuleRegistry.

\`\`\`js
// Mandatory CSS required by the Data Grid
import "@ag-grid-community/styles/ag-grid.css"; 
// Optional Theme applied to the Data Grid
import "@ag-grid-community/styles/ag-theme-quartz.css"; 
// React Data Grid Component & Module Registry
import { AgGridReact } from '@ag-grid-community/react'; 
// Default Row Model & Module Registry
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';

// Register the RowModel Module
ModuleRegistry.registerModules([ClientSideRowModelModule]);
\`\`\`

**2. Define Rows and Columns**

\`\`\`js
const GridExample = () => {
 // Row Data: The data to be displayed.
 const [rowData, setRowData] = useState([
   { make: "Tesla", model: "Model Y", price: 64950, electric: true },
   { make: "Ford", model: "F-Series", price: 33850, electric: false },
   { make: "Toyota", model: "Corolla", price: 29600, electric: false },
 ]);
 
 // Column Definitions: Defines the columns to be displayed.
 const [colDefs, setColDefs] = useState([
   { field: "make" },
   { field: "model" },
   { field: "price" },
   { field: "electric" }
 ]);

 // ...

}
\`\`\`

**3. React Data Grid Component**

\`\`\`js
return (
 // wrapping container with theme & size
 <div
  className="ag-theme-quartz" // applying the Data Grid theme
  style={{ height: 500 }} // the Data Grid will fill the size of the parent container
 >
   <AgGridReact
       rowData={rowData}
       columnDefs={colDefs}
   />
 </div>
)
\`\`\`
`;

const quickStartAngular = `
**1. Import the Angular Data Grid**

\`\`\`js
import { Component } from '@angular/core';

// Angular Data Grid Component
import { AgGridAngular } from 'ag-grid-angular'; 
// Column Definition Type Interface
import { ColDef } from 'ag-grid-community'; 
\`\`\`

**2. Define Rows and Columns**

\`\`\`js
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridAngular], // Add Angular Data Grid Component
  styleUrls: ['./app.component.css'],
  template: \`\`
})

export class AppComponent {
// Row Data: The data to be displayed.
rowData = [
  { make: "Tesla", model: "Model Y", price: 64950, electric: true },
  { make: "Ford", model: "F-Series", price: 33850, electric: false },
  { make: "Toyota", model: "Corolla", price: 29600, electric: false },
];

// Column Definitions: Defines the columns to be displayed.
colDefs: ColDef[] = [
  { field: "make" },
  { field: "model" },
  { field: "price" },
  { field: "electric" }
];
}
\`\`\`

**3. Create the Angular Data Grid Component**

\`\`\`js
template:
\`
<!-- The AG Grid component -->
<ag-grid-angular
  [rowData]="rowData"
  [columnDefs]="colDefs" />
\`
\`\`\`

**4. Styling the Data Grid**

Import the required dependencies into your styles.css file.

\`\`\`js
/* Core Data Grid CSS */
import 'ag-grid-community/styles/ag-grid.css';

/* Quartz Theme Specific CSS */
import 'ag-grid-community/styles/ag-theme-quartz.css';
\`\`\`

Add the class and style props to the ag-grid-angular component.

\`\`\`js
<ag-grid-angular
class="ag-theme-quartz"
style="height: 500px;"
...
/>
\`\`\`
`;

const quickStartAngularModule = `
**1. Import the Angular Data Grid**

Import the required modules, and register them via the ModuleRegistry.

\`\`\`js
import { Component } from '@angular/core';

// Angular Data Grid Component
import { AgGridAngular } from '@ag-grid-community/angular'; 
// Column Definition Type Interface & Module Registry
import { ColDef, ModuleRegistry } from '@ag-grid-community/core'; 
// Default Row Model
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the RowModel Module
ModuleRegistry.registerModules([ClientSideRowModelModule]);
\`\`\`

**2. Define Rows and Columns**

\`\`\`js
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridAngular], // Add Angular Data Grid Component
  styleUrls: ['./app.component.css'],
  template: \`\`
})

export class AppComponent {
// Row Data: The data to be displayed.
rowData = [
  { make: "Tesla", model: "Model Y", price: 64950, electric: true },
  { make: "Ford", model: "F-Series", price: 33850, electric: false },
  { make: "Toyota", model: "Corolla", price: 29600, electric: false },
];

// Column Definitions: Defines the columns to be displayed.
colDefs: ColDef[] = [
  { field: "make" },
  { field: "model" },
  { field: "price" },
  { field: "electric" }
];
}
\`\`\`

**3. Create the Angular Data Grid Component**

\`\`\`js
template:
\`
<!-- The AG Grid component -->
<ag-grid-angular
  [rowData]="rowData"
  [columnDefs]="colDefs" />
\`
\`\`\`

**4. Styling the Data Grid**

Import the required dependencies into your styles.css file.

\`\`\`js
/* Core Data Grid CSS */
import '~@ag-grid-community/styles/ag-grid.css';

/* Quartz Theme Specific CSS */
import '~@ag-grid-community/styles/ag-theme-quartz.css';
\`\`\`

Add the class and style props to the ag-grid-angular component.

\`\`\`js
<ag-grid-angular
class="ag-theme-quartz"
style="height: 500px;"
...
/>
\`\`\`
`;

const quickStartVue3 = `
**1. Import the Vue Data Grid**

\`\`\`js
<template></template>

<script>
import { ref } from 'vue';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component

export default {
 name: "App",
 components: {
   AgGridVue, // Add Vue Data Grid component
 },
 setup() {},
};
</script>
\`\`\`

**2. Define Rows and Columns**

\`\`\`js
setup() {
 // Row Data: The data to be displayed.
 const rowData = ref([
   { make: "Tesla", model: "Model Y", price: 64950, electric: true },
   { make: "Ford", model: "F-Series", price: 33850, electric: false },
   { make: "Toyota", model: "Corolla", price: 29600, electric: false },
 ]);

 // Column Definitions: Defines the columns to be displayed.
 const colDefs = ref([
   { field: "make" },
   { field: "model" },
   { field: "price" },
   { field: "electric" }
 ]);

 return {
   rowData,
   colDefs,
 };
},
\`\`\`

**3. Vue Data Grid Component**

Rows and Columns are set as ag-grid-vue component attributes. Styling is applied through the class and style attributes.

\`\`\`js
<template>
 <!-- The AG Grid component -->
 <ag-grid-vue
   :rowData="rowData"
   :columnDefs="colDefs"
   style="height: 500px"
   class="ag-theme-quartz"
 >
 </ag-grid-vue>
</template>
\`\`\`
`;

const quickStartVue3Module = `
**1. Import the Vue Data Grid**

Import the required modules, and register them via the ModuleRegistry.

\`\`\`js
<template></template>

<script>
import { ref } from 'vue';
import "@ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid
import { AgGridVue } from "@ag-grid-community/vue3"; // Vue Data Grid Component

// Default Row Model & Module Registry
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';

// Register the RowModel Module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default {
 name: "App",
 components: {
   AgGridVue, // Add Vue Data Grid component
 },
 setup() {},
};
</script>
\`\`\`

**2. Define Rows and Columns**

\`\`\`js
setup() {
 // Row Data: The data to be displayed.
 const rowData = ref([
   { make: "Tesla", model: "Model Y", price: 64950, electric: true },
   { make: "Ford", model: "F-Series", price: 33850, electric: false },
   { make: "Toyota", model: "Corolla", price: 29600, electric: false },
 ]);

 // Column Definitions: Defines the columns to be displayed.
 const colDefs = ref([
   { field: "make" },
   { field: "model" },
   { field: "price" },
   { field: "electric" }
 ]);

 return {
   rowData,
   colDefs,
 };
},
\`\`\`

**3. Vue Data Grid Component**

Rows and Columns are set as ag-grid-vue component attributes. Styling is applied through the class and style attributes.

\`\`\`js
<template>
 <!-- The AG Grid component -->
 <ag-grid-vue
   :rowData="rowData"
   :columnDefs="colDefs"
   style="height: 500px"
   class="ag-theme-quartz"
 >
 </ag-grid-vue>
</template>
\`\`\`
`;

module.exports = {
    quickStartReact,
    quickStartReactModule,
    quickStartAngular,
    quickStartAngularModule,
    quickStartVue3,
    quickStartVue3Module,
};
