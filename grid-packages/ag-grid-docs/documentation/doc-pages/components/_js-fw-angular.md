[[only-angular]]
|## Mixing JavaScript and Angular
|
|When providing Custom Components you have a choice of the following:
|1. Provide an AG Grid component as an Angular Component.
|1. Provide an AG Grid component in JavaScript.
|
|When referencing Angular components directly, use `xxxFramework` (eg `cellRendererFramework = MyAngularComp`).
|
|When referencing JavaScript components directly, use `xxx` (eg `cellRenderer = MyJsComp`).
|
|When looking up JavaScript or Angular components, use `xxx` (eg `cellRenderer = 'myCompName'`) for both.
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
|   <ag-grid-angular [components]="components" [frameworkComponents]="frameworkComponents" 
|                    ...other properties>
|   </ag-grid-angular>
|`
|})
|export class AppComponent {
|   // js components
|   components: [
|       'javascriptComponent': JavascriptComponent
|   ];
|   // Angular components
|   frameworkComponents: [
|       'angularComponent': AngularComponent
|   ];
|   columnDefs: [
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: 'javascriptComponent', // use JS comp by Name
|       },
|       {
|           headerName: "JS Cell",
|           field: "value",
|           cellRenderer: JavascriptComponent, // use JS comp by Direct Reference
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRenderer: 'angularComponent', // use Angular comp by Name
|       },
|       {
|           headerName: "Angular Cell",
|           field: "value",
|           cellRendererFramework: AngularComponent, // use Angular comp by Direct Reference
|       }
|   ];
|
|   //...other properties & methods
|}
|```
|

