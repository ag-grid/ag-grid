import { getByTestId, waitFor } from '@testing-library/dom';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { MultiFilter, SetFilter } from 'ag-grid-enterprise';
import { ColumnMenuModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Row {
    name: string;
}

const ROW_DATA: Row[] = [{ name: 'michael' }, { name: 'michelle' }, { name: 'bob' }, { name: 'alice' }];

describe('Multi Filter + Set Filter list refresh on floating filter change', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, MultiFilterModule, SetFilterModule, TextFilterModule, ColumnMenuModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    async function createGrid(overrides?: Partial<GridOptions<Row>>): Promise<GridApi<Row>> {
        return gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    floatingFilter: true,
                },
            ],
            rowData: ROW_DATA,
            ...overrides,
        });
    }

    async function typeInFloatingFilter(api: GridApi<Row>, text: string): Promise<void> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        const input = getByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'name', index: 0 })
        );
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        // Filters are debounced; wait enough for debounce + async handler refresh.
        await asyncSetTimeout(600);
    }

    /**
     * Keys that will be rendered in the open Set Filter list — read from the display value model
     * the Set Filter populates in `setParams`. Same pattern as set-filter-complex-objects.test.ts.
     * Needed because jsdom does not lay out the VirtualList, so the rendered DOM is empty.
     */
    async function openPopupAndGetDisplayedSetFilterKeys(api: GridApi<Row>): Promise<string[]> {
        api.showColumnFilter('name');
        await asyncSetTimeout(0);
        const multiFilter = (await api.getColumnFilterInstance('name')) as MultiFilter | null | undefined;
        const setFilter = multiFilter?.getChildFilterInstance<SetFilter>(1);
        if (!setFilter) {
            throw new Error('Expected SetFilter child instance at index 1 of Multi Filter');
        }
        const displayedKeys = (setFilter as any).displayValueModel.getDisplayedKeys() as (string | null)[];
        return displayedKeys.filter((k): k is string => k != null).sort();
    }

    test('Scenario A: no popup opened — reopening popup shows filtered Set Filter list', async () => {
        const api = await createGrid();
        await asyncSetTimeout(0);

        await typeInFloatingFilter(api, 'michael');

        expect(api.getDisplayedRowCount()).toBe(1);

        await waitFor(async () => {
            expect(await openPopupAndGetDisplayedSetFilterKeys(api)).toEqual(['michael']);
        });
    });

    test('Scenario B: popup opened+closed before floating filter — reopening popup shows filtered Set Filter list', async () => {
        const api = await createGrid();
        await asyncSetTimeout(0);

        api.showColumnFilter('name');
        await asyncSetTimeout(10);
        api.hideColumnFilter();
        await asyncSetTimeout(10);

        await typeInFloatingFilter(api, 'michael');

        expect(api.getDisplayedRowCount()).toBe(1);

        await waitFor(async () => {
            expect(await openPopupAndGetDisplayedSetFilterKeys(api)).toEqual(['michael']);
        });
    });
});
