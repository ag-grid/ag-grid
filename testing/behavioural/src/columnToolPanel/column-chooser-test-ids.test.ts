import type { ColDef, GridApi } from 'ag-grid-community';
import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('column tool panel test IDs with virtualization', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = Array.from({ length: 30 }, (_, i) => ({
        field: `col${i}`,
        headerName: `Column ${i}`,
    }));

    const rowData = [Object.fromEntries(columnDefs.map((c) => [c.field, `val_${c.field}`]))];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    async function createGrid(): Promise<GridApi> {
        return gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
    }

    function forceVirtualListRender(gridApi: GridApi): HTMLElement {
        const gridEl = getGridElement(gridApi)! as HTMLElement;
        const viewport = gridEl.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        // jsdom doesn't have a layout engine so offsetHeight returns 0, which prevents
        // the virtual list from rendering items. Override it on the instance.
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        // Trigger virtual list render via scroll event
        viewport.dispatchEvent(new Event('scroll'));
        return viewport;
    }

    function getVisibleCheckboxTestIds(gridApi: GridApi): string[] {
        const gridEl = getGridElement(gridApi)! as HTMLElement;
        const items = gridEl.querySelectorAll('.ag-column-select-virtual-list-item');
        const testIds: string[] = [];
        items.forEach((item) => {
            const checkbox = item.querySelector('.ag-column-select-checkbox input[type=checkbox]');
            const testId = checkbox?.getAttribute('data-testid');
            if (testId) {
                testIds.push(testId);
            }
        });
        return testIds;
    }

    function getVisibleItemLabels(gridApi: GridApi): (string | null)[] {
        const gridEl = getGridElement(gridApi)! as HTMLElement;
        const items = gridEl.querySelectorAll('.ag-column-select-virtual-list-item');
        return Array.from(items, (item) => item.getAttribute('aria-label'));
    }

    function countCheckboxesWithoutTestId(gridApi: GridApi): string[] {
        const gridEl = getGridElement(gridApi)! as HTMLElement;
        const items = gridEl.querySelectorAll('.ag-column-select-virtual-list-item');
        const missing: string[] = [];
        items.forEach((item) => {
            const label = item.getAttribute('aria-label');
            const checkbox = item.querySelector('.ag-column-select-checkbox input[type=checkbox]');
            if (checkbox && !checkbox.getAttribute('data-testid')) {
                missing.push(label ?? 'unknown');
            }
        });
        return missing;
    }

    it('should maintain checkbox test IDs after scrolling the virtual list', async () => {
        const api = await createGrid();
        await new GridColumns(api, `should maintain checkbox test IDs after scrolling the virtual list setup`)
            .checkColumns(`
                CENTER
                ├── col0 "Column 0" width:200
                ├── col1 "Column 1" width:200
                ├── col2 "Column 2" width:200
                ├── col3 "Column 3" width:200
                ├── col4 "Column 4" width:200
                ├── col5 "Column 5" width:200
                ├── col6 "Column 6" width:200
                ├── col7 "Column 7" width:200
                ├── col8 "Column 8" width:200
                ├── col9 "Column 9" width:200
                ├── col10 "Column 10" width:200
                ├── col11 "Column 11" width:200
                ├── col12 "Column 12" width:200
                ├── col13 "Column 13" width:200
                ├── col14 "Column 14" width:200
                ├── col15 "Column 15" width:200
                ├── col16 "Column 16" width:200
                ├── col17 "Column 17" width:200
                ├── col18 "Column 18" width:200
                ├── col19 "Column 19" width:200
                ├── col20 "Column 20" width:200
                ├── col21 "Column 21" width:200
                ├── col22 "Column 22" width:200
                ├── col23 "Column 23" width:200
                ├── col24 "Column 24" width:200
                ├── col25 "Column 25" width:200
                ├── col26 "Column 26" width:200
                ├── col27 "Column 27" width:200
                ├── col28 "Column 28" width:200
                └── col29 "Column 29" width:200
            `);
        await new GridRows(api, `should maintain checkbox test IDs after scrolling the virtual list setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 col0:"val_col0" col1:"val_col1" col2:"val_col2" col3:"val_col3" col4:"val_col4" col5:"val_col5" col6:"val_col6" col7:"val_col7" col8:"val_col8" col9:"val_col9" col10:"val_col10" col11:"val_col11" col12:"val_col12" col13:"val_col13" col14:"val_col14" col15:"val_col15" col16:"val_col16" col17:"val_col17" col18:"val_col18" col19:"val_col19" col20:"val_col20" col21:"val_col21" col22:"val_col22" col23:"val_col23" col24:"val_col24" col25:"val_col25" col26:"val_col26" col27:"val_col27" col28:"val_col28" col29:"val_col29"
        `);
        await asyncSetTimeout(50);

        const viewport = forceVirtualListRender(api);
        await asyncSetTimeout(200);

        // Initial state: visible items should have test IDs
        const initialLabels = getVisibleItemLabels(api);
        expect(initialLabels.length).toBeGreaterThan(0);
        expect(initialLabels).toContain('Column 0 Column');

        const initialTestIds = getVisibleCheckboxTestIds(api);
        expect(initialTestIds.length).toBeGreaterThan(0);
        expect(initialTestIds[0]).toBe(agTestIdFor.columnSelectListItemCheckbox('Column 0 Column'));

        // Scroll down to reveal new items
        viewport.scrollTop = 500;
        await asyncSetTimeout(200);

        const scrolledLabels = getVisibleItemLabels(api);
        expect(scrolledLabels.length).toBeGreaterThan(0);
        expect(scrolledLabels).not.toContain('Column 0 Column');

        // Every visible checkbox should have a test ID
        const missingAfterScrollDown = countCheckboxesWithoutTestId(api);
        expect(missingAfterScrollDown).toEqual([]);

        // Scroll back to top
        viewport.scrollTop = 0;
        await asyncSetTimeout(200);

        const scrolledBackLabels = getVisibleItemLabels(api);
        expect(scrolledBackLabels).toContain('Column 0 Column');

        // Checkboxes should still have test IDs after scrolling back
        const missingAfterScrollBack = countCheckboxesWithoutTestId(api);
        expect(missingAfterScrollBack).toEqual([]);
        expect(getVisibleCheckboxTestIds(api)[0]).toBe(agTestIdFor.columnSelectListItemCheckbox('Column 0 Column'));
        await new GridRows(api, `should maintain checkbox test IDs after scrolling the virtual list final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 col0:"val_col0" col1:"val_col1" col2:"val_col2" col3:"val_col3" col4:"val_col4" col5:"val_col5" col6:"val_col6" col7:"val_col7" col8:"val_col8" col9:"val_col9" col10:"val_col10" col11:"val_col11" col12:"val_col12" col13:"val_col13" col14:"val_col14" col15:"val_col15" col16:"val_col16" col17:"val_col17" col18:"val_col18" col19:"val_col19" col20:"val_col20" col21:"val_col21" col22:"val_col22" col23:"val_col23" col24:"val_col24" col25:"val_col25" col26:"val_col26" col27:"val_col27" col28:"val_col28" col29:"val_col29"
            `
        );
    });
});
