import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';
import type { SetFilter } from 'ag-grid-enterprise';

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

    test('converges on the same dropdown checkbox state regardless of when the dropdown is opened', async () => {
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

    // Migrates the reporter's three-grid repro (plnkr rDnZ7Rlxl6dLqcY5, "Grid 1": default cellDataType with
    // inference enabled, no filterParams.values) as a behavioural test. Sequence: apply a set model to the empty
    // grid, add rows, remove the sole matching row, then re-apply the identical model.
    async function runSequence(options: { openBeforeData: boolean; startWithData: boolean }) {
        const { openBeforeData, startWithData } = options;
        const one: RowData = { value: 'one' };
        const two: RowData = { value: 'two' };

        const api = gridsManager.createGrid<RowData>(`seq-${startWithData}-${openBeforeData}`, {
            columnDefs: [{ field: 'value', filter: 'agSetColumnFilter' }],
            rowData: startWithData ? [one, two] : [],
        });
        await asyncSetTimeout(0);

        const modelNow = () => ({
            model: api.getColumnFilterModel<{ values: string[] }>('value')?.values ?? null,
            rows: api.getDisplayedRowCount(),
        });

        // Step 1: apply the model while the grid may still be empty (pre-inference).
        void api.setColumnFilterModel('value', { filterType: 'set', values: ['one'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The observational interaction under test: open the dropdown before any data has arrived.
        if (openBeforeData) {
            await openDropdown(api);
            api.hideColumnFilter();
            await asyncSetTimeout(0);
        }

        // Step 2: data arrives (a no-op when the grid already had it).
        if (!startWithData) {
            api.applyTransaction({ add: [one, two] });
            await asyncSetTimeout(0);
        }
        const afterData = modelNow();

        // Step 3: remove the only row matching the applied model.
        api.applyTransaction({ remove: [one] });
        await asyncSetTimeout(0);
        const afterRemove = modelNow();

        // Step 4: re-apply the identical model, now that 'one' is no longer a grid value.
        void api.setColumnFilterModel('value', { filterType: 'set', values: ['one'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const afterReapply = modelNow();

        await openDropdown(api);
        const setFilter = await getSetFilter(api);
        const available = (await setFilter.handler.valueModel.allKeys) ?? [];

        return {
            afterData,
            afterRemove,
            afterReapply,
            finalUi: { ticked: setFilter.getModelFromUi()?.values ?? null, available: [...available] },
        };
    }

    test('multi-step transaction sequence is unaffected by opening the dropdown before data', async () => {
        const openedEarly = await runSequence({ openBeforeData: true, startWithData: false });
        const notOpenedEarly = await runSequence({ openBeforeData: false, startWithData: false });

        // AG-17369: opening the dropdown while the grid is empty is observational, so every later checkpoint
        // must match the run that never opened it early.
        expect(openedEarly).toEqual(notOpenedEarly);

        // Absolute anchors so a same-but-wrong state cannot pass. Removing the sole 'one' row then re-applying
        // `['one']` (no longer a grid value) reconciles the model away — standard grid-derived refresh-values
        // behaviour, not the observational defect.
        expect(notOpenedEarly.afterData).toEqual({ model: ['one'], rows: 1 });
        expect(notOpenedEarly.afterRemove).toEqual({ model: [], rows: 0 });
        expect(notOpenedEarly.afterReapply).toEqual({ model: [], rows: 0 });
        expect(notOpenedEarly.finalUi).toEqual({ ticked: [], available: ['two'] });
    });

    test('empty-before-data reconciles to the same state as a grid that always had data', async () => {
        const emptyStart = await runSequence({ openBeforeData: false, startWithData: false });
        const dataStart = await runSequence({ openBeforeData: false, startWithData: true });

        // The empty-before-inference lifecycle must converge to the normal lifecycle once data is present.
        // This also demonstrates that the step-3/step-4 model reset — removing the sole 'one' row, then
        // re-applying a value no longer in the grid — is standard grid-derived refresh-values reconciliation,
        // identical to a grid that always had data, and not the AG-17369 defect.
        expect(emptyStart.afterData).toEqual(dataStart.afterData);
        expect(emptyStart.afterRemove).toEqual(dataStart.afterRemove);
        expect(emptyStart.afterReapply).toEqual(dataStart.afterReapply);
        expect(emptyStart.finalUi).toEqual(dataStart.finalUi);
    });

    test('explicit cellDataType keeps the correct scenario-independent state (workaround guard)', async () => {
        const columnDefs: GridOptions<RowData>['columnDefs'] = [
            { field: 'value', filter: 'agSetColumnFilter', cellDataType: 'text' },
        ];
        const scenarioA = await runScenario('gridTextA', { openBeforeData: false, columnDefs });
        const scenarioB = await runScenario('gridTextB', { openBeforeData: true, columnDefs });

        expect(scenarioA.uiValues).toEqual(['one']);
        expect(scenarioB.uiValues).toEqual(['one']);
        expect(scenarioB.modelValues).toEqual(scenarioA.modelValues);
        expect(scenarioB.displayedRowCount).toBe(scenarioA.displayedRowCount);
    });

    test('explicit filterParams.values is unaffected by dropdown-open timing (provided-list guard)', async () => {
        const columnDefs: GridOptions<RowData>['columnDefs'] = [
            { field: 'value', filter: 'agSetColumnFilter', filterParams: { values: ['one', 'two', 'three'] } },
        ];
        const scenarioA = await runScenario('gridProvidedA', { openBeforeData: false, columnDefs });
        const scenarioB = await runScenario('gridProvidedB', { openBeforeData: true, columnDefs });

        // Values are supplied explicitly rather than derived from grid data, so the empty-grid guard never
        // engages and the model is scenario-independent throughout.
        expect(scenarioA.uiValues).toEqual(['one']);
        expect(scenarioB.uiValues).toEqual(['one']);
        expect(scenarioB.modelValues).toEqual(scenarioA.modelValues);
        expect(scenarioB.displayedRowCount).toBe(scenarioA.displayedRowCount);
    });

    test('excelMode keeps the applied model regardless of dropdown-open timing', async () => {
        const columnDefs: GridOptions<RowData>['columnDefs'] = [
            { field: 'value', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } },
        ];
        const scenarioA = await runScenario('gridExcelA', { openBeforeData: false, columnDefs });
        const scenarioB = await runScenario('gridExcelB', { openBeforeData: true, columnDefs });

        // The empty-grid guard returns before the excelMode "no matches ⇒ clear model" branch, so opening the
        // dropdown while empty must not wipe the applied model in excelMode either.
        expect(scenarioB.uiValues).toEqual(scenarioA.uiValues);
        expect(scenarioB.modelValues).toEqual(scenarioA.modelValues);
        expect(scenarioB.displayedRowCount).toBe(scenarioA.displayedRowCount);
        expect(scenarioA.uiValues).toEqual(['one']);
        expect(scenarioA.displayedRowCount).toBe(1);
    });

    // The reporter and QA (plnkr 41sqYmiFjrSjJN3S) drive the filter through grid-level `api.setFilterModel` — a
    // different entry point from the `api.setColumnFilterModel` the tests above exercise (grid-level queues the
    // model and replays it against the still-empty client-side row model while inference is pending) — and reuse
    // ONE `columnDefs` object across a destroy/recreate "Reset": Scenario A on the cold first grid, Scenario B on
    // the grid recreated with that same column def. Opening the dropdown before data must remain observational.
    async function runViaGridApi(
        api: GridApi,
        openBeforeData: boolean
    ): Promise<{ ticked: (string | null)[] | null; modelValues: string[] | undefined; displayedRowCount: number }> {
        api.setFilterModel({ value: { filterType: 'set', values: ['one'] } });
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
            ticked: setFilter.getModelFromUi()?.values ?? null,
            modelValues: api.getColumnFilterModel<{ values: string[] }>('value')?.values,
            displayedRowCount: api.getDisplayedRowCount(),
        };
    }

    test('grid-level api.setFilterModel converges across a shared-column-def reset (plnkr 41sqYmiFjrSjJN3S)', async () => {
        const sharedColumnDefs: GridOptions<RowData>['columnDefs'] = [{ field: 'value', filter: 'agSetColumnFilter' }];

        const apiA = gridsManager.createGrid<RowData>('qa-grid', {
            columnDefs: sharedColumnDefs,
            defaultColDef: { floatingFilter: true },
            rowData: [],
        });
        await asyncSetTimeout(0);
        const scenarioA = await runViaGridApi(apiA, false);

        apiA.destroy();
        await asyncSetTimeout(0);

        const apiB = gridsManager.createGrid<RowData>('qa-grid', {
            columnDefs: sharedColumnDefs,
            defaultColDef: { floatingFilter: true },
            rowData: [],
        });
        await asyncSetTimeout(0);
        const scenarioB = await runViaGridApi(apiB, true);

        // Opening the dropdown before data is observational: B converges on A.
        expect(scenarioB.ticked).toEqual(scenarioA.ticked);
        expect(scenarioB.modelValues).toEqual(scenarioA.modelValues);
        expect(scenarioB.displayedRowCount).toBe(scenarioA.displayedRowCount);

        // The converged state applies the reporter's set model — one row, only 'one' ticked.
        expect(scenarioA.ticked).toEqual(['one']);
        expect(scenarioA.modelValues).toEqual(['one']);
        expect(scenarioA.displayedRowCount).toBe(1);
    });
});
