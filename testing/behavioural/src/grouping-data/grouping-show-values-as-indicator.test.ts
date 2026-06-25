import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

function indicator(colId: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-show-values-as-icon`);
    if (!el) {
        throw new Error(`No show-values-as indicator for column '${colId}'`);
    }
    return el;
}

const isShown = (colId: string): boolean => !indicator(colId).classList.contains('ag-hidden');
const isDormant = (colId: string): boolean => indicator(colId).classList.contains('ag-show-values-as-dormant');
const ariaText = (): string => document.querySelector('.ag-aria-description-container')?.textContent ?? '';

describe('showValuesAs header indicator', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('the indicator reflects active / dormant / off, honours suppress, and updates reactively', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator', {
            columnDefs: [
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' }, // applies on a flat grid
                { field: 'units', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' }, // dormant — no hierarchy
                { field: 'price', aggFunc: 'sum' }, // no mode
                {
                    field: 'cost',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    showValuesAsDef: { suppressHeaderIndicator: true },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25, units: 4, price: 1, cost: 5 },
                { id: '2', amount: 75, units: 6, price: 2, cost: 5 },
            ],
        });

        expect(isShown('amount')).toBe(true); // applying
        expect(isDormant('amount')).toBe(false);
        expect(isShown('units')).toBe(true); // dormant — shown but muted
        expect(isDormant('units')).toBe(true);
        expect(isShown('price')).toBe(false); // no mode
        expect(isShown('cost')).toBe(false); // suppressed despite an active mode

        // amount/cost (%grandTotal) applying → percentages; units (%parentTotal, flat) dormant → raw; price has no mode.
        await new GridColumns(api, 'indicator mixed modes').checkColumns(`
            CENTER
            ├── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
            ├── units "Units" width:200 aggFunc:sum %:percentOfParentRowTotal
            ├── price "Price" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'indicator mixed modes').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%" units:"#N/A" price:3 cost:"100.00%"
            ├── LEAF id:1 amount:"25.00%" units:"#N/A" price:1 cost:"50.00%"
            └── LEAF id:2 amount:"75.00%" units:"#N/A" price:2 cost:"50.00%"
        `);

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: null }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(false);

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(false);

        // Active-to-active switch to a mode with DIFFERENT applicability: the header recomputes dormancy even
        // though `showValuesAs` stayed non-null (the applicability memo is rebuilt on every mode change, and the
        // header refreshes on the columnStateUpdated the switch dispatches).
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfParentRowTotal' }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(true); // flat grid → parent-total is dormant
    });

    test('enableShowValuesAs:false hides the selection menu but keeps the indicator — the values are still transformed', async () => {
        // The indicator is informational: it signals the displayed values aren't raw. It tracks an active mode (and
        // `suppressHeaderIndicator`), independent of `enableShowValuesAs`, which governs only the selection menu.
        const api = await gridMgr.createGridAndWait('sva-indicator-disabled-ui', {
            columnDefs: [
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    enableShowValuesAs: false, // hides the selection menu; transform + indicator still show
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });

        expect(isShown('amount')).toBe(true); // indicator shown — a mode is active
        expect(isDormant('amount')).toBe(false); // and applying

        await new GridRows(api, 'enableShowValuesAs false transform still runs').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 amount:"25.00%"
            └── LEAF id:2 amount:"75.00%"
        `);
    });

    test('a parent-total indicator goes from dormant to active when grouping is added', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-group', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        expect(isDormant('amount')).toBe(true); // flat — no parent

        // Flat → %parentTotal dormant → raw amounts.
        await new GridColumns(api, 'flat dormant').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'flat dormant').check(`
            ROOT id:ROOT_NODE_ID amount:"#N/A"
            ├── LEAF id:1 country:"A" amount:"#N/A"
            └── LEAF id:2 country:"B" amount:"#N/A"
        `);

        api.applyColumnState({ state: [{ colId: 'country', rowGroup: true }] });
        await asyncSetTimeout(10);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(false); // now meaningful

        // Grouping added → %parentTotal applies → percentages.
        await new GridColumns(api, 'after grouping added').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200 rowGroup
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'after grouping added').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP collapsed id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"25.00%"
            │ └── LEAF hidden id:1 country:"A" amount:"100.00%"
            └─┬ LEAF_GROUP collapsed id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"75.00%"
            · └── LEAF hidden id:2 country:"B" amount:"100.00%"
        `);
    });

    test('focusing the header announces an applying mode for screen readers', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-aria-on', {
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });

        api.setFocusedHeader('amount');
        await waitFor(() => expect(ariaText()).toContain('Showing Values As % of Grand Total'));
    });

    test('a dormant mode is not announced — the raw value is shown', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-aria-dormant', {
            // Flat grid: percentOfParentRowTotal is dormant, so no transform to announce.
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });

        api.setFocusedHeader('amount');
        // The header still announces (proving the description ran), but without the transform.
        await waitFor(() => expect(ariaText()).toContain('sort'));
        expect(ariaText()).not.toContain('Showing Values As');
    });
});
