import type { DetailGridInfo, GridApi, GridOptions, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    params!: ICellRendererParams;
    detailGridApi!: GridApi;

    init(params: ICellRendererParams) {
        this.params = params;

        // trick to convert string of HTML into DOM object
        const eTemp = document.createElement('div');
        eTemp.innerHTML = this.getTemplate();
        this.eGui = eTemp.firstElementChild as HTMLElement;

        this.setupDetailGrid();
    }

    setupDetailGrid() {
        const eDetailGrid = this.eGui.querySelector<HTMLElement>('.full-width-grid')!;
        const detailGridOptions: GridOptions = {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number' },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode' },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 120,
            },
            rowData: this.params.data.callRecords,
        };

        this.detailGridApi = createGrid(eDetailGrid, detailGridOptions);

        const masterGridApi = this.params.api;
        const rowId = this.params.node.id!;

        const gridInfo: DetailGridInfo = {
            id: rowId,
            api: this.detailGridApi,
        };

        console.log('adding detail grid info with id: ', rowId);
        masterGridApi.addDetailGridInfo(rowId, gridInfo);
    }

    getTemplate() {
        const data = this.params.data;
        const template =
            '<div class="full-width-panel">' +
            '  <div class="full-width-details">' +
            '    <div class="full-width-detail"><b>Name: </b>' +
            data.name +
            '</div>' +
            '    <div class="full-width-detail"><b>Account: </b>' +
            data.account +
            '</div>' +
            '  </div>' +
            `  <div class="full-width-grid"></div>` +
            '</div>';

        return template;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    destroy() {
        const rowId = this.params.node.id!;
        console.log('removing Grid Info with id: ' + rowId);
        const masterGridApi = this.params.api;
        masterGridApi.removeDetailGridInfo(rowId);

        console.log('destroying detail grid');
        this.detailGridApi.destroy();
    }
}
