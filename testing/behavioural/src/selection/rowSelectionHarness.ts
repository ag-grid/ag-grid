// Shared setup for the client-side row-selection suites: the grid manager, the flat and grouped fixtures
// every one of them drives, and the hooks. Siblings rather than one file because vitest parallelises across
// files but not within one, so 124 grid-building tests in a single file serialise in one worker.
import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { GridApi, GridOptions, Params } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    PaginationModule,
    QuickFilterModule,
    RowSelectionModule,
    TextEditorModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GROUP_ROW_DATA } from './group-data';
import { GridActions } from './utils';

export const gridMgr = new TestGridsManager({
    modules: [
        RowSelectionModule,
        ClientSideRowModelModule,
        RowGroupingModule,
        PaginationModule,
        QuickFilterModule,
        TextEditorModule,
    ],
});

export const columnDefs = [{ field: 'sport' }];

export const rowData = [
    { sport: 'football' },
    { sport: 'rugby' },
    { sport: 'tennis' },
    { sport: 'cricket' },
    { sport: 'golf' },
    { sport: 'swimming' },
    { sport: 'rowing' },
];

export const groupGridOptions: Partial<GridOptions> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'age' },
        { field: 'year' },
        { field: 'date' },
    ],
    autoGroupColumnDef: {
        headerName: 'Athlete',
        field: 'athlete',
        cellRenderer: 'agGroupCellRenderer',
    },
    rowData: GROUP_ROW_DATA,
    groupDefaultExpanded: -1,
};

export function createGrid(gridOptions: GridOptions, params?: Params): [GridApi, GridActions] {
    const api = gridMgr.createGrid('myGrid', gridOptions, params);
    const actions = new GridActions(api, '#myGrid');
    return [api, actions];
}

export async function createGridAndWait(gridOptions: GridOptions, params?: Params): Promise<[GridApi, GridActions]> {
    const [api, actions] = createGrid(gridOptions, params);

    await waitForEvent('firstDataRendered', api);

    return [api, actions];
}

/** Registers the hooks every sibling suite needs. */
export function setupRowSelectionSuite(): void {
    beforeEach(() => {
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });
}
