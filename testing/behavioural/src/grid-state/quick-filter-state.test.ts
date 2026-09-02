import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, QuickFilterModule } from 'ag-grid-community';
import { AllEnterpriseModule, ToolbarModule } from 'ag-grid-enterprise';

describe('Grid state - quick filter text', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, QuickFilterModule, ToolbarModule],
    });

    const rowData = [
        { name: 'Alice', country: 'Canada' },
        { name: 'Bob', country: 'Ireland' },
    ];

    const columnDefs = [{ field: 'name' }, { field: 'country' }];

    const toolbar = { items: ['agQuickFilterToolbarItem'] } as const;

    const pivotGridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridMgr.reset();
        pivotGridMgr.reset();
    });

    function getInput(api: GridApi): HTMLInputElement {
        return TestGridsManager.getHTMLElement(api)!.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
    }

    async function typeInToolbar(api: GridApi, value: string): Promise<void> {
        const input = getInput(api);
        input.value = value;
        input.dispatchEvent(new Event('input'));
        await waitForEvent('filterChanged', api);
    }

    test('captures text typed in the toolbar input', async () => {
        const api = gridMgr.createGrid('quick-filter-state-capture', {
            columnDefs,
            rowData,
            toolbar,
        });
        await waitForEvent('firstDataRendered', api);

        expect(api.getState().filter).toBeUndefined();

        await typeInToolbar(api, 'canada');

        expect(api.getState().filter?.quickFilterText).toBe('canada');
        await new GridRows(api, `captures text typed in the toolbar input filtered`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Canada"
        `);
    });

    test('an empty input produces no state entry', async () => {
        const api = gridMgr.createGrid('quick-filter-state-empty', {
            columnDefs,
            rowData,
            toolbar,
        });
        await waitForEvent('firstDataRendered', api);

        await typeInToolbar(api, 'canada');
        expect(api.getState().filter?.quickFilterText).toBe('canada');

        await typeInToolbar(api, '');

        expect(api.getState().filter?.quickFilterText).toBeUndefined();
        await new GridRows(api, `an empty input produces no state entry unfiltered`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice" country:"Canada"
            └── LEAF id:1 name:"Bob" country:"Ireland"
        `);
    });

    test('a case-only edit updates the captured text', async () => {
        const api = gridMgr.createGrid('quick-filter-state-case', {
            columnDefs,
            rowData,
            toolbar,
        });
        await waitForEvent('firstDataRendered', api);

        await typeInToolbar(api, 'canada');
        expect(api.getState().filter?.quickFilterText).toBe('canada');

        // Uppercasing makes this equal to the previous filter, so no `filterChanged` is dispatched.
        const input = getInput(api);
        input.value = 'CANADA';
        input.dispatchEvent(new Event('input'));

        await waitFor(() => expect(api.getState().filter?.quickFilterText).toBe('CANADA'));
    });

    test('initialState restores the text, the rows and the toolbar input', async () => {
        const api = gridMgr.createGrid('quick-filter-state-restore', {
            columnDefs,
            rowData,
            toolbar,
            initialState: { filter: { quickFilterText: 'canada' } },
        });
        await waitForEvent('firstDataRendered', api);

        expect(api.getGridOption('quickFilterText')).toBe('canada');
        expect(api.getState().filter?.quickFilterText).toBe('canada');
        expect(getInput(api).value).toBe('canada');
        await new GridRows(api, `initialState restores the text, the rows and the toolbar input`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Canada"
        `);
    });

    test('restored state takes precedence over a conflicting grid option', async () => {
        const api = gridMgr.createGrid('quick-filter-state-precedence', {
            columnDefs,
            rowData,
            toolbar,
            quickFilterText: 'ireland',
            initialState: { filter: { quickFilterText: 'canada' } },
        });
        await waitForEvent('firstDataRendered', api);

        expect(api.getGridOption('quickFilterText')).toBe('canada');
        expect(getInput(api).value).toBe('canada');
        await new GridRows(api, `restored state takes precedence over a conflicting grid option`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Canada"
        `);
    });

    test('setState without a filter section clears the text', async () => {
        const api = gridMgr.createGrid('quick-filter-state-clear', {
            columnDefs,
            rowData,
            toolbar,
            quickFilterText: 'canada',
        });
        await waitForEvent('firstDataRendered', api);

        api.setState({});

        await waitFor(() => expect(api.getGridOption('quickFilterText')).toBe(''));
        expect(api.getState().filter?.quickFilterText).toBeUndefined();
        expect(getInput(api).value).toBe('');
        await new GridRows(api, `setState without a filter section clears the text`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice" country:"Canada"
            └── LEAF id:1 name:"Bob" country:"Ireland"
        `);
    });

    test('setGridOption updates the toolbar input', async () => {
        const api = gridMgr.createGrid('quick-filter-state-resync', {
            columnDefs,
            rowData,
            toolbar,
        });
        await waitForEvent('firstDataRendered', api);

        expect(getInput(api).value).toBe('');

        api.setGridOption('quickFilterText', 'canada');

        await waitFor(() => expect(getInput(api).value).toBe('canada'));
        await new GridRows(api, `setGridOption updates the toolbar input`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Canada"
        `);
    });

    test('reports source quickFilter when applied through state', async () => {
        const api = gridMgr.createGrid('quick-filter-state-source', {
            columnDefs,
            rowData,
            toolbar,
        });
        await waitForEvent('firstDataRendered', api);

        const sources: (string | undefined)[] = [];
        api.addEventListener('filterChanged', ({ source }) => sources.push(source));

        api.setState({ filter: { quickFilterText: 'canada' } });

        await waitFor(() => expect(sources).toEqual(['quickFilter']));
    });

    test('captured and restored without the toolbar item', async () => {
        const api = gridMgr.createGrid('quick-filter-state-no-toolbar', {
            columnDefs,
            rowData,
            initialState: { filter: { quickFilterText: 'canada' } },
        });
        await waitForEvent('firstDataRendered', api);

        expect(api.getGridOption('quickFilterText')).toBe('canada');
        expect(api.getState().filter?.quickFilterText).toBe('canada');
        await new GridRows(api, `captured and restored without the toolbar item`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice" country:"Canada"
        `);
    });

    test('restores against pivot result columns when pivot mode is enabled', async () => {
        // With the default `applyQuickFilterBeforePivotOrAgg`, quick filter searches the aggregated values of
        // the pivot result columns, so a gold total only matches once those columns exist.
        const api = pivotGridMgr.createGrid('quick-filter-state-pivot', {
            columnDefs: [
                { field: 'name', rowGroup: true },
                { field: 'country', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            rowData: [
                { name: 'Alice', country: 'Canada', gold: 111 },
                { name: 'Bob', country: 'Ireland', gold: 222 },
            ],
            pivotMode: true,
            initialState: { filter: { quickFilterText: '111' } },
        });
        await waitForEvent('firstDataRendered', api);

        expect(api.getState().filter?.quickFilterText).toBe('111');
        await new GridRows(api, `restores against pivot result columns when pivot mode is enabled`).check(`
            ROOT id:ROOT_NODE_ID pivot_country_Canada_gold:111 pivot_country_Ireland_gold:222
            └─┬ LEAF_GROUP collapsed id:row-group-name-Alice ag-Grid-AutoColumn:"Alice" pivot_country_Canada_gold:111 pivot_country_Ireland_gold:null
            · └── LEAF hidden id:0 pivot_country_Canada_gold:111 pivot_country_Ireland_gold:111
        `);
    });
});
