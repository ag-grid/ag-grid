<framework-specific-section frameworks="vue">
|## Cell Renderer Function
|
|Instead of using a Vue component, it's possible to use a simple function for a cell renderer.
|
|This is probably most useful if you have a simple String value to render and want to avoid the overhead of an actual Vue
|component.
|
|In the example below we're outputting a simple string value that depends on the cell value:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|&lt;template>
|     &lt;ag-grid-vue :columnDefs="columnDefs" ...other properties>
|     &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|//...other imports
|import {AgGridVue} from "ag-grid-vue3";
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
|&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|It is also possible to write a JavaScript-based cell renderer function - refer to the [docs here](../../javascript-data-grid/component-cell-renderer/#cell-renderer-function) for more information
</framework-specific-section>
