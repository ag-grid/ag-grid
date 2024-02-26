<framework-specific-section frameworks="vue">
|## Cell Component Function
|
|Instead of using a Vue component, it's possible to use a function for a Cell Component.
|
|This is useful if you have a String value to render and want to avoid the overhead of a Vue component.
|
|In the example below we're outputting a string value that depends on the cell value:
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
|  //...
|}
|&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|It is also possible to write a JavaScript-based Cell Component - refer to the [docs here](../../javascript-data-grid/component-cell-renderer/#cell-renderer-function) for more information
</framework-specific-section>
