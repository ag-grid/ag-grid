import { GridColumns, GridRows, TestGridsManager, assertSelectedCellRanges } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

describe('Cell Selection Grid API', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule],
    });

    function createGrid(go: GridOptions): GridApi {
        return gridMgr.createGrid('myGrid', go);
    }

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    const columnDefs = [{ field: 'sport' }, { field: 'year' }];
    const rowData = [
        { sport: 'football', year: 2021 },
        { sport: 'rugby', year: 2020 },
        { sport: 'tennis', year: 2018 },
        { sport: 'cricket', year: 2003 },
        { sport: 'golf', year: 2021 },
        { sport: 'swimming', year: 2020 },
        { sport: 'rowing', year: 2019 },
    ];

    describe('addCellRange', () => {
        test('add multiple cell ranges', async () => {
            const api = createGrid({
                columnDefs,
                rowData,
                cellSelection: true,
            });
            await new GridColumns(api, `add multiple cell ranges setup`).checkColumns(`
                CENTER
                ├── sport "Sport" width:200
                └── year "Year" width:200
            `);
            await new GridRows(api, `add multiple cell ranges setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021
                ├── LEAF id:1 sport:"rugby" year:2020
                ├── LEAF id:2 sport:"tennis" year:2018
                ├── LEAF id:3 sport:"cricket" year:2003
                ├── LEAF id:4 sport:"golf" year:2021
                ├── LEAF id:5 sport:"swimming" year:2020
                └── LEAF id:6 sport:"rowing" year:2019
            `);

            api.addCellRange({
                rowStartIndex: 2,
                rowEndIndex: 4,
                columnStart: 'sport',
                columnEnd: 'year',
            });

            assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] }], api);

            api.addCellRange({
                rowStartIndex: 5,
                rowEndIndex: 6,
                columnStart: 'sport',
                columnEnd: 'sport',
            });

            assertSelectedCellRanges(
                [
                    { rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] },
                    { rowStartIndex: 5, rowEndIndex: 6, columns: ['sport'] },
                ],
                api
            );
            await new GridRows(api, `add multiple cell ranges final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 sport:"football" year:2021
                ├── LEAF id:1 sport:"rugby" year:2020
                ├── LEAF id:2 sport:"tennis" year:2018
                ├── LEAF id:3 sport:"cricket" year:2003
                ├── LEAF id:4 sport:"golf" year:2021
                ├── LEAF id:5 sport:"swimming" year:2020
                └── LEAF id:6 sport:"rowing" year:2019
            `);
        });

        // suppressMultiRanges stops the *user* multi-selecting (ctrl+drag), while `addCellRange` refuses only
        // once more than one range is already selected — so the API adds the second itself and warns from the
        // third on. Asserted here because the ranges left behind are what the caller then reads back.
        test('addCellRange adds a second range under suppressMultiRanges = true and refuses the third', async () => {
            const api = createGrid({
                columnDefs,
                rowData,
                cellSelection: { suppressMultiRanges: true },
            });

            api.addCellRange({
                rowStartIndex: 2,
                rowEndIndex: 4,
                columnStart: 'sport',
                columnEnd: 'year',
            });

            assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] }], api);

            api.addCellRange({
                rowStartIndex: 5,
                rowEndIndex: 6,
                columnStart: 'sport',
                columnEnd: 'sport',
            });

            const twoRanges = [
                { rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] },
                { rowStartIndex: 5, rowEndIndex: 6, columns: ['sport'] },
            ];
            assertSelectedCellRanges(twoRanges, api);

            // Dev validations turn the warning into a throw for this suite; either way the ranges stand.
            expect(() =>
                api.addCellRange({
                    rowStartIndex: 0,
                    rowEndIndex: 1,
                    columnStart: 'year',
                    columnEnd: 'year',
                })
            ).toThrow(/warning #93/);
            assertSelectedCellRanges(twoRanges, api);
            await new GridRows(api, `addCellRange under suppressMultiRanges = true final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021
                    ├── LEAF id:1 sport:"rugby" year:2020
                    ├── LEAF id:2 sport:"tennis" year:2018
                    ├── LEAF id:3 sport:"cricket" year:2003
                    ├── LEAF id:4 sport:"golf" year:2021
                    ├── LEAF id:5 sport:"swimming" year:2020
                    └── LEAF id:6 sport:"rowing" year:2019
                `);
        });
    });
});
