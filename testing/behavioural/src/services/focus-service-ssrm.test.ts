import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../test-utils';

describe('SSRM focus restoration', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function waitForCondition(
        description: string,
        condition: () => boolean,
        timeoutMs = 200,
        pollMs = 5
    ): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if (condition()) {
                return;
            }
            await asyncSetTimeout(pollMs);
        }
        throw new Error(`Timed out waiting for ${description}`);
    }

    test('shift-tab into grid from below restores focus after load', async () => {
        const totalRows = 200;
        const rowData = Array.from({ length: totalRows }, (_, idx) => ({ id: idx, value: `Row ${idx}` }));

        const host = document.createElement('div');
        const aboveInput = document.createElement('input');
        const gridDiv = document.createElement('div');
        const belowInput = document.createElement('input');

        host.append(aboveInput, gridDiv, belowInput);
        document.body.appendChild(host);

        const datasource: IServerSideDatasource = {
            getRows(params: IServerSideGetRowsParams) {
                const { startRow, endRow } = params.request;
                const rows = rowData.slice(startRow, endRow);
                setTimeout(() => {
                    params.success({ rowData: rows, rowCount: totalRows });
                }, 0);
            },
        };

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 20,
            maxBlocksInCache: 1,
            rowBuffer: 0,
            tabIndex: 0,
            getRowId: (params) => params.data.id.toString(),
            serverSideDatasource: datasource,
        };

        try {
            const api = await gridsManager.createGridAndWait(gridDiv, gridOptions);

            const user = userEvent.setup();
            belowInput.focus();
            expect(belowInput).toHaveFocus();

            await user.tab({ shift: true });

            const gridElement = getGridElement(api) as HTMLElement;
            const bottomGuard = gridElement.querySelector<HTMLElement>('.ag-tab-guard-bottom');
            bottomGuard?.focus();

            await waitForNoLoadingRows(api);
            await asyncSetTimeout(0);

            const lastDisplayedIndex = api.getDisplayedRowCount() - 1;
            const lastDisplayedRowIndex = api.getDisplayedRowAtIndex(lastDisplayedIndex)?.rowIndex;
            expect(lastDisplayedRowIndex).not.toBeNull();
            expect(lastDisplayedRowIndex).not.toBeUndefined();

            const lastRowNode = api.getDisplayedRowAtIndex(lastDisplayedIndex);
            expect(lastRowNode).toBeTruthy();

            const lastCell = getByTestId(gridElement, agTestIdFor.cell(lastRowNode!.id!, 'value'));
            await waitForCondition(
                'focus to settle on last displayed cell',
                () =>
                    api.getFocusedCell()?.rowIndex === lastDisplayedRowIndex &&
                    api.getFocusedCell()?.column.getColId() === 'value' &&
                    !!document.activeElement &&
                    gridElement.contains(document.activeElement) &&
                    lastCell.contains(document.activeElement as Node)
            );
        } finally {
            host.remove();
        }
    });
});
