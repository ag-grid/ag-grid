[[only-vue]]
|## Mixing JavaScript and Vue
|When providing Custom Components have a choice of the following:
|
|1. Provide an AG Grid component in JavaScript.
|1. Provide an AG Grid component as an Vue Component.
|
|For example if you want to build a cell renderer you have the choice to build the cell renderer using either Vue or using plain JavaScript.
|
|The following code snippet shows how both JavaScript and Vue Components can be used at the same time:
|
|```js
|<template>
|   <ag-grid-vue :components="components" 
|                :frameworkComponents="frameworkComponents" 
|                ...other properties>
|   </ag-grid-vue>
|</template>
|
|<script>
|//...other imports
|import {AgGridVue} from "@ag-grid-community/vue";
|import JavascriptComponent from './JavascriptComponent.js';
|import VueComponent from './VueComponent.vue';
|
|export default {
|   components: {
|       AgGridVue,
|       // Vue components are registered here
|       'vueComponent': VueComponent
|   }
|   data() {
|       return {
|           // JavaScript components are registered here
|           components: [
|               // declare the javascript component
|               'javascriptComponent': JavascriptComponent
|           ],          
|           columnDefs: [
|                {
|                   headerName: "JS Cell",
|                   field: "value",
|                   cellRenderer: 'javascriptComponent',    // reference/use the javascript component
|               },
|               {
|                   headerName: "Vue Cell",
|                   field: "value",
|                   cellRendererFramework: 'vueComponent',  // reference/use the Vue component
|               }
|           ]
|       }
|   }
|   //...other properties & methods
|}
|</script>
|```
|Change the documentation view to <a href='../../javascript-grid/components/'>JavaScript</a> to see how to create a plain JavaScript component.
