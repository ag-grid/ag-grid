---
title: "Components"
frameworks: ["angular", "vue"]
---

[[only-angular]]
| If you are using the Angular component version of the grid, it is then possible to customise the 
| internals of the grid with Angular components. For example you can use a component to customise 
| the contents of a cell.
| 
| In order for ag-Grid to be able to use your Angular components, you need to provide them in 
| the **top level** module:
| 
| ```jsx
| @NgModule({
|     imports: [
|         BrowserModule,
|         FormsModule,
|         RouterModule.forRoot(appRoutes),
|         AgGridModule.withComponents(
|             [
|                 SquareComponent,
|                 CubeComponent,
|                 // ...other components
| ```
| 
| You can then use these components as editors, renderers or filters. For example, to use an Angular 
| Component as a Cell Renderer, you would do the following:
| 
| ```js
| let colDefs = [
|     {
|         headerName: "Square Component",
|         field: "value",
|         cellRendererFramework: SquareComponent,
|         editable:true,
|         colId: "square",
|         width: 175
|     },
|     ...other column definitions
| ]
| ```
| Please see the relevant sections on 
| <a href="../component-cell-renderer/">cell renderers</a>, 
| <a href="../cell-editing/">cell editors</a> and 
| <a href="../filtering/">filters</a> 
| for configuring and using Angular components in ag-Grid.</p> 
| 
| The example has ag-Grid configured through the template in the following ways:
| 
| ```jsx
| // notice the grid has an id called agGrid, which can be used to call the API
| <ag-grid-angular #agGrid style="width: 100%; height: 350px;" class="ag-theme-alpine"
| 
|     // items bound to properties on the controller
|     [gridOptions]="gridOptions"
|     [columnDefs]="columnDefs"
|     [showToolPanel]="showToolPanel"
|     [rowData]="rowData"
| 
|     // boolean values 'turned on'
|     animateRows
|     pagination
| 
|     // simple values, not bound
|     rowHeight="22"
|     rowSelection="multiple"
| 
|     // event callbacks
|     (modelUpdated)="onModelUpdated()"
|     (cellClicked)="onCellClicked($event)"
|     (cellDoubleClicked)="onCellDoubleClicked($event)">
| 
| </ag-grid-angular>
| ```
| 
| The above is all you need to get started using ag-Grid in a Angular application. Now would 
| be a good time to try it in a simple app and get some data displaying and practice with 
| some of the grid settings before moving onto the advanced features of cellRendering 
| and custom filtering.
| 
| ### Child to Parent Communication
| 
| There are a variety of ways to manage component communication in Angular (shared service, 
| local variables etc), but you often need a simple way to let a "parent" component know 
| that something has happened on a "child" component. In this case the simplest route is 
| to use the `gridOptions.context` to hold a reference to the parent, which the child can 
| then access.
| 
| ```jsx
| // in the parent component - the component that hosts ag-grid-angular and specifies which angular components to use in the | grid
| constructor() {
|     this.gridOptions = <GridOptions>{
|         context: {
|             componentParent: this
|         }
|     };
|     this.gridOptions.rowData = this.createRowData();
|     this.gridOptions.columnDefs = this.createColumnDefs();
| }
| 
| // in the child component - the angular components created dynamically in the grid
| // the parent component can then be accessed as follows:
| this.params.context.componentParent
| ```
| 
| Note that although we've used `componentParent` as the property name here it can 
| be anything - the main point is that you can use the `context` mechanism to share 
| information between the components.
| 
| The _"A Simple Example, using CellRenderers created from Angular Components"_ above illustrates 
| this in the Child/Parent column:
| 
| - <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/dynamic-component-example/dynamic.component.ts" target="_blank"><i class="fa fa-external-link-alt"></i> Parent Component</a>
| - <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/dynamic-component-example/child-message.component.ts" target="_blank"><i class="fa fa-external-link-alt"></i> Child Component</a>

[[only-vue]]
| VueJS components can be defined as either simple inline components, or as full/complex 
| externalised ones (i.e in a separate file).
| 
| ### Simple, Inline Components
| 
| ```js
| components: {
| 'CubeComponent': {
|     template: '<span>{{ valueCubed() }}</span>',
|     methods: {
|         valueCubed() {
|             return this.params.value * this.params.value * this.params.value;
|         }
|     }
| },
| ParamsComponent: {
|     template: '<span>Field: {{params.colDef.field}}, Value: {{params.value}}</span>',
|     methods: {
|         valueCubed() {
|             return this.params.value * this.params.value * this.params.value;
|         }
|     }
| }
| ```
| 
| Note here that we can define the property name either quoted or not but note that in 
| order to reference these components in your column definitions you'll need to provide 
| them as **case-sensitive** strings.
| 
| ### Simple, Locally Declared Components
| 
| ```js
| let SquareComponent = {
|     template: '<span>{{ valueSquared() }}</span>',
|     methods: {
|         valueSquared() {
|             return this.params.value * this.params.value;
|         }
|     }
| };
| ```
| 
| ### External .js Components
| 
| ```js
| // SquareComponent.js
| export default {
|     template: '<span>{{ valueSquared() }}</span>',
|     methods: {
|         valueSquared() {
|             return this.params.value * this.params.value;
|         }
|     }
| };
| 
| // MyGridApp.vue (your Component holding the ag-Grid component)
| import SquareComponent from './SquareComponent'
| ```
| 
| ### More Complex, Externalised Single File Components (.vue)
| 
| ```jsx
| <template>
|     <span class="currency"><span ng-non-bindable>{{</span> params.value | currency('EUR') }}</span>
| </template>
| 
| <script>
| export default {
|     filters: {
|         currency(value, symbol) {
|             let result = value;
|             if (!isNaN(value)) {
|                 result = value.toFixed(2);
|             }
|             return symbol ? symbol + result : result;
|         }
|     }
| };
| </script>
| 
| <style scoped>
|     .currency {
|         color: blue;
|     }
| </style>
| ```
| 
| For non-inline components you need to provide them to Vue via the `components` property:
| 
| ```js
| components: {
|     AgGridVue,
|     SquareComponent
| }
| ```
| 
| Note that in this case the component name will match the actual reference, but you can 
| specify a different one if you choose:
| 
| ```js
| components: {
|     AgGridVue,
|     'MySquareComponent': SquareComponent
| }
| ```
| 
| In either case the name you use will be used to reference the component 
| within the grid (see below).
| 
| ### Referencing VueJS Components for use in ag-Grid
| 
| Having defined your component, you can now reference them in your column definitions.
| 
| To use a component within the grid you will reference components by **case-sensitive** 
| name, for example:
| 
| ```js
| // defined as a quoted string above: 'CubeComponent'
| {
|     headerName: "Cube",
|     field: "value",
|     cellRendererFramework: 'CubeComponent',
|     colId: "cube",
|     width: 125
| },
| // defined as a value above: ParamsComponent
| {
|     headerName: "Row Params",
|     field: "row",
|     cellRendererFramework: 'ParamsComponent',
|     colId: "params",
|     width: 245
| }
| ```
| 
| Please see the relevant sections on 
| <a href="../component-cell-renderer/">cell renderers</a>, 
| <a href="../cell-editing/">cell editors</a> and 
| <a href="../filtering/">filters</a> for configuring and using 
| VueJS Components in ag-Grid.
| 
| ## Child to Parent Communication
| 
| There are a variety of ways to manage component communication in Vue (shared service, 
| local variables etc), but you often need a simple way to let a "parent" component know 
| that something has happened on a "child" component. In this case the simplest route is 
| to use the `gridOptions.context` to hold a reference to the parent, which the child can 
| then access.
| 
| ```js
| // in the parent component - the component that hosts ag-grid-angular and specifies which angular components to use in the | grid
| beforeMount() {
|     this.gridOptions = {
|         context: {
|             componentParent: this
|         }
|     };
|     this.createRowData();
|     this.createColumnDefs();
| },
| 
| // in the child component - the Vue components created dynamically in the grid
| // the parent component can then be accessed as follows:
| this.params.context.componentParent
| ```
| 
| Note that although we've used `componentParent` as the property name here it can 
| be anything - the main point is that you can use the `context` mechanism to share 
| information between the components.

