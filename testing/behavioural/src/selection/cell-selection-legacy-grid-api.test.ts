import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, assertSelectedCellRanges } from '../test-utils';

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
                enableRangeSelection: true,
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

        test('can still add multiple cell ranges when suppressMultiRanges = true', async () => {
            const api = createGrid({
                columnDefs,
                rowData,
                enableRangeSelection: true,
                suppressMultiRangeSelection: true,
            });
            await new GridColumns(api, `can still add multiple cell ranges when suppressMultiRanges = true setup`)
                .checkColumns(`
                    CENTER
                    ├── sport "Sport" width:200
                    └── year "Year" width:200
                `);
            await new GridRows(api, `can still add multiple cell ranges when suppressMultiRanges = true setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football" year:2021
                    ├── LEAF id:1 sport:"rugby" year:2020
                    ├── LEAF id:2 sport:"tennis" year:2018
                    ├── LEAF id:3 sport:"cricket" year:2003
                    ├── LEAF id:4 sport:"golf" year:2021
                    ├── LEAF id:5 sport:"swimming" year:2020
                    └── LEAF id:6 sport:"rowing" year:2019
                `
            );

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
            await new GridRows(api, `can still add multiple cell ranges when suppressMultiRanges = true final state`)
                .check(`
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
