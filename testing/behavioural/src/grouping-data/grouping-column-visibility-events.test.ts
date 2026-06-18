import type { ColumnVisibleEvent, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Row-group activation auto-hides the grouped column (and shows it again on un-group). These tests
 * pin the `columnVisible` event payloads AND the resulting column/row state for grouping, hierarchy
 * grouping and pivot — guarding the batched visibility path (one `columnVisible` per `setColumns`
 * call rather than one per column).
 */
describe('grouping column visibility events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => gridsManager.reset());

    const captureVisible = (api: GridApi): { visible: boolean | undefined; cols: string[] }[] => {
        const events: { visible: boolean | undefined; cols: string[] }[] = [];
        api.addEventListener('columnVisible', (e: ColumnVisibleEvent) => {
            events.push({ visible: e.visible, cols: (e.columns ?? []).map((c) => c.getColId()) });
        });
        return events;
    };

    test('grouping multiple columns fires a single columnVisible hiding them all', async () => {
        const api = gridsManager.createGrid('groupHideMany', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData: [{ country: 'USA', sport: 'Swim', gold: 5 }],
        });
        await asyncSetTimeout(0);

        const events = captureVisible(api);
        api.setRowGroupColumns(['country', 'sport']);
        await asyncSetTimeout(0);

        expect(events).toEqual([{ visible: false, cols: ['country', 'sport'] }]);
        await new GridColumns(api, 'after grouping country+sport').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, 'after grouping country+sport').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-USA-sport-Swim ag-Grid-AutoColumn:"Swim"
            · · └── LEAF hidden id:0 country:"USA" sport:"Swim" gold:5
        `);
    });

    test('ungrouping fires a single columnVisible showing the cols', async () => {
        const api = gridsManager.createGrid('ungroupShowMany', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData: [{ country: 'USA', sport: 'Swim', gold: 5 }],
        });
        await asyncSetTimeout(0);
        // Group dynamically first (this is what auto-hides the cols); colDef `rowGroup: true` at
        // creation does NOT auto-hide.
        api.setRowGroupColumns(['country', 'sport']);
        await asyncSetTimeout(0);

        const events = captureVisible(api);
        api.setRowGroupColumns([]);
        await asyncSetTimeout(0);

        await new GridColumns(api, 'after ungrouping country+sport').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── sport "Sport" width:200
            └── gold "Gold" width:200
        `);

        expect(events).toEqual([{ visible: true, cols: ['country', 'sport'] }]);
    });

    test('a no-op setRowGroupColumns fires no columnVisible', async () => {
        const api = gridsManager.createGrid('groupNoop', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'gold' }],
            rowData: [{ country: 'USA', gold: 5 }],
        });
        await asyncSetTimeout(0);

        const events = captureVisible(api);
        api.setRowGroupColumns(['country']);
        await asyncSetTimeout(0);

        expect(events).toEqual([]);
    });

    test('sequential grouping never re-fires columnVisible for already-hidden cols', async () => {
        const api = gridsManager.createGrid('groupSequential', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            rowData: [{ country: 'USA', sport: 'Swim', gold: 5 }],
        });
        await asyncSetTimeout(0);

        const events = captureVisible(api);
        api.addRowGroupColumns(['country']);
        api.addRowGroupColumns(['sport']);
        api.addRowGroupColumns(['gold']);
        await asyncSetTimeout(0);

        // Each grouping auto-hides only the newly-grouped col; previously-hidden cols must not re-fire.
        expect(events).toEqual([
            { visible: false, cols: ['country'] },
            { visible: false, cols: ['sport'] },
            { visible: false, cols: ['gold'] },
        ]);
    });

    test('grouping a hierarchy column hides only the source col', async () => {
        const api = gridsManager.createGrid('groupHideHierarchy', {
            columnDefs: [
                { field: 'country' },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
            ],
            rowData: [{ country: 'USA', date: new Date(2020, 0, 1) }],
        });
        await asyncSetTimeout(0);

        const events = captureVisible(api);
        api.setRowGroupColumns(['date']);
        await asyncSetTimeout(0);

        // Only the user-facing `date` col is hidden; the generated hierarchy virtuals are not toggled.
        expect(events).toEqual([{ visible: false, cols: ['date'] }]);
        await new GridColumns(api, 'after grouping hierarchy date').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── country "Country" width:200
        `);
        await new GridRows(api, 'after grouping hierarchy date').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            └─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn:"2020" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn:"1" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn:"2020-01-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" date:"2020-01-01"
        `);
    });
});
