import { getByTestId, waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import { AllCommunityModule, ModuleRegistry, agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import type { CellRendererSelectorResult, ColDef, GridApi } from 'ag-grid-community';
import { FormulaModule, RowGroupingModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import type { CustomCellRendererProps } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError, mockGridLayout } from '../test-utils';

describe('Tooltips (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule, FormulaModule]);
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
        await waitFor(() => expect(hasTooltipText('Cell renderer tooltip')).toBe(true));

        await userEvent.unhover(cell);
        await waitFor(() => expect(getTooltips().length).toBe(0));

        act(() => {
            api!.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
        });
        await waitFor(() => expect(getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))).toHaveTextContent('plain'));

        await userEvent.hover(cell);
        // the ColDef tooltip can only render once the show delay has fired, so it proves the window elapsed
        await waitFor(() => expect(hasTooltipText('ColDef tooltip')).toBe(true));

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
        await waitFor(() => expect(hasTooltipText('Cell renderer tooltip')).toBe(true));

        await userEvent.unhover(cell);
        await waitFor(() => expect(getTooltips().length).toBe(0));

        act(() => {
            api!.setGridOption('rowData', [{ id: 'r1', showDetail: false }]);
        });
        await waitFor(() => expect(getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))).toHaveTextContent('plain'));

        await userEvent.hover(cell);
        // the ColDef tooltip can only render once the show delay has fired, so it proves the window elapsed
        await waitFor(() => expect(hasTooltipText('ColDef tooltip')).toBe(true));

        expect(hasTooltipText('Cell renderer tooltip')).toBe(false);
        expect(getTooltips().length).toBeLessThanOrEqual(1);
        expect(getTooltips()[0]).toHaveTextContent('ColDef tooltip');
    });

    test('re-registers the renderer tooltip when refresh() returning false remounts the renderer (React)', async () => {
        // React answers a refresh() of false by resetting the renderer tooltip and remounting under a new
        // render key, so the tooltip registered by the outgoing renderer must be replaced, not duplicated.
        const RefreshingTooltipRenderer = forwardRef<{ refresh: () => boolean }, CustomCellRendererProps>(
            (props, ref) => {
                useImperativeHandle(ref, () => ({ refresh: () => false }));
                useEffect(() => {
                    props.setTooltip(`Tip ${props.value}`, () => true);
                }, []);
                return <span>{String(props.value)}</span>;
            }
        );

        let api: GridApi | undefined;

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'A', cellRenderer: RefreshingTooltipRenderer }]}
                    rowData={[{ id: 'r1', A: 'a1' }]}
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
        await waitFor(() => expect(hasTooltipText('Tip a1')).toBe(true));

        await userEvent.unhover(cell);
        await waitFor(() => expect(getTooltips().length).toBe(0));

        act(() => {
            api!.setGridOption('rowData', [{ id: 'r1', A: 'a2' }]);
        });
        await waitFor(() => expect(getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))).toHaveTextContent('a2'));

        await userEvent.hover(await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r1', 'A'))));
        await waitFor(() => expect(hasTooltipText('Tip a2')).toBe(true));
        expect(getTooltips()).toHaveLength(1);
    });

    test('keeps the formula error tooltip after a colDef change on a column with no tooltip config (React)', async () => {
        // formula and validation error tooltips are not gated by the column's own tooltip config, so a
        // colDef change must leave every cell with a tooltip feature, not just tooltip-enabled columns.
        let api: GridApi | undefined;

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'A' }, { field: 'result' }]}
                    defaultColDef={{ editable: true, allowFormula: true }}
                    rowData={[
                        { id: 'r1', A: 1 },
                        { id: 'r2', A: 2, result: '=ERRORIFONE(REF(COLUMN("A"),ROW("r1"),COLUMN("A"),ROW("r2")))' },
                    ]}
                    getRowId={(params) => String(params.data.id)}
                    formulaFuncs={{
                        ERRORIFONE: {
                            func: (params) => {
                                for (const value of Array.from(params.values)) {
                                    if (Number(value) === 1) {
                                        throw new Error("Error, discovered a '1' in params");
                                    }
                                }
                                return 'SUCCESS';
                            },
                        },
                    }}
                    tooltipShowDelay={200}
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );

        const gridDiv = rendered.container;
        const cell = await waitFor(() => {
            const el = getByTestId(gridDiv, agTestIdFor.cell('r2', 'result'));
            expect(el).toHaveTextContent('#ERROR!');
            return el;
        });

        await userEvent.hover(cell);
        await waitFor(() => expect(getTooltips()[0]?.classList.contains('ag-cell-formula-tooltip')).toBe(true));

        await userEvent.unhover(cell);
        await waitFor(() => expect(getTooltips().length).toBe(0));

        act(() => {
            api!.setGridOption('columnDefs', [{ field: 'A' }, { field: 'result', headerName: 'Renamed' }]);
        });
        await waitFor(() => expect(api!.getColumnDef('result')?.headerName).toBe('Renamed'));

        const renamedCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('r2', 'result')));
        await userEvent.hover(renamedCell);
        await waitFor(() => expect(getTooltips()[0]?.classList.contains('ag-cell-formula-tooltip')).toBe(true));
    });

    test('AG-5004 aggregated group-row cell tooltips the aggregated value (React)', async () => {
        let api: GridApi | undefined;
        const columnDefs: ColDef[] = [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'value', aggFunc: 'sum', tooltipField: 'value' },
        ];

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={[
                        { country: 'AU', value: 2 },
                        { country: 'AU', value: 4 },
                    ]}
                    tooltipShowDelay={200}
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );

        const gridDiv = rendered.container;
        let groupRowId: string | undefined;
        await waitFor(() => {
            api!.forEachNode((node) => {
                if (node.group && node.key === 'AU') {
                    groupRowId = node.id ?? undefined;
                }
            });
            expect(groupRowId).toBeDefined();
        });

        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell(groupRowId!, 'value')));

        await userEvent.hover(cell);
        await waitFor(() => expect(getTooltips().length).toBe(1));
        expect(getTooltips()[0]).toHaveTextContent('6');
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
            // eslint-disable-next-line no-restricted-syntax -- negative assertion: samples past the 200ms tooltipShowDelay window to prove no whenTruncated tooltip appears
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
            await waitFor(() => expect(hasTooltipText('Renderer tooltip')).toBe(true));
        });
    });
});
