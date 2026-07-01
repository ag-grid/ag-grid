import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

interface RowData {
    value: string;
}

describe('Set Filter dropdown opened before data arrives (AG-17369)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SetFilterModule],
    });

    afterEach(() => gridsManager.reset());

    async function getSetFilter(api: GridApi): Promise<SetFilter<any>> {
        const filter = (await api.getColumnFilterInstance('value')) as SetFilter<any> | null | undefined;
        if (!filter) {
            throw new Error('Expected SetFilter instance for value column');
        }
        return filter;
    }

    async function openDropdown(api: GridApi): Promise<void> {
        api.showColumnFilter('value');
        await asyncSetTimeout(0);
    }

    async function runScenario(
        gridId: string,
        options: { openBeforeData: boolean } & Partial<GridOptions<RowData>>
    ): Promise<{ uiValues: (string | null)[] | null; modelValues: string[] | undefined; displayedRowCount: number }> {
        const { openBeforeData, ...overrides } = options;
        const api = gridsManager.createGrid<RowData>(gridId, {
            columnDefs: [{ field: 'value', filter: 'agSetColumnFilter' }],
            rowData: [],
            ...overrides,
        });

        void api.setColumnFilterModel('value', { filterType: 'set', values: ['one'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        if (openBeforeData) {
            await openDropdown(api);
            api.hideColumnFilter();
            await asyncSetTimeout(0);
        }

        api.applyTransaction({ add: [{ value: 'one' }, { value: 'two' }] });
        await asyncSetTimeout(0);

        await openDropdown(api);
        const setFilter = await getSetFilter(api);

        return {
            uiValues: setFilter.getModelFromUi()?.values ?? null,
            modelValues: api.getColumnFilterModel<{ values: string[] }>('value')?.values,
            displayedRowCount: api.getDisplayedRowCount(),
        };
    }

    test('converges on the same Set Filter state regardless of when the dropdown is opened', async () => {
        const scenarioA = await runScenario('gridA', { openBeforeData: false });
        const scenarioB = await runScenario('gridB', { openBeforeData: true });

        // AC3: Scenario A (open after data) and Scenario B (open before + after data) converge.
        expect(scenarioB.uiValues).toEqual(scenarioA.uiValues);
        expect(scenarioB.modelValues).toEqual(scenarioA.modelValues);
        expect(scenarioB.displayedRowCount).toBe(scenarioA.displayedRowCount);

        // AC1 + AC2: the converged state matches the applied `values: ['one']` model.
        expect(scenarioA.uiValues).toEqual(['one']);
        expect(scenarioA.modelValues).toEqual(['one']);
        expect(scenarioA.displayedRowCount).toBe(1);
    });

    test('explicit cellDataType keeps the correct scenario-independent state (workaround guard)', async () => {
        const columnDefs = [{ field: 'value', filter: 'agSetColumnFilter', cellDataType: 'text' }];
        const scenarioA = await runScenario('gridTextA', { openBeforeData: false, columnDefs });
        const scenarioB = await runScenario('gridTextB', { openBeforeData: true, columnDefs });

        expect(scenarioA.uiValues).toEqual(['one']);
        expect(scenarioB.uiValues).toEqual(['one']);
        expect(scenarioB.modelValues).toEqual(scenarioA.modelValues);
        expect(scenarioB.displayedRowCount).toBe(scenarioA.displayedRowCount);
    });
});
