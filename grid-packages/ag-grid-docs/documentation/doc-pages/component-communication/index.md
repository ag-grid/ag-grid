---
title: "Child to Parent Communication"
frameworks: ["angular", "vue"]
---

[[only-angular]]
|There are a variety of ways to manage component communication in Angular (shared service,
|local variables etc), but you often need a simple way to let a "parent" component know
|that something has happened on a "child" component. In this case the simplest route is
|to use the Grid's `context` feature to hold a reference to the parent, which the child can
|then access.
|
|```tsx
|//...other imports
|import {Component} from '@angular/core';
|import {ICellRendererAngularComp} from '@ag-grid-community/angular';
|import {CubeComponent} from './cube.component';
|
|@Component({
|   selector: 'app-root',
|   template: `
|       <ag-grid-angular [context]="context" ...other properties>
|       </ag-grid-angular>
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
|```
|Note that although we've used `componentParent` as the property name here it can
|be anything - the main point is that you can use the `context` mechanism to share
|information between the components.
|A working example of this can be found in the [Cell Renderer](/component-cell-renderer/#example-dynamic-components) docs.

[[only-vue]]
|There are a variety of ways to manage component communication in Vue (shared service,
|local variables etc), but you often need a simple way to let a "parent" component know
|that something has happened on a "child" component. In this case the simplest route is
|to use the Grid's `context` feature to hold a reference to the parent, which the child can
|then access.
|
|```js
|// Parent Grid Component
|<template>
|   <ag-grid-vue :context="context" ...other properties>
|   </ag-grid-vue>
|</template>
|
|<script>
|//...other imports
|import {AgGridVue} from "@ag-grid-community/vue";
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
|</script>
|
|// Child Grid Component
|<template>
|   <ag-grid-vue ...other properties>
|   </ag-grid-vue>
|</template>
|
|<script>
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
|</script>
|```
|Note that although we've used `componentParent` as the property name here it can
|be anything - the main point is that you can use the `context` mechanism to share
|information between the components.
|
|A working example of this can be found in the [Cell Renderer](/component-cell-renderer/#example-dynamic-components) docs.
