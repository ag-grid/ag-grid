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
|// define cell editor to be used
|const MyCellEditor = ...cell editor definition...
|
|export default {
|  components: {
|      AgGridVue,
|      MyCellEditor
|  },
|  data() {
|      return {
|          columnDefs: [
|              {
|                  headerName: "Value Column",
|                  field: "value",
|                  cellEditor: 'MyCellEditor',
|                  cellEditorParams: {
|                       // make "country" value available to cell editor
|                       country: 'Ireland'
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
