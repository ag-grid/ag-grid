<framework-specific-section frameworks="angular">
|## Component Lifecycle Hook agInit
</framework-specific-section>

<framework-specific-section frameworks="angular">
<p>Each custom Angular component must implement the <code>agInit(params)</code> lifecycle hook. AgInit is called by AG Grid before any of the <a href="https://angular.io/guide/lifecycle-hooks#lifecycle-hooks">Angular Lifecycle hooks</a>, including <code>ngOnInit</code>. This order is deterministic and applies to all component types.</p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|## Mixing JavaScript and Angular
|
|When providing Custom Components you have a choice of the following:
|1. Provide an AG Grid component as an Angular Component.
|1. Provide an AG Grid component in JavaScript.
|
|The following code snippet shows how both JavaScript and Angular Components can be used at the same time:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|//...other imports
|import { Component } from '@angular/core';
|import JavascriptComponent from './JavascriptComponent.js';
|import { AngularComponent }  from './angular.component';
|
|@Component({
|selector: 'app-root',
|template: `
|   &lt;ag-grid-angular [columnDefs]="columnDefs" [components]="components"
|                    ...other properties>
|   &lt;/ag-grid-angular>
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
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<warning>
 Javascript components are run outside of NgZone. If they initiate calls into your Angular application you may need to wrap these calls within `ngZone.run()` for Change Detection to correctly run.
</warning>
</framework-specific-section>