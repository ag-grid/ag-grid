import { findByTestId, waitFor } from '@testing-library/dom';

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

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForEvent } from '../test-utils';

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

    async function typeInFloatingFilter(api: GridApi<Row>, text: string): Promise<void> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        // findByTestId retries internally — handles the slow-CI window where the floating-filter
        // input is briefly detached/remounted after a popup show/hide cycle (Scenario B).
        const input = await findByTestId<HTMLInputElement>(
            gridDiv,
            agTestIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'name', index: 0 })
        );

        // Register the listener before dispatching so the post-debounce event isn't missed.
        const filterChanged = waitForEvent('filterChanged', api);
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        await asyncSetTimeout(1);
        return filterChanged;
    }

    /**
     * Keys that will be rendered in the open Set Filter list — read from the display value model
     * the Set Filter populates in `setParams`. Same pattern as set-filter-complex-objects.test.ts.
     * Needed because jsdom does not lay out the VirtualList, so the rendered DOM is empty.
     */
    async function openPopupAndGetDisplayedSetFilterKeys(api: GridApi<Row>): Promise<string[]> {
        api.showColumnFilter('name');
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
        await new GridColumns(api, `Scenario A: no popup opened — reopening popup shows filtered Set Filter list setup`)
            .checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
        await new GridRows(api, `Scenario A: no popup opened — reopening popup shows filtered Set Filter list setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);

        // typeInFloatingFilter awaits filterChanged so the post-debounce row state is deterministic.
        await typeInFloatingFilter(api, 'michael');
        expect(api.getDisplayedRowCount()).toBe(1);

        // The Set Filter's display value model refreshes asynchronously after filterChanged; the
        // popup show + child filter resolution path also has its own microtask hops, so retry here.
        await waitFor(async () => {
            expect(await openPopupAndGetDisplayedSetFilterKeys(api)).toEqual(['michael']);
        });
        await new GridRows(
            api,
            `Scenario A: no popup opened — reopening popup shows filtered Set Filter list final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"michael"
        `);
    });

    test('Scenario B: popup opened+closed before floating filter — reopening popup shows filtered Set Filter list', async () => {
        const api = await createGrid();
        await new GridColumns(
            api,
            `Scenario B: popup opened+closed before floating filter — reopening popup shows f setup`
        ).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(
            api,
            `Scenario B: popup opened+closed before floating filter — reopening popup shows f setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"michael"
            ├── LEAF id:1 name:"michelle"
            ├── LEAF id:2 name:"bob"
            └── LEAF id:3 name:"alice"
        `);

        api.showColumnFilter('name');
        api.hideColumnFilter();

        await typeInFloatingFilter(api, 'michael');
        expect(api.getDisplayedRowCount()).toBe(1);

        await waitFor(async () => {
            expect(await openPopupAndGetDisplayedSetFilterKeys(api)).toEqual(['michael']);
        });
        await new GridRows(
            api,
            `Scenario B: popup opened+closed before floating filter — reopening popup shows f final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"michael"
        `);
    });
});
