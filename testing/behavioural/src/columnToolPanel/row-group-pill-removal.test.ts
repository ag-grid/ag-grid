import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('removing a row group via the drop-zone pill remove button', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridMgr.reset());

    const pillTexts = (api: GridApi): (string | null)[] =>
        Array.from(
            getGridElement(api)!.querySelectorAll('.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell-text')
        ).map((el) => el.textContent);

    const clickRemove = (api: GridApi, index: number): void => {
        const buttons = getGridElement(api)!.querySelectorAll(
            '.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell-button'
        );
        const button = buttons[index] as HTMLElement | undefined;
        if (!button) {
            throw new Error(`no remove button at index ${index} (found ${buttons.length})`);
        }
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    test('a groupHierarchy date part is removed by its own remove button', async () => {
        const api = await gridMgr.createGridAndWait('hierarchy-pill-removal', {
            columnDefs: [
                { field: 'date', rowGroup: true, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'country' },
                { field: 'total', aggFunc: 'sum' },
            ],
            rowGroupPanelShow: 'always',
            rowData: [
                { date: '2008-08-24', country: 'United States', total: 8 },
                { date: '2004-08-29', country: 'United States', total: 8 },
                { date: '2000-10-01', country: 'Romania', total: 6 },
            ],
        });
        await waitFor(() => expect(pillTexts(api)).toEqual(['Date (Year)', 'Date (Month)', 'Date']));

        clickRemove(api, 0);

        await waitFor(() => expect(pillTexts(api)).toEqual(['Date (Month)', 'Date']));
        expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);
    });

    test('a remove button click never falls through to a sort, even when a column callback throws', async () => {
        // The removed group column becomes visible again over the group rows still on screen, so a
        // non-null-safe valueFormatter (as in the grouping-object-data example) throws mid-update.
        const errors: (string | undefined)[] = [];
        const swallowError = (event: ErrorEvent) => {
            errors.push(event.error?.message ?? event.message);
            event.preventDefault();
        };
        window.addEventListener('error', swallowError);
        try {
            const api = await gridMgr.createGridAndWait('object-data-pill-removal', {
                columnDefs: [
                    {
                        field: 'athlete',
                        rowGroup: true,
                        hide: true,
                        keyCreator: (params) => params.value.id,
                        valueFormatter: (params) => params.value.name,
                    },
                    { field: 'country' },
                    { field: 'year' },
                ],
                rowGroupPanelShow: 'always',
                rowData: [
                    { athlete: { id: 1, name: 'Michael Phelps' }, country: 'United States', year: 2008 },
                    { athlete: { id: 2, name: 'Julian Weber' }, country: 'Romania', year: 2000 },
                ],
            });
            await waitFor(() => expect(pillTexts(api)).toEqual(['Athlete']));
            expect(errors).toEqual([]);

            clickRemove(api, 0);

            // The formatter must actually have thrown, or the test would pass without exercising the fix.
            await waitFor(() => expect(errors).toContain("Cannot read properties of undefined (reading 'name')"));
            expect(api.getColumnState().find((state) => state.colId === 'athlete')?.sort ?? null).toBeNull();
            expect(api.getRowGroupColumns()).toEqual([]);
            expect(pillTexts(api)).toEqual([]);
        } finally {
            window.removeEventListener('error', swallowError);
        }
    });
});
