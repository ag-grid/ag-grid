import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef, ColGroupDef, RowGroupingDisplayType } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { TestGridsManager } from '../../test-utils';
import {
    GROUP_AUTO_COLUMN_ID,
    getAutoGroupColumnIds,
    getColumnOrder,
    getColumnOrderFromState,
} from '../column-test-utils';

describe('Auto Group Column Order', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('groupDisplayType=groupRows', () => {
        test('omits row group column when colDef.rowGroup=true', () => {
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
        });
    });

    describe.each(['singleColumn', 'multipleColumns'])(
        'groupDisplayType=%s',
        (groupDisplayType: RowGroupingDisplayType) => {
            test('omits row group column when no grouping', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });

                const expected = ['a', 'b'];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            });

            test.each([true, false])('orders row group column(s) first when enableRtl=%s', (enableRtl: boolean) => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b' },
                    { colId: 'c', rowGroup: true },
                ];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl });

                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                const expected = [...groupColIds, 'a', 'b', 'c'];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            });

            test.each([true, false])(
                'orders row group column(s) by rowGroupIndex (lowest first) when enableRtl=%s',
                (enableRtl: boolean) => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { colId: 'a', rowGroupIndex: 1 },
                        { colId: 'b', rowGroup: true },
                        { colId: 'c', rowGroupIndex: 0 },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType, enableRtl });

                    let groupColIds = [GROUP_AUTO_COLUMN_ID];
                    if (groupDisplayType === 'multipleColumns') {
                        groupColIds = [
                            `${GROUP_AUTO_COLUMN_ID}-c`,
                            `${GROUP_AUTO_COLUMN_ID}-a`,
                            `${GROUP_AUTO_COLUMN_ID}-b`,
                        ];
                    }
                    const expected = [...groupColIds, 'a', 'b', 'c'];
                    expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                    expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
                }
            );

            test('lockPosition columns appear before auto column', () => {
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
            });

            test.each(['left', 'right'] as const)(
                'lockPosition columns appear after lockPosition auto column',
                (lockPosition) => {
                    const defaultColDef = { lockPosition };
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { colId: 'a' },
                        { colId: 'b', rowGroup: true },
                        { colId: 'c' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', { columnDefs, defaultColDef, groupDisplayType });

                    const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                    const expected = [...groupColIds, 'a', 'b', 'c'];
                    expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
                }
            );

            describe.each(['left', 'right'] as const)('pinned=%s', (pinned) => {
                test('row group columns can be pinned', () => {
                    const autoGroupColumnDef = { pinned };
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
                    expect(getColumnOrder(gridApi, pinned)).toEqual(groupColIds);
                });

                test('row group columns are always first pinned columns', () => {
                    const autoGroupColumnDef = { pinned };
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { colId: 'a', pinned, rowGroup: true },
                        { colId: 'b', pinned },
                        { colId: 'c', pinned, rowGroup: true },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        groupDisplayType,
                        autoGroupColumnDef,
                    });

                    const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                    expect(getColumnOrder(gridApi, pinned)).toEqual([...groupColIds, 'a', 'b', 'c']);
                });
            });

            test.each(['all', 'primaryColumns', 'pivotResultColumns', 'none'] as const)(
                'maintainColumnOrder=%s inserts new auto cols at head',
                (maintainColumnOrder) => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        groupDisplayType,
                        maintainColumnOrder,
                    });

                    const columnDefsNew: (ColDef | ColGroupDef)[] = [
                        { colId: 'a' },
                        { colId: 'b' },
                        { colId: 'c' },
                        { colId: 'z', rowGroup: true },
                    ];
                    // reorder cols
                    gridApi.setGridOption('columnDefs', columnDefsNew);
                    const groupColIds = getAutoGroupColumnIds(columnDefsNew, groupDisplayType);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c', 'z']);
                }
            );

            test.each(['pivotResultColumns', 'none'] as const)(
                'maintainColumnOrder=%s resets group column to head when no new cols/change to grouping',
                (maintainColumnOrder) => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { colId: 'a', rowGroup: true },
                        { colId: 'b' },
                        { colId: 'c' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        groupDisplayType,
                        maintainColumnOrder,
                    });

                    gridApi.moveColumns(['a'], 0);

                    // reorder cols
                    gridApi.setGridOption('columnDefs', columnDefs);
                    const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                    expect(getColumnOrder(gridApi, 'center')).toEqual([...groupColIds, 'a', 'b', 'c']);
                }
            );

            test.each(['all', 'primaryColumns'] as const)(
                'maintainColumnOrder=%s preserves group column position when no new cols/change to grouping',
                (maintainColumnOrder) => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { colId: 'a', rowGroup: true },
                        { colId: 'b' },
                        { colId: 'c' },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', {
                        columnDefs,
                        groupDisplayType,
                        maintainColumnOrder,
                    });

                    gridApi.moveColumns(['a'], 0);

                    // reorder cols
                    gridApi.setGridOption('columnDefs', columnDefs);
                    const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                    expect(getColumnOrder(gridApi, 'center')).toEqual(['a', ...groupColIds, 'b', 'c']);
                }
            );

            test('auto columns can be positioned using gridApi.moveColumns', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', rowGroup: true },
                    { colId: 'b', rowGroup: true },
                    { colId: 'c' },
                ];

                const gridApi = gridsManager.createGrid('myGrid', { columnDefs, groupDisplayType });
                const groupColIds = getAutoGroupColumnIds(columnDefs, groupDisplayType);
                gridApi.moveColumns(groupColIds, 2);

                expect(getColumnOrder(gridApi, 'center')).toEqual(['a', 'b', ...groupColIds, 'c']);
            });
        }
    );
});
