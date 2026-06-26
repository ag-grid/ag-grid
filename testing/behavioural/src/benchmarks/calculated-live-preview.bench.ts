import { bench, suite } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellApiModule, ClientSideRowModelModule, RowApiModule, ValidationModule } from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule, FormulaModule, RowGroupingModule } from 'ag-grid-enterprise';

import { BenchGridsManager, IS_JSDOM, benchDefaults } from './bench-utils';

// Measures the live-preview keystroke flush WORK (rebuildCols + CSRM refreshModel + formula cache
// wipe + viewport re-evaluation). requestAnimationFrame is overridden to fire synchronously so the
// bench captures the flush body rather than the ~16ms frame wait.

const modules = [
    CellApiModule,
    ClientSideRowModelModule,
    RowApiModule,
    CalculatedColumnsModule,
    FormulaModule,
    ColumnMenuModule,
    RowGroupingModule,
    ValidationModule,
];

// Only jsdom needs this: it has no layout, so the dialog's centering reads a null offsetParent.
// A real browser (`--browser`) has native offsetParent — overriding it there would corrupt layout.
if (IS_JSDOM) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            if (this.closest('.ag-measurement-container')) {
                return null;
            }
            return this.parentElement;
        },
    });
}

// Synchronous rAF: the live-preview scheduler coalesces per frame; firing inline makes each
// keystroke's flush run synchronously inside the input event so the bench measures only the work.
window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
}) as typeof window.requestAnimationFrame;

const buildRows = (n: number) => {
    const rows: { id: string; revenue: number; cost: number; region: string }[] = [];
    for (let i = 0; i < n; ++i) {
        rows.push({ id: `r${i}`, revenue: (i * 37) % 1000, cost: (i * 13) % 500, region: `R${i % 20}` });
    }
    return rows;
};

const baseOptions = (rows: number, sortOnMargin: boolean, extraCols = 0, grouped = false): GridOptions => {
    const columnDefs: GridOptions['columnDefs'] = [
        { field: 'region', rowGroup: grouped, hide: grouped },
        { field: 'revenue', aggFunc: grouped ? 'sum' : undefined },
        { field: 'cost', aggFunc: grouped ? 'sum' : undefined },
        { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
        {
            colId: 'margin',
            calculatedExpression: '[profit] / ([revenue] + 1)',
            cellDataType: 'number',
            sortable: true,
            sort: sortOnMargin ? 'asc' : null,
        },
    ];
    for (let i = 0; i < extraCols; ++i) {
        columnDefs.push({ colId: `x${i}`, field: 'revenue', headerName: `x${i}` });
    }
    return {
        getRowId: (params) => params.data?.id,
        rowData: buildRows(rows),
        calculatedColumns: { applyMode: 'live' },
        animateRows: false,
        // Expand groups so the grouped variant displays leaf rows for readAllRows to re-evaluate.
        groupDefaultExpanded: grouped ? -1 : undefined,
        columnDefs,
    };
};

const typeExpression = (expression: string): void => {
    const input = document.querySelector<HTMLTextAreaElement>('.ag-calculated-column-form textarea');
    if (!input) {
        throw new Error('expression editor not found');
    }
    input.value = expression;
    input.dispatchEvent(new Event('input', { bubbles: true }));
};

// Force a full re-evaluation of both (lazy) calc columns over every row, so the bench captures the
// whole flush cost — not just the ~30 cells the live preview lazily repaints in the viewport.
const readAllRows = (api: GridApi): void => {
    const count = api.getDisplayedRowCount();
    for (let i = 0; i < count; ++i) {
        const rowNode = api.getDisplayedRowAtIndex(i);
        if (!rowNode) {
            continue;
        }
        api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false });
        api.getCellValue({ rowNode, colKey: 'margin', useFormatter: false });
    }
};

suite('calculated columns — live preview keystroke flush (synchronous rAF)', () => {
    let gridId = 0;
    const benchKeystroke = (name: string, rows: number, sortOnMargin: boolean, extraCols = 0, grouped = false) => {
        const id = `LP${++gridId}`;
        const gridsManager = new BenchGridsManager({ modules });
        let api!: GridApi;
        let iter = 0;
        bench(
            name,
            () => {
                // Alternate so every flush is a real expression change on the chained `profit` column.
                typeExpression(iter++ & 1 ? '[revenue] - [cost] + 1' : '[revenue] - [cost] + 2');
                api.flushAllAnimationFrames();
                readAllRows(api);
            },
            {
                ...benchDefaults(),
                setup: async () => {
                    await gridsManager.reset();
                    iter = 0;
                    api = gridsManager.createGrid(id, baseOptions(rows, sortOnMargin, extraCols, grouped));
                    api.showColumnMenu('profit');
                    await new Promise<void>((resolve) => setTimeout(resolve, 10));
                    const menuItem = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text'))
                        .find((element) => element.textContent?.trim() === 'Edit Calculated Column')
                        ?.closest<HTMLElement>('.ag-menu-option');
                    if (!menuItem) {
                        throw new Error('Edit Calculated Column menu item not found');
                    }
                    menuItem.click();
                    await new Promise<void>((resolve) => setTimeout(resolve, 1));
                },
            }
        );
    };

    benchKeystroke('keystroke flush — 1k rows, chained calc, no sort', 1_000, false);
    benchKeystroke('keystroke flush — 10k rows, chained calc, no sort', 10_000, false);
    benchKeystroke('keystroke flush — 100k rows, chained calc, no sort', 100_000, false);
    benchKeystroke('keystroke flush — 10k rows, chained calc, SORTED on dependent margin', 10_000, true);
    benchKeystroke('keystroke flush — 100k rows, chained calc, SORTED on dependent margin', 100_000, true);
    benchKeystroke('keystroke flush — 100k rows, 200 extra cols, no sort', 100_000, false, 200);
    benchKeystroke('keystroke flush — 100k rows, GROUPED region + sum aggs', 100_000, false, 0, true);
});
