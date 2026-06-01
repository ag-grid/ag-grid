import type { GridApi, GridOptions, Module, RowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

describe('ag-grid formulas row pinning', () => {
    const rowNumberRefreshBufferMs = 25;
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, FormulaModule] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
            ...opts,
        };
        return gridsManager.createGrid(id, options);
    }

    function getValue(api: GridApi, rowNode: RowNode | undefined): unknown {
        expect(rowNode).toBeDefined();
        return api.getCellValue({ rowNode: rowNode!, colKey: 'value', useFormatter: false });
    }

    test('manual top pinning preserves formula results across source updates', async () => {
        let pinned = false;
        const api = createGrid('formulas-row-pinning-manual-top', {
            enableRowPinning: true,
            isRowPinned: (node) => (pinned && node.data?.id === 'dep' ? 'top' : null),
            rowData: [
                { id: 'src', value: 5 },
                { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))*2' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        pinned = true;
        api.setGridOption('isRowPinned', (node) => (pinned && node.data?.id === 'dep' ? 'top' : null));
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after top pin', gridRowsOpts).check(`
            PINNED_TOP id:t-top-dep row-number:"2" value:10
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:5
            └── LEAF id:dep row-number:"2" value:10
        `);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 9 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(18);
        expect(getValue(api, api.getRowNode('dep') as RowNode | undefined)).toBe(18);
    });

    test('manual bottom pinning preserves formula results across source updates', async () => {
        let pinned = false;
        const api = createGrid('formulas-row-pinning-manual-bottom', {
            enableRowPinning: true,
            isRowPinned: (node) => (pinned && node.data?.id === 'dep' ? 'bottom' : null),
            rowData: [
                { id: 'src', value: 4 },
                { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))+6' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        pinned = true;
        api.setGridOption('isRowPinned', (node) => (pinned && node.data?.id === 'dep' ? 'bottom' : null));
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'after bottom pin', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:4
            └── LEAF id:dep row-number:"2" value:10
            PINNED_BOTTOM id:b-bottom-dep row-number:"2" value:10
        `);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 11 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(17);
        expect(getValue(api, api.getRowNode('dep') as RowNode | undefined)).toBe(17);
    });

    test('repeated manual pin and unpin cycles preserve formula results', async () => {
        let pinned = false;
        let currentSourceValue = 3;
        const api = createGrid('formulas-row-pinning-repeat-cycles', {
            enableRowPinning: true,
            isRowPinned: (node) => (pinned && node.data?.id === 'dep' ? 'top' : null),
            rowData: [
                { id: 'src', value: 3 },
                { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))*5' },
            ],
        });
        await new GridColumns(api, `repeated manual pin and unpin cycles preserve formula results setup`).checkColumns(
            `
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── value "Value" width:200
            `
        );
        await new GridRows(api, `repeated manual pin and unpin cycles preserve formula results setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:3
            └── LEAF id:dep row-number:"2" value:15
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        for (const nextValue of [4, 6, 8]) {
            pinned = true;
            api.setGridOption('isRowPinned', (node) => (pinned && node.data?.id === 'dep' ? 'top' : null));
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            expect(api.getPinnedTopRowCount()).toBe(1);
            expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(currentSourceValue * 5);

            pinned = false;
            api.setGridOption('isRowPinned', (node) => (pinned && node.data?.id === 'dep' ? 'top' : null));
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            applyTransactionChecked(api, { update: [{ id: 'src', value: nextValue }] });
            await asyncSetTimeout(rowNumberRefreshBufferMs);

            expect(api.getPinnedTopRowCount()).toBe(0);
            expect(getValue(api, api.getRowNode('dep') as RowNode | undefined)).toBe(nextValue * 5);
            currentSourceValue = nextValue;
        }
        await new GridRows(api, `repeated manual pin and unpin cycles preserve formula results final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:8
            └── LEAF id:dep row-number:"2" value:40
        `);
    });

    test('pinning the source row does not change dependent formula results', async () => {
        let pinned = false;
        const api = createGrid('formulas-row-pinning-source-row', {
            enableRowPinning: true,
            isRowPinned: (node) => (pinned && node.data?.id === 'src' ? 'top' : null),
            rowData: [
                { id: 'src', value: 8 },
                { id: 'dep', value: '=REF(COLUMN("value"),ROW("src"))+2' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        pinned = true;
        api.setGridOption('isRowPinned', (node) => (pinned && node.data?.id === 'src' ? 'top' : null));
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'source row pinned', gridRowsOpts).check(`
            PINNED_TOP id:t-top-src row-number:"1" value:8
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:8
            └── LEAF id:dep row-number:"2" value:10
        `);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 11 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(11);
        expect(getValue(api, api.getRowNode('dep') as RowNode | undefined)).toBe(13);
    });

    test('mixed manual top and bottom pinned formula rows both refresh from shared source updates', async () => {
        const api = createGrid('formulas-row-pinning-mixed-containers', {
            enableRowPinning: true,
            isRowPinned: (node) => {
                if (node.data?.id === 'dep-top') {
                    return 'top';
                }
                if (node.data?.id === 'dep-bottom') {
                    return 'bottom';
                }
                return null;
            },
            rowData: [
                { id: 'src', value: 10 },
                { id: 'dep-top', value: '=REF(COLUMN("value"),ROW("src"))*2' },
                { id: 'dep-bottom', value: '=REF(COLUMN("value"),ROW("src"))+5' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'mixed pinned containers', gridRowsOpts).check(`
            PINNED_TOP id:t-top-dep-top row-number:"2" value:20
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src row-number:"1" value:10
            ├── LEAF id:dep-top row-number:"2" value:20
            └── LEAF id:dep-bottom row-number:"3" value:15
            PINNED_BOTTOM id:b-bottom-dep-bottom row-number:"3" value:15
        `);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 12 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(24);
        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(17);
        expect(getValue(api, api.getRowNode('dep-top') as RowNode | undefined)).toBe(24);
        expect(getValue(api, api.getRowNode('dep-bottom') as RowNode | undefined)).toBe(17);
    });

    test('static pinned top row replacement with multiple formulas refreshes all rows', async () => {
        const api = createGrid('formulas-row-pinning-static-top-multiple', {
            rowData: [
                { id: 'src-a', value: 2 },
                { id: 'src-b', value: 7 },
            ],
            pinnedTopRowData: [
                { id: 'pt-a', value: '=REF(COLUMN("value"),ROW("src-a"))*10' },
                { id: 'pt-b', value: '=REF(COLUMN("value"),ROW("src-b"))+1' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'initial top formulas', gridRowsOpts).check(`
            PINNED_TOP id:pt-a row-number:"1" value:20
            PINNED_TOP id:pt-b row-number:"1" value:8
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:src-a row-number:"1" value:2
            └── LEAF id:src-b row-number:"2" value:7
        `);

        api.setGridOption('pinnedTopRowData', [
            { id: 'pt-a', value: '=REF(COLUMN("value"),ROW("src-a"))*11' },
            { id: 'pt-b', value: '=REF(COLUMN("value"),ROW("src-b"))+3' },
        ]);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(22);
        expect(getValue(api, api.getPinnedTopRow(1) as RowNode | undefined)).toBe(10);

        applyTransactionChecked(api, {
            update: [
                { id: 'src-a', value: 4 },
                { id: 'src-b', value: 9 },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(44);
        expect(getValue(api, api.getPinnedTopRow(1) as RowNode | undefined)).toBe(12);
    });

    test('static pinned top and bottom formulas coexist across independent updates', async () => {
        const api = createGrid('formulas-row-pinning-static-top-bottom', {
            rowData: [{ id: 'src', value: 6 }],
            pinnedTopRowData: [{ id: 'pt', value: '=REF(COLUMN("value"),ROW("src"))*2' }],
            pinnedBottomRowData: [{ id: 'pb', value: '=REF(COLUMN("value"),ROW("src"))+4' }],
        });
        await new GridColumns(api, `static pinned top and bottom formulas coexist across independent updates setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── value "Value" width:200
            `);
        await new GridRows(api, `static pinned top and bottom formulas coexist across independent updates setup`).check(
            `
                PINNED_TOP id:pt row-number:"1" value:12
                ROOT id:ROOT_NODE_ID
                └── LEAF id:src row-number:"1" value:6
                PINNED_BOTTOM id:pb row-number:"1" value:10
            `
        );
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(12);
        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(10);

        api.setGridOption('pinnedTopRowData', [{ id: 'pt', value: '=REF(COLUMN("value"),ROW("src"))*3' }]);
        await new GridRows(
            api,
            `static pinned top and bottom formulas coexist across independent updates after setGridOption pinnedTopRowData`
        ).check(`
            PINNED_TOP id:pt row-number:"1" value:18
            ROOT id:ROOT_NODE_ID
            └── LEAF id:src row-number:"1" value:6
            PINNED_BOTTOM id:pb row-number:"1" value:10
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(18);
        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(10);

        api.setGridOption('pinnedBottomRowData', [{ id: 'pb', value: '=REF(COLUMN("value"),ROW("src"))+8' }]);
        await new GridRows(
            api,
            `static pinned top and bottom formulas coexist across independent updates after setGridOption pinnedBottomRowData`
        ).check(`
            PINNED_TOP id:pt row-number:"1" value:18
            ROOT id:ROOT_NODE_ID
            └── LEAF id:src row-number:"1" value:6
            PINNED_BOTTOM id:pb row-number:"1" value:14
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(18);
        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(14);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 9 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(27);
        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(17);
    });

    test('static pinned top row formulas evaluate and refresh when source rows change', async () => {
        const api = createGrid('formulas-row-pinning-static-top', {
            rowData: [{ id: 'src', value: 5 }],
            pinnedTopRowData: [{ id: 'pt', value: '=REF(COLUMN("value"),ROW("src"))*3' }],
        });
        await new GridColumns(api, `static pinned top row formulas evaluate and refresh when source rows change setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── value "Value" width:200
            `);
        await new GridRows(api, `static pinned top row formulas evaluate and refresh when source rows change setup`)
            .check(`
                PINNED_TOP id:pt row-number:"1" value:15
                ROOT id:ROOT_NODE_ID
                └── LEAF id:src row-number:"1" value:5
            `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(15);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 9 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(27);

        api.setGridOption('pinnedTopRowData', [{ id: 'pt', value: '=REF(COLUMN("value"),ROW("src"))*4' }]);
        await new GridRows(
            api,
            `static pinned top row formulas evaluate and refresh when source rows change after setGridOption pinnedTopRowData`
        ).check(`
            PINNED_TOP id:pt row-number:"1" value:36
            ROOT id:ROOT_NODE_ID
            └── LEAF id:src row-number:"1" value:9
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedTopRow(0) as RowNode | undefined)).toBe(36);
    });

    test('static pinned bottom row formulas evaluate and refresh when source rows change', async () => {
        const api = createGrid('formulas-row-pinning-static-bottom', {
            rowData: [{ id: 'src', value: 7 }],
            pinnedBottomRowData: [{ id: 'pb', value: '=REF(COLUMN("value"),ROW("src"))-2' }],
        });
        await new GridColumns(
            api,
            `static pinned bottom row formulas evaluate and refresh when source rows change setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `static pinned bottom row formulas evaluate and refresh when source rows change setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:src row-number:"1" value:7
                PINNED_BOTTOM id:pb row-number:"1" value:5
            `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(5);

        applyTransactionChecked(api, { update: [{ id: 'src', value: 12 }] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(10);

        api.setGridOption('pinnedBottomRowData', [{ id: 'pb', value: '=REF(COLUMN("value"),ROW("src"))+1' }]);
        await new GridRows(
            api,
            `static pinned bottom row formulas evaluate and refresh when source rows change after setGridOption pinnedBottomRowData`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:src row-number:"1" value:12
            PINNED_BOTTOM id:pb row-number:"1" value:13
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        expect(getValue(api, api.getPinnedBottomRow(0) as RowNode | undefined)).toBe(13);
    });
});
