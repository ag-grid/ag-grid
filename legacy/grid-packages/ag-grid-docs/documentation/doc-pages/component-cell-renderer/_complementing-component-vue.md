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
|// define Cell Component to be reused
|const ColourComponent = {
|   template: '&lt;span :style="{color: params.color}">{{params.value}}&lt;/span>'
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
|                  cellRenderer: 'ColourComponent',
|                  cellRendererParams: {
|                       color: 'guinnessBlack'
|                  }
|              },
|              {
|                  headerName: "Colour 2",
|                  field: "value",
|                  cellRenderer: 'ColourComponent',     
|                  cellRendererParams: {
|                       color: 'irishGreen'
|                  }
|              }
|          ]
|      }
|  }
|  //...other properties & methods
|}
|&lt;/script>
</snippet>
</framework-specific-section>