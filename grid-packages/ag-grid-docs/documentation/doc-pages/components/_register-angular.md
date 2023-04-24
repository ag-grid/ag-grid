[[only-angular]]
|
|## Registering Custom Components
|
|There are two ways to register custom components:
|
|- Direct reference.
|- By name.
|
|### 1. By Direct Reference
|
|When registering an Angular Component by reference you simply pass the Component to the place you want it used (i.e. Cell Renderer, Filter etc).
|
|In this example we're specifying that we want our Angular `CubeComponent` as a Cell Renderer in the `Cube` column:
|
|```tsx
|//...other imports
|import { Component } from '@angular/core';
|import { CubeComponent } from './cube.component';
|
|@Component({
|selector: 'app-root',
|template: `
|   <ag-grid-angular [columnDefs]="columnDefs"
|                    ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   columnDefs: [
|       {
|           field: "cube",
|           cellRenderer: CubeComponent,     
|       }
|   ]
|
|   //...other properties & methods
|}
|```
|
|The advantage of referencing Components directly is cleaner code, without the extra level of indirection added when referencing by name.
|
|### 2. By Name
|
|When registering an Angular component by name you need to first register the component within the grid `components` property,
|then reference the component by name where you want it used (i.e. as a Cell Renderer, Filter etc).
|
|In this example we've registered our Angular `CubeComponent` and given it a name of `cubeComponent` (this can be any name you choose).
|We then specify that we want the previously registered `cubeComponent` to be used as a Cell Renderer in the `Cube` column:
|
|```tsx
|//...other imports
|import { Component } from '@angular/core';
|import { CubeComponent } from './cube.component';
|
|@Component({
|selector: 'app-root',
|template: `
|   <ag-grid-angular [columnDefs]="columnDefs" [components]="components"
|                    ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   components = {
|       'cubeComponent': CubeComponent
|   };          
|   columnDefs = [
|       {
|           field: "cube",
|           cellRenderer: 'cubeComponent',     
|       }
|   ]
|
|   //...other properties & methods
|}
|```
|
|The advantage of referencing components by name is definitions (eg Column Definitions) can be composed of simple types (ie JSON), which is useful should you wish to persist Column Definitions.
|
