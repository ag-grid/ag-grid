[[only-vue]]
|
|## Registering Non-Inline Custom Components
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
| To use a component within the grid you will reference components by **case-sensitive**
| name, for example:
|
|```js
|<template>
|   <ag-grid-vue :frameworkComponents="frameworkComponents" ...other properties>
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
|           frameworkComponents: [
|               'cubeComponent': CubeComponent
|           ],          
|           columnDefs: [
|                {
|                   headerName: "Cube",
|                   field: "value",
|                   cellRenderer: 'cubeComponent',     
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|</script>
|```
|### 2. By Direct Reference
|
|```js
|<template>
|   <ag-grid-vue ...other properties>
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
|       AgGridVue,
|   }
|   data() {
|       return {
|           columnDefs: [
|                {
|                   headerName: "Cube",
|                   field: "value",
|                   cellRendererFramework: CubeComponent
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|</script>
