// Cell-repaint benchmark for the four cell-tooltip shapes. Each measured iteration forces a repaint of
// every visible cell, so it captures the per-cell tooltip work a renderer teardown triggers — the cost
// that differs between a cell whose renderer registers a tooltip, one that doesn't, and one with none.
//
// AllEnterpriseModule is registered so the per-cell cost reflects every feature being loaded.
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [AllEnterpriseModule];

const ROW_COUNT = 2000;
const COL_COUNT = 5;

class SetTooltipRenderer implements ICellRendererComp {
    private eGui!: HTMLElement;
    public init(params: ICellRendererParams): void {
        this.eGui = document.createElement('span');
        this.eGui.textContent = String(params.value);
        params.setTooltip(`Tip ${params.value}`, () => true);
    }
    public getGui(): HTMLElement {
        return this.eGui;
    }
    public refresh(): boolean {
        return false;
    }
}

class PlainRenderer implements ICellRendererComp {
    private eGui!: HTMLElement;
    public init(params: ICellRendererParams): void {
        this.eGui = document.createElement('span');
        this.eGui.textContent = String(params.value);
    }
    public getGui(): HTMLElement {
        return this.eGui;
    }
    public refresh(): boolean {
        return false;
    }
}

const buildCols = (cellRenderer: unknown, withColDefTooltip: boolean): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < COL_COUNT; ++i) {
        const col: ColDef = { colId: `c${i}`, field: `c${i}` };
        if (cellRenderer) {
            col.cellRenderer = cellRenderer;
        }
        if (withColDefTooltip) {
            col.tooltip = (params) => `Tip ${params.value}`;
        }
        cols.push(col);
    }
    return cols;
};

const buildData = (): any[] => {
    const rows: any[] = [];
    for (let r = 0; r < ROW_COUNT; ++r) {
        const row: any = { id: `${r}` };
        for (let c = 0; c < COL_COUNT; ++c) {
            row[`c${c}`] = `r${r}c${c}`;
        }
        rows.push(row);
    }
    return rows;
};

suite('cell repaint — tooltip shapes', () => {
    const gridsManager = new BenchGridsManager({ modules });
    const data = buildData();
    let gridId = 0;

    const benchRepaint = (name: string, cellRenderer: unknown, withColDefTooltip: boolean) => {
        const options: GridOptions = {
            columnDefs: buildCols(cellRenderer, withColDefTooltip),
            getRowId: (params) => String(params.data.id),
            rowHeight: 20,
        };
        const id = `TR${++gridId}`;
        let api!: GridApi;
        bench(
            name,
            () => {
                api.refreshCells({ force: true });
                api.flushAllAnimationFrames();
            },
            {
                ...benchDefaults({ noiseFactor: 3 }),
                setup: async () => {
                    await gridsManager.reset();
                    api = gridsManager.createGrid(id, { ...options, rowData: data });
                    api.flushAllAnimationFrames();
                },
            }
        );
    };

    benchRepaint('repaint — renderer using setTooltip', SetTooltipRenderer, false);
    benchRepaint('repaint — renderer without setTooltip, colDef tooltip', PlainRenderer, true);
    benchRepaint('repaint — no renderer, colDef tooltip', undefined, true);
    benchRepaint('repaint — no renderer, no tooltip', undefined, false);
});
