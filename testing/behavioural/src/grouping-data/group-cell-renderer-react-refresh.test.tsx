import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { useCallback, useMemo } from 'react';

import type { ColDef, GridApi, GridReadyEvent, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RenderApiModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

describe('GroupCellRenderer (React) — refresh propagates new params to inner renderer', () => {
    let consoleErrorSpy: ReturnType<typeof vitest.spyOn>;
    let consoleWarnSpy: ReturnType<typeof vitest.spyOn>;

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RenderApiModule, AllEnterpriseModule]);
    });

    beforeEach(() => {
        cleanup();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('refreshCells flows new params through cellComp → GroupCellRenderer → ctrl.refresh → inner renderer', async () => {
        const data: { id: number; group: number; name: string }[] = [];
        for (let i = 0; i < 10; i++) {
            data.push({ id: i, group: i % 2, name: `row-${i}` });
        }

        const InnerRenderer = (props: CustomCellRendererProps) => (
            <span data-testid={`inner:${props.node.id}`}>{props.value}</span>
        );

        // tick lives outside the React tree so the test body can mutate it directly.
        // The valueGetter closes over it and produces a NEW immutable string per refresh
        // — using a string (not a shared mutable object) is essential, otherwise stale
        // references would still see the latest value and mask a broken refresh path.
        const tickHolder = { tick: 0 };
        let api: GridApi | undefined;

        const Grid = () => {
            const colDefs = useMemo<ColDef[]>(
                () => [
                    {
                        colId: 'tickCol',
                        cellRenderer: 'agGroupCellRenderer',
                        cellRendererParams: { innerRenderer: InnerRenderer, suppressCount: true },
                        valueGetter: (p: ValueGetterParams) =>
                            `${p.data?.name ?? p.node?.key ?? ''}|tick=${tickHolder.tick}`,
                    },
                    { field: 'group', rowGroup: true, hide: true },
                ],
                []
            );

            const onGridReady = useCallback((e: GridReadyEvent) => {
                api = e.api;
            }, []);

            return (
                <AgGridReact
                    rowData={data}
                    columnDefs={colDefs}
                    getRowId={(p) => String(p.data.id)}
                    groupDefaultExpanded={-1}
                    onGridReady={onGridReady}
                />
            );
        };

        render(<Grid />);

        await waitFor(() => expect(screen.getByTestId('inner:0')).toHaveTextContent('row-0|tick=0'));
        expect(screen.getByTestId('inner:2')).toHaveTextContent('row-2|tick=0');

        // Bump + refreshCells. With a real ctrl.refresh impl, addGroupValue re-runs
        // and setInnerRenderer fires; without it (blind `return true` or no method),
        // innerComp.details.params.value stays frozen at "row-0|tick=0".
        await act(async () => {
            tickHolder.tick = 1;
            api!.refreshCells({ force: true });
        });

        await waitFor(() => expect(screen.getByTestId('inner:0')).toHaveTextContent('row-0|tick=1'));
        expect(screen.getByTestId('inner:2')).toHaveTextContent('row-2|tick=1');

        await act(async () => {
            tickHolder.tick = 2;
            api!.refreshCells({ force: true });
        });

        await waitFor(() => expect(screen.getByTestId('inner:0')).toHaveTextContent('row-0|tick=2'));
    });
});

describe('GroupCellRenderer (React) — CssClassManager owns managed elements', () => {
    let consoleErrorSpy: ReturnType<typeof vitest.spyOn>;
    let consoleWarnSpy: ReturnType<typeof vitest.spyOn>;

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RenderApiModule, AllEnterpriseModule]);
    });

    beforeEach(() => {
        cleanup();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('default classes are present and survive React re-renders triggered by refreshCells', async () => {
        const data: { id: number; group: number; name: string }[] = [];
        for (let i = 0; i < 4; i++) {
            data.push({ id: i, group: i % 2, name: `row-${i}` });
        }

        const tickHolder = { tick: 0 };
        let api: GridApi | undefined;

        const Grid = () => {
            const colDefs = useMemo<ColDef[]>(
                () => [
                    {
                        colId: 'tickCol',
                        valueGetter: (p: ValueGetterParams) =>
                            `${p.data?.name ?? p.node?.key ?? ''}|tick=${tickHolder.tick}`,
                    },
                    { field: 'group', rowGroup: true, hide: true },
                ],
                []
            );

            const onGridReady = useCallback((e: GridReadyEvent) => {
                api = e.api;
            }, []);

            return (
                <AgGridReact
                    rowData={data}
                    columnDefs={colDefs}
                    getRowId={(p) => String(p.data.id)}
                    groupDefaultExpanded={-1}
                    onGridReady={onGridReady}
                />
            );
        };

        const { container } = render(<Grid />);

        const getGroupWrapper = () => container.querySelector<HTMLElement>('.ag-cell-wrapper.ag-row-group');

        await waitFor(() => expect(getGroupWrapper()).toBeTruthy());

        // Default classes seeded by the manager land on the DOM
        const wrapper = getGroupWrapper()!;
        expect(wrapper.classList.contains('ag-cell-wrapper')).toBe(true);
        const expandedSpan = wrapper.querySelector<HTMLElement>('.ag-group-expanded')!;
        const contractedSpan = wrapper.querySelector<HTMLElement>('.ag-group-contracted')!;
        const checkboxSpan = wrapper.querySelector<HTMLElement>('.ag-group-checkbox')!;
        expect(expandedSpan).toBeTruthy();
        expect(contractedSpan).toBeTruthy();
        expect(checkboxSpan).toBeTruthy();

        // Expanded by default → expanded span visible, contracted span hidden
        expect(expandedSpan.classList.contains('ag-hidden')).toBe(false);
        expect(contractedSpan.classList.contains('ag-hidden')).toBe(true);

        // Collapse the group → manager flips ag-hidden between the two spans
        await act(async () => {
            api!.collapseAll();
        });

        await waitFor(() => {
            const w = getGroupWrapper()!;
            expect(w.querySelector<HTMLElement>('.ag-group-expanded')!.classList.contains('ag-hidden')).toBe(true);
            expect(w.querySelector<HTMLElement>('.ag-group-contracted')!.classList.contains('ag-hidden')).toBe(false);
        });

        // Force a React re-render via refreshCells. The renderer's internal state
        // (innerCompDetails, value) updates, causing reconciliation of the JSX.
        // Manager-applied classes must survive — if we ever put className back on a
        // managed element, this assertion will catch the regression.
        await act(async () => {
            tickHolder.tick = 1;
            api!.refreshCells({ force: true });
        });

        const afterRefresh = getGroupWrapper()!;
        expect(afterRefresh.classList.contains('ag-cell-wrapper')).toBe(true);
        expect(afterRefresh.querySelector<HTMLElement>('.ag-group-expanded')!.classList.contains('ag-hidden')).toBe(
            true
        );
        expect(afterRefresh.querySelector<HTMLElement>('.ag-group-contracted')!.classList.contains('ag-hidden')).toBe(
            false
        );
        // Checkbox base classes still present
        expect(afterRefresh.querySelector<HTMLElement>('.ag-group-checkbox')).toBeTruthy();
    });
});
