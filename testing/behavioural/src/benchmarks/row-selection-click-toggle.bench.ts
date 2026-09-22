// Inside AG Studio a click on the row that is the whole selection is a deselection, which means the
// click path first asks `isSoleSelection`. That read is O(1) on a flat grid but walks the selected
// nodes under `groupSelects: 'descendants'`, so both shapes are measured.
//
// Each iteration clicks the same row, so state alternates: select, then deselect. The measurement is
// the whole gesture — the `isSoleSelection` read plus the selection mutation it enables — and the
// mutation dominates for the grouped case, where selecting a group touches every descendant.
import { StudioStubModule } from 'ag-test-utils';
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule, getGridElement } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

// the toggle only applies inside Studio, so every grid here is created as if it were
const modules = [ClientSideRowModelModule, RowSelectionModule, RowGroupingModule, StudioStubModule];

const ROW_COUNT = 20_000;

const flatColumnDefs: ColDef[] = [{ field: 'code' }];
const groupedColumnDefs: ColDef[] = [{ field: 'country', rowGroup: true, hide: true }, { field: 'code' }];

function buildRowData(groupCount: number): { code: string; country: string }[] {
    const rowData: { code: string; country: string }[] = [];
    for (let r = 0; r < ROW_COUNT; ++r) {
        rowData.push({ code: `code-${r}`, country: `country-${r % groupCount}` });
    }
    return rowData;
}

const clickRow = (api: GridApi, rowIndex: number): void => {
    const row = getGridElement(api)?.querySelector(`[row-index="${rowIndex}"]`);
    // a missed row would measure an empty gesture and read as a very fast benchmark
    if (!row) {
        throw new Error(`row ${rowIndex} is not rendered`);
    }
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};

suite('row selection — click toggle', () => {
    const gridsManager = new BenchGridsManager({ modules });
    let gridSeq = 0;

    const benchClick = (name: string, gridOptions: GridOptions, rowData: any[]) => {
        const id = `RSCT${++gridSeq}`;
        let api!: GridApi;
        bench(
            name,
            () => {
                clickRow(api, 0);
                api.flushAllAnimationFrames();
            },
            {
                ...benchDefaults({ noiseFactor: 2 }),
                setup: async () => {
                    await gridsManager.reset();
                    api = gridsManager.createGrid(id, { ...gridOptions, rowData });
                    api.flushAllAnimationFrames();
                },
            }
        );
    };

    benchClick(
        'flat — toggle the sole selected row',
        {
            columnDefs: flatColumnDefs,
            rowSelection: {
                mode: 'multiRow',
                checkboxes: false,
                enableClickSelection: true,
            },
        },
        buildRowData(1)
    );

    // one group owning every row, so the click selects and deselects the largest possible subtree
    benchClick(
        'groupSelects descendants — toggle a group owning every row',
        {
            columnDefs: groupedColumnDefs,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                checkboxes: false,
                enableClickSelection: true,
            },
        },
        buildRowData(1)
    );

    benchClick(
        'groupSelects descendants — toggle one group of 200',
        {
            columnDefs: groupedColumnDefs,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                checkboxes: false,
                enableClickSelection: true,
            },
        },
        buildRowData(100)
    );
});
