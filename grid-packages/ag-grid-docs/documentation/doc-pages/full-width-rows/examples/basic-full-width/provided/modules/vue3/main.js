import { createApp } from 'vue';
import { AgGridVue } from '@ag-grid-community/vue3';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

const VueExample = {
    template: `
      <div style="height: 100%">
      <ag-grid-vue
          style="width: 100%; height: 100%;"
          class="ag-theme-alpine"
          id="myGrid"
          :gridOptions="gridOptions"
          :rowData="rowData"
          :pinnedTopRowData="pinnedTopRowData"
          :pinnedBottomRowData="pinnedBottomRowData"
          :columnDefs="columnDefs"
          :isFullWidthCell="isFullWidthCell"
          :fullWidthCellRenderer="fullWidthCellRenderer"
          :getRowHeight="getRowHeight"
          :modules="modules"></ag-grid-vue>
      </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    data: function () {
        return {
            gridOptions: null,
            gridApi: null,
            columnApi: null,
            rowData: null,
            pinnedTopRowData: null,
            pinnedBottomRowData: null,
            columnDefs: null,
            isFullWidthCell: null,
            fullWidthCellRenderer: null,
            getRowHeight: null,
            modules: [ClientSideRowModelModule]
        };
    },
    beforeMount() {
        this.gridOptions = {};
        this.rowData = this.createData(100, 'body');
        this.pinnedTopRowData = this.createData(3, 'pinned');
        this.pinnedBottomRowData = this.createData(3, 'pinned');
        this.columnDefs = this.getColumnDefs();
        this.isFullWidthCell = (rowNode) => {
            return rowNode.data.fullWidth;
        };
        this.fullWidthCellRenderer = (params) => {
            let cssClass;
            let message;
            if (params.node.rowPinned) {
                cssClass = 'example-full-width-pinned-row';
                message = 'Pinned full width row at index ' + params.rowIndex;
            } else {
                cssClass = 'example-full-width-row';
                message = 'Normal full width row at index' + params.rowIndex;
            }
            const eDiv = document.createElement('div');
            eDiv.innerHTML =
                '<div class="' +
                cssClass +
                '"><button>Click</button> ' +
                message +
                '</div>';
            const eButton = eDiv.querySelector('button');
            eButton.addEventListener('click', function () {
                alert('button clicked');
            });
            return eDiv.firstChild;
        };
        this.getRowHeight = (params) => {
            const isBodyRow = params.node.rowPinned === undefined;
            const isFullWidth = params.node.data.fullWidth;
            if (isBodyRow && isFullWidth) {
                return 75;
            }
        };
    },
    mounted() {
        this.gridApi = this.gridOptions.api;
        this.gridColumnApi = this.gridOptions.columnApi;
    },
    methods: {
        createData(count, prefix) {
            const rowData = [];
            for (let i = 0; i < count; i++) {
                const item = {};
                item.fullWidth = i % 3 === 2;
                this.alphabet().forEach(function (letter) {
                    item[letter] = prefix + ' (' + letter + ',' + i + ')';
                });
                rowData.push(item);
            }
            return rowData;
        },
        getColumnDefs() {
            const columnDefs = [];
            this.alphabet().forEach(function (letter) {
                const colDef = {
                    headerName: letter,
                    field: letter,
                    width: 150,
                };
                if (letter === 'A') {
                    colDef.pinned = 'left';
                }
                if (letter === 'Z') {
                    colDef.pinned = 'right';
                }
                columnDefs.push(colDef);
            });
            return columnDefs;
        },
        alphabet() {
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        }
    },
};

createApp(VueExample)
    .mount("#app")

