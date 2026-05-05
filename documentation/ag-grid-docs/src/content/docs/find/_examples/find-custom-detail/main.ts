import type {
    FindDetailCellRendererParams,
    FirstDataRenderedEvent,
    GetFindMatchesParams,
    GridApi,
    GridOptions,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, MasterDetailModule, ToolbarModule } from 'ag-grid-enterprise';

import { DetailCellRenderer } from './detailCellRenderer';

ModuleRegistry.registerModules([
    FindModule,
    ToolbarModule,
    ClientSideRowModelModule,
    MasterDetailModule,
    RowApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
    ],
    masterDetail: true,
    detailCellRenderer: DetailCellRenderer,
    detailCellRendererParams: {
        getFindMatches: (params: GetFindMatchesParams) => {
            return params.getMatchesForValue('My Custom Detail');
        },
    } as FindDetailCellRendererParams,
    detailRowHeight: 100,
    toolbar: {
        items: ['agFindToolbarItem'],
    },
    findOptions: {
        searchDetail: true,
    },
    onFirstDataRendered: (event: FirstDataRenderedEvent) => {
        event.api.getDisplayedRowAtIndex(0)?.setExpanded(true);
    },
};

function goToFind() {
    const num = Number((document.getElementById('find-goto') as HTMLInputElement).value);
    if (isNaN(num) || num < 0) {
        return;
    }
    gridApi!.findGoTo(num);
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then((response) => response.json())
        .then((data: IAccount[]) => gridApi!.setGridOption('rowData', data));
});
