import type { MockInstance } from 'vitest';

import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../test-utils';
import { VERSION } from '../../version';
import { getColumnOrder, getColumnOrderFromState } from '../column-test-utils';

describe('lockPosition Column Order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });
    let consoleWarnSpy: MockInstance | undefined;

    afterEach(() => {
        consoleWarnSpy?.mockRestore();
        gridsManager.reset();
    });

    describe.each([true, false])('when enableRTL=%s', (enableRtl: boolean) => {
        describe.each([undefined, 'left', 'right'] as const)('pinned=%s', (pinned) => {
            test.each([true, 'left', 'right'])(
                'lockPosition=%s columns are placed correctly',
                (lockPosition: true | 'left' | 'right') => {
                    const columnDefs: (ColDef | ColGroupDef)[] = [
                        { colId: 'a', pinned },
                        { colId: 'b', pinned, lockPosition },
                        { colId: 'c', pinned },
                    ];

                    const gridApi = gridsManager.createGrid('myGrid', { columnDefs, enableRtl });

                    // enableRtl -> lockPosition
                    const expectedResultMatrix = {
                        // enableRtl=true, expect lockPosition to flip.
                        true: {
                            true: ['a', 'c', 'b'],
                            left: ['a', 'c', 'b'],
                            right: ['b', 'a', 'c'],
                        },
                        false: {
                            true: ['b', 'a', 'c'],
                            left: ['b', 'a', 'c'],
                            right: ['a', 'c', 'b'],
                        },
                    };
                    const expected = expectedResultMatrix[String(enableRtl)][String(lockPosition)];
                    expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                    expect(getColumnOrder(gridApi, 'all')).toEqual(expected);

                    for (const port of ['center', 'left', 'right']) {
                        const expectedInViewport = port === (pinned ?? 'center') ? expected : [];
                        expect(getColumnOrder(gridApi, port as any)).toEqual(expectedInViewport);
                    }
                }
            );
        });
    });

    describe('columns are locked', () => {
        describe('gridApi.moveColumns', () => {
            test.each(['left', 'right'] as const)('cannot move lockPosition=%s column', (lockPosition) => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a' },
                    { colId: 'b', lockPosition },
                    { colId: 'c' },
                ];
                const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

                // lockPosition
                const expectedResultMatrix = {
                    left: ['b', 'a', 'c'],
                    right: ['a', 'c', 'b'],
                };
                const expected = expectedResultMatrix[lockPosition];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

                gridApi.moveColumns(['b'], 1);

                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            });

            test('provided index is relative to all columns, including locked', () => {
                const columnDefs: (ColDef | ColGroupDef)[] = [
                    { colId: 'a', lockPosition: 'left' },
                    { colId: 'b' },
                    { colId: 'c' },
                    { colId: 'd' },
                ];
                const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

                const expected = ['a', 'b', 'c', 'd'];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

                gridApi.moveColumns(['d'], 2);

                const nowExpected = ['a', 'b', 'd', 'c'];
                expect(getColumnOrderFromState(gridApi)).toEqual(nowExpected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(nowExpected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(nowExpected);
            });

            test.each([-1, 0])('cannot move columns before lockPosition=left column using index=%i', (idx: number) => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a', lockPosition: 'left' }, { colId: 'b' }];
                const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

                const expected = ['a', 'b'];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

                gridApi.moveColumns(['b'], idx);

                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            });

            test.each([1, 2])('cannot move columns after lockPosition=right column using index=%i', (idx: number) => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b', lockPosition: 'right' }];
                const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

                consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

                const expected = ['a', 'b'];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

                gridApi.moveColumns(['a'], idx);

                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

                if (idx === 2) {
                    expect(consoleWarnSpy).toHaveBeenCalledWith(
                        'AG Grid: error #30',
                        'tried to insert columns in invalid location, toIndex = ',
                        2,
                        'remember that you should not count the moving columns when calculating the new index',
                        expect.stringContaining(`/javascript-data-grid/errors/30?_version_=${VERSION}&toIndex=2`)
                    );
                }

                consoleWarnSpy?.mockRestore();
            });
        });
    });

    describe('is reactive', () => {
        test.each(['left', 'right'] as const)(
            'lockPosition is reactive when changed from undefined to %s',
            (lockPosition) => {
                const columnDefs: (ColDef | ColGroupDef)[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];
                const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

                const expected = ['a', 'b', 'c'];
                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

                gridApi.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b', lockPosition }, { colId: 'c' }]);

                const nowExpected = lockPosition === 'left' ? ['b', 'a', 'c'] : ['a', 'c', 'b'];
                expect(getColumnOrderFromState(gridApi)).toEqual(nowExpected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(nowExpected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(nowExpected);

                gridApi.setGridOption('columnDefs', columnDefs);

                expect(getColumnOrderFromState(gridApi)).toEqual(expected);
                expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
                expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
            }
        );

        test('lockPosition is reactive when changed between left and right', () => {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { colId: 'a' },
                { colId: 'b', lockPosition: 'left' },
                { colId: 'c' },
            ];
            const gridApi = gridsManager.createGrid('myGrid', { columnDefs });

            const expected = ['b', 'a', 'c'];
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);

            gridApi.setGridOption('columnDefs', [
                { colId: 'a' },
                { colId: 'b', lockPosition: 'right' },
                { colId: 'c' },
            ]);

            const nowExpected = ['a', 'c', 'b'];
            expect(getColumnOrderFromState(gridApi)).toEqual(nowExpected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(nowExpected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(nowExpected);

            gridApi.setGridOption('columnDefs', columnDefs);
            expect(getColumnOrderFromState(gridApi)).toEqual(expected);
            expect(getColumnOrder(gridApi, 'all')).toEqual(expected);
            expect(getColumnOrder(gridApi, 'center')).toEqual(expected);
        });
    });
});
