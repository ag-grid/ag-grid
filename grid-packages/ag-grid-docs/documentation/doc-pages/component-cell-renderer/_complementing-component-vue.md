[[only-vue]]
|## Complementing Cell Renderer Params
|
|On top of the parameters provided by the grid, you can also provide your own parameters. This is useful if you want to 
|'configure' your cell renderer. For example, you might have a cell renderer for formatting currency but you need to 
|provide what currency for your cell renderer to use.
|
|Provide params to a cell renderer using the colDef option `cellRendererParams`.
|
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
|                  cellRendererFramework: 'ColourComponent',
|                  cellRendererParams: {
|                       color: 'guinnessBlack'
|                  }
|              },
|              {
|                  headerName: "Colour 2",
|                  field: "value",
|                  cellRendererFramework: 'ColourComponent',     
|                  cellRendererParams: {
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
