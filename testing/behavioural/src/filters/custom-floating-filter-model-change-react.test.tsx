import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ALL_SEVERITIES, LEGACY_FILTER_WARNING_IDS } from 'ag-test-utils';
import React, { useCallback } from 'react';
import type { MockInstance } from 'vitest';

import type { GridApi, IDoesFilterPassParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    RowApiModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import type { CustomFilterProps, CustomFloatingFilterProps } from 'ag-grid-react';
import { AgGridReact, useGridFilter } from 'ag-grid-react';
import { MultiFilterModule } from 'ag-grid-enterprise';

const rowData = [{ athlete: 'Michael Phelps' }, { athlete: 'Aleksey Nemov' }];

const AthleteFloatingFilter = ({ model, onModelChange }: CustomFloatingFilterProps) => {
    const value = (model && model.filter) || '';
    return (
        <input
            data-testid="floating-filter-input"
            value={value}
            onChange={(e) =>
                onModelChange(
                    e.target.value === '' ? null : { filterType: 'text', type: 'contains', filter: e.target.value }
                )
            }
        />
    );
};

const CustomAthleteFilter = ({ model, getValue }: CustomFilterProps) => {
    const doesFilterPass = useCallback(
        (params: IDoesFilterPassParams) =>
            String(getValue(params.node)).toLowerCase().includes(String(model).toLowerCase()),
        [model, getValue]
    );
    useGridFilter({ doesFilterPass });
    return <div data-testid="custom-parent-filter">{model ?? ''}</div>;
};

const StringFloatingFilter = ({ model, onModelChange }: CustomFloatingFilterProps) => (
    <input
        data-testid="string-floating-filter-input"
        value={model ?? ''}
        onChange={(e) => onModelChange(e.target.value === '' ? null : e.target.value)}
    />
);

const unexpectedWarnings = (warnSpy: MockInstance<typeof console.warn>) =>
    warnSpy.mock.calls
        .map((call) => String(call[0]))
        .filter((message) => !LEGACY_FILTER_WARNING_IDS.some((id) => message.includes(`warning #${id}`)));

describe('Custom floating filter onModelChange (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, TextFilterModule, CustomFilterModule, RowApiModule]);
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: LEGACY_FILTER_WARNING_IDS });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('applies the model to a grid-provided parent filter and fires filterChangedCallback', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const onFilterChanged = vi.fn();
        let api: GridApi | undefined;

        const rendered = render(
            <AgGridReact
                onGridReady={(e) => {
                    api = e.api;
                }}
                onFilterChanged={onFilterChanged}
                rowData={rowData}
                columnDefs={[
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        floatingFilter: true,
                        floatingFilterComponent: AthleteFloatingFilter,
                        suppressFloatingFilterButton: true,
                    },
                ]}
            />
        );

        await rendered.findByText('Michael Phelps');
        const input = await rendered.findByTestId('floating-filter-input');

        fireEvent.change(input, { target: { value: 'Phelps' } });

        await waitFor(() => {
            expect(api!.getColumnFilterModel('athlete')).toEqual({
                filterType: 'text',
                type: 'contains',
                filter: 'Phelps',
            });
            expect(onFilterChanged).toHaveBeenCalled();
            expect(api!.getDisplayedRowCount()).toBe(1);
        });
        expect(unexpectedWarnings(warnSpy)).toEqual([]);
    });

    // The child floating filter's params carry the Multi Filter column, so the child model is applied to the
    // whole Multi Filter and clears every child. This pins that existing behaviour; it is not the intended one.
    // Multi Filter children are wrapped by FloatingFilterComponentWrapper, not FloatingFilterComponentProxy.
    test('pins the model change of a floating filter over a grid-provided Multi Filter child', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        let api: GridApi | undefined;

        const rendered = render(
            <AgGridReact
                modules={[MultiFilterModule]}
                onGridReady={(e) => {
                    api = e.api;
                }}
                rowData={rowData}
                columnDefs={[
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        floatingFilter: true,
                        suppressFloatingFilterButton: true,
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter', floatingFilterComponent: AthleteFloatingFilter },
                                { filter: 'agTextColumnFilter' },
                            ],
                        },
                    },
                ]}
            />
        );

        await rendered.findByText('Michael Phelps');
        await act(async () => {
            await api!.setColumnFilterModel('athlete', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'text', type: 'contains', filter: 'Nemov' }],
            });
            api!.onFilterChanged();
        });
        await waitFor(() => expect(api!.getDisplayedRowCount()).toBe(1));

        const input = await rendered.findByTestId('floating-filter-input');
        fireEvent.change(input, { target: { value: 'Phelps' } });

        await waitFor(() => {
            expect(api!.getColumnFilterModel('athlete')).toBeNull();
            expect(api!.getDisplayedRowCount()).toBe(2);
        });
        expect(unexpectedWarnings(warnSpy)).toEqual([]);
    });

    // A fully-custom parent filter is not a ProvidedFilter, so its own setModel applies the model.
    test('leaves a fully-custom parent filter on its own path', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        let api: GridApi | undefined;

        const rendered = render(
            <AgGridReact
                onGridReady={(e) => {
                    api = e.api;
                }}
                rowData={rowData}
                columnDefs={[
                    {
                        field: 'athlete',
                        filter: CustomAthleteFilter,
                        floatingFilter: true,
                        floatingFilterComponent: StringFloatingFilter,
                        suppressFloatingFilterButton: true,
                    },
                ]}
            />
        );

        await rendered.findByText('Michael Phelps');
        const input = await rendered.findByTestId('string-floating-filter-input');

        // Custom React parent re-registers its filter asynchronously on the model change; act()+waitFor
        // awaits the grid's async re-filter without leaking "not wrapped in act" noise.
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Phelps' } });
        });
        await waitFor(() => expect(api!.getDisplayedRowCount()).toBe(1));

        expect(unexpectedWarnings(warnSpy)).toEqual([]);
        expect(api!.getColumnFilterModel('athlete')).toBe('Phelps');
    });
});
