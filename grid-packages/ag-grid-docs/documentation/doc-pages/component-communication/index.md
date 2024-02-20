---
title: "Child to Parent Communication"
frameworks: ["angular", "vue"]
---

<framework-specific-section frameworks="angular">
|There are a variety of ways to manage component communication in Angular (shared service,
|local variables etc), but you often need a simple way to let a "parent" component know
|that something has happened on a "child" component. In this case the simplest route is
|to use the Grid's `context` feature to hold a reference to the parent, which the child can
|then access.
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|//...other imports
|import {Component} from '@angular/core';
|import {ICellRendererAngularComp} from 'ag-grid-angular';
|import {CubeComponent} from './cube.component';
|
|@Component({
|   selector: 'app-root',
|   template: `
|       &lt;ag-grid-angular [context]="context" /* ...other properties */>
|       &lt;/ag-grid-angular>
|   `
|})
|export class AppComponent {
|   constructor() {
|       this.context = {
|           componentParent: this
|       }
|   }
|
|   parentMethod() {
|       // do something
|   }
|   //...other properties & methods
|}
|
|@Component({
|   selector: 'cell-renderer',
|   template: `
|       ...component template...
|   `
|})
|export class CellRendererComponent implements ICellRendererAngularComp {
|   params: any;
|   componentParent: any;
|
|   agInit(params) {
|       this.params = params;
|       this.componentParent = this.params.context.componentParent;
|       // the grid component can now be accessed - for example: this.componentParent.parentMethod()
|   }
|
|   //...other properties & methods
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|Note that although we've used `componentParent` as the property name here it can
|be anything - the main point is that you can use the `context` mechanism to share
|information between the components.
|A working example of this can be found in the [Cell Renderer](/component-cell-renderer/#example-dynamic-components) docs.
</framework-specific-section>

<framework-specific-section frameworks="vue">
|There are a variety of ways to manage component communication in Vue (shared service,
|local variables etc), but you often need a simple way to let a "parent" component know
|that something has happened on a "child" component. In this case the simplest route is
|to use the Grid's `context` feature to hold a reference to the parent, which the child can
|then access.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|// Parent Grid Component
|&lt;template>
|   &lt;ag-grid-vue :context="context" ...other properties>
|   &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|//...other imports
|import {AgGridVue} from "ag-grid-vue3";
|import CubeComponent from './CubeComponent.vue';
|
|export default {
|   components: {
|       AgGridVue
|   }
|   data() {
|       return {
|           context: {}
|       }
|   },
|   beforeMount() {
|       this.context = {
|           componentParent: this
|       }
|   },
|   methods: {
|       parentMethod() {
|           // do something
|       }
|   }
|   //...other properties & methods
|}
|&lt;/script>
|
|// Child Grid Component
|&lt;template>
|   &lt;ag-grid-vue ...other properties>
|   &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|//...other imports
|
|export default {
|   methods: {
|       doSomethingOnGrid() {
|           // the grid component can now be accessed via this.params.context.componentParent
|           this.params.context.componentParent.parentMethod()
|       }
|   }
|   //...other properties & methods
|}
|&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|Note that although we've used `componentParent` as the property name here it can
|be anything - the main point is that you can use the `context` mechanism to share
|information between the components.
|
|A working example of this can be found in the [Cell Renderer](/component-cell-renderer/#example-dynamic-components) docs.
</framework-specific-section>