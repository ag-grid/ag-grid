import { act, cleanup, render, waitFor } from '@testing-library/react';
import { ALL_SEVERITIES } from 'ag-test-utils';
import React from 'react';

import type {
    ColDef,
    FloatingFilterDisplayParams,
    GridApi,
    IFloatingFilterComp,
    IFloatingFilterParams,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomFilterModule,
    NumberFilterModule,
    RowApiModule,
    TextFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AggregationModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';
import type { CustomFilterProps, CustomFloatingFilterProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

interface Person {
    athlete: string;
    age?: number;
}

const THORPE = { filterType: 'text', type: 'contains', filter: 'Thorpe' };

class ModelFloatingFilter implements IFloatingFilterComp {
    private readonly eGui = document.createElement('input');
    public init(): void {
        this.eGui.className = 'model-floating-filter';
    }
    public getGui(): HTMLElement {
        return this.eGui;
    }
    public onParentModelChanged(model: { filter?: string } | null): void {
        this.eGui.value = model?.filter ?? '';
    }
    public refresh(params: IFloatingFilterParams | FloatingFilterDisplayParams): void {
        this.eGui.value = 'model' in params ? (params.model?.filter ?? '') : '';
    }
}

const ReactModelFloatingFilter = (props: CustomFloatingFilterProps) => (
    <input className="model-floating-filter" readOnly value={props.model?.filter ?? ''} />
);

const withComponent = (floatingFilterComponent?: unknown): ColDef<Person>[] => [
    { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent },
];

describe('Floating Filters (React)', () => {
    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
    });
    afterEach(() => cleanup());

    const renderGrid = (enableFilterHandlers: boolean, columnDefs: ColDef<Person>[]) => {
        const grid: { api?: GridApi<Person> } = {};
        const container = render(
            <React.StrictMode>
                <AgGridReact<Person>
                    enableFilterHandlers={enableFilterHandlers}
                    columnDefs={columnDefs}
                    rowData={[{ athlete: 'Ian Thorpe' }, { athlete: 'Mark Spitz' }]}
                    modules={[ClientSideRowModelModule, RowApiModule, TextFilterModule]}
                    onGridReady={(e) => (grid.api = e.api)}
                />
            </React.StrictMode>
        ).container;
        const modelInput = () =>
            container.querySelector<HTMLInputElement>('.ag-floating-filter[col-id="athlete"] .model-floating-filter');
        return { grid, container, modelInput };
    };

    test.each([
        ['a component class', 'in the same call', false, ModelFloatingFilter],
        ['a component class', 'in the same call', true, ModelFloatingFilter],
        ['a component class', 'before', false, ModelFloatingFilter],
        ['a component class', 'before', true, ModelFloatingFilter],
        ['a React component', 'in the same call', false, ReactModelFloatingFilter],
        ['a React component', 'in the same call', true, ReactModelFloatingFilter],
        ['a React component', 'before', false, ReactModelFloatingFilter],
        ['a React component', 'before', true, ReactModelFloatingFilter],
    ])(
        'a floating filter replaced by %s shows the column model set %s, with enableFilterHandlers %s',
        async (_, timing, enableFilterHandlers, component) => {
            const { grid, container, modelInput } = renderGrid(enableFilterHandlers, withComponent());
            await waitFor(() =>
                expect(container.querySelector('.ag-floating-filter[col-id="athlete"] input')).not.toBeNull()
            );
            const api = grid.api!;

            await act(async () => {
                if (timing === 'before') {
                    await api.setColumnFilterModel('athlete', THORPE);
                    api.onFilterChanged();
                }
                api.setGridOption('columnDefs', withComponent(component));
                if (timing !== 'before') {
                    await api.setColumnFilterModel('athlete', THORPE);
                    api.onFilterChanged();
                }
            });

            await waitFor(() => expect(modelInput()?.value).toBe('Thorpe'));
            expect(api.getDisplayedRowCount()).toBe(1);
        }
    );

    test('a floating filter replaced while its own creation is pending shows the column model set in the same call', async () => {
        let finishSlowInit: (() => void) | undefined;
        class SlowFloatingFilter implements IFloatingFilterComp {
            private readonly eGui = document.createElement('input');
            public init(): AgPromise<void> {
                return new AgPromise<void>((resolve) => {
                    finishSlowInit = () => resolve();
                });
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public onParentModelChanged(): void {}
        }
        const { grid, modelInput } = renderGrid(false, withComponent(SlowFloatingFilter));
        await waitFor(() => expect(typeof finishSlowInit).toBe('function'));
        const api = grid.api!;

        await act(async () => {
            api.setGridOption('columnDefs', withComponent(ModelFloatingFilter));
            await api.setColumnFilterModel('athlete', THORPE);
            api.onFilterChanged();
            finishSlowInit!();
        });

        await waitFor(() => expect(modelInput()?.value).toBe('Thorpe'));
    });

    test('a floating filter turned off and on again shows the model set while it was off', async () => {
        let api: GridApi<Person> | undefined;
        const withFloating = (floatingFilter: boolean): ColDef<Person>[] => [
            { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter },
            // keeps the floating filter row, so athlete's header cell is the one turned off and on
            { field: 'age', filter: 'agTextColumnFilter', floatingFilter: true },
        ];
        const container = render(
            <React.StrictMode>
                <AgGridReact<Person>
                    columnDefs={withFloating(true)}
                    rowData={[{ athlete: 'Ian Thorpe', age: 17 }]}
                    modules={[ClientSideRowModelModule, RowApiModule, TextFilterModule]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        ).container;
        const floatingInput = () =>
            container.querySelector<HTMLInputElement>('.ag-floating-filter[col-id="athlete"] input');
        await waitFor(() => expect(floatingInput()).not.toBeNull());

        act(() => api!.setGridOption('columnDefs', withFloating(false)));
        await waitFor(() => expect(floatingInput()).toBeNull());
        await act(() => api!.setColumnFilterModel('athlete', THORPE));
        act(() => api!.setGridOption('columnDefs', withFloating(true)));
        await waitFor(() => expect(floatingInput()?.value).toBe('Thorpe'));
    });

    test('pivot result floating filters name their column with the new aggregation function', async () => {
        let api: GridApi | undefined;
        const container = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[
                        { field: 'a', rowGroup: true },
                        { field: 'b', pivot: true },
                        { field: 'n', aggFunc: 'max', filter: true, floatingFilter: true },
                    ]}
                    rowData={[
                        { a: 'p', b: 'x', n: 1 },
                        { a: 'p', b: 'y', n: 2 },
                        { a: 'q', b: 'x', n: 3 },
                        { a: 'q', b: 'y', n: 4 },
                    ]}
                    pivotMode
                    modules={[
                        ClientSideRowModelModule,
                        ColumnApiModule,
                        NumberFilterModule,
                        AggregationModule,
                        PivotModule,
                        RowGroupingModule,
                    ]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        ).container;
        const labels = (colIds: string[]) =>
            colIds.map((colId) => {
                const cell = container.querySelector(`.ag-floating-filter[col-id="${colId}"]`);
                return {
                    colId,
                    button:
                        cell?.querySelector('.ag-floating-filter-button button')?.getAttribute('aria-label') ?? null,
                    input: cell?.querySelector('input')?.getAttribute('aria-label') ?? null,
                };
            });
        const expected = (colIds: string[], name: string) =>
            colIds.map((colId) => ({
                colId,
                button: `Open ${name} Filter Menu`,
                input: `${name} Filter Input`,
            }));
        await waitFor(() => expect(api?.getPivotResultColumns()?.length).toBe(2));
        const colIds = api!.getPivotResultColumns()!.map((col) => col.getColId());

        await waitFor(() => expect(labels(colIds)).toEqual(expected(colIds, 'max(N)')));

        act(() => {
            api!.applyColumnState({ state: [{ colId: 'n', aggFunc: 'avg' }] });
        });

        await waitFor(() => expect(labels(colIds)).toEqual(expected(colIds, 'avg(N)')));
    });

    test.each([
        ['a string', 'a', 'a', 'a'],
        ['a callback', (params: { floatingFilter?: boolean }) => (params.floatingFilter ? 'ff' : 'hdr'), 'hdr', 'ff'],
    ])('headerClass as %s applies to the header and the floating filter', async (_, headerClass, header, ff) => {
        const { container } = renderGrid(false, [
            { field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true, headerClass },
        ]);
        const names = (selector: string) =>
            Array.from(container.querySelector(selector)?.classList ?? []).filter((name) => /^(a|hdr|ff)$/.test(name));

        await waitFor(() => expect(names('.ag-floating-filter[col-id="athlete"]')).toEqual([ff]));
        expect(names('.ag-header-cell:not(.ag-floating-filter)[col-id="athlete"]')).toEqual([header]);
    });

    test('a React custom filter receives props without rowModel', async () => {
        let captured: CustomFilterProps | undefined;
        const CapturingFilter = (props: CustomFilterProps) => {
            captured = props;
            return <div className="capturing-filter" />;
        };
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [343, 348] });
        let api: GridApi<Person> | undefined;
        render(
            <AgGridReact<Person>
                columnDefs={[{ field: 'athlete', filter: CapturingFilter }]}
                rowData={[{ athlete: 'Ian Thorpe' }]}
                modules={[ClientSideRowModelModule, CustomFilterModule]}
                onGridReady={(e) => (api = e.api)}
            />
        );
        await waitFor(() => expect(api).toBeDefined());
        await act(async () => {
            await api!.getColumnFilterInstance('athlete');
        });
        await waitFor(() => expect(captured).toBeDefined());

        expect(captured!.api).toBeDefined();
        expect('rowModel' in captured!).toBe(false);
    });
});
