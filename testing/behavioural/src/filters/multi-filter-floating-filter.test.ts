import { findByTestId } from '@testing-library/dom';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    EventApiModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnMenuModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Row {
    name: string;
}

const ROW_DATA: Row[] = [{ name: 'michael' }, { name: 'michelle' }, { name: 'bob' }, { name: 'alice' }];

describe('Multi Filter floating filter keystroke race', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            EventApiModule,
            MultiFilterModule,
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
        });
    });
});
