import { ALL_SEVERITIES, FloatingFilterHarness, GridRows, TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridState } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, GridStateModule, enableDevValidations } from 'ag-grid-community';

/**
 * The BigInt floating filter must write the same string `filter` into the model as the column filter popup,
 * so the model stays JSON-serialisable (Grid State compares it with `JSON.stringify`).
 */
describe('BigInt floating filter with enableFilterHandlers', () => {
    const gridsManager = new TestGridsManager({
        modules: [BigIntFilterModule, ClientSideRowModelModule, GridStateModule],
    });

    afterEach(() => gridsManager.reset());

    test('typing a value updates Grid State and filters the rows without throwing', async () => {
        const states: GridState[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agBigIntColumnFilter',
                    floatingFilter: true,
                    filterParams: { debounceMs: 0 },
                },
            ],
            rowData: [{ value: 1n }, { value: 2n }, { value: 3n }],
            enableFilterHandlers: true,
            onStateUpdated: (event) => states.push(event.state),
        });

        await FloatingFilterHarness.get(api, 'value').setValue('1');

        // `stateUpdated` is dispatched asynchronously.
        await vi.waitFor(() =>
            expect(states.at(-1)?.filter?.filterModel).toEqual({
                value: { filterType: 'bigint', type: 'equals', filter: '1' },
            })
        );
        await new GridRows(api, 'floating filter value filters to the matching bigint row').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:"1n"
        `);
        expect(api.getFilterModel()).toEqual({ value: { filterType: 'bigint', type: 'equals', filter: '1' } });
    });

    test('a value parsed by a custom bigintParser is stored as a string', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agBigIntColumnFilter',
                    floatingFilter: true,
                    filterParams: {
                        debounceMs: 0,
                        allowedCharPattern: '\\dxXa-fA-F',
                        bigintParser: (text: string | null) =>
                            text == null || text.trim() === '' ? null : BigInt(text),
                    },
                },
            ],
            rowData: [{ value: 1n }, { value: 255n }],
            enableFilterHandlers: true,
        });

        await FloatingFilterHarness.get(api, 'value').setValue('0xFF');

        await new GridRows(api, 'hex floating filter value filters to the parsed bigint row').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 value:"255n"
        `);
        expect(api.getFilterModel()).toEqual({ value: { filterType: 'bigint', type: 'equals', filter: '255' } });
    });

    test.each([false, true])(
        'the model holds a string filter when enableFilterHandlers is %s',
        async (enableFilterHandlers) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'value',
                        filter: 'agBigIntColumnFilter',
                        floatingFilter: true,
                        filterParams: { debounceMs: 0 },
                    },
                ],
                rowData: [{ value: 1n }, { value: 2n }],
                enableFilterHandlers,
            });

            await FloatingFilterHarness.get(api, 'value').setValue('2');

            await vi.waitFor(() =>
                expect(api.getFilterModel()).toEqual({ value: { filterType: 'bigint', type: 'equals', filter: '2' } })
            );
            expect(() => JSON.stringify(api.getFilterModel())).not.toThrow();
        }
    );
});
