import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, GridColumns, GridRows, TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import {
    GROUP_AUTO_COLUMN_ID,
    getAutoGroupColumnIds,
    getColumnOrder,
    getColumnOrderFromState,
} from '../column-test-utils';

describe('Auto Group Column Order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule],
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

        test('appends auto group column for a row group added at runtime', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            expect(getColumnOrder(gridApi, 'center')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, 'a', 'b', 'c']);

            gridApi.addRowGroupColumns(['b']);

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
            // b is auto-hidden when grouped via the API, so it drops out of the displayed cols.
            expect(gridApi.getColumn('b')?.isVisible()).toBe(false);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                'a',
                'c',
            ]);
        });

        test('appends multiple auto group columns for row groups added at runtime', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'd' },
            ];

            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            expect(getColumnOrder(gridApi, 'center')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, 'a', 'b', 'c', 'd']);

            gridApi.addRowGroupColumns(['b', 'c']);

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b', 'c']);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                `${GROUP_AUTO_COLUMN_ID}-c`,
                'a',
                'd',
            ]);
        });

        test('appends multiple auto group columns when added via applyColumnState', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'd' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            expect(getColumnOrder(gridApi, 'center')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, 'a', 'b', 'c', 'd']);

            // Only the pre-existing auto col is named in state; the two new ones are "missed" and must seat after it.
            gridApi.applyColumnState({
                state: [
                    { colId: 'd' },
                    { colId: `${GROUP_AUTO_COLUMN_ID}-a` },
                    { colId: 'a', rowGroupIndex: 0 },
                    { colId: 'b', rowGroupIndex: 1 },
                    { colId: 'c', rowGroupIndex: 2 },
                ],
                applyOrder: true,
            });

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b', 'c']);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                'd',
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                `${GROUP_AUTO_COLUMN_ID}-c`,
                'a',
                'b',
                'c',
            ]);
        });

        test('appends auto group column in place when a row group is added via applyColumnState', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            expect(getColumnOrder(gridApi, 'center')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, 'a', 'b', 'c']);

            gridApi.applyColumnState({
                state: [
                    { colId: 'c' },
                    { colId: `${GROUP_AUTO_COLUMN_ID}-a` },
                    { colId: 'a', rowGroupIndex: 0 },
                    { colId: 'b', rowGroupIndex: 1 },
                ],
                applyOrder: true,
            });

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                'c',
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                'a',
                'b',
            ]);
        });

        test('appends auto group column when a column is dragged into the row group panel', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                rowGroupPanelShow: 'always',
                defaultColDef: { enableRowGroup: true },
            });
            expect(getColumnOrder(gridApi, 'center')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, 'a', 'b', 'c']);

            await dragHeaderToRowGroupPanel(gridApi, 'b');

            await waitFor(() => expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b']));
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                'a',
                'c',
            ]);
        });

        test('appends auto group column after a pinned existing auto group column added at runtime', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', enableRowGroup: true },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                autoGroupColumnDef: { pinned: 'left' },
            });
            expect(getColumnOrder(gridApi, 'left')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`]);

            gridApi.addRowGroupColumns(['b']);

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
            // both auto cols are pinned left; the new one seats after the existing one, not ahead of it
            expect(getColumnOrder(gridApi, 'left')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, `${GROUP_AUTO_COLUMN_ID}-b`]);
        });

        test('animates the column reflow when a row group is added at runtime', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            const gridEl = getGridElement(gridApi)! as HTMLElement;
            expect(gridEl.querySelector('.ag-column-moving')).toBeNull();

            gridApi.addRowGroupColumns(['b']);

            // colAnimation tags the grid body while the appended auto col slides in and the rest reflow.
            expect(gridEl.querySelector('.ag-column-moving')).not.toBeNull();
            await new GridColumns(gridApi, 'row group add animation').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200 rowGroup
                └── c width:200
            `);
            await new GridRows(gridApi, 'row group add animation').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null ag-Grid-AutoColumn-b:null
            `);
        });

        test('suppressColumnMoveAnimation skips the row group add animation', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                suppressColumnMoveAnimation: true,
            });
            const gridEl = getGridElement(gridApi)! as HTMLElement;

            gridApi.addRowGroupColumns(['b']);

            expect(gridEl.querySelector('.ag-column-moving')).toBeNull();
            await new GridColumns(gridApi, 'row group add without animation').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200 rowGroup
                └── c width:200
            `);
            await new GridRows(gridApi, 'row group add without animation').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null ag-Grid-AutoColumn-b:null
            `);
        });

        test('animates the column reflow when a row group is removed at runtime', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            const gridEl = getGridElement(gridApi)! as HTMLElement;
            expect(gridEl.querySelector('.ag-column-moving')).toBeNull();

            gridApi.removeRowGroupColumns(['b']);

            // colAnimation tags the grid body while the removed auto col's gap closes and the rest reflow.
            expect(gridEl.querySelector('.ag-column-moving')).not.toBeNull();
            await new GridColumns(gridApi, 'row group remove animation').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(gridApi, 'row group remove animation').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null
            `);
        });

        test('suppressColumnMoveAnimation skips the row group remove animation', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                suppressColumnMoveAnimation: true,
            });
            const gridEl = getGridElement(gridApi)! as HTMLElement;

            gridApi.removeRowGroupColumns(['b']);

            expect(gridEl.querySelector('.ag-column-moving')).toBeNull();
            await new GridColumns(gridApi, 'row group remove without animation').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(gridApi, 'row group remove without animation').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null
            `);
        });

        test('reuses auto group column instances when row groups are reordered', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            const autoA = gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`);
            const autoB = gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-b`);
            expect(autoA).toBeTruthy();
            expect(autoB).toBeTruthy();

            gridApi.moveRowGroupColumn(1, 0);

            // a pure reorder must reuse the existing instances (keeping their state + sliding), not recreate them
            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`)).toBe(autoA);
            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-b`)).toBe(autoB);
            await new GridColumns(gridApi, 'reuse instances on reorder').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-b width:200
                ├── ag-Grid-AutoColumn-a width:200
                ├── a width:200 rowGroup
                ├── b width:200 rowGroup
                └── c width:200
            `);
            await new GridRows(gridApi, 'reuse instances on reorder').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null ag-Grid-AutoColumn-a:null
            `);
        });

        test('reuses surviving auto group column instances across add and remove', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            const autoA = gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`);
            expect(autoA).toBeTruthy();

            gridApi.addRowGroupColumns(['b']); // a survives the add

            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`)).toBe(autoA);
            const autoB = gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-b`);
            expect(autoB).toBeTruthy();

            gridApi.removeRowGroupColumns(['a']); // b survives the remove, a's auto col is destroyed

            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-b`)).toBe(autoB);
            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`)).toBeNull();
            await new GridColumns(gridApi, 'reuse survivors across add/remove').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200
                └── c width:200
            `);
            await new GridRows(gridApi, 'reuse survivors across add/remove').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null
            `);
        });

        test('preserves a resized auto group column width across a runtime group add', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            gridApi.setColumnWidths([{ key: `${GROUP_AUTO_COLUMN_ID}-a`, newWidth: 321 }]);
            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`)?.getActualWidth()).toBe(321);

            gridApi.addRowGroupColumns(['b']);

            // the surviving auto col keeps the user's width — the instance is reused, not recreated
            expect(gridApi.getColumn(`${GROUP_AUTO_COLUMN_ID}-a`)?.getActualWidth()).toBe(321);
            await new GridColumns(gridApi, 'width preserved across add').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a width:321
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200 rowGroup
                └── c width:200
            `);
            await new GridRows(gridApi, 'width preserved across add').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null ag-Grid-AutoColumn-b:null
            `);
        });

        test('resnaps a middle row group reordered to the front (3 groups)', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c', rowGroup: true },
                { colId: 'd' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                `${GROUP_AUTO_COLUMN_ID}-c`,
                'a',
                'b',
                'c',
                'd',
            ]);

            gridApi.moveRowGroupColumn(2, 0); // c to the front → [c, a, b]

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['c', 'a', 'b']);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-c`,
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                'a',
                'b',
                'c',
                'd',
            ]);
            await new GridColumns(gridApi, '3-group middle reorder').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-c width:200
                ├── ag-Grid-AutoColumn-a width:200
                ├── ag-Grid-AutoColumn-b width:200
                ├── a width:200 rowGroup
                ├── b width:200 rowGroup
                ├── c width:200 rowGroup
                └── d width:200
            `);
            await new GridRows(gridApi, '3-group middle reorder').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-c:null ag-Grid-AutoColumn-a:null ag-Grid-AutoColumn-b:null
            `);
        });

        test('resnaps pinned auto group columns when row groups are reordered', async () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', rowGroup: true },
                { colId: 'b', rowGroup: true },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', {
                columnDefs,
                groupDisplayType,
                autoGroupColumnDef: { pinned: 'left' },
            });
            expect(getColumnOrder(gridApi, 'left')).toEqual([`${GROUP_AUTO_COLUMN_ID}-a`, `${GROUP_AUTO_COLUMN_ID}-b`]);

            gridApi.moveRowGroupColumn(1, 0);

            expect(getColumnOrder(gridApi, 'left')).toEqual([`${GROUP_AUTO_COLUMN_ID}-b`, `${GROUP_AUTO_COLUMN_ID}-a`]);
            await new GridColumns(gridApi, 'pinned reorder').checkColumns(`
                LEFT
                ├── ag-Grid-AutoColumn-b width:200
                └── ag-Grid-AutoColumn-a width:200
                CENTER
                ├── a width:200 rowGroup
                ├── b width:200 rowGroup
                └── c width:200
            `);
            await new GridRows(gridApi, 'pinned reorder').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null ag-Grid-AutoColumn-a:null
            `);
        });

        test.each([
            ['setRowGroupColumns', (api: GridApi) => api.setRowGroupColumns(['b', 'a'])],
            ['moveRowGroupColumn', (api: GridApi) => api.moveRowGroupColumn(1, 0)],
        ] as const)(
            'resnaps auto group columns when existing row groups are reordered via %s',
            async (label, reorder) => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b', rowGroup: true },
                    { colId: 'c' },
                ];
                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
                const gridEl = getGridElement(gridApi)! as HTMLElement;
                expect(getColumnOrder(gridApi, 'center')).toEqual([
                    `${GROUP_AUTO_COLUMN_ID}-a`,
                    `${GROUP_AUTO_COLUMN_ID}-b`,
                    'a',
                    'b',
                    'c',
                ]);

                reorder(gridApi);

                expect(gridEl.querySelector('.ag-column-moving')).not.toBeNull();
                expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['b', 'a']);
                expect(getColumnOrder(gridApi, 'center')).toEqual([
                    `${GROUP_AUTO_COLUMN_ID}-b`,
                    `${GROUP_AUTO_COLUMN_ID}-a`,
                    'a',
                    'b',
                    'c',
                ]);
                await new GridColumns(gridApi, `resnaps auto group columns via ${label}`).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn-b width:200
                    ├── ag-Grid-AutoColumn-a width:200
                    ├── a width:200 rowGroup
                    ├── b width:200 rowGroup
                    └── c width:200
                `);
                await new GridRows(gridApi, `resnaps auto group columns via ${label}`).check(`
                    ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-b:null ag-Grid-AutoColumn-a:null
                `);
            }
        );

        test('resnaps a manually reordered auto group column back to hierarchy order on the next rebuild', async () => {
            // Auto cols always follow row-group order: a manual move that breaks it sticks only until the next
            // rebuild, which resnaps them back to hierarchy order. This matches v35.
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a', field: 'a', rowGroup: true },
                { colId: 'b', field: 'b', rowGroup: true },
                { colId: 'c', field: 'c' },
            ];
            const rowData = [
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a1', b: 'b1', c: 'c2' },
                { a: 'a1', b: 'b2', c: 'c1' },
                { a: 'a2', b: 'b1', c: 'c1' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs, rowData, groupDisplayType });

            gridApi.moveColumns([`${GROUP_AUTO_COLUMN_ID}-a`], 1); // manual move, out of hierarchy order
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-b`,
                `${GROUP_AUTO_COLUMN_ID}-a`,
                'a',
                'b',
                'c',
            ]);

            gridApi.addRowGroupColumns(['c']); // rebuild → resnaps every auto col to row-group order
            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a', 'b', 'c']);
            expect(getColumnOrder(gridApi, 'center')).toEqual([
                `${GROUP_AUTO_COLUMN_ID}-a`,
                `${GROUP_AUTO_COLUMN_ID}-b`,
                `${GROUP_AUTO_COLUMN_ID}-c`,
                'a',
                'b',
            ]);
            await new GridColumns(gridApi, 'resnap heals manual move on rebuild').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a "A" width:200
                ├── ag-Grid-AutoColumn-b "B" width:200
                ├── ag-Grid-AutoColumn-c "C" width:200
                ├── a "A" width:200 rowGroup
                └── b "B" width:200 rowGroup
            `);
            await new GridRows(gridApi, 'resnap heals manual move on rebuild').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-a:null ag-Grid-AutoColumn-b:null ag-Grid-AutoColumn-c:null
                ├─┬ filler collapsed id:row-group-a-a1 ag-Grid-AutoColumn-a:"a1" ag-Grid-AutoColumn-b:null ag-Grid-AutoColumn-c:null
                │ ├─┬ filler collapsed hidden id:row-group-a-a1-b-b1 ag-Grid-AutoColumn-b:"b1" ag-Grid-AutoColumn-c:null
                │ │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-a-a1-b-b1-c-c1 ag-Grid-AutoColumn-c:"c1"
                │ │ │ └── LEAF hidden id:0 a:"a1" b:"b1" c:"c1"
                │ │ └─┬ LEAF_GROUP collapsed hidden id:row-group-a-a1-b-b1-c-c2 ag-Grid-AutoColumn-c:"c2"
                │ │ · └── LEAF hidden id:1 a:"a1" b:"b1" c:"c2"
                │ └─┬ filler collapsed hidden id:row-group-a-a1-b-b2 ag-Grid-AutoColumn-b:"b2" ag-Grid-AutoColumn-c:null
                │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-a-a1-b-b2-c-c1 ag-Grid-AutoColumn-c:"c1"
                │ · · └── LEAF hidden id:2 a:"a1" b:"b2" c:"c1"
                └─┬ filler collapsed id:row-group-a-a2 ag-Grid-AutoColumn-a:"a2" ag-Grid-AutoColumn-b:null ag-Grid-AutoColumn-c:null
                · └─┬ filler collapsed hidden id:row-group-a-a2-b-b1 ag-Grid-AutoColumn-b:"b1" ag-Grid-AutoColumn-c:null
                · · └─┬ LEAF_GROUP collapsed hidden id:row-group-a-a2-b-b1-c-c1 ag-Grid-AutoColumn-c:"c1"
                · · · └── LEAF hidden id:3 a:"a2" b:"b1" c:"c1"
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

async function dragHeaderToRowGroupPanel(api: GridApi, colId: string): Promise<void> {
    const gridEl = getGridElement(api)! as HTMLElement;
    const source = gridEl.querySelector(`.ag-header-cell[col-id="${colId}"]`) as HTMLElement | null;
    const panel = gridEl.querySelector('.ag-column-drop-horizontal') as HTMLElement | null;
    if (!source || !panel) {
        throw new Error(`drag setup failed: source=${!!source} panel=${!!panel}`);
    }
    const dispatcher = new DragEventDispatcher('mouse', null, false);
    const ownerDocument = source.ownerDocument;
    const original = ownerDocument.elementsFromPoint?.bind(ownerDocument);
    ownerDocument.elementsFromPoint = () => [panel];
    try {
        await dispatcher.startDrag(source, 5, 15);
        await dispatcher.movePointer(source, 12, 15);
        await dispatcher.movePointer(panel, 50, 10);
        await dispatcher.movePointer(panel, 90, 10);
        await dispatcher.finishDrag(panel);
    } finally {
        ownerDocument.elementsFromPoint = original as typeof ownerDocument.elementsFromPoint;
    }
}
