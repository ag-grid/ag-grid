import { getByTestId, waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React, { useEffect } from 'react';

import { AllCommunityModule, ModuleRegistry, agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import type { CellRendererSelectorResult, ColDef, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type { CustomCellRendererProps } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError, mockGridLayout } from '../test-utils';

describe('Tooltips (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([AllCommunityModule]);
        setupAgTestIds();
    });
    beforeEach(() => ignoreConsoleLicenseKeyError());
    afterEach(() => cleanup());

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const hasTooltipText = (text: string) => getTooltips().some((tooltip) => tooltip.textContent?.includes(text));

    const TooltipRenderer = (props: CustomCellRendererProps) => {
        useEffect(() => {
            props.setTooltip('Cell renderer tooltip', () => true);
        }, []);
        return <span>{String(props.value)}</span>;
    };
    const PlainRenderer = (props: CustomCellRendererProps) => <span>{String(props.value)}</span>;

    test('AG-17663 destroys cell renderer tooltip when cellRendererSelector swaps the renderer (React)', async () => {
        let api: GridApi | undefined;
        const columnDefs: ColDef[] = [
            {
                field: 'A',
                valueGetter: (params) => (params.data?.showDetail ? 'detail' : 'plain'),
                tooltipValueGetter: () => 'ColDef tooltip',
                cellRendererSelector: (params): CellRendererSelectorResult =>
                    params.data?.showDetail ? { component: TooltipRenderer } : { component: PlainRenderer },
            },
        ];

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={[{ id: 'r1', showDetail: true }]}
                    getRowId={(params) => String(params.data.id)}
                    tooltipShowDelay={200}
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );

        const gridDiv = rendered.container;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitFor(() => expect(hasTooltipText('Cell renderer tooltip')).toBe(true));

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitFor(() => expect(getTooltips().length).toBe(0));

        act(() => {
            api!.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
        });
        await asyncSetTimeout(100);

        await userEvent.hover(cell);
        await asyncSetTimeout(250);

        expect(hasTooltipText('Cell renderer tooltip')).toBe(false);
        expect(getTooltips().length).toBeLessThanOrEqual(1);
        expect(getTooltips()[0]).toHaveTextContent('ColDef tooltip');
    });

    test('AG-17663 destroys cell renderer tooltip when the selector swaps to no renderer (React)', async () => {
        let api: GridApi | undefined;
        const columnDefs: ColDef[] = [
            {
                field: 'A',
                valueGetter: (params) => (params.data?.showDetail ? 'detail' : 'plain'),
                tooltipValueGetter: () => 'ColDef tooltip',
                cellRendererSelector: (params): CellRendererSelectorResult | undefined =>
                    params.data?.showDetail ? { component: TooltipRenderer } : undefined,
            },
        ];

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={[{ id: 'r1', showDetail: true }]}
                    getRowId={(params) => String(params.data.id)}
                    tooltipShowDelay={200}
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );

        const gridDiv = rendered.container;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));

        await userEvent.hover(cell);
        await asyncSetTimeout(250);
        await waitFor(() => expect(hasTooltipText('Cell renderer tooltip')).toBe(true));

        await userEvent.unhover(cell);
        await asyncSetTimeout(250);
        await waitFor(() => expect(getTooltips().length).toBe(0));

        act(() => {
            api!.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
        });
        await asyncSetTimeout(100);

        await userEvent.hover(cell);
        await asyncSetTimeout(250);

        expect(hasTooltipText('Cell renderer tooltip')).toBe(false);
        expect(getTooltips().length).toBeLessThanOrEqual(1);
        expect(getTooltips()[0]).toHaveTextContent('ColDef tooltip');
    });

    describe('whenTruncated (React)', () => {
        beforeAll(() => {
            mockGridLayout.init();
            mockGridLayout.useRealOffsetDimensions = true;
        });
        afterAll(() => {
            mockGridLayout.useRealOffsetDimensions = false;
        });

        test('AG-17691 does not show whenTruncated tooltip for a non-truncated cell whose selector returns undefined', async () => {
            const columnDefs: ColDef[] = [
                {
                    field: 'A',
                    width: 200,
                    tooltipValueGetter: () => 'Should not show',
                    cellRendererSelector: (): CellRendererSelectorResult | undefined => undefined,
                },
            ];

            const rendered = render(
                <div style={{ height: 400, width: 600 }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={[{ id: 'r1', A: 'AGE' }]}
                        getRowId={(params) => String(params.data.id)}
                        tooltipShowMode="whenTruncated"
                        tooltipShowDelay={200}
                    />
                </div>
            );

            const gridDiv = rendered.container;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));

            await userEvent.hover(cell);
            await asyncSetTimeout(250);
            expect(getTooltips()).toHaveLength(0);
        });

        test('AG-17691 keeps showing whenTruncated tooltip for a stateless functional cell renderer', async () => {
            const columnDefs: ColDef[] = [
                {
                    field: 'A',
                    width: 200,
                    tooltipValueGetter: () => 'Renderer tooltip',
                    cellRenderer: PlainRenderer,
                },
            ];

            const rendered = render(
                <div style={{ height: 400, width: 600 }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={[{ id: 'r1', A: 'AGE' }]}
                        getRowId={(params) => String(params.data.id)}
                        tooltipShowMode="whenTruncated"
                        tooltipShowDelay={200}
                    />
                </div>
            );

            const gridDiv = rendered.container;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A')));

            await userEvent.hover(cell);
            await asyncSetTimeout(250);
            await waitFor(() => expect(hasTooltipText('Renderer tooltip')).toBe(true));
        });
    });
});
