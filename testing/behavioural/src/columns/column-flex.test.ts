import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

describe('Column Flex', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    afterEach(() => gridsManager.reset());

    test('flex columns have flex property set', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 2 },
            ],
        });
        expect(api.getColumn('a')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getFlex()).toBe(2);
        await new GridColumns(api, 'flex columns').checkColumns(`
            CENTER
            ├── a width:333 flex:1
            └── b width:667 flex:2
        `);
    });

    test('two flex cols 1:1 split remaining space equally', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(500);
        expect(api.getColumn('b')!.getActualWidth()).toBe(500);
        await new GridColumns(api, 'two flex 1:1').checkColumns(`
            CENTER
            ├── a width:500 flex:1
            └── b width:500 flex:1
        `);
    });

    test('two flex cols 1:2 split remaining space in 1:2 ratio', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 2 },
            ],
        });
        const a = api.getColumn('a')!.getActualWidth();
        const b = api.getColumn('b')!.getActualWidth();
        expect(a + b).toBe(1000);
        expect(b).toBeGreaterThan(a);
        expect(b / a).toBeGreaterThanOrEqual(1.9);
        await new GridColumns(api, 'two flex 1:2').checkColumns(`
            CENTER
            ├── a width:333 flex:1
            └── b width:667 flex:2
        `);
    });

    test('three flex cols 1:1:1 split equally', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 1 },
                { colId: 'c', flex: 1 },
            ],
        });
        const widths = ['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth());
        expect(widths.reduce((s, w) => s + w, 0)).toBe(1000);
        expect(Math.abs(widths[0] - widths[1])).toBeLessThanOrEqual(1);
        await new GridColumns(api, 'three flex 1:1:1').checkColumns(`
            CENTER
            ├── a width:333 flex:1
            ├── b width:334 flex:1
            └── c width:333 flex:1
        `);
    });

    test('fixed-width cols keep width, flex cols share the remainder', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 200 },
                { colId: 'b', flex: 1 },
                { colId: 'c', width: 100 },
                { colId: 'd', flex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(200);
        expect(api.getColumn('c')!.getActualWidth()).toBe(100);
        const b = api.getColumn('b')!.getActualWidth();
        const d = api.getColumn('d')!.getActualWidth();
        expect(b + d).toBe(700);
        expect(Math.abs(b - d)).toBeLessThanOrEqual(1);
        await new GridColumns(api, 'fixed + flex mixed').checkColumns(`
            CENTER
            ├── a width:200
            ├── b width:350 flex:1
            ├── c width:100
            └── d width:350 flex:1
        `);
    });

    test('single flex col takes all remaining space after fixed cols', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 300 },
                { colId: 'b', flex: 1 },
                { colId: 'c', width: 200 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(300);
        expect(api.getColumn('b')!.getActualWidth()).toBe(500);
        expect(api.getColumn('c')!.getActualWidth()).toBe(200);
        await new GridColumns(api, 'single flex with fixed').checkColumns(`
            CENTER
            ├── a width:300
            ├── b width:500 flex:1
            └── c width:200
        `);
    });

    test('flex with minWidth is respected', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1, minWidth: 300 },
                { colId: 'b', flex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBeGreaterThanOrEqual(300);
        await new GridColumns(api, 'flex with minWidth').checkColumns(`
            CENTER
            ├── a width:500 flex:1
            └── b width:500 flex:1
        `);
    });

    test('flex with maxWidth clamps the col', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1, maxWidth: 200 },
                { colId: 'b', flex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(200);
        expect(api.getColumn('b')!.getActualWidth()).toBe(800);
        await new GridColumns(api, 'flex with maxWidth').checkColumns(`
            CENTER
            ├── a width:200 flex:1
            └── b width:800 flex:1
        `);
    });

    test('flex respects both minWidth and maxWidth on the same col', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1, minWidth: 100, maxWidth: 300 },
                { colId: 'b', flex: 10 },
            ],
        });
        const a = api.getColumn('a')!.getActualWidth();
        expect(a).toBeGreaterThanOrEqual(100);
        expect(a).toBeLessThanOrEqual(300);
        await new GridColumns(api, 'flex with both min/max').checkColumns(`
            CENTER
            ├── a width:100 flex:1
            └── b width:900 flex:10
        `);
    });

    test('minWidth extends a flex col whose natural share would be smaller', async () => {
        // Natural distribution: a gets 1/10 of 1000 = 100. minWidth bumps it to 300.
        // Remaining 700 distributed across the other 9 flex cols.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1, minWidth: 300 },
                ...Array.from({ length: 9 }, (_, i) => ({ colId: `b${i}`, flex: 1 })),
            ],
        });
        await new GridColumns(api, `minWidth extends a flex col whose natural share would be smaller setup`)
            .checkColumns(`
                CENTER
                ├── a width:300 flex:1
                ├── b0 width:78 flex:1
                ├── b1 width:78 flex:1
                ├── b2 width:77 flex:1
                ├── b3 width:78 flex:1
                ├── b4 width:78 flex:1
                ├── b5 width:78 flex:1
                ├── b6 width:77 flex:1
                ├── b7 width:78 flex:1
                └── b8 width:78 flex:1
            `);
        await new GridRows(api, `minWidth extends a flex col whose natural share would be smaller setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getActualWidth()).toBe(300);
        const others = Array.from({ length: 9 }, (_, i) => api.getColumn(`b${i}`)!.getActualWidth());
        expect(others.reduce((s, w) => s + w, 0)).toBe(700);
        expect(Math.abs(others[0] - 700 / 9)).toBeLessThanOrEqual(1);
        await new GridRows(api, `minWidth extends a flex col whose natural share would be smaller final state`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );
    });

    test('maxWidth below an inherited minWidth caps at maxWidth and still fills the viewport', async () => {
        // defaultColDef.minWidth (150) exceeds the per-col maxWidth on b/c, an incoherent config.
        // maxWidth must win and the freed space must flow to the unconstrained flex cols (no gap).
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 1, maxWidth: 120 },
                { colId: 'c', flex: 1, maxWidth: 100 },
                { colId: 'd', flex: 1 },
            ],
            defaultColDef: { flex: 1, minWidth: 150 },
        });
        // GridColumns snapshot is skipped: its validator (correctly) rejects the incoherent min>max config.
        const widths = ['a', 'b', 'c', 'd'].map((id) => api.getColumn(id)!.getActualWidth());
        expect(widths.reduce((s, w) => s + w, 0)).toBe(1000);
        expect(api.getColumn('b')!.getActualWidth()).toBe(120);
        expect(api.getColumn('c')!.getActualWidth()).toBe(100);
        expect(api.getColumn('a')!.getActualWidth()).toBe(390);
        expect(api.getColumn('d')!.getActualWidth()).toBe(390);
    });

    test('all flex cols hit maxWidth: total stays under viewport', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1, maxWidth: 200 },
                { colId: 'b', flex: 1, maxWidth: 200 },
                { colId: 'c', flex: 1, maxWidth: 200 },
            ],
        });
        // Each capped at 200; total = 600 even though viewport is 1000.
        expect(api.getColumn('a')!.getActualWidth()).toBe(200);
        expect(api.getColumn('b')!.getActualWidth()).toBe(200);
        expect(api.getColumn('c')!.getActualWidth()).toBe(200);
        await new GridColumns(api, 'all hit maxWidth').checkColumns(`
            CENTER
            ├── a width:200 flex:1
            ├── b width:200 flex:1
            └── c width:200 flex:1
        `);
    });

    test('manually resizing a flex col disables its flex', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 1 },
            ],
        });
        await new GridColumns(api, `manually resizing a flex col disables its flex setup`).checkColumns(`
            CENTER
            ├── a width:500 flex:1
            └── b width:500 flex:1
        `);
        await new GridRows(api, `manually resizing a flex col disables its flex setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getFlex()).toBe(1);

        api.setColumnWidths([{ key: 'a', newWidth: 300 }]);
        await new GridColumns(api, `manually resizing a flex col disables its flex after setColumnWidths`).checkColumns(
            `
                CENTER
                ├── a width:300
                └── b width:700 flex:1
            `
        );

        expect(api.getColumn('a')!.getActualWidth()).toBe(300);
        expect(api.getColumn('a')!.getFlex()).toBeNull();
        expect(api.getColumn('b')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getActualWidth()).toBe(700);
    });

    test('flex defined on defaultColDef applies to all cols', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            defaultColDef: { flex: 1 },
        });
        await new GridColumns(api, `flex defined on defaultColDef applies to all cols setup`).checkColumns(`
            CENTER
            ├── a width:333 flex:1
            ├── b width:334 flex:1
            └── c width:333 flex:1
        `);
        await new GridRows(api, `flex defined on defaultColDef applies to all cols setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getFlex()).toBe(1);
        expect(api.getColumn('c')!.getFlex()).toBe(1);
        // All three split 1000 evenly.
        const widths = ['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth());
        expect(widths.reduce((s, w) => s + w, 0)).toBe(1000);
        await new GridRows(api, `flex defined on defaultColDef applies to all cols final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('per-col flex overrides defaultColDef flex', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a' }, // inherits flex:1 from default
                { colId: 'b', flex: 3 }, // overrides to 3
            ],
            defaultColDef: { flex: 1 },
        });
        await new GridColumns(api, `per-col flex overrides defaultColDef flex setup`).checkColumns(`
            CENTER
            ├── a width:250 flex:1
            └── b width:750 flex:3
        `);
        await new GridRows(api, `per-col flex overrides defaultColDef flex setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getFlex()).toBe(3);
        // 1000 split 1:3 → 250 + 750.
        expect(api.getColumn('a')!.getActualWidth()).toBe(250);
        expect(api.getColumn('b')!.getActualWidth()).toBe(750);
        await new GridRows(api, `per-col flex overrides defaultColDef flex final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('initialFlex applies when flex is not set', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', initialFlex: 1 },
                { colId: 'b', initialFlex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getFlex()).toBe(1);
        await new GridColumns(api, 'initialFlex applied').checkColumns(`
            CENTER
            ├── a width:500 flex:1
            └── b width:500 flex:1
        `);
    });

    test('flex overrides initialFlex when both set', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a', flex: 3, initialFlex: 1 }],
        });
        expect(api.getColumn('a')!.getFlex()).toBe(3);
        await new GridColumns(api, 'flex overrides initialFlex').checkColumns(`
            CENTER
            └── a width:1000 flex:3
        `);
    });

    test('pinned cols are not flexed (only center cols participate)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', pinned: 'left', width: 150, flex: 1 },
                { colId: 'b', flex: 1 },
                { colId: 'c', flex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(150);
        expect(api.getColumn('b')!.getActualWidth() + api.getColumn('c')!.getActualWidth()).toBe(850);
        await new GridColumns(api, 'pinned not flexed').checkColumns(`
            LEFT
            └── a width:150 flex:1
            CENTER
            ├── b width:425 flex:1
            └── c width:425 flex:1
        `);
    });

    test('pinned col with flex does not flex centre cols (flexActive considers only centre)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', pinned: 'left', width: 150, flex: 1 },
                { colId: 'b', width: 200 },
                { colId: 'c', width: 300 },
            ],
        });

        expect(api.getColumn('a')!.getActualWidth()).toBe(150);
        expect(api.getColumn('b')!.getActualWidth()).toBe(200);
        expect(api.getColumn('c')!.getActualWidth()).toBe(300);
        await new GridColumns(api, 'pinned flex does not flex centre').checkColumns(`
            LEFT
            └── a width:150 flex:1
            CENTER
            ├── b width:200
            └── c width:300
        `);
    });

    test('hidden col with flex is excluded from sizing', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1, hide: true },
                { colId: 'b', flex: 1 },
                { colId: 'c', flex: 1 },
            ],
        });
        expect(api.getColumn('b')!.getActualWidth() + api.getColumn('c')!.getActualWidth()).toBe(1000);
        await new GridColumns(api, 'hidden flex excluded').checkColumns(`
            CENTER
            ├── b width:500 flex:1
            └── c width:500 flex:1
        `);
    });

    test('flex: 0 is treated as no flex', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 0, width: 100 },
                { colId: 'b', flex: 1 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(100);
        expect(api.getColumn('b')!.getActualWidth()).toBe(900);
        await new GridColumns(api, 'flex 0 = no flex').checkColumns(`
            CENTER
            ├── a width:100
            └── b width:900 flex:1
        `);
    });

    test('grid with no flex cols leaves widths untouched', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 200 },
            ],
        });
        expect(api.getColumn('a')!.getActualWidth()).toBe(100);
        expect(api.getColumn('b')!.getActualWidth()).toBe(200);
        await new GridColumns(api, 'no flex cols').checkColumns(`
            CENTER
            ├── a width:100
            └── b width:200
        `);
    });

    test('adding flex via setColumnDefs activates flex sizing', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
        });
        expect(api.getColumn('a')!.getFlex()).toBeNull();

        api.setGridOption('columnDefs', [
            { colId: 'a', flex: 1 },
            { colId: 'b', flex: 2 },
        ]);

        expect(api.getColumn('a')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getFlex()).toBe(2);
        await new GridColumns(api, 'flex added').checkColumns(`
            CENTER
            ├── a width:333 flex:1
            └── b width:667 flex:2
        `);
    });

    test('clearing flex with explicit null via setColumnDefs deactivates flex sizing', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 2 },
            ],
        });
        expect(api.getColumn('a')!.getFlex()).toBe(1);

        api.setGridOption('columnDefs', [
            { colId: 'a', flex: null as any, width: 100 },
            { colId: 'b', flex: null as any, width: 100 },
        ]);

        expect(api.getColumn('a')!.getFlex()).toBeNull();
        expect(api.getColumn('b')!.getFlex()).toBeNull();
        await new GridColumns(api, 'flex cleared').checkColumns(`
            CENTER
            ├── a width:100
            └── b width:100
        `);
    });

    test('switching from flex to fixed via setColumnDefs preserves the new width', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a', flex: 1 }],
        });
        await new GridColumns(api, `switching from flex to fixed via setColumnDefs preserves the new width setup`)
            .checkColumns(`
                CENTER
                └── a width:1000 flex:1
            `);
        await new GridRows(api, `switching from flex to fixed via setColumnDefs preserves the new width setup`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );
        expect(api.getColumn('a')!.getActualWidth()).toBe(1000);

        api.setGridOption('columnDefs', [{ colId: 'a', flex: null as any, width: 250 }]);
        await new GridColumns(
            api,
            `switching from flex to fixed via setColumnDefs preserves the new width after setGridOption columnDefs`
        ).checkColumns(`
            CENTER
            └── a width:250
        `);
        await new GridRows(
            api,
            `switching from flex to fixed via setColumnDefs preserves the new width after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getActualWidth()).toBe(250);
    });

    test('mutating flex in place on the same colDef ref is picked up', async () => {
        const cols: ColDef[] = [{ colId: 'a', flex: 1 }];
        const api = gridsManager.createGrid('myGrid', { columnDefs: cols });

        expect(api.getColumn('a')!.getFlex()).toBe(1);

        cols[0].flex = 4;
        api.setGridOption('columnDefs', cols);

        expect(api.getColumn('a')!.getFlex()).toBe(4);
        await new GridColumns(api, 'flex mutated in place').checkColumns(`
            CENTER
            └── a width:1000 flex:4
        `);
    });

    test('flex cols inside a column group are flexed individually (groups have no width)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    groupId: 'g1',
                    children: [
                        { colId: 'a', flex: 1 },
                        { colId: 'b', flex: 1 },
                    ],
                },
            ],
        });
        // 1000px split 1:1 across the two children inside the group.
        expect(api.getColumn('a')!.getActualWidth()).toBe(500);
        expect(api.getColumn('b')!.getActualWidth()).toBe(500);
        await new GridColumns(api, 'flex inside group').checkColumns(`
            CENTER
            └─┬ GROUP
              ├── a width:500 flex:1
              └── b width:500 flex:1
        `);
    });

    test('mixed flex + fixed across two groups respects group boundaries (flex sees centre row only)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    groupId: 'g1',
                    children: [
                        { colId: 'a', width: 150 },
                        { colId: 'b', flex: 1 },
                    ],
                },
                {
                    groupId: 'g2',
                    children: [
                        { colId: 'c', flex: 2 },
                        { colId: 'd', width: 100 },
                    ],
                },
            ],
        });
        // Fixed cols: a=150, d=100 → 250 consumed. Remaining 750 split 1:2 → b≈250, c≈500.
        expect(api.getColumn('a')!.getActualWidth()).toBe(150);
        expect(api.getColumn('d')!.getActualWidth()).toBe(100);
        const b = api.getColumn('b')!.getActualWidth();
        const c = api.getColumn('c')!.getActualWidth();
        expect(b + c).toBe(750);
        expect(c).toBeGreaterThan(b);
        await new GridColumns(api, 'flex across groups').checkColumns(`
            CENTER
            ├─┬ GROUP
            │ ├── a width:150
            │ └── b width:250 flex:1
            └─┬ GROUP
              ├── c width:500 flex:2
              └── d width:100
        `);
    });

    test('flex with nested column groups', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    groupId: 'outer',
                    children: [
                        { colId: 'a', flex: 1 },
                        {
                            groupId: 'inner',
                            children: [
                                { colId: 'b', flex: 1 },
                                { colId: 'c', flex: 2 },
                            ],
                        },
                    ],
                },
            ],
        });
        // All three leaves participate: a (1), b (1), c (2). Sum 4 → a=250, b=250, c=500.
        expect(api.getColumn('a')!.getActualWidth()).toBe(250);
        expect(api.getColumn('b')!.getActualWidth()).toBe(250);
        expect(api.getColumn('c')!.getActualWidth()).toBe(500);
        await new GridColumns(api, 'flex nested groups').checkColumns(`
            CENTER
            └─┬ GROUP
              ├── a width:250 flex:1
              └─┬ GROUP
                ├── b width:250 flex:1
                └── c width:500 flex:2
        `);
    });

    test('20 flex cols (1:1:...:1) split equally', async () => {
        const cols: ColDef[] = Array.from({ length: 20 }, (_, i) => ({ colId: `c${i}`, flex: 1 }));
        const api = gridsManager.createGrid('myGrid', { columnDefs: cols });
        await new GridColumns(api, `20 flex cols (1:1:...:1) split equally setup`).checkColumns(`
            CENTER
            ├── c0 width:50 flex:1
            ├── c1 width:50 flex:1
            ├── c2 width:50 flex:1
            ├── c3 width:50 flex:1
            ├── c4 width:50 flex:1
            ├── c5 width:50 flex:1
            ├── c6 width:50 flex:1
            ├── c7 width:50 flex:1
            ├── c8 width:50 flex:1
            ├── c9 width:50 flex:1
            ├── c10 width:50 flex:1
            ├── c11 width:50 flex:1
            ├── c12 width:50 flex:1
            ├── c13 width:50 flex:1
            ├── c14 width:50 flex:1
            ├── c15 width:50 flex:1
            ├── c16 width:50 flex:1
            ├── c17 width:50 flex:1
            ├── c18 width:50 flex:1
            └── c19 width:50 flex:1
        `);
        await new GridRows(api, `20 flex cols (1:1:...:1) split equally setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const widths = cols.map((c) => api.getColumn(c.colId!)!.getActualWidth());
        expect(widths.reduce((s, w) => s + w, 0)).toBe(1000);
        // 1000 / 20 = 50; rounding errors absorbed by last.
        expect(Math.abs(widths[0] - 50)).toBeLessThanOrEqual(1);
        await new GridRows(api, `20 flex cols (1:1:...:1) split equally final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('mixed 10 flex + 10 fixed cols distribute correctly', async () => {
        const cols: ColDef[] = [];
        for (let i = 0; i < 10; ++i) {
            cols.push({ colId: `f${i}`, width: 40 });
        }
        for (let i = 0; i < 10; ++i) {
            cols.push({ colId: `x${i}`, flex: 1 });
        }
        const api = gridsManager.createGrid('myGrid', { columnDefs: cols });
        await new GridColumns(api, `mixed 10 flex + 10 fixed cols distribute correctly setup`).checkColumns(`
            CENTER
            ├── f0 width:40
            ├── f1 width:40
            ├── f2 width:40
            ├── f3 width:40
            ├── f4 width:40
            ├── f5 width:40
            ├── f6 width:40
            ├── f7 width:40
            ├── f8 width:40
            ├── f9 width:40
            ├── x0 width:60 flex:1
            ├── x1 width:60 flex:1
            ├── x2 width:60 flex:1
            ├── x3 width:60 flex:1
            ├── x4 width:60 flex:1
            ├── x5 width:60 flex:1
            ├── x6 width:60 flex:1
            ├── x7 width:60 flex:1
            ├── x8 width:60 flex:1
            └── x9 width:60 flex:1
        `);
        await new GridRows(api, `mixed 10 flex + 10 fixed cols distribute correctly setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        // Fixed 10 × 40 = 400. Flex shares remaining 600 / 10 = 60 each.
        for (let i = 0; i < 10; ++i) {
            expect(api.getColumn(`f${i}`)!.getActualWidth()).toBe(40);
        }
        const flexWidths = Array.from({ length: 10 }, (_, i) => api.getColumn(`x${i}`)!.getActualWidth());
        expect(flexWidths.reduce((s, w) => s + w, 0)).toBe(600);
        expect(Math.abs(flexWidths[0] - 60)).toBeLessThanOrEqual(1);
        await new GridRows(api, `mixed 10 flex + 10 fixed cols distribute correctly final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('fractional flex values (0.5 + 0.5) split equally', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 0.5 },
                { colId: 'b', flex: 0.5 },
            ],
        });
        await new GridColumns(api, `fractional flex values (0.5 + 0.5) split equally setup`).checkColumns(`
            CENTER
            ├── a width:500 flex:0.5
            └── b width:500 flex:0.5
        `);
        await new GridRows(api, `fractional flex values (0.5 + 0.5) split equally setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getActualWidth()).toBe(500);
        expect(api.getColumn('b')!.getActualWidth()).toBe(500);
        await new GridRows(api, `fractional flex values (0.5 + 0.5) split equally final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('very large flex value still respects total viewport (with explicit minWidth: 0)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1000, minWidth: 0 },
                { colId: 'b', flex: 1, minWidth: 0 },
            ],
        });
        await new GridColumns(
            api,
            `very large flex value still respects total viewport (with explicit minWidth: 0) setup`
        ).checkColumns(`
            CENTER
            ├── a width:999 flex:1000
            └── b width:1 flex:1
        `);
        await new GridRows(api, `very large flex value still respects total viewport (with explicit minWidth: 0) setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
            `);
        const a = api.getColumn('a')!.getActualWidth();
        const b = api.getColumn('b')!.getActualWidth();
        expect(a + b).toBe(1000);
        expect(a).toBeGreaterThan(990);
        expect(b).toBeLessThan(10);
        await new GridRows(
            api,
            `very large flex value still respects total viewport (with explicit minWidth: 0) final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('default minWidth clamps a very small flex share to the default min', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1000 },
                { colId: 'b', flex: 1 },
            ],
        });
        await new GridColumns(api, `default minWidth clamps a very small flex share to the default min setup`)
            .checkColumns(`
                CENTER
                ├── a width:964 flex:1000
                └── b width:36 flex:1
            `);
        await new GridRows(api, `default minWidth clamps a very small flex share to the default min setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getActualWidth() + api.getColumn('b')!.getActualWidth()).toBe(1000);
        expect(api.getColumn('b')!.getActualWidth()).toBeGreaterThan(10);
        await new GridRows(api, `default minWidth clamps a very small flex share to the default min final state`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );
    });

    test('flex widths persist across rowData updates', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 3 },
            ],
        });
        await new GridColumns(api, `flex widths persist across rowData updates setup`).checkColumns(`
            CENTER
            ├── a width:250 flex:1
            └── b width:750 flex:3
        `);
        await new GridRows(api, `flex widths persist across rowData updates setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getActualWidth()).toBe(250);
        expect(api.getColumn('b')!.getActualWidth()).toBe(750);

        api.setGridOption('rowData', [{ x: 1 }, { x: 2 }]);
        await new GridRows(api, `flex widths persist across rowData updates after setGridOption rowData`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0
            └── LEAF id:1
        `);

        expect(api.getColumn('a')!.getActualWidth()).toBe(250);
        expect(api.getColumn('b')!.getActualWidth()).toBe(750);
    });

    test('flex inherited via columnTypes', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', type: 'flexed' },
                { colId: 'b', type: 'flexed' },
            ],
            columnTypes: {
                flexed: { flex: 1 },
            },
        });
        await new GridColumns(api, `flex inherited via columnTypes setup`).checkColumns(`
            CENTER
            ├── a width:500 flex:1
            └── b width:500 flex:1
        `);
        await new GridRows(api, `flex inherited via columnTypes setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        expect(api.getColumn('a')!.getFlex()).toBe(1);
        expect(api.getColumn('b')!.getFlex()).toBe(1);
        expect(api.getColumn('a')!.getActualWidth()).toBe(500);
        expect(api.getColumn('b')!.getActualWidth()).toBe(500);
        await new GridRows(api, `flex inherited via columnTypes final state`).check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('refreshing with the same defs does not change widths', async () => {
        const cols: ColDef[] = [
            { colId: 'a', flex: 1 },
            { colId: 'b', flex: 2 },
        ];
        const api = gridsManager.createGrid('myGrid', { columnDefs: cols });
        await new GridColumns(api, `refreshing with the same defs does not change widths setup`).checkColumns(`
            CENTER
            ├── a width:333 flex:1
            └── b width:667 flex:2
        `);
        await new GridRows(api, `refreshing with the same defs does not change widths setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        const a1 = api.getColumn('a')!.getActualWidth();
        const b1 = api.getColumn('b')!.getActualWidth();

        api.setGridOption('columnDefs', cols);
        await new GridColumns(
            api,
            `refreshing with the same defs does not change widths after setGridOption columnDefs`
        ).checkColumns(`
            CENTER
            ├── a width:333 flex:1
            └── b width:667 flex:2
        `);
        await new GridRows(api, `refreshing with the same defs does not change widths after setGridOption columnDefs`)
            .check(`
                ROOT id:ROOT_NODE_ID
            `);

        expect(api.getColumn('a')!.getActualWidth()).toBe(a1);
        expect(api.getColumn('b')!.getActualWidth()).toBe(b1);
    });
});
