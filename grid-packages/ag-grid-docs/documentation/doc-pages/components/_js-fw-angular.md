[[only-angular]]
|## Mixing JavaScript and Angular
|When providing Custom Components you have a choice of the following:
|
|1. Provide an AG Grid component as an Angular Component.
|1. Provide an AG Grid component in JavaScript.
|
|For example if you want to build a Cell Renderer you have the choice to build it using either Angular or using plain JavaScript.
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
|   <ag-grid-angular [comps]="comps" 
|                    ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   // All components registered together
|   comps: [
|       'javascriptComponent': JavascriptComponent
|       'angularComponent': AngularComponent
|   ];
|   columnDefs: [
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRendererComp: 'javascriptComponent', // use JS comp by Name
|       },
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRendererComp: JavascriptComponent, // use JS comp by Direct Reference
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRendererComp: 'angularComponent', // use Angular comp by Name
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRendererComp: AngularComponent, // use Angular comp by Direct Reference
|       }
|   ];
|
|   //...other properties & methods
|}
|```
|

