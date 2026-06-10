import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

// colIds / groupIds that collide with Object.prototype members. With a plain `{}` lookup Record
// these break: `map['toString']` returns the inherited function, `map['__proto__'] = col` fails to
// create an own key, and `'toString' in map` is always true (so a fresh col is spuriously renamed).
// The grid uses `Object.create(null)` for these lookups so user-supplied prototype-name ids work.
const PROTO_IDS = ['toString', 'constructor', 'valueOf', 'hasOwnProperty', '__proto__'];

describe('Columns with Object.prototype-name colIds / groupIds', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            RowApiModule,
            ColumnAutoSizeModule,
            ColumnsToolPanelModule,
            ValidationModule,
        ],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    test('getColumn resolves each prototype-name colId to the right column (not renamed, not a prototype member)', () => {
        const columnDefs: ColDef[] = PROTO_IDS.map((id, i) => ({ colId: id, field: `f${i}` }));
        const api = gridsManager.createGrid('g', { columnDefs });

        for (let i = 0; i < PROTO_IDS.length; ++i) {
            const id = PROTO_IDS[i];
            const col = api.getColumn(id);
            expect(col, `getColumn(${id})`).not.toBeNull();
            // Must keep its id — `'toString' in {}` being always-true would force a `_1` rename.
            expect(col!.getColId(), `colId of ${id}`).toBe(id);
            expect(typeof col!.getColId()).toBe('string');
        }
        // All ids present and not duplicated/renamed.
        expect(
            api
                .getColumns()!
                .map((c) => c.getColId())
                .sort()
        ).toEqual([...PROTO_IDS].sort());
    });

    test('getValue / getCellValue work for prototype-name colIds', () => {
        const columnDefs: ColDef[] = PROTO_IDS.map((id, i) => ({ colId: id, field: `f${i}` }));
        const rowData = [
            PROTO_IDS.reduce((row, _id, i) => ({ ...row, [`f${i}`]: `v${i}` }), {} as Record<string, string>),
        ];
        const api = gridsManager.createGrid('g', { columnDefs, rowData });

        const node = api.getDisplayedRowAtIndex(0)!;
        for (let i = 0; i < PROTO_IDS.length; ++i) {
            const value = api.getCellValue({ rowNode: node, colKey: PROTO_IDS[i] });
            expect(value, `value of ${PROTO_IDS[i]}`).toBe(`v${i}`);
        }
    });

    test('getColumnDefs round-trips a prototype-name groupId without losing children', () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [
            {
                groupId: 'toString',
                headerName: 'G',
                children: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
            },
            { colId: 'c', field: 'c' },
        ];
        const api = gridsManager.createGrid('g', { columnDefs });

        const defs = api.getColumnDefs()!;
        const group = defs.find((d): d is ColGroupDef => (d as ColGroupDef).groupId === 'toString');
        expect(group, 'group with groupId toString').toBeDefined();
        expect((group!.children as ColDef[]).map((c) => c.colId)).toEqual(['a', 'b']);
    });

    test('applyColumnState / getColumnState round-trips prototype-name colIds (order, sort, width)', () => {
        const columnDefs: ColDef[] = PROTO_IDS.map((id, i) => ({ colId: id, field: `f${i}` }));
        const api = gridsManager.createGrid('g', { columnDefs });

        const desired = [...PROTO_IDS].reverse();
        api.applyColumnState({
            state: desired.map((id, i) => ({
                colId: id,
                width: 100 + i,
                sort: id === '__proto__' ? ('asc' as const) : null,
            })),
            applyOrder: true,
        });

        const state = api.getColumnState();
        expect(state.map((s) => s.colId)).toEqual(desired);
        for (let i = 0; i < desired.length; ++i) {
            expect(state[i].width, `width of ${desired[i]}`).toBe(100 + i);
        }
        expect(state.find((s) => s.colId === '__proto__')!.sort).toBe('asc');
    });

    test('multi-column sort orders prototype-name colIds deterministically (sortService colId index map)', () => {
        const columnDefs: ColDef[] = PROTO_IDS.map((id, i) => ({ colId: id, field: `f${i}`, sortable: true }));
        const api = gridsManager.createGrid('g', { columnDefs });

        // Sort all of them with no explicit sortIndex — the sortService colId-index map decides order.
        api.applyColumnState({ state: PROTO_IDS.map((id) => ({ colId: id, sort: 'asc' as const })) });

        const sorted = api
            .getColumnState()
            .filter((s) => s.sort === 'asc')
            .map((s) => s.colId)
            .sort();
        expect(sorted).toEqual([...PROTO_IDS].sort());
    });

    test('setColumnWidths resizes a prototype-name colId (columnResize colId map)', () => {
        const columnDefs: ColDef[] = PROTO_IDS.map((id, i) => ({ colId: id, field: `f${i}` }));
        const api = gridsManager.createGrid('g', { columnDefs });

        api.setColumnWidths(PROTO_IDS.map((id) => ({ key: id, newWidth: 321 })));

        for (const id of PROTO_IDS) {
            expect(api.getColumn(id)!.getActualWidth(), `width of ${id}`).toBe(321);
        }
    });
});
