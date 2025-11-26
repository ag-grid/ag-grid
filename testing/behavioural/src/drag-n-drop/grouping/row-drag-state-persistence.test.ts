import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import type { GridApi, GridOptions, GridState, StateUpdatedEvent } from 'ag-grid-community';
import {
    BatchEditModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SideBarModule,
} from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout, waitForEvent } from '../../test-utils';

interface AthleteRow {
    id: string;
    athlete: string;
    age: number;
    region: string;
    country: string;
    year: number;
    date: string;
    total: number;
}

const BASE_ROW_DATA: AthleteRow[] = [
    {
        id: 'r-usa-08',
        athlete: 'Michael Phelps',
        age: 23,
        region: 'Americas',
        country: 'United States',
        year: 2008,
        date: '2008-08-24',
        total: 8,
    },
    {
        id: 'r-usa-12',
        athlete: 'Missy Franklin',
        age: 17,
        region: 'Americas',
        country: 'United States',
        year: 2012,
        date: '2012-08-12',
        total: 5,
    },
    {
        id: 'r-can-12',
        athlete: 'Penny Oleksiak',
        age: 16,
        region: 'Americas',
        country: 'Canada',
        year: 2012,
        date: '2012-08-12',
        total: 1,
    },
    {
        id: 'r-can-16',
        athlete: 'Andre De Grasse',
        age: 21,
        region: 'Americas',
        country: 'Canada',
        year: 2016,
        date: '2016-08-20',
        total: 3,
    },
    {
        id: 'r-fra-08',
        athlete: 'Alain Bernard',
        age: 25,
        region: 'Europe',
        country: 'France',
        year: 2008,
        date: '2008-08-24',
        total: 1,
    },
    {
        id: 'r-fra-12',
        athlete: 'Camille Muffat',
        age: 22,
        region: 'Europe',
        country: 'France',
        year: 2012,
        date: '2012-08-12',
        total: 3,
    },
    {
        id: 'r-ger-12',
        athlete: 'Paul Biedermann',
        age: 26,
        region: 'Europe',
        country: 'Germany',
        year: 2012,
        date: '2012-08-12',
        total: 1,
    },
];

const cloneRowData = (rows: AthleteRow[] = BASE_ROW_DATA) => rows.map((row) => ({ ...row }));

const collectRowData = (api: GridApi<AthleteRow>): AthleteRow[] => {
    const result: AthleteRow[] = [];
    api.forEachNode((node) => {
        if (!node.group && node.data) {
            result.push({ ...node.data });
        }
    });
    return result;
};

type StateUpdatedCallback = (event: StateUpdatedEvent<AthleteRow>) => void;

const createGridOptions = (
    rowData: AthleteRow[] = cloneRowData(),
    initialState?: GridState,
    stateUpdated?: StateUpdatedCallback
): GridOptions<AthleteRow> => ({
    columnDefs: [
        { field: 'region', rowGroup: true, editable: true, hide: true },
        { field: 'country', rowGroup: true, editable: true, hide: true },
        { field: 'year', rowGroup: true, editable: true, hide: true },
        { field: 'athlete', minWidth: 150 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
    },
    autoGroupColumnDef: {
        headerName: 'Hierarchy',
        minWidth: 220,
        rowDrag: true,
    },
    animateRows: true,
    rowData,
    rowSelection: { mode: 'multiRow' },
    rowDragManaged: true,
    refreshAfterGroupEdit: true,
    suppressColumnMoveAnimation: true,
    sideBar: true,
    groupDefaultExpanded: -1,
    getRowId: (params) => params.data!.id,
    initialState,
    onStateUpdated: stateUpdated,
});

describe('row drag state persistence', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowDragModule,
            RowSelectionModule,
            RowGroupingModule,
            UndoRedoEditModule,
            BatchEditModule,
            TextEditorModule,
            SideBarModule,
            PivotModule,
            ColumnsToolPanelModule,
            FiltersToolPanelModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('managed row drag edits survive save/load via initialState', async () => {
        const stateEvents: StateUpdatedEvent<AthleteRow>[] = [];
        const api = await gridsManager.createGridAndWait(
            'row-drag-state-persistence',
            createGridOptions(undefined, undefined, (event) => {
                stateEvents.push(event);
            })
        );

        let gridRows = new GridRows(api, 'initial hierarchy', {
            columns: true,
            ignoreUndefinedCells: true,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas"
            │ ├─┬ filler id:"row-group-region-Americas-country-United States" ag-Grid-AutoColumn:"United States"
            │ │ ├─┬ LEAF_GROUP id:"row-group-region-Americas-country-United States-year-2008" ag-Grid-AutoColumn:2008
            │ │ │ └── LEAF id:r-usa-08 region:"Americas" country:"United States" year:2008 athlete:"Michael Phelps"
            │ │ └─┬ LEAF_GROUP id:"row-group-region-Americas-country-United States-year-2012" ag-Grid-AutoColumn:2012
            │ │ · └── LEAF id:r-usa-12 region:"Americas" country:"United States" year:2012 athlete:"Missy Franklin"
            │ └─┬ filler id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada"
            │ · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada-year-2012 ag-Grid-AutoColumn:2012
            │ · │ └── LEAF id:r-can-12 region:"Americas" country:"Canada" year:2012 athlete:"Penny Oleksiak"
            │ · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada-year-2016 ag-Grid-AutoColumn:2016
            │ · · └── LEAF id:r-can-16 region:"Americas" country:"Canada" year:2016 athlete:"Andre De Grasse"
            └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ filler id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"Europe" country:"France" year:2008 athlete:"Alain Bernard"
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2012 ag-Grid-AutoColumn:2012
            · │ · └── LEAF id:r-fra-12 region:"Europe" country:"France" year:2012 athlete:"Camille Muffat"
            · └─┬ filler id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany-year-2012 ag-Grid-AutoColumn:2012
            · · · └── LEAF id:r-ger-12 region:"Europe" country:"Germany" year:2012 athlete:"Paul Biedermann"
        `);

        const leafDispatcher = new RowDragDispatcher({ api, eventType: 'pointer' });
        await leafDispatcher.start('r-usa-12');
        await leafDispatcher.move('row-group-region-Europe-country-France-year-2012', { yOffsetPercent: 0.7 });
        await leafDispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after leaf drag', {
            columns: true,
            ignoreUndefinedCells: true,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas"
            │ ├─┬ filler id:"row-group-region-Americas-country-United States" ag-Grid-AutoColumn:"United States"
            │ │ └─┬ LEAF_GROUP id:"row-group-region-Americas-country-United States-year-2008" ag-Grid-AutoColumn:2008
            │ │ · └── LEAF id:r-usa-08 region:"Americas" country:"United States" year:2008 athlete:"Michael Phelps"
            │ └─┬ filler id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada"
            │ · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada-year-2012 ag-Grid-AutoColumn:2012
            │ · │ └── LEAF id:r-can-12 region:"Americas" country:"Canada" year:2012 athlete:"Penny Oleksiak"
            │ · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada-year-2016 ag-Grid-AutoColumn:2016
            │ · · └── LEAF id:r-can-16 region:"Americas" country:"Canada" year:2016 athlete:"Andre De Grasse"
            └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ filler id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"Europe" country:"France" year:2008 athlete:"Alain Bernard"
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2012 ag-Grid-AutoColumn:2012
            · │ · ├── LEAF id:r-usa-12 region:"Europe" country:"France" year:2012 athlete:"Missy Franklin"
            · │ · └── LEAF id:r-fra-12 region:"Europe" country:"France" year:2012 athlete:"Camille Muffat"
            · └─┬ filler id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany-year-2012 ag-Grid-AutoColumn:2012
            · · · └── LEAF id:r-ger-12 region:"Europe" country:"Germany" year:2012 athlete:"Paul Biedermann"
        `);

        expect(api.getRowNode('r-usa-12')?.data?.region).toBe('Europe');
        expect(api.getRowNode('r-usa-12')?.data?.country).toBe('France');

        const groupDispatcher = new RowDragDispatcher({ api, eventType: 'pointer' });
        await groupDispatcher.start('row-group-region-Americas-country-Canada'!);
        await groupDispatcher.move('row-group-region-Europe', { yOffsetPercent: 0.35 });
        await groupDispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after group drag', {
            columns: true,
            ignoreUndefinedCells: true,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas"
            │ └─┬ filler id:"row-group-region-Americas-country-United States" ag-Grid-AutoColumn:"United States"
            │ · └─┬ LEAF_GROUP id:"row-group-region-Americas-country-United States-year-2008" ag-Grid-AutoColumn:2008
            │ · · └── LEAF id:r-usa-08 region:"Americas" country:"United States" year:2008 athlete:"Michael Phelps"
            └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ filler id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"Europe" country:"France" year:2008 athlete:"Alain Bernard"
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2012 ag-Grid-AutoColumn:2012
            · │ · ├── LEAF id:r-usa-12 region:"Europe" country:"France" year:2012 athlete:"Missy Franklin"
            · │ · └── LEAF id:r-fra-12 region:"Europe" country:"France" year:2012 athlete:"Camille Muffat"
            · ├─┬ filler id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany-year-2012 ag-Grid-AutoColumn:2012
            · │ · └── LEAF id:r-ger-12 region:"Europe" country:"Germany" year:2012 athlete:"Paul Biedermann"
            · └─┬ filler id:row-group-region-Europe-country-Canada ag-Grid-AutoColumn:"Canada"
            · · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Canada-year-2012 ag-Grid-AutoColumn:2012
            · · │ └── LEAF id:r-can-12 region:"Europe" country:"Canada" year:2012 athlete:"Penny Oleksiak"
            · · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Canada-year-2016 ag-Grid-AutoColumn:2016
            · · · └── LEAF id:r-can-16 region:"Europe" country:"Canada" year:2016 athlete:"Andre De Grasse"
        `);

        expect(api.getRowNode('r-can-12')?.data?.region).toBe('Europe');
        expect(api.getRowNode('r-can-16')?.data?.region).toBe('Europe');

        const savedState = api.getState();
        expect(savedState.rowGroup?.groupColIds).toEqual(['region', 'country', 'year']);
        expect(stateEvents.length).toBeGreaterThan(0);

        const persistedRowData = collectRowData(api);
        api.destroy();

        const reloadApi = gridsManager.createGrid(
            'row-drag-state-persistence',
            createGridOptions(persistedRowData, savedState)
        );

        await waitForEvent('firstDataRendered', reloadApi);

        const reloadedRows = new GridRows(reloadApi, 'after reload', {
            columns: true,
            ignoreUndefinedCells: true,
        });
        await reloadedRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas"
            │ └─┬ filler id:"row-group-region-Americas-country-United States" ag-Grid-AutoColumn:"United States"
            │ · └─┬ LEAF_GROUP id:"row-group-region-Americas-country-United States-year-2008" ag-Grid-AutoColumn:2008
            │ · · └── LEAF id:r-usa-08 region:"Americas" country:"United States" year:2008 athlete:"Michael Phelps"
            └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe"
            · ├─┬ filler id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France"
            · │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"Europe" country:"France" year:2008 athlete:"Alain Bernard"
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2012 ag-Grid-AutoColumn:2012
            · │ · ├── LEAF id:r-usa-12 region:"Europe" country:"France" year:2012 athlete:"Missy Franklin"
            · │ · └── LEAF id:r-fra-12 region:"Europe" country:"France" year:2012 athlete:"Camille Muffat"
            · ├─┬ filler id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany"
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany-year-2012 ag-Grid-AutoColumn:2012
            · │ · └── LEAF id:r-ger-12 region:"Europe" country:"Germany" year:2012 athlete:"Paul Biedermann"
            · └─┬ filler collapsed id:row-group-region-Europe-country-Canada ag-Grid-AutoColumn:"Canada"
            · · ├─┬ LEAF_GROUP collapsed hidden id:row-group-region-Europe-country-Canada-year-2012 ag-Grid-AutoColumn:2012
            · · │ └── LEAF hidden id:r-can-12 region:"Europe" country:"Canada" year:2012 athlete:"Penny Oleksiak"
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-region-Europe-country-Canada-year-2016 ag-Grid-AutoColumn:2016
            · · · └── LEAF hidden id:r-can-16 region:"Europe" country:"Canada" year:2016 athlete:"Andre De Grasse"
        `);

        expect(reloadApi.getRowNode('r-usa-12')?.data?.country).toBe('France');
        expect(reloadApi.getRowNode('r-can-12')?.data?.region).toBe('Europe');
    });
});
