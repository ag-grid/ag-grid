import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

function indicator(colId: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-show-value-as-icon`);
    if (!el) {
        throw new Error(`No show-value-as indicator for column '${colId}'`);
    }
    return el;
}

const isShown = (colId: string): boolean => !indicator(colId).classList.contains('ag-hidden');
const isDormant = (colId: string): boolean => indicator(colId).classList.contains('ag-show-value-as-dormant');
const ariaText = (): string => document.querySelector('.ag-aria-description-container')?.textContent ?? '';

describe('showValueAs header indicator', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('the indicator reflects active / dormant / off, honours suppress, and updates reactively', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator', {
            columnDefs: [
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }, // applies on a flat grid
                { field: 'units', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' }, // dormant — no hierarchy
                { field: 'price', aggFunc: 'sum' }, // no mode
                {
                    field: 'cost',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: { suppressHeaderIndicator: true },
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
            ├── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
            ├── units "Units" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
            ├── price "Price" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'indicator mixed modes').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%" units:10 price:3 cost:"100.00%"
            ├── LEAF id:1 amount:"25.00%" units:4 price:1 cost:"50.00%"
            └── LEAF id:2 amount:"75.00%" units:6 price:2 cost:"50.00%"
        `);

        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: null }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(false);

        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(false);

        // Active-to-active switch to a mode with DIFFERENT applicability: the header recomputes dormancy even
        // though `showValueAs` stayed non-null (the applicability memo is rebuilt on every mode change, and the
        // header refreshes on the columnStateUpdated the switch dispatches).
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfParentRowTotal' }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(true); // flat grid → parent-total is dormant
    });

    test('a parent-total indicator goes from dormant to active when grouping is added', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-group', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
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
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
        `);
        await new GridRows(api, 'flat dormant').check(`
            ROOT id:ROOT_NODE_ID amount:100
            ├── LEAF id:1 country:"A" amount:25
            └── LEAF id:2 country:"B" amount:75
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
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
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
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
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
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' }],
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
