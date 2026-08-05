import { getByTestId, waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, canvasPolyfill } from '../test-utils';

describe('chart range handle', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    const rowData = [
        { id: 'ROW_0', month: 'Jan', sunshine: 1 },
        { id: 'ROW_1', month: 'Feb', sunshine: 2 },
        { id: 'ROW_2', month: 'Mar', sunshine: 3 },
        { id: 'ROW_3', month: 'Apr', sunshine: 4 },
        { id: 'ROW_4', month: 'May', sunshine: 5 },
    ];

    beforeAll(async () => {
        setupAgTestIds();
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    // The chart replaces its cell range objects on every range change, so a drag spanning more than
    // one row only reaches the final row if the handle keeps up with those new objects.
    test.each([
        ['grows', 1, [2, 3, 4], 4],
        ['shrinks', 4, [3, 2, 1], 1],
    ] as const)(
        'dragging the handle across several rows %s the chart range to the last row',
        async (_action, initialEndRow, hoveredRows, expectedEndRow) => {
            const api = await gridsManager.createGridAndWait('chartRangeHandleGrid', {
                cellSelection: true,
                columnDefs: [
                    { field: 'month', chartDataType: 'category' },
                    { field: 'sunshine', chartDataType: 'series' },
                ],
                rowData,
                getRowId: ({ data }) => data.id,
            });

            api.createRangeChart({
                cellRange: { rowStartIndex: 0, rowEndIndex: initialEndRow, columns: ['month', 'sunshine'] },
                chartType: 'groupedColumn',
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const cellOfRow = (rowIndex: number) =>
                getByTestId(gridDiv, agTestIdFor.cell(`ROW_${rowIndex}`, 'sunshine'));

            // Test IDs are stamped on by a debounced pass, so poll until both the handle and the
            // cells the drag visits are addressable.
            await waitFor(() => {
                expect(gridDiv.querySelector('.ag-range-handle')).toBeTruthy();
                for (let i = 0, len = rowData.length; i < len; ++i) {
                    cellOfRow(i);
                }
            });

            gridDiv
                .querySelector('.ag-range-handle')!
                .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 }));
            for (let i = 0, len = hoveredRows.length; i < len; ++i) {
                cellOfRow(hoveredRows[i]).dispatchEvent(
                    new MouseEvent('mousemove', { bubbles: true, clientX: 0, clientY: 1 })
                );
                await asyncSetTimeout(0);
            }
            cellOfRow(expectedEndRow).dispatchEvent(
                new MouseEvent('mouseup', { bubbles: true, clientX: 0, clientY: 1 })
            );

            await waitFor(() => {
                const [chartModel] = api.getChartModels()!;
                expect(chartModel.cellRange.rowEndIndex).toBe(expectedEndRow);
                // the dimension range must follow the value range that carries the handle
                expect(api.getCellRanges()!.map((r) => [r.startRow!.rowIndex, r.endRow!.rowIndex])).toEqual([
                    [0, expectedEndRow],
                    [0, expectedEndRow],
                ]);
            });
        }
    );
});
