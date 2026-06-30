import { getByTestId, waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import type { GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TooltipModule,
    agTestIdFor,
    setupAgTestIds,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';

// React drives cell rendering through the shared CellCtrl (refreshCell -> showValue -> comp.setRenderDetails),
// so the tooltip-teardown fix must hold for React too. React's reactUi is not exercised by the vanilla suite.
describe('React cell renderer tooltip teardown on cellRendererSelector swap', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, TooltipModule]);
        setupAgTestIds();
        ignoreConsoleLicenseKeyError();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });
    const hasTooltipText = (text: string) => getTooltips().some((tooltip) => tooltip.textContent?.includes(text));

    const DetailRenderer = (params: ICellRendererParams) => {
        params.setTooltip('Cell renderer tooltip', () => true);
        return <span>Detail</span>;
    };

    test('swapping the React renderer falls back to the colDef tooltip and leaves no orphans', async () => {
        let api: GridApi | undefined;
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    colId: 'A',
                    tooltipValueGetter: () => 'ColDef tooltip',
                    cellRendererSelector: (params) =>
                        params.data?.showDetail ? { component: DetailRenderer } : undefined,
                },
            ],
            rowData: [{ id: 'r1', showDetail: true }],
            getRowId: (params) => params.data.id,
            tooltipShowDelay: 200,
        };

        const rendered = render(
            <div style={{ height: 400, width: 400 }}>
                <AgGridReact {...gridOptions} onGridReady={(p) => (api = p.api)} />
            </div>
        );

        const cell = await waitFor(() => getByTestId(rendered.container as HTMLElement, agTestIdFor.cell('r1', 'A')));

        // React detail renderer sets its own tooltip.
        await waitFor(() => expect(cell).toHaveTextContent('Detail'));
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Cell renderer tooltip');
        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        // Swap to the default renderer: tooltip must reset to the colDef value, not keep the renderer's.
        // React re-renders asynchronously, so wait for the swap to commit before hovering.
        await act(async () => {
            api!.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
            await asyncSetTimeout(0);
        });
        await waitFor(() => expect(cell).not.toHaveTextContent('Detail'));
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('ColDef tooltip');
        expect(hasTooltipText('Cell renderer tooltip')).toBe(false);
        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);

        // Repeated swaps must not accumulate orphaned tooltip elements.
        for (let i = 0; i < 5; i++) {
            const showDetail = i % 2 === 0;
            await act(async () => {
                api!.setGridOption('rowData', [{ id: 'r1', showDetail }]);
                await asyncSetTimeout(0);
            });
            await waitFor(() => {
                if (showDetail) {
                    expect(cell).toHaveTextContent('Detail');
                } else {
                    expect(cell).not.toHaveTextContent('Detail');
                }
            });
        }
        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(1);
        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);
    });
});
