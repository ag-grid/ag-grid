[[only-vue]]
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
|// define cellRenderer to be reused
|const ColourComponent = {
|   template: '<span :style="{color: params.color}">{{params.value}}</span>'
|};
|
|export default {
|  components: {
|      AgGridVue,
|      ColourComponent
|  },
|  data() {
|      return {
|          columnDefs: [
|              {
|                  headerName: "Colour 1",
|                  field: "value",
|                  cellRendererComp: 'ColourComponent',
|                  cellRendererCompParams: {
|                       color: 'guinnessBlack'
|                  }
|              },
|              {
|                  headerName: "Colour 2",
|                  field: "value",
|                  cellRendererComp: 'ColourComponent',     
|                  cellRendererCompParams: {
|                       color: 'irishGreen'
|                  }
|              }
|          ]
|      }
|  }
|  //...other properties & methods
|}
|</script>
|
|```
