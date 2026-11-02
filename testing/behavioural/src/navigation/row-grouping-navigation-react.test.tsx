import { act, cleanup, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { asyncSetTimeout, mockGridLayout } from 'ag-test-utils';
import React from 'react';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, GROUP_AUTO_COLUMN_ID, RowApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

describe('Row Grouping Navigation (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        // happy-dom offset dimensions are 0 by default, which disables sticky rows entirely.
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test.each([
        ['a full-width group row', 'groupRows'],
        ['a group cell', 'singleColumn'],
    ] as const)(
        'Enter on %s that sticks as it expands, and unsticks as it collapses, keeps focus on the group',
        async (_kind, groupDisplayType) => {
            const rowData: { id: string; group: string; value: number }[] = [];
            for (let g = 0; g < 20; ++g) {
                for (let i = 0; i < 10; ++i) {
                    rowData.push({ id: `G${g}-${i}`, group: `G${g}`, value: i });
                }
            }
            let api: GridApi | undefined;
            const container = render(
                <React.StrictMode>
                    <AgGridReact
                        columnDefs={[{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }]}
                        groupDisplayType={groupDisplayType as GridOptions['groupDisplayType']}
                        getRowId={(params) => params.data.id}
                        rowData={rowData}
                        modules={[ClientSideRowModelModule, RowApiModule, RowGroupingModule]}
                        onGridReady={(e) => {
                            api = e.api;
                        }}
                    />
                </React.StrictMode>
            ).container;
            await waitFor(() =>
                expect(container.querySelector('.ag-row[row-id="row-group-group-G10"]')).not.toBeNull()
            );

            const group = api!.getRowNode('row-group-group-G10')!;
            const viewport = container.querySelector<HTMLElement>('.ag-grid-viewport')!;
            await act(async () => {
                viewport.scrollTop = group.rowTop! + 5;
                await asyncSetTimeout(0);
            });
            const focusTarget =
                '.ag-row[row-id="row-group-group-G10"]' +
                (groupDisplayType === 'groupRows' ? '' : ` .ag-cell[col-id="${GROUP_AUTO_COLUMN_ID}"]`);
            const user = userEvent.setup();
            await user.click(container.querySelector<HTMLElement>(`.ag-grid-scrolling-container ${focusTarget}`)!);

            const focused = () => {
                const row = document.activeElement?.closest('.ag-row');
                return {
                    rowId: row?.getAttribute('row-id'),
                    container: row?.parentElement?.classList.contains('ag-grid-sticky-top-rows-container')
                        ? 'sticky'
                        : 'body',
                    focusedRowIndex: api!.getFocusedCell()?.rowIndex,
                };
            };
            expect(focused()).toEqual({ rowId: 'row-group-group-G10', container: 'body', focusedRowIndex: 10 });

            await user.keyboard('{Enter}');
            expect(group.expanded).toBe(true);
            await waitFor(() =>
                expect(focused()).toEqual({ rowId: 'row-group-group-G10', container: 'sticky', focusedRowIndex: 10 })
            );

            await user.keyboard('{Enter}');
            expect(group.expanded).toBe(false);
            await waitFor(() =>
                expect(focused()).toEqual({ rowId: 'row-group-group-G10', container: 'body', focusedRowIndex: 10 })
            );
        }
    );
});
