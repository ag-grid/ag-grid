import { waitFor } from '@testing-library/dom';
import {
    AdvancedFilterHarness,
    FilterDom,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
} from 'ag-test-utils';

import { ClientSideRowModelModule, NumberFilterModule, PinnedRowModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

describe('Advanced Filter Header DOM', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            PinnedRowModule,
            TextFilterModule,
            NumberFilterModule,
            AdvancedFilterModule,
        ],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [{ athlete: 'A', age: 1 }];

    afterEach(() => {
        gridsManager.reset();
    });

    const getElementY = (element: HTMLElement): number => {
        const transform = element.style.transform;
        if (transform) {
            const match = transform.match(/translateY\(([-\d.]+)px\)/);
            if (match) {
                return Number.parseFloat(match[1]);
            }
        }
        return Number.parseFloat(element.style.top || '0');
    };

    test('does not render advanced filter header when disabled', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
        });

        expect(document.querySelector('.ag-advanced-filter-header')).toBeNull();
    });

    test('mounts and unmounts advanced filter header when toggled', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
        });
        await new GridColumns(api, `mounts and unmounts advanced filter header when toggled setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── age "Age" width:200
        `);
        await new GridRows(api, `mounts and unmounts advanced filter header when toggled setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"A" age:1
        `);

        expect(document.querySelector('.ag-advanced-filter-header')).toBeNull();

        api.setGridOption('enableAdvancedFilter', true);
        await new GridColumns(
            api,
            `mounts and unmounts advanced filter header when toggled after setGridOption enableAdvancedFilter`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `mounts and unmounts advanced filter header when toggled after setGridOption enableAdvancedFilter`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"A" age:1
        `);
        await waitFor(() => expect(document.querySelector('.ag-advanced-filter-header')).not.toBeNull());

        api.setGridOption('enableAdvancedFilter', false);
        await new GridColumns(
            api,
            `mounts and unmounts advanced filter header when toggled after setGridOption enableAdvancedFilter #2`
        ).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── age "Age" width:200
        `);
        await new GridRows(
            api,
            `mounts and unmounts advanced filter header when toggled after setGridOption enableAdvancedFilter #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"A" age:1
        `);
        await waitFor(() => expect(document.querySelector('.ag-advanced-filter-header')).toBeNull());
    });

    test('keeps pinned-top rows below advanced filter row', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableAdvancedFilter: true,
            pinnedTopRowData: [{ athlete: 'Pinned Top', age: 99 }],
        });

        const topRowsSection = document.querySelector<HTMLElement>('.ag-grid-pinned-top-rows');
        const advancedFilterHeader = topRowsSection?.querySelector<HTMLElement>('.ag-advanced-filter-header');
        const pinnedTopRow = topRowsSection?.querySelector<HTMLElement>('.ag-row.ag-row-pinned');

        expect(topRowsSection).toBeTruthy();
        expect(advancedFilterHeader).toBeTruthy();
        expect(pinnedTopRow).toBeTruthy();

        const advancedFilterTop = Number.parseFloat(advancedFilterHeader!.style.top || '0');
        const advancedFilterHeight = Number.parseFloat(advancedFilterHeader!.style.height || '0');
        const advancedFilterBottom = advancedFilterTop + advancedFilterHeight;

        // The pinned top container has a `top` that positions it below the header and advanced filter.
        // The row's own transform/top is container-relative (starts at 0).
        const pinnedTopContainer = topRowsSection?.querySelector<HTMLElement>('.ag-grid-pinned-top-rows-container');
        const containerTop = Number.parseFloat(pinnedTopContainer?.style.top || '0');
        const pinnedTopRowTop = containerTop + getElementY(pinnedTopRow!);

        // Pinned top rows must start at or below the advanced filter row.
        expect(pinnedTopRowTop).toBeGreaterThanOrEqual(advancedFilterBottom - 1);
    });

    const filterableColumnDefs = [
        { field: 'athlete', filter: true },
        { field: 'age', filter: true },
    ];

    const athletes = [
        { athlete: 'Michael Phelps', age: 23 },
        { athlete: 'Usain Bolt', age: 25 },
    ];

    test('input stays enabled while the grid is still waiting for row data', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        await new FilterDom(api, 'no row data yet').checkFilterDom(`
            ADVANCED FILTER
            input: ""
            valid: true
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('input stays enabled after row data is set to an empty array', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setGridOption('rowData', []);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'empty row data').checkFilterDom(`
            ADVANCED FILTER
            input: ""
            valid: true
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('a filter set before data loads is applied once data arrives', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);
        api.setGridOption('rowData', []);
        await asyncSetTimeout(0);

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains "Bolt"');
        await asyncSetTimeout(0);

        await new FilterDom(api, 'filter built with no data').checkFilterDom(`
            ADVANCED FILTER
            input: "[Athlete] contains "Bolt""
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "text"
              colId: "athlete"
              type: "contains"
              filter: "Bolt"
        `);

        api.setGridOption('rowData', [
            { athlete: 'Michael Phelps', age: 23 },
            { athlete: 'Usain Bolt', age: 25 },
        ]);
        await asyncSetTimeout(0);

        await new GridRows(api, 'filter applied once data arrives').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Usain Bolt" age:25
        `);
    });

    test('a number filter built before data loads self-corrects and filters once data arrives', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        // With no row data yet, Age's data type is not inferred (defaults to text), so a number
        // expression cannot be validated and shows as invalid.
        await AdvancedFilterHarness.get(api).applyExpression('[Age] > 20');
        await asyncSetTimeout(0);

        await new FilterDom(api, 'number filter before data').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] > 20"
            valid: false — Expression has an error. Option not found - > 20.
            buttons: Apply ⊘ | Builder
            model: null
        `);

        api.setGridOption('rowData', [
            { athlete: 'Michael Phelps', age: 23 },
            { athlete: 'Usain Bolt', age: 15 },
        ]);
        await asyncSetTimeout(0);

        // Once data arrives Age is inferred as a number, the expression re-parses and becomes valid.
        await new FilterDom(api, 'number filter after data').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] > 20"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "number"
              colId: "age"
              type: "greaterThan"
              filter: 20
        `);

        await new GridRows(api, 'number filter applied once data arrives').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps" age:23
        `);
    });

    test('does not focus the input when the grid initialises without row data', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        await new FilterDom(api, 'init without row data').checkFilterDom(`
            ADVANCED FILTER
            input: ""
            valid: true
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'init without row data').check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(document.activeElement).toBe(document.body);
    });

    test('does not focus the input when the grid initialises with row data', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            rowData: athletes,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        await new FilterDom(api, 'init with row data').checkFilterDom(`
            ADVANCED FILTER
            input: ""
            valid: true
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'init with row data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23
            └── LEAF id:1 athlete:"Usain Bolt" age:25
        `);

        expect(document.activeElement).toBe(document.body);
    });

    test('does not focus the input when the model is set via the API', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            rowData: athletes,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'Bolt' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new FilterDom(api, 'model set via API').checkFilterDom(`
            ADVANCED FILTER
            input: "[Athlete] contains "Bolt""
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "text"
              colId: "athlete"
              type: "contains"
              filter: "Bolt"
        `);
        await new GridRows(api, 'model set via API').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Usain Bolt" age:25
        `);

        expect(document.activeElement).toBe(document.body);
    });

    test('restores focus to the input when cleared via the clear button', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: filterableColumnDefs,
            rowData: athletes,
            enableAdvancedFilter: true,
            advancedFilterParams: { buttons: ['apply', 'clear'] },
        });
        await asyncSetTimeout(0);

        const harness = AdvancedFilterHarness.get(api);
        await harness.applyExpression('[Athlete] contains "Bolt"');
        await asyncSetTimeout(0);

        const eClear = document.querySelector<HTMLElement>('.ag-advanced-filter-buttons [data-ref=clearFilterButton]')!;
        eClear.focus();
        eClear.click();
        await asyncSetTimeout(0);

        // Clear only empties the editor - the applied model (and the filtered rows) stay until Apply.
        await new FilterDom(api, 'cleared via clear button').checkFilterDom(`
            ADVANCED FILTER
            input: ""
            valid: true
            buttons: Apply | Clear | Builder
            model:
              filterType: "text"
              colId: "athlete"
              type: "contains"
              filter: "Bolt"
        `);
        await new GridRows(api, 'cleared via clear button').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Usain Bolt" age:25
        `);

        expect(document.activeElement).toBe(harness.input);
    });
});
