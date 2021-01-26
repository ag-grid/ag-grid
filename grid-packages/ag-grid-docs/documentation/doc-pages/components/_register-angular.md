[[only-angular]]
|
|## Registering Custom Components
|
|The pages for each component type (cell renderer, cell editor etc) contain examples on how to register and use each component type.
|It is however useful here to step back and focus on the component registration process which is common across all component types.
|
|There are two ways to register custom components:
|
|- By name.
|- Direct reference.
|
|Both options are fully supported by the grid, however registering by name is ag-Grid's preferred options as it's more flexible.
|All of the examples in the documentation use this approach.
|The direct reference approach is kept for backwards compatibility reasons as this was the original way to do it in ag-Grid.
|
|### 1. By Name
|
| To use an Angular component within the grid you will reference components by name, for example:
|
|```tsx
|//...other imports
|import {Component} from '@angular/core';
|import CubeComponent from './CubeComponent';
|
|@Component({
|selector: 'app-root',
|template: `
|   <ag-grid-angular [frameworkComponents]="frameworkComponents" ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   frameworkComponents: [
|       'cubeComponent': CubeComponent
|   ];          
|   columnDefs: [
|       {
|           headerName: "Cube",
|           field: "value",
|           cellRenderer: 'cubeComponent',     
|       }
|   ]
|
|   //...other properties & methods
|}
|```
|### 2. By Direct Reference
|
|```tsx
|//...other imports
|import {Component} from '@angular/core';
|import CubeComponent from './CubeComponent';
|
|@Component({
|selector: 'app-root',
|template: `
|   <ag-grid-angular ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   columnDefs: [
|       {
|           headerName: "Cube",
|           field: "value",
|           cellRendererFramework: CubeComponent,     
|       }
|   ]
|
|   //...other properties & methods
|}
|```
