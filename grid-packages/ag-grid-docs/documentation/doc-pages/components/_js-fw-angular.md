[[only-angular]]
|## Component Lifecyle Hook agInit
|
|Each custom Angular component must implement the `agInit(params)` lifecyle hook. AgInit is called by AG Grid before any of the [Angular Lifecyle hooks](https://angular.io/guide/lifecycle-hooks#lifecycle-hooks), including `ngOnInit`. This order is deterministic and applies to all component types.
|
|## Mixing JavaScript and Angular
|
|When providing Custom Components you have a choice of the following:
|1. Provide an AG Grid component as an Angular Component.
|1. Provide an AG Grid component in JavaScript.
|
|The following code snippet shows how both JavaScript and Angular Components can be used at the same time:
|
|```tsx
|//...other imports
|import { Component } from '@angular/core';
|import JavascriptComponent from './JavascriptComponent.js';
|import { AngularComponent }  from './angular.component';
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
|   // JS and Angular components, only need register if looking up by name
|   components = {
|       'javascriptComponent': JavascriptComponent,
|       'angularComponent': AngularComponent
|   };
|   columnDefs = [
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: 'javascriptComponent', // JS comp by Name
|       },
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: JavascriptComponent, // JS comp by Direct Reference
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRenderer: 'angularComponent', // Angular comp by Name
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRenderer: AngularComponent, // Angular comp by Direct Reference
|       }
|   ];
|
|   //...other properties & methods
|}
|```
|

