import { bench, suite } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    DateFilterModule,
    RowApiModule,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchCooldown, benchDefaults } from './bench-utils';

const ROW_COUNT = 50_000;
const START = Date.UTC(2020, 0, 1);

const instantAt = (index: number) => new Date(START + index * 60_000);
const localString = (index: number) => instantAt(index).toISOString().slice(0, 19);
const utcString = (index: number) => `${localString(index)}Z`;

/**
 * Datetime strings are parsed for every row on each filter or aggregation, and a Date Filter also re-reads its
 * model values per row. Covers strings with and without a `Z`, since the two take different parser paths.
 */
suite('datetime filtering and aggregation', () => {
    const gridsManager = new BenchGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            DateFilterModule,
            RowApiModule,
            RowGroupingModule,
        ],
    });

    const filterBench = (
        name: string,
        cellDataType: 'dateTime' | 'dateTimeString',
        cellValue: (index: number) => Date | string,
        dateFrom: string
    ) => {
        let api: GridApi | undefined;
        const setup = async () => {
            await benchCooldown();
            if (api) {
                return;
            }
            const rowData = Array.from({ length: ROW_COUNT }, (_, index) => ({ at: cellValue(index) }));
            const options: GridOptions = {
                columnDefs: [{ field: 'at', cellDataType, filter: 'agDateColumnFilter' }],
                rowData,
            };
            api = gridsManager.createGrid(name, options);
            await api.setColumnFilterModel('at', { filterType: 'date', type: 'greaterThan', dateFrom, dateTo: null });
            api.onFilterChanged();
            const displayed = api.getDisplayedRowCount();
            // Guards against measuring a no-op: the filter must keep some rows and drop others.
            if (displayed === 0 || displayed === ROW_COUNT) {
                throw new Error(`datetime filter bench "${name}": filter kept ${displayed} rows`);
            }
        };
        bench(`re-filter ${ROW_COUNT} rows: ${name}`, () => api!.onFilterChanged(), { ...benchDefaults(), setup });
    };

    filterBench('dateTimeString cells with no offset', 'dateTimeString', localString, '2020-01-18T00:00:00');
    filterBench('dateTimeString cells with Z', 'dateTimeString', utcString, '2020-01-18T00:00:00.000Z');
    filterBench('dateTime cells', 'dateTime', instantAt, '2020-01-18T00:00:00.000Z');

    let aggApi: GridApi | undefined;
    bench(
        `aggregate max of ${ROW_COUNT} dateTimeString cells with Z`,
        () => aggApi!.refreshClientSideRowModel('aggregate'),
        {
            ...benchDefaults(),
            setup: async () => {
                await benchCooldown();
                if (aggApi) {
                    return;
                }
                aggApi = gridsManager.createGrid('aggregate', {
                    columnDefs: [
                        { field: 'group', rowGroup: true, hide: true },
                        { field: 'at', cellDataType: 'dateTimeString', aggFunc: 'max' },
                    ],
                    rowData: Array.from({ length: ROW_COUNT }, (_, index) => ({
                        group: `g${index % 100}`,
                        at: utcString(index),
                    })),
                });
                if (aggApi.getDisplayedRowAtIndex(0)?.aggData?.at == null) {
                    throw new Error('datetime aggregate bench: no aggregated value');
                }
            },
        }
    );
});
