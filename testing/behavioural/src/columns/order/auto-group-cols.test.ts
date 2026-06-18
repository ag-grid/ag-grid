import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../../test-utils';
import {
    GROUP_AUTO_COLUMN_ID,
    getAutoGroupColumnIds,
    getColumnOrder,
    getColumnOrderFromState,
} from '../column-test-utils';

describe('Auto Group Column Order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('groupDisplayType=groupRows', () => {
        test('omits row group column when colDef.rowGroup=true', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'd' },
                { colId: 'e', aggFunc: 'sum' },
                { colId: 'f', aggFunc: 'sum' },
                { colId: 'g', aggFunc: 'sum' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType: 'groupRows' });

            const expected = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── b width:200
                ├── c width:200
                ├── d width:200
                ├── e width:200 aggFunc:sum
                ├── f width:200 aggFunc:sum
                └── g width:200 aggFunc:sum
            `);
        });
    });

    describe('groupDisplayType=singleColumn', () => {
        const groupDisplayType = 'singleColumn' as const;

        test('omits row group column when no grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });

            const expected = ['a', 'b'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('orders row group column(s) first when enableRtl=true', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: true });

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200 rowGroup
            `);
        });

        test('orders row group column(s) first when enableRtl=false', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: false });

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200 rowGroup
            `);
        });

        test('orders row group column(s) by rowGroupIndex (lowest first) when enableRtl=true', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroupIndex: 1 },
                { colId: 'b', rowGroup: true },
                { colId: 'c', rowGroupIndex: 0 },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: true });

            const groupColIds = [GROUP_AUTO_COLUMN_ID];
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup rowGroupIndex:1
                ├── b width:200 rowGroup
                └── c width:200 rowGroup rowGroupIndex:0
            `);
        });

        test('orders row group column(s) by rowGroupIndex (lowest first) when enableRtl=false', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroupIndex: 1 },
                { colId: 'b', rowGroup: true },
                { colId: 'c', rowGroupIndex: 0 },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: false });

            const groupColIds = [GROUP_AUTO_COLUMN_ID];
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup rowGroupIndex:1
                ├── b width:200 rowGroup
                └── c width:200 rowGroup rowGroupIndex:0
            `);
        });

        test('lockPosition columns appear before auto column', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', lockPosition: 'right' },
                { colId: 'b', rowGroup: true },
                { colId: 'c', lockPosition: 'left' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = ['c', ...groupColIds, 'b', 'a'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── c width:200 lockPosition:left
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── b width:200 rowGroup
                └── a width:200 lockPosition:right
            `);
        });

        test('lockPosition=left columns appear after lockPosition auto column', async () => {
            const defaultColDef = { lockPosition: 'left' as const };
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, defaultColDef, groupDisplayType });
            await new GridColumns(gridApi, `lockPosition=left columns appear after lockPosition auto column setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200 lockPosition:left
                    ├── a width:200 lockPosition:left
                    ├── b width:200 rowGroup lockPosition:left
                    └── c width:200 lockPosition:left
                `);
            await new GridRows(gridApi, `lockPosition=left columns appear after lockPosition auto column setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `lockPosition=left columns appear after lockPosition auto column final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });

        test('lockPosition=right columns appear after lockPosition auto column', async () => {
            const defaultColDef = { lockPosition: 'right' as const };
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, defaultColDef, groupDisplayType });
            await new GridColumns(gridApi, `lockPosition=right columns appear after lockPosition auto column setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200 lockPosition:right
                    ├── a width:200 lockPosition:right
                    ├── b width:200 rowGroup lockPosition:right
                    └── c width:200 lockPosition:right
                `);
            await new GridRows(gridApi, `lockPosition=right columns appear after lockPosition auto column setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `lockPosition=right columns appear after lockPosition auto column final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });

        describe('pinned=left', () => {
            test('row group columns can be pinned', async () => {
                const autoGroupColumnDef = { pinned: 'left' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b' },
                    { colId: 'c', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c']);
                expect(getColumnOrder(gridApi, 'left')).toEqual(groupColIds);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    LEFT
                    └── ag-Grid-AutoColumn "Group" width:200
                    CENTER
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                `);
            });

            test('row group columns are always first pinned columns', async () => {
                const autoGroupColumnDef = { pinned: 'left' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', pinned: 'left', rowGroup: true },
                    { colId: 'b', pinned: 'left' },
                    { colId: 'c', pinned: 'left', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'left')).toEqual([...groupColIds, 'a', 'b', 'c']);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    LEFT
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                `);
            });
        });

        describe('pinned=right', () => {
            test('row group columns can be pinned', async () => {
                const autoGroupColumnDef = { pinned: 'right' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b' },
                    { colId: 'c', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c']);
                expect(getColumnOrder(gridApi, 'right')).toEqual(groupColIds);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    CENTER
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                    RIGHT
                    └── ag-Grid-AutoColumn "Group" width:200
                `);
            });

            test('row group columns are always first pinned columns', async () => {
                const autoGroupColumnDef = { pinned: 'right' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', pinned: 'right', rowGroup: true },
                    { colId: 'b', pinned: 'right' },
                    { colId: 'c', pinned: 'right', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'right')).toEqual([...groupColIds, 'a', 'b', 'c']);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    RIGHT
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                `);
            });
        });

        test('maintainColumnOrder=true inserts new auto cols at head', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: true,
            });
            await new GridColumns(gridApi, `maintainColumnOrder=true inserts new auto cols at head setup`).checkColumns(
                `
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `
            );
            await new GridRows(gridApi, `maintainColumnOrder=true inserts new auto cols at head setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const columnDefsNew: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'z', rowGroup: true },
            ];
            gridApi.setGridOption('columnDefs', columnDefsNew);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true inserts new auto cols at head after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200
                ├── b width:200
                ├── c width:200
                └── z width:200 rowGroup
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=true inserts new auto cols at head after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefsNew, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c', 'z']);
        });

        test('maintainColumnOrder=false inserts new auto cols at head', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: false,
            });
            await new GridColumns(gridApi, `maintainColumnOrder=false inserts new auto cols at head setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            await new GridRows(gridApi, `maintainColumnOrder=false inserts new auto cols at head setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const columnDefsNew: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'z', rowGroup: true },
            ];
            gridApi.setGridOption('columnDefs', columnDefsNew);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false inserts new auto cols at head after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200
                ├── b width:200
                ├── c width:200
                └── z width:200 rowGroup
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=false inserts new auto cols at head after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefsNew, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c', 'z']);
        });

        test('maintainColumnOrder=false resets group column to head when no new cols/change to grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: false,
            });
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            gridApi.moveColumns(['a'], 0);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to after moveColumns`
            ).checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── b width:200
                └── c width:200
            `);
            gridApi.setGridOption('columnDefs', columnDefs);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c']);
        });

        test('maintainColumnOrder=true preserves group column position when no new cols/change to grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: true,
            });
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            gridApi.moveColumns(['a'], 0);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change after moveColumns`
            ).checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── b width:200
                └── c width:200
            `);
            gridApi.setGridOption('columnDefs', columnDefs);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual(['a', ...groupColIds, 'b', 'c']);
        });

        test('auto columns can be positioned using gridApi.moveColumns', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            await new GridColumns(gridApi, `auto columns can be positioned using gridApi.moveColumns setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── a width:200 rowGroup
                    ├── b width:200 rowGroup
                    └── c width:200
                `);
            await new GridRows(gridApi, `auto columns can be positioned using gridApi.moveColumns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            gridApi.moveColumns(groupColIds, 2);
            await new GridColumns(gridApi, `auto columns can be positioned using gridApi.moveColumns after moveColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:200 rowGroup
                    ├── b width:200 rowGroup
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── c width:200
                `);

            expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', ...groupColIds, 'c']);
        });
    });

    describe('groupDisplayType=multipleColumns', () => {
        const groupDisplayType = 'multipleColumns' as const;

        test('omits row group column when no grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });

            const expected = ['a', 'b'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('orders row group column(s) first when enableRtl=true', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: true });

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-c width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200 rowGroup
            `);
        });

        test('orders row group column(s) first when enableRtl=false', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c', rowGroup: true },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: false });

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-c width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200 rowGroup
            `);
        });

        test('orders row group column(s) by rowGroupIndex (lowest first) when enableRtl=true', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroupIndex: 1 },
                { colId: 'b', rowGroup: true },
                { colId: 'c', rowGroupIndex: 0 },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: true });

            const groupColIds = [`${GROUP_AUTO_COLUMN_ID}-c`, `${GROUP_AUTO_COLUMN_ID}-a`, `${GROUP_AUTO_COLUMN_ID}-b`];
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-c width:200
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200 rowGroup rowGroupIndex:1
                ├── b width:200 rowGroup
                └── c width:200 rowGroup rowGroupIndex:0
            `);
        });

        test('orders row group column(s) by rowGroupIndex (lowest first) when enableRtl=false', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroupIndex: 1 },
                { colId: 'b', rowGroup: true },
                { colId: 'c', rowGroupIndex: 0 },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl: false });

            const groupColIds = [`${GROUP_AUTO_COLUMN_ID}-c`, `${GROUP_AUTO_COLUMN_ID}-a`, `${GROUP_AUTO_COLUMN_ID}-b`];
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-c width:200
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200 rowGroup rowGroupIndex:1
                ├── b width:200 rowGroup
                └── c width:200 rowGroup rowGroupIndex:0
            `);
        });

        test('lockPosition columns appear before auto column', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', lockPosition: 'right' },
                { colId: 'b', rowGroup: true },
                { colId: 'c', lockPosition: 'left' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = ['c', ...groupColIds, 'b', 'a'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            await new GridColumns(gridApi, 'columns').checkColumns(`
                CENTER
                ├── c width:200 lockPosition:left
                ├── ag-Grid-AutoColumn-b width:200
                ├── b width:200 rowGroup
                └── a width:200 lockPosition:right
            `);
        });

        test('lockPosition=left columns appear after lockPosition auto column', async () => {
            const defaultColDef = { lockPosition: 'left' as const };
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, defaultColDef, groupDisplayType });
            await new GridColumns(gridApi, `lockPosition=left columns appear after lockPosition auto column setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn-b width:200 lockPosition:left
                    ├── a width:200 lockPosition:left
                    ├── b width:200 rowGroup lockPosition:left
                    └── c width:200 lockPosition:left
                `);
            await new GridRows(gridApi, `lockPosition=left columns appear after lockPosition auto column setup`).check(
                `
                    ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null
                `
            );

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `lockPosition=left columns appear after lockPosition auto column final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null
                `);
        });

        test('lockPosition=right columns appear after lockPosition auto column', async () => {
            const defaultColDef = { lockPosition: 'right' as const };
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, defaultColDef, groupDisplayType });
            await new GridColumns(gridApi, `lockPosition=right columns appear after lockPosition auto column setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn-b width:200 lockPosition:right
                    ├── a width:200 lockPosition:right
                    ├── b width:200 rowGroup lockPosition:right
                    └── c width:200 lockPosition:right
                `);
            await new GridRows(gridApi, `lockPosition=right columns appear after lockPosition auto column setup`).check(
                `
                    ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null
                `
            );

            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            const expected = [...groupColIds, 'a', 'b', 'c'];
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            await new GridRows(gridApi, `lockPosition=right columns appear after lockPosition auto column final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null
                `);
        });

        describe('pinned=left', () => {
            test('row group columns can be pinned', async () => {
                const autoGroupColumnDef = { pinned: 'left' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b' },
                    { colId: 'c', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c']);
                expect(getColumnOrder(gridApi, 'left')).toEqual(groupColIds);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    LEFT
                    ├── ag-Grid-AutoColumn-a width:200
                    └── ag-Grid-AutoColumn-c width:200
                    CENTER
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                `);
            });

            test('row group columns are always first pinned columns', async () => {
                const autoGroupColumnDef = { pinned: 'left' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', pinned: 'left', rowGroup: true },
                    { colId: 'b', pinned: 'left' },
                    { colId: 'c', pinned: 'left', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'left')).toEqual([...groupColIds, 'a', 'b', 'c']);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    LEFT
                    ├── ag-Grid-AutoColumn-a width:200
                    ├── ag-Grid-AutoColumn-c width:200
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                `);
            });
        });

        describe('pinned=right', () => {
            test('row group columns can be pinned', async () => {
                const autoGroupColumnDef = { pinned: 'right' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b' },
                    { colId: 'c', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', 'c']);
                expect(getColumnOrder(gridApi, 'right')).toEqual(groupColIds);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    CENTER
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                    RIGHT
                    ├── ag-Grid-AutoColumn-a width:200
                    └── ag-Grid-AutoColumn-c width:200
                `);
            });

            test('row group columns are always first pinned columns', async () => {
                const autoGroupColumnDef = { pinned: 'right' as const };
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', pinned: 'right', rowGroup: true },
                    { colId: 'b', pinned: 'right' },
                    { colId: 'c', pinned: 'right', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', {
                    columnDefs,
                    groupDisplayType,
                    autoGroupColumnDef,
                });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                expect(getColumnOrder(gridApi, 'right')).toEqual([...groupColIds, 'a', 'b', 'c']);

                await new GridColumns(gridApi, 'columns').checkColumns(`
                    RIGHT
                    ├── ag-Grid-AutoColumn-a width:200
                    ├── ag-Grid-AutoColumn-c width:200
                    ├── a width:200 rowGroup
                    ├── b width:200
                    └── c width:200 rowGroup
                `);
            });
        });

        test('maintainColumnOrder=true inserts new auto cols at head', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: true,
            });
            await new GridColumns(gridApi, `maintainColumnOrder=true inserts new auto cols at head setup`).checkColumns(
                `
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `
            );
            await new GridRows(gridApi, `maintainColumnOrder=true inserts new auto cols at head setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const columnDefsNew: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'z', rowGroup: true },
            ];
            gridApi.setGridOption('columnDefs', columnDefsNew);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true inserts new auto cols at head after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-z width:200
                ├── a width:200
                ├── b width:200
                ├── c width:200
                └── z width:200 rowGroup
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=true inserts new auto cols at head after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-z:null
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefsNew, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c', 'z']);
        });

        test('maintainColumnOrder=false inserts new auto cols at head', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: false,
            });
            await new GridColumns(gridApi, `maintainColumnOrder=false inserts new auto cols at head setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            await new GridRows(gridApi, `maintainColumnOrder=false inserts new auto cols at head setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const columnDefsNew: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'z', rowGroup: true },
            ];
            gridApi.setGridOption('columnDefs', columnDefsNew);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false inserts new auto cols at head after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-z width:200
                ├── a width:200
                ├── b width:200
                ├── c width:200
                └── z width:200 rowGroup
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=false inserts new auto cols at head after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-z:null
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefsNew, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c', 'z']);
        });

        test('maintainColumnOrder=false resets group column to head when no new cols/change to grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: false,
            });
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to setup`
            ).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null
            `);

            gridApi.moveColumns(['a'], 0);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to after moveColumns`
            ).checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── ag-Grid-AutoColumn-a width:200
                ├── b width:200
                └── c width:200
            `);
            gridApi.setGridOption('columnDefs', columnDefs);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=false resets group column to head when no new cols/change to after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c']);
        });

        test('maintainColumnOrder=true preserves group column position when no new cols/change to grouping', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                maintainColumnOrder: true,
            });
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change setup`
            ).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null
            `);

            gridApi.moveColumns(['a'], 0);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change after moveColumns`
            ).checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── ag-Grid-AutoColumn-a width:200
                ├── b width:200
                └── c width:200
            `);
            gridApi.setGridOption('columnDefs', columnDefs);
            await new GridColumns(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── a width:200 rowGroup
                ├── ag-Grid-AutoColumn-a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                gridApi,
                `maintainColumnOrder=true preserves group column position when no new cols/change after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            expect(getColumnOrder(gridApi, 'center')).toEqual(['a', ...groupColIds, 'b', 'c']);
        });

        test('auto columns can be positioned using gridApi.moveColumns', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            await new GridColumns(gridApi, `auto columns can be positioned using gridApi.moveColumns setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn-a width:200
                    ├── ag-Grid-AutoColumn-b width:200
                    ├── a width:200 rowGroup
                    ├── b width:200 rowGroup
                    └── c width:200
                `);
            await new GridRows(gridApi, `auto columns can be positioned using gridApi.moveColumns setup`).check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null ag-Grid-AutoColumn-b:null
            `);
            const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
            gridApi.moveColumns(groupColIds, 2);
            await new GridColumns(gridApi, `auto columns can be positioned using gridApi.moveColumns after moveColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:200 rowGroup
                    ├── b width:200 rowGroup
                    ├── ag-Grid-AutoColumn-a width:200
                    ├── ag-Grid-AutoColumn-b width:200
                    └── c width:200
                `);

            expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', ...groupColIds, 'c']);
        });
    });
});
