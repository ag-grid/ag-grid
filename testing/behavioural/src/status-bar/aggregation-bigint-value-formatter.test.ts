import type { IStatusPanelValueFormatterParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, StatusBarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

const getStatusBarValue = (gridDiv: HTMLElement, label: string): string | null => {
    const items = Array.from(gridDiv.querySelectorAll<HTMLElement>('.ag-status-name-value'));
    for (const item of items) {
        const labelSpan = item.querySelector('span');
        if (labelSpan?.textContent === label) {
            return item.querySelector<HTMLElement>('.ag-status-name-value-value')?.textContent ?? null;
        }
    }
    return null;
};

describe('Status bar aggregation value formatter', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, StatusBarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('uses valueFormatter for bigint aggregations', async () => {
        const api = gridMgr.createGrid('status-bar-aggregation-bigint', {
            columnDefs: [{ field: 'totalBigInt', cellDataType: 'bigint' }],
            rowData: [
                { id: 'r1', totalBigInt: 1000000000000000000000n },
                { id: 'r2', totalBigInt: 2000000000000000000000n },
                { id: 'r3', totalBigInt: 3000000000000000000000n },
            ],
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: {
                statusPanels: [
                    {
                        statusPanel: 'agAggregationComponent',
                        statusPanelParams: {
                            valueFormatter: (params: IStatusPanelValueFormatterParams) =>
                                params.bigintValue != null ? `bigint:${params.bigintValue}` : `number:${params.value}`,
                        },
                    },
                ],
            },
        });
        await new GridColumns(api, `uses valueFormatter for bigint aggregations setup`).checkColumns(`
            CENTER
            └── totalBigInt "Total Big Int" width:200
        `);
        await new GridRows(api, `uses valueFormatter for bigint aggregations setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 totalBigInt:"1000000000000000000000n"
            ├── LEAF id:r2 totalBigInt:"2000000000000000000000n"
            └── LEAF id:r3 totalBigInt:"3000000000000000000000n"
        `);

        await waitForEvent('firstDataRendered', api);
        const selectionChanged = waitForEvent('cellSelectionChanged', api);

        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 2, columns: ['totalBigInt'] });
        await selectionChanged;

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        expect(getStatusBarValue(gridDiv, 'Sum')).toBe('bigint:6000000000000000000000');
        await new GridRows(api, `uses valueFormatter for bigint aggregations final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 totalBigInt:"1000000000000000000000n"
            ├── LEAF id:r2 totalBigInt:"2000000000000000000000n"
            └── LEAF id:r3 totalBigInt:"3000000000000000000000n"
        `);
    });

    test('avoids lossy number conversion for large bigint aggregations', async () => {
        const api = gridMgr.createGrid('status-bar-aggregation-bigint-large', {
            columnDefs: [{ field: 'totalBigInt', cellDataType: 'bigint' }],
            rowData: [
                { id: 'r1', totalBigInt: 9007199254740993n },
                { id: 'r2', totalBigInt: 10n },
            ],
            getRowId: (params) => params.data?.id,
            cellSelection: true,
            statusBar: {
                statusPanels: [
                    {
                        statusPanel: 'agAggregationComponent',
                        statusPanelParams: {
                            valueFormatter: (params: IStatusPanelValueFormatterParams) => {
                                if (params.bigintValue != null) {
                                    return `bigint:${params.bigintValue}`;
                                }
                                return params.value == null ? 'number:null' : `number:${params.value}`;
                            },
                        },
                    },
                ],
            },
        });
        await new GridColumns(api, `avoids lossy number conversion for large bigint aggregations setup`).checkColumns(
            `
                CENTER
                └── totalBigInt "Total Big Int" width:200
            `
        );
        await new GridRows(api, `avoids lossy number conversion for large bigint aggregations setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 totalBigInt:"9007199254740993n"
            └── LEAF id:r2 totalBigInt:"10n"
        `);

        await waitForEvent('firstDataRendered', api);
        const selectionChanged = waitForEvent('cellSelectionChanged', api);

        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['totalBigInt'] });
        await selectionChanged;

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        expect(getStatusBarValue(gridDiv, 'Sum')).toBe('bigint:9007199254741003');
        await new GridRows(api, `avoids lossy number conversion for large bigint aggregations final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 totalBigInt:"9007199254740993n"
            └── LEAF id:r2 totalBigInt:"10n"
        `);
    });
});
