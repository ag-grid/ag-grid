import {
    DetailGridInfo,
    GridApi,
    GridOptions,
    ICellRendererComp,
    ICellRendererParams,
    createGrid,
} from '@ag-grid-community/core';

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    params!: ICellRendererParams;
    detailGridApi!: GridApi;

    init(params: ICellRendererParams) {
        this.params = params;

        // trick to convert string of HTML into DOM object
        var eTemp = document.createElement('div');
        eTemp.innerHTML = this.getTemplate();
        this.eGui = eTemp.firstElementChild as HTMLElement;

        this.setupDetailGrid();
    }

    setupDetailGrid() {
        var eDetailGrid = this.eGui.querySelector<HTMLElement>('.full-width-grid')!;
        var detailGridOptions: GridOptions = {
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

        var masterGridApi = this.params.api;
        var rowId = this.params.node.id!;

        var gridInfo: DetailGridInfo = {
            id: rowId,
            api: this.detailGridApi,
        };

        console.log('adding detail grid info with id: ', rowId);
        masterGridApi.addDetailGridInfo(rowId, gridInfo);
    }

    getTemplate() {
        var data = this.params.data;
        // Application logic to match parent theme for this Example
        const themeClass: string =
            'full-width-grid ' + (document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz');
        var template =
            '<div class="full-width-panel">' +
            '  <div class="full-width-details">' +
            '    <div class="full-width-detail"><b>Name: </b>' +
            data.name +
            '</div>' +
            '    <div class="full-width-detail"><b>Account: </b>' +
            data.account +
            '</div>' +
            '  </div>' +
            `  <div class="${themeClass}"></div>` +
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
        var rowId = this.params.node.id!;
        console.log('removing Grid Info with id: ' + rowId);
        var masterGridApi = this.params.api;
        masterGridApi.removeDetailGridInfo(rowId);

        console.log('destroying detail grid');
        this.detailGridApi.destroy();
    }
}
