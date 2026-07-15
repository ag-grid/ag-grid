import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React, { useCallback } from 'react';

import type { GridApi, IDoesFilterPassParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    RowApiModule,
    TextFilterModule,
} from 'ag-grid-community';
import type { CustomFilterProps, CustomFloatingFilterProps } from 'ag-grid-react';
import { AgGridReact, useGridFilter } from 'ag-grid-react';

import { asyncSetTimeout } from '../test-utils';

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

// Fully-custom parent filter: its setModel is the user's own method, not the deprecated ProvidedFilter.setModel.
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

const emitted286 = (warnSpy: ReturnType<typeof vi.spyOn>) =>
    warnSpy.mock.calls.some((call) => String(call[0]).includes('warning #286'));

describe('Custom floating filter onModelChange (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, TextFilterModule, CustomFilterModule, RowApiModule]);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    // onModelChange is the documented, non-deprecated API; changing the model through it must not
    // route through the parent filter's deprecated setModel() (which fires warning #286).
    test('does not emit deprecation warning #286 when the model changes', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rendered = render(
            <AgGridReact
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
        await asyncSetTimeout(50);

        expect(emitted286(warnSpy)).toBe(false);
    });

    test('still applies the model to the provided parent filter', async () => {
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
        await asyncSetTimeout(50);

        expect(api!.getColumnFilterModel('athlete')).toEqual({
            filterType: 'text',
            type: 'contains',
            filter: 'Phelps',
        });
        expect(api!.getDisplayedRowCount()).toBe(1);
    });

    // Scope guard: a fully-custom parent filter keeps its own setModel path (the instanceof
    // ProvidedFilter branch is false), so the model is still applied and no warning fires.
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

        expect(emitted286(warnSpy)).toBe(false);
        expect(api!.getColumnFilterModel('athlete')).toBe('Phelps');
    });
});
