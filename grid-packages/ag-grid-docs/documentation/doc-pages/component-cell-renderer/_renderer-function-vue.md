[[only-vue]]
|## Cell Renderer Function
|
|Instead of using a Vue component, it's possible to use a simple function for a cell renderer.
|
|This is probably most useful if you have a simple String value to render and want to avoid the overhead of an actual Vue
|component.
|
|In the example below we're outputting a simple string value that depends on the cell value:
|
|```js
|<template>
|     <ag-grid-vue :columnDefs="columnDefs" ...other properties>
|     </ag-grid-vue>
|</template>
|
|<script>
|//...other imports
|import {AgGridVue} from "@ag-grid-community/vue";
|
|export default {
|  components: {
|      AgGridVue
|  },
|  data() {
|      return {
|          columnDefs: [
|              {
|                  headerName: "Value",
|                  field: "value",
|                  cellRenderer: params => params.value > 1000 ? "LARGE VALUE" : "SMALL VALUE"
|              }
|          ]
|      }
|  }
|  //...other properties & methods
|}
|</script>
|```
|
|It is also possible to write a JavaScript-based cell renderer function - refer to the [docs here](../../javascript-data-grid/component-cell-renderer/#cell-renderer-function) for more information
