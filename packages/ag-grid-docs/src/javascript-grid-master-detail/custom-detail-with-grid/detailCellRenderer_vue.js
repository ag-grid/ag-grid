import Vue from "vue";
import {AgGridVue} from "ag-grid-vue";

export default Vue.extend({
    template: `
        <div class="full-width-panel">
            <div class="full-width-details">
                <div class="full-width-detail"><b>Name: </b>{{params.data.name}}</div>
                <div class="full-width-detail"><b>Account: </b>{{params.data.account}}</div>
             </div>
             <ag-grid-vue style="width: 100%; height: 100%;"
                 class="full-width-grid"
                 :gridOptions="gridOptions"
                 :columnDefs="colDefs"
                 :rowData="rowData"
                 :gridReady="onGridReady">
            </ag-grid-vue>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue
    },
    data: function () {
        return {
            gridOptions: null,
            colDefs: null,
            rowData: null
        };
    },
    beforeMount() {
        this.gridOptions = {debug: true};
        this.colDefs = [
            {field: 'callId'},
            {field: 'direction'},
            {field: 'number'},
            {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
            {field: 'switchCode'}
        ];
    },
    mounted() {
        this.rowData = this.params.data.callRecords;
        this.rowIndex = this.params.rowIndex;
        this.masterGridApi = this.params.api;
    },
    beforeDestroy() {
      let detailGridId = "detail_" + this.rowIndex;

      // ag-Grid is automatically destroyed

      console.log("removing detail grid info with id: ", detailGridId);
      this.masterGridApi.removeDetailGridInfo(detailGridId);
    },
    methods: {
      onGridReady(params) {
        let detailGridId = "detail_" + this.rowIndex;

        let gridInfo = {
          id: detailGridId,
          api: params.api,
          columnApi: params.columnApi
        };

        console.log("adding detail grid info with id: ", detailGridId);
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
      }
    }
});