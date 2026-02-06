import type { FirstDataRenderedEvent, GridApi, GridOptions, IDetailCellRendererParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

export class DetailCellRenderer {
    eGui: HTMLDivElement | undefined;

    init() {
        this.eGui = document.createElement('div');
        //additional content shown in detail
        const panel = document.createElement('div');

        // Notice: the height is set
        panel.style = 'height:100px; background-color:lightblue; padding: 15px; font-weight: bold; ';
        panel.innerText = 'Optional element content';

        // button to toggle optional content visibility
        const btn = document.createElement('button');
        btn.innerText = 'Show Optional Element';

        btn.style = 'margin:10px';
        btn.addEventListener('click', function (p: any) {
            //add your own condition here based on application logic - this only checks the number of children shown
            if (p.target.parentElement.children.length === 1) {
                p.target.parentElement.appendChild(panel);
                p.target.innerText = 'Hide Optional Element';
            } else {
                p.target.parentElement.removeChild(panel);
                p.target.innerText = 'Show Optional Element';
            }
        });

        this.eGui.appendChild(btn);
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}

ModuleRegistry.registerModules([
    RowApiModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IAccount>;

const gridOptions: GridOptions<IAccount> = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
    ],
    defaultColDef: {
        flex: 1,
    },
    masterDetail: true,
    detailRowAutoHeight: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 },
            ],
            defaultColDef: {
                flex: 1,
            },
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.callRecords);
        },
    } as IDetailCellRendererParams<IAccount, ICallRecord>,
    onFirstDataRendered: onFirstDataRendered,

    detailCellRenderer: DetailCellRenderer,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    // arbitrarily expand a row for presentational purposes
    setTimeout(() => {
        params.api.getDisplayedRowAtIndex(1)!.setExpanded(true);
    }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then((response) => response.json())
        .then((data: IAccount[]) => {
            gridApi!.setGridOption('rowData', data);
        });
});
