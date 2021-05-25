[[only-angular]]
|## Mixing JavaScript and Angular
|When providing Custom Components have a choice of the following:
|
|1. Provide an AG Grid component in JavaScript.
|1. Provide an AG Grid component as an Angular Component.
|
|For example if you want to build a cell renderer you have the choice to build the cell renderer using either Angular or using plain JavaScript.
|
|The following code snippet shows how both JavaScript and Angular Components can be used at the same time:
|
|```tsx
|//...other imports
|import {Component} from '@angular/core';
|import JavascriptComponent from './JavascriptComponent.js';
|import AngularComponent from './AngularComponent';
|
|@Component({
|selector: 'app-root',
|template: `
|   <ag-grid-angular [components]="components" 
|                    [frameworkComponents]="frameworkComponents" 
|                    ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   // JavaScript components are registered here
|   components: [
|       'javascriptComponent': JavascriptComponent
|   ];          
|   // Angular components are registered here
|   frameworkComponents: [
|       'angularComponent': AngularComponent
|   ];          
|   columnDefs: [
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: 'javascriptComponent',        // reference/use the javascript component
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRenderer: 'angularComponent',           // reference/use the Angular component
|       }
|   ]
|
|   //...other properties & methods
|}
|```
|Change the documentation view to <a href='../../javascript-grid/components/'>JavaScript</a> to see how to create a plain JavaScript component.
