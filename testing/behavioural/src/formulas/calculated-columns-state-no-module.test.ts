import { TestGridsManager } from 'ag-test-utils';

import type { GridState, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, ValidationModule } from 'ag-grid-community';

// The calculated-columns module being absent is a different grid setup, so it needs its own manager.
describe('calculated columns - grid state persistence without the calculated columns module', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, ValidationModule] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('userColumns in initialState are preserved by getState when the module is not registered', () => {
        const userColumns: GridState['userColumns'] = [
            {
                colId: 'calc_1',
                created: true,
                parentGroupId: null,
                properties: [
                    { property: 'calculatedExpression', value: '[a] * 2' },
                    { property: 'cellDataType', value: 'text' },
                    { property: 'headerName', value: 'Double A' },
                ],
            },
        ];
        const api = gridsManager.createGrid('state-no-module', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: { userColumns },
        });

        // No calc col is created, but the descriptors must survive a re-save untouched so the state can
        // later be restored into a grid that does register the module.
        expect(api.getAllGridColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toEqual(userColumns);
    });

    test('overrides and removals of declared columns are inert when the module is not registered', () => {
        const userColumns: GridState['userColumns'] = [
            { colId: 'a', properties: [{ property: 'headerName', value: 'Overridden' }] },
            { colId: 'b', removed: true },
        ];
        const api = gridsManager.createGrid('state-no-module-declared', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: { userColumns },
        });

        // With no owner to interpret them, entries must not touch the developer's columns — an applied
        // tombstone would destroy a column for a feature that is not even loaded.
        expect(api.getAllGridColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
        expect(api.getColumn('a')!.getColDef().headerName).toBeUndefined();
        expect(api.getState().userColumns).toEqual(userColumns);
    });

    test('setting columnDefs clears the layer when the module is not registered', () => {
        const api = gridsManager.createGrid('state-no-module-clear', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: { userColumns: [{ colId: 'b', removed: true }] },
        });
        expect(api.getState().userColumns).toHaveLength(1);

        // Clearing cannot depend on an owning service that was never registered.
        api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
        expect(api.getState().userColumns).toBeUndefined();
    });
});
