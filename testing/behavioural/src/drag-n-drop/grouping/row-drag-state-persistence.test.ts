import {
    ClientSideRowModelModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    BatchEditModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SideBarModule,
} from 'ag-grid-enterprise';

import { GridRows, RowDragDispatcher, TestGridsManager, asyncSetTimeout } from '../../test-utils';

interface AthleteRow {
    id: string;
    region: string;
    country: string;
    year: number;
    name: string;
}

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
        const baseGridOptions: GridOptions<AthleteRow> = {
            columnDefs: [
                { field: 'region', rowGroup: true, editable: true, hide: true },
                { field: 'country', rowGroup: true, editable: true, hide: true },
                { field: 'year', rowGroup: true, editable: true, hide: true },
                { field: 'name', minWidth: 150 },
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
            rowSelection: { mode: 'multiRow' },
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
            suppressColumnMoveAnimation: true,
            sideBar: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data!.id,
        };

        const api = await gridsManager.createGridAndWait('row-drag-state-persistence', {
            ...baseGridOptions,
            rowData: getAthletes(),
        });

        let gridRows = new GridRows(api, 'initial hierarchy');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-WE ag-Grid-AutoColumn:"WE"
            │ ├─┬ filler id:row-group-region-WE-country-US ag-Grid-AutoColumn:"US"
            │ │ ├─┬ LEAF_GROUP id:row-group-region-WE-country-US-year-2008 ag-Grid-AutoColumn:2008
            │ │ │ └── LEAF id:r-usa-08 region:"WE" country:"US" year:2008 name:"Michael"
            │ │ └─┬ LEAF_GROUP id:row-group-region-WE-country-US-year-2012 ag-Grid-AutoColumn:2012
            │ │ · └── LEAF id:r-usa-12 region:"WE" country:"US" year:2012 name:"Missy"
            │ └─┬ filler id:row-group-region-WE-country-CA ag-Grid-AutoColumn:"CA"
            │ · ├─┬ LEAF_GROUP id:row-group-region-WE-country-CA-year-2012 ag-Grid-AutoColumn:2012
            │ · │ └── LEAF id:r-can-12 region:"WE" country:"CA" year:2012 name:"Penny"
            │ · └─┬ LEAF_GROUP id:row-group-region-WE-country-CA-year-2016 ag-Grid-AutoColumn:2016
            │ · · └── LEAF id:r-can-16 region:"WE" country:"CA" year:2016 name:"Andre"
            └─┬ filler id:row-group-region-EU ag-Grid-AutoColumn:"EU"
            · ├─┬ filler id:row-group-region-EU-country-FR ag-Grid-AutoColumn:"FR"
            · │ ├─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"EU" country:"FR" year:2008 name:"Alain"
            · │ └─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2012 ag-Grid-AutoColumn:2012
            · │ · └── LEAF id:r-fra-12 region:"EU" country:"FR" year:2012 name:"Camille"
            · └─┬ filler id:row-group-region-EU-country-DE ag-Grid-AutoColumn:"DE"
            · · └─┬ LEAF_GROUP id:row-group-region-EU-country-DE-year-2012 ag-Grid-AutoColumn:2012
            · · · └── LEAF id:r-ger-12 region:"EU" country:"DE" year:2012 name:"Paul"
        `);

        const leafDispatcher = new RowDragDispatcher({ api, eventType: 'pointer' });
        await leafDispatcher.start('r-usa-12');
        await leafDispatcher.move('row-group-region-EU-country-FR-year-2012', { yOffsetPercent: 0.7 });
        await leafDispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after leaf drag');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-WE ag-Grid-AutoColumn:"WE"
            │ ├─┬ filler id:row-group-region-WE-country-US ag-Grid-AutoColumn:"US"
            │ │ └─┬ LEAF_GROUP id:row-group-region-WE-country-US-year-2008 ag-Grid-AutoColumn:2008
            │ │ · └── LEAF id:r-usa-08 region:"WE" country:"US" year:2008 name:"Michael"
            │ └─┬ filler id:row-group-region-WE-country-CA ag-Grid-AutoColumn:"CA"
            │ · ├─┬ LEAF_GROUP id:row-group-region-WE-country-CA-year-2012 ag-Grid-AutoColumn:2012
            │ · │ └── LEAF id:r-can-12 region:"WE" country:"CA" year:2012 name:"Penny"
            │ · └─┬ LEAF_GROUP id:row-group-region-WE-country-CA-year-2016 ag-Grid-AutoColumn:2016
            │ · · └── LEAF id:r-can-16 region:"WE" country:"CA" year:2016 name:"Andre"
            └─┬ filler id:row-group-region-EU ag-Grid-AutoColumn:"EU"
            · ├─┬ filler id:row-group-region-EU-country-FR ag-Grid-AutoColumn:"FR"
            · │ ├─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"EU" country:"FR" year:2008 name:"Alain"
            · │ └─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2012 ag-Grid-AutoColumn:2012
            · │ · ├── LEAF id:r-usa-12 region:"EU" country:"FR" year:2012 name:"Missy"
            · │ · └── LEAF id:r-fra-12 region:"EU" country:"FR" year:2012 name:"Camille"
            · └─┬ filler id:row-group-region-EU-country-DE ag-Grid-AutoColumn:"DE"
            · · └─┬ LEAF_GROUP id:row-group-region-EU-country-DE-year-2012 ag-Grid-AutoColumn:2012
            · · · └── LEAF id:r-ger-12 region:"EU" country:"DE" year:2012 name:"Paul"
        `);

        expect(api.getRowNode('r-usa-12')?.data?.region).toBe('EU');
        expect(api.getRowNode('r-usa-12')?.data?.country).toBe('FR');

        const groupDispatcher = new RowDragDispatcher({ api, eventType: 'pointer' });
        await groupDispatcher.start('row-group-region-WE-country-CA'!);
        await groupDispatcher.move('row-group-region-EU', { yOffsetPercent: 0.35 });
        await groupDispatcher.finish();

        await asyncSetTimeout(0);

        gridRows = new GridRows(api, 'after group drag');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-WE ag-Grid-AutoColumn:"WE"
            │ └─┬ filler id:row-group-region-WE-country-US ag-Grid-AutoColumn:"US"
            │ · └─┬ LEAF_GROUP id:row-group-region-WE-country-US-year-2008 ag-Grid-AutoColumn:2008
            │ · · └── LEAF id:r-usa-08 region:"WE" country:"US" year:2008 name:"Michael"
            └─┬ filler id:row-group-region-EU ag-Grid-AutoColumn:"EU"
            · ├─┬ filler id:row-group-region-EU-country-FR ag-Grid-AutoColumn:"FR"
            · │ ├─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"EU" country:"FR" year:2008 name:"Alain"
            · │ └─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2012 ag-Grid-AutoColumn:2012
            · │ · ├── LEAF id:r-usa-12 region:"EU" country:"FR" year:2012 name:"Missy"
            · │ · └── LEAF id:r-fra-12 region:"EU" country:"FR" year:2012 name:"Camille"
            · ├─┬ filler id:row-group-region-EU-country-DE ag-Grid-AutoColumn:"DE"
            · │ └─┬ LEAF_GROUP id:row-group-region-EU-country-DE-year-2012 ag-Grid-AutoColumn:2012
            · │ · └── LEAF id:r-ger-12 region:"EU" country:"DE" year:2012 name:"Paul"
            · └─┬ filler id:row-group-region-EU-country-CA ag-Grid-AutoColumn:"CA"
            · · ├─┬ LEAF_GROUP id:row-group-region-EU-country-CA-year-2012 ag-Grid-AutoColumn:2012
            · · │ └── LEAF id:r-can-12 region:"EU" country:"CA" year:2012 name:"Penny"
            · · └─┬ LEAF_GROUP id:row-group-region-EU-country-CA-year-2016 ag-Grid-AutoColumn:2016
            · · · └── LEAF id:r-can-16 region:"EU" country:"CA" year:2016 name:"Andre"
        `);

        const collectRowData = (api: GridApi<AthleteRow>): AthleteRow[] => {
            const result: AthleteRow[] = [];
            api.forEachNode((node) => {
                if (!node.group && node.data) {
                    result.push({ ...node.data });
                }
            });
            return result;
        };

        // TODO: we could just use rootNode allLeafChildren but due to the sorting not being consistent
        // with grouping, we are using the recursive collection. We can remove this once AG-13321 is fixed
        const persistedRowData = collectRowData(api);

        // TODO: this seems a pre-existing bug, the initial expand state for groups seems to
        // not invalidate the expansion cache in the StateService. This need further investigation.
        // Is possible that the mechanism got broken during the last releases adding the expandAll feature.
        // The complete lack of pre-existing automated behavioural tests for this specific scenario didn't help catching this.
        api.expandAll();
        await asyncSetTimeout(50);

        const savedState = api.getState();

        api.destroy();

        const reloadApi = await gridsManager.createGridAndWait('row-drag-state-persistence', {
            ...baseGridOptions,
            rowData: persistedRowData,
            initialState: savedState,
        });

        const reloadedRows = new GridRows(reloadApi, 'after reload');
        await reloadedRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-WE ag-Grid-AutoColumn:"WE"
            │ └─┬ filler id:row-group-region-WE-country-US ag-Grid-AutoColumn:"US"
            │ · └─┬ LEAF_GROUP id:row-group-region-WE-country-US-year-2008 ag-Grid-AutoColumn:2008
            │ · · └── LEAF id:r-usa-08 region:"WE" country:"US" year:2008 name:"Michael"
            └─┬ filler id:row-group-region-EU ag-Grid-AutoColumn:"EU"
            · ├─┬ filler id:row-group-region-EU-country-FR ag-Grid-AutoColumn:"FR"
            · │ ├─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2008 ag-Grid-AutoColumn:2008
            · │ │ └── LEAF id:r-fra-08 region:"EU" country:"FR" year:2008 name:"Alain"
            · │ └─┬ LEAF_GROUP id:row-group-region-EU-country-FR-year-2012 ag-Grid-AutoColumn:2012
            · │ · ├── LEAF id:r-usa-12 region:"EU" country:"FR" year:2012 name:"Missy"
            · │ · └── LEAF id:r-fra-12 region:"EU" country:"FR" year:2012 name:"Camille"
            · ├─┬ filler id:row-group-region-EU-country-DE ag-Grid-AutoColumn:"DE"
            · │ └─┬ LEAF_GROUP id:row-group-region-EU-country-DE-year-2012 ag-Grid-AutoColumn:2012
            · │ · └── LEAF id:r-ger-12 region:"EU" country:"DE" year:2012 name:"Paul"
            · └─┬ filler id:row-group-region-EU-country-CA ag-Grid-AutoColumn:"CA"
            · · ├─┬ LEAF_GROUP id:row-group-region-EU-country-CA-year-2012 ag-Grid-AutoColumn:2012
            · · │ └── LEAF id:r-can-12 region:"EU" country:"CA" year:2012 name:"Penny"
            · · └─┬ LEAF_GROUP id:row-group-region-EU-country-CA-year-2016 ag-Grid-AutoColumn:2016
            · · · └── LEAF id:r-can-16 region:"EU" country:"CA" year:2016 name:"Andre"
        `);
    });
});

function getAthletes(): AthleteRow[] {
    return [
        { id: 'r-usa-08', name: 'Michael', region: 'WE', country: 'US', year: 2008 },
        { id: 'r-usa-12', name: 'Missy', region: 'WE', country: 'US', year: 2012 },
        { id: 'r-can-12', name: 'Penny', region: 'WE', country: 'CA', year: 2012 },
        { id: 'r-can-16', name: 'Andre', region: 'WE', country: 'CA', year: 2016 },
        { id: 'r-fra-08', name: 'Alain', region: 'EU', country: 'FR', year: 2008 },
        { id: 'r-fra-12', name: 'Camille', region: 'EU', country: 'FR', year: 2012 },
        { id: 'r-ger-12', name: 'Paul', region: 'EU', country: 'DE', year: 2012 },
    ];
}
