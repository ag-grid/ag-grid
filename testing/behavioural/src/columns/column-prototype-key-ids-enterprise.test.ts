import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { AdvancedFilterModel, ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowApiModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

// Enterprise features that key internal lookup Records by user-supplied colId / groupId. With a
// plain `{}` these collide with Object.prototype members; the grid uses `Object.create(null)`.

describe('Enterprise: prototype-name colIds / groupIds', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            RowApiModule,
            TextFilterModule,
            AdvancedFilterModule,
            RowGroupingModule,
        ],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    test('advanced filter evaluates against a prototype-name colId (expressionEvaluatorParams map)', () => {
        const api = gridsManager.createGrid('g', {
            columnDefs: [
                { colId: 'toString', field: 'a', filter: true },
                { colId: 'b', field: 'b', filter: true },
            ] as ColDef[],
            rowData: [
                { a: 'keep', b: '1' },
                { a: 'drop', b: '2' },
            ],
            enableAdvancedFilter: true,
        });

        const model: AdvancedFilterModel = {
            filterType: 'text',
            colId: 'toString',
            type: 'contains',
            filter: 'keep',
        };
        api.setAdvancedFilterModel(model);
        api.onFilterChanged();

        expect(api.getDisplayedRowCount()).toBe(1);
        expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('keep');
    });

    test('row grouping by prototype-name colIds keeps order (orderedColsService colId map)', () => {
        const api = gridsManager.createGrid('g', {
            columnDefs: [
                { colId: 'toString', field: 'a' },
                { colId: 'valueOf', field: 'b' },
                { colId: 'c', field: 'c' },
            ] as ColDef[],
            rowData: [
                { a: 'x', b: 'p', c: '1' },
                { a: 'x', b: 'q', c: '2' },
            ],
            maintainColumnOrder: true,
        });

        api.addRowGroupColumns(['toString', 'valueOf']);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['toString', 'valueOf']);
        // Grouping actually took effect (group rows created).
        expect(api.getDisplayedRowCount()).toBeGreaterThan(0);

        api.removeRowGroupColumns(['toString']);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['valueOf']);
    });
});
