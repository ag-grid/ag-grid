import { bench, suite } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';
import { CalculatedColumnsModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const rowData = Array.from({ length: 100_000 }, (_, i) => ({
    id: String(i),
    revenue: 100 + ((i * 7919) % 10000),
    cost: 50 + ((i * 104729) % 9000),
    qty: 1 + (i % 50),
}));
type Data = (typeof rowData)[number];

const profit = (data: Data) => data.revenue - data.cost;
const margin = (data: Data) => (data.revenue > 0 ? profit(data) / data.revenue : 0);
const unit = (data: Data) => data.revenue / data.qty;
const c1 = (data: Data) => margin(data) * 100;
const c2 = (data: Data) => c1(data) + unit(data);

const derivedColumns = [
    { colId: 'profit', expression: '[revenue] - [cost]', getter: profit },
    { colId: 'margin', expression: 'IF([revenue] > 0, [profit] / [revenue], 0)', getter: margin },
    { colId: 'unit', expression: '[revenue] / [qty]', getter: unit },
    { colId: 'c1', expression: '[margin] * 100', getter: c1 },
    { colId: 'c2', expression: '[c1] + [unit]', getter: c2 },
];

suite('calculated columns - sorting 100k rows with five chained values', () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, ColumnApiModule, CalculatedColumnsModule],
    });

    for (const calculated of [true, false]) {
        let api: GridApi<Data>;
        let ascending: boolean;
        let cost: number;
        const options = benchDefaults({
            setup: async () => {
                await gridsManager.reset();
                const columnDefs: ColDef<Data>[] = derivedColumns.map(({ colId, expression, getter }) => ({
                    colId,
                    ...(calculated
                        ? { calculatedExpression: expression, cellDataType: 'number' }
                        : { valueGetter: ({ data }) => (data ? getter(data) : undefined) }),
                }));
                api = gridsManager.createGrid<Data>('sorting', {
                    columnDefs: [{ field: 'revenue' }, { field: 'cost' }, { field: 'qty' }, ...columnDefs],
                    rowData,
                    getRowId: ({ data }) => data.id,
                    calculatedColumns: calculated,
                    defaultColDef: { sortable: true, width: 120 },
                });
                ascending = true;
                cost = rowData[5].cost;
                api.applyColumnState({ state: [{ colId: 'c2', sort: 'asc' }] });
                api.flushAllAnimationFrames();
            },
        });
        const mode = calculated ? 'calculated' : 'valueGetter';

        bench(
            `${mode}: repeat sort by c2`,
            () => {
                ascending = !ascending;
                api.applyColumnState({
                    state: [{ colId: 'c2', sort: ascending ? 'asc' : 'desc' }],
                    defaultState: { sort: null },
                });
                api.flushAllAnimationFrames();
            },
            options
        );

        bench(
            `${mode}: one-row transaction sorted by c2`,
            () => {
                cost = cost === rowData[5].cost ? cost + 1 : rowData[5].cost;
                api.applyTransaction({ update: [{ ...rowData[5], cost }] });
                api.flushAllAnimationFrames();
            },
            options
        );
    }
});
