import { findByTestId } from '@testing-library/dom';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    EventApiModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnMenuModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Row {
    name?: string;
    age?: number;
}

const ROW_DATA: Row[] = [{ name: 'michael' }, { name: 'michelle' }, { name: 'bob' }, { name: 'alice' }];
const NUMBER_ROW_DATA: Row[] = [{ age: 5 }, { age: 58 }, { age: 100 }];

describe('Multi Filter floating filter keystroke race', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            EventApiModule,
            MultiFilterModule,
            NumberFilterModule,
            SetFilterModule,
            TextFilterModule,
            ColumnMenuModule,
        ],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    async function createGrid(overrides?: Partial<GridOptions<Row>>): Promise<GridApi<Row>> {
        return gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 1 } },
                            { filter: 'agSetColumnFilter', filterParams: { debounceMs: 1 } },
                        ],
                    },
                    floatingFilter: true,
                },
            ],
            rowData: ROW_DATA,
            ...overrides,
        });
    }

    async function getFloatingFilterInput(api: GridApi<Row>): Promise<HTMLInputElement> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        return findByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'name', index: 0 })
        );
    }

    async function getTextFloatingFilterInput(api: GridApi<Row>, colId: string): Promise<HTMLInputElement> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        return findByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId })
        );
    }

    async function getNumberFloatingFilterInput(api: GridApi<Row>, colId: string): Promise<HTMLInputElement> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        return findByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId })
        );
    }

    describe.each([false, true])('enableFilterHandlers: %s', (enableFilterHandlers) => {
        test('typed character is not clobbered by an interleaving non-floating filter-changed cycle', async () => {
            const api = await createGrid({ enableFilterHandlers });
            const input = await getFloatingFilterInput(api);

            // Type and apply `u` so the parent filter model becomes `u`.
            input.focus();
            input.value = 'u';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await asyncSetTimeout(2);
            expect(api.getDisplayedRowCount()).toBe(0);
            // No name contains 'u', so the applied `u` model empties the grid.
            await new GridRows(api, "text 'u' applied empties grid").check(`
                ROOT id:ROOT_NODE_ID
            `);

            // User continues typing: the live input is now `u8` while still focused, but the new
            // keystroke has not yet flushed through the debounce into the filter model.
            input.value = 'u8';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            // An interleaving, non-floating filter-changed cycle re-runs the model writeback over the
            // focused input with the still-stale `u` model — the keystroke-clobber trigger.
            api.onFilterChanged();
            await asyncSetTimeout(2);

            // The live keystroke must survive: the input must still read `u8`, not revert to `u`.
            expect(input.value).toBe('u8');

            // ...and the applied filter model must converge on the live keystroke, not the stale `u`.
            const model = api.getColumnFilterModel<{ filterModels: ({ filter?: string } | null)[] }>('name');
            expect(model?.filterModels?.[0]?.filter).toBe('u8');
            // Converged `u8` model matches no name, so the grid stays empty (not reverted to a different set).
            expect(api.getDisplayedRowCount()).toBe(0);
            await new GridRows(api, "converged 'u8' model empties grid").check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('external model writeback still updates the input when it is not focused', async () => {
            const api = await createGrid({ enableFilterHandlers });
            const input = await getFloatingFilterInput(api);

            input.blur();

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }, null],
            });
            await api.onFilterChanged();
            await asyncSetTimeout(2);

            expect(input.value).toBe('bob');
            // The programmatic `contains bob` model filters down to the single matching row.
            expect(api.getDisplayedRowCount()).toBe(1);
            await new GridRows(api, "writeback 'bob' filters to one row (blurred)").check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);
        });

        test('external model writeback updates a focused input when no keystroke is pending', async () => {
            const api = await createGrid({ enableFilterHandlers });
            const input = await getFloatingFilterInput(api);

            // Input is focused but the user has not typed anything, so there is no pending edit to protect.
            input.focus();

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }, null],
            });
            await api.onFilterChanged();
            await asyncSetTimeout(2);

            expect(input.value).toBe('bob');
            // Same programmatic model applied while focused still filters to the single matching row.
            expect(api.getDisplayedRowCount()).toBe(1);
            await new GridRows(api, "writeback 'bob' filters to one row (focused)").check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);
        });

        test('number floating filter keystroke is not clobbered by an interleaving filter-changed cycle', async () => {
            const api = await createGrid({
                enableFilterHandlers,
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: { debounceMs: 1 },
                        floatingFilter: true,
                    },
                ],
                rowData: NUMBER_ROW_DATA,
            });
            const input = await getNumberFloatingFilterInput(api, 'age');

            // Type and apply `5` so the parent filter model becomes `5`.
            input.focus();
            input.value = '5';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await asyncSetTimeout(2);

            // Continue typing `58` while focused, before the keystroke flushes into the model.
            input.value = '58';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            api.onFilterChanged();
            await asyncSetTimeout(2);

            expect(input.value).toBe('58');
            const model = api.getColumnFilterModel<{ filter?: number }>('age');
            expect(model?.filter).toBe(58);
            // Converged `58` equals-model keeps only the age-58 row, not the stale age-5 result.
            expect(api.getDisplayedRowCount()).toBe(1);
            await new GridRows(api, "converged age '58' keeps one row").check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 age:58
            `);
        });

        test('typed character survives an interleaving cycle when an apply button is configured', async () => {
            const api = await createGrid({
                enableFilterHandlers,
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agTextColumnFilter',
                        filterParams: { buttons: ['apply'] },
                        floatingFilter: true,
                    },
                ],
                rowData: ROW_DATA,
            });
            const input = await getTextFloatingFilterInput(api, 'name');

            input.focus();
            input.value = 'mich';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await asyncSetTimeout(2);

            // With an apply button the keystroke is held until applied, so `pendingEdit` stays set.
            api.onFilterChanged();
            await asyncSetTimeout(2);

            expect(input.value).toBe('mich');
            // Nothing was applied: the apply button still gates the model.
            expect(api.getColumnFilterModel('name')).toBeNull();
            // Gated keystroke never reaches the model, so no rows are filtered out.
            expect(api.getDisplayedRowCount()).toBe(4);
            await new GridRows(api, "gated 'mich' keystroke leaves all rows").check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });
    });
});
