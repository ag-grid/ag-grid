import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { enableDevValidations, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

/**
 * The Columns Tool Panel list and every column chip mirror the header's column-type indicators: ƒx before the
 * column name for calculated columns, Show Values As after it whenever the header shows it.
 */
describe('column indicator icons in the Columns Tool Panel and chips', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    const rowData = [
        { country: 'Ireland', year: 2000, gold: 1, silver: 2 },
        { country: 'France', year: 2004, gold: 3, silver: 4 },
    ];

    function createGrid(columnDefs: ColDef[], options: GridOptions = {}): GridApi {
        return gridMgr.createGrid('column-indicator-icons', {
            columnDefs,
            rowData,
            calculatedColumns: true,
            sideBar: 'columns',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
            ...options,
        });
    }

    /** jsdom gives the virtual list no height, so the viewport needs one before it renders any row. */
    function renderVirtualList(root: ParentNode): void {
        const viewport = root.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
    }

    function listItem(api: GridApi, name: string): HTMLElement {
        const root = getGridElement(api)!;
        renderVirtualList(root);
        const labels = Array.from(root.querySelectorAll<HTMLElement>('.ag-column-select-column-label'));
        const label = labels.find((el) => el.textContent === name);
        expect(label).toBeDefined();
        return label!.closest<HTMLElement>('.ag-column-select-column')!;
    }

    function chipIn(api: GridApi, zone: 'header' | 'toolPanel', text: string): HTMLElement {
        const container = zone === 'header' ? '.ag-column-drop-wrapper' : '.ag-column-panel';
        const chip = Array.from(
            getGridElement(api)!.querySelectorAll<HTMLElement>(`${container} .ag-column-drop-cell`)
        ).find((el) => el.querySelector('.ag-column-drop-cell-text')?.textContent === text);
        expect(chip).toBeDefined();
        return chip!;
    }

    function nameEl(host: HTMLElement): HTMLElement {
        return host.querySelector<HTMLElement>('.ag-column-select-column-label, .ag-column-drop-cell-text')!;
    }

    function expectCalcIconBeforeName(host: HTMLElement): void {
        const icon = host.querySelector('.ag-calculated-column-icon');
        expect(icon).not.toBeNull();
        expect(icon!.nextElementSibling).toBe(nameEl(host));
    }

    function showValuesAsIcon(host: HTMLElement): HTMLElement | null {
        return host.querySelector<HTMLElement>('.ag-show-values-as-icon');
    }

    function expectShowValuesAsIconAfterName(host: HTMLElement, dormant = false): void {
        const icon = showValuesAsIcon(host);
        expect(icon).not.toBeNull();
        expect(icon!.classList.contains('ag-hidden')).toBe(false);
        expect(icon!.classList.contains('ag-show-values-as-dormant')).toBe(dormant);
        expect(icon!.previousElementSibling).toBe(nameEl(host));
    }

    function expectNoVisibleShowValuesAsIcon(host: HTMLElement): void {
        const icon = showValuesAsIcon(host);
        expect(icon == null || icon.classList.contains('ag-hidden')).toBe(true);
    }

    const calcDef: ColDef = { colId: 'profit', headerName: 'Profit', calculatedExpression: '[gold] * 2' };

    test('calculated column shows ƒx before its name in the list; standard columns show no icon', async () => {
        const api = createGrid([{ field: 'country' }, { field: 'gold' }, calcDef]);

        await waitFor(() => expectCalcIconBeforeName(listItem(api, 'Profit')));
        const country = listItem(api, 'Country');
        expect(country.querySelector('.ag-calculated-column-icon')).toBeNull();
        expectNoVisibleShowValuesAsIcon(country);
    });

    test('calculated column chip shows ƒx before its name in Row Groups (tool panel + header) and Values', async () => {
        const api = createGrid([
            { field: 'country' },
            { ...calcDef, colId: 'profitGroup', headerName: 'Profit Group', rowGroup: true },
            { ...calcDef, aggFunc: 'sum' },
        ]);

        await waitFor(() => {
            expectCalcIconBeforeName(chipIn(api, 'header', 'Profit Group'));
            expectCalcIconBeforeName(chipIn(api, 'toolPanel', 'Profit Group'));
            expectCalcIconBeforeName(chipIn(api, 'toolPanel', 'sum(Profit)'));
        });
    });

    test('pivot mode: ƒx shows in Column Labels chips (tool panel + header) and Values chips', async () => {
        const api = createGrid(
            [
                { field: 'country', rowGroup: true },
                { ...calcDef, colId: 'profitPivot', headerName: 'Profit Pivot', pivot: true },
                { ...calcDef, aggFunc: 'sum' },
            ],
            { pivotMode: true }
        );

        await waitFor(() => {
            expectCalcIconBeforeName(chipIn(api, 'header', 'Profit Pivot'));
            expectCalcIconBeforeName(chipIn(api, 'toolPanel', 'Profit Pivot'));
            expectCalcIconBeforeName(chipIn(api, 'toolPanel', 'sum(Profit)'));
        });
        expect(chipIn(api, 'header', 'Country').querySelector('.ag-calculated-column-icon')).toBeNull();
    });

    test('Show Values As icon shows after the name in the list and Values chip, and not when the header hides it', async () => {
        const api = createGrid([
            { field: 'country' },
            { field: 'gold', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            {
                field: 'silver',
                aggFunc: 'sum',
                showValuesAs: 'percentOfGrandTotal',
                showValuesAsDef: { suppressHeaderIndicator: true },
            },
        ]);

        await waitFor(() => {
            expectShowValuesAsIconAfterName(listItem(api, 'Gold'));
            expectShowValuesAsIconAfterName(chipIn(api, 'toolPanel', 'sum(Gold)'));
        });
        expectNoVisibleShowValuesAsIcon(listItem(api, 'Silver'));
        expectNoVisibleShowValuesAsIcon(chipIn(api, 'toolPanel', 'sum(Silver)'));
        expectNoVisibleShowValuesAsIcon(listItem(api, 'Country'));
    });

    test('Show Values As icon follows mode and dormant changes on the same list item and chip', async () => {
        const api = createGrid([
            { field: 'country', enableRowGroup: true },
            { field: 'gold', aggFunc: 'sum' },
        ]);

        let item!: HTMLElement;
        let chip!: HTMLElement;
        await waitFor(() => {
            item = listItem(api, 'Gold');
            chip = chipIn(api, 'toolPanel', 'sum(Gold)');
        });
        expectNoVisibleShowValuesAsIcon(item);
        expectNoVisibleShowValuesAsIcon(chip);

        api.applyColumnState({ state: [{ colId: 'gold', showValuesAs: 'percentOfGrandTotal' }] });
        expect(listItem(api, 'Gold')).toBe(item);
        expect(chipIn(api, 'toolPanel', 'sum(Gold)')).toBe(chip);
        expectShowValuesAsIconAfterName(item);
        expectShowValuesAsIconAfterName(chip);

        // Parent-row total has no hierarchy on a flat grid, so the mode is dormant until a row group is added.
        api.applyColumnState({ state: [{ colId: 'gold', showValuesAs: 'percentOfParentRowTotal' }] });
        expectShowValuesAsIconAfterName(item, true);
        expectShowValuesAsIconAfterName(chip, true);

        api.applyColumnState({ state: [{ colId: 'gold', showValuesAs: null }] });
        expectNoVisibleShowValuesAsIcon(item);
        expectNoVisibleShowValuesAsIcon(chip);
    });

    test('clicking an indicator icon in a list item toggles the column, like clicking its name', async () => {
        const api = createGrid([
            { field: 'country' },
            calcDef,
            { field: 'gold', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
        ]);

        await waitFor(() => expectShowValuesAsIconAfterName(listItem(api, 'Gold')));
        listItem(api, 'Profit').querySelector<HTMLElement>('.ag-calculated-column-icon')!.click();
        showValuesAsIcon(listItem(api, 'Gold'))!.click();

        await waitFor(() => {
            expect(api.getColumn('profit')!.isVisible()).toBe(false);
            expect(api.getColumn('gold')!.isVisible()).toBe(false);
        });
        expect(api.getColumn('country')!.isVisible()).toBe(true);
    });

    test('ƒx follows a colDef change on the same list item', async () => {
        const api = createGrid([{ field: 'country' }, { colId: 'profit', headerName: 'Profit', field: 'gold' }]);

        let item!: HTMLElement;
        await waitFor(() => {
            item = listItem(api, 'Profit');
        });
        expect(item.querySelector('.ag-calculated-column-icon')).toBeNull();

        api.setGridOption('columnDefs', [{ field: 'country' }, calcDef]);
        await waitFor(() => expectCalcIconBeforeName(listItem(api, 'Profit')));

        api.setGridOption('columnDefs', [
            { field: 'country' },
            { colId: 'profit', headerName: 'Profit', field: 'gold' },
        ]);
        await waitFor(() => expect(listItem(api, 'Profit').querySelector('.ag-calculated-column-icon')).toBeNull());
    });

    test('ƒx follows the calculatedColumns grid option', async () => {
        const api = createGrid([{ field: 'country' }, { ...calcDef, aggFunc: 'sum' }]);

        await waitFor(() => expectCalcIconBeforeName(chipIn(api, 'toolPanel', 'sum(Profit)')));

        // Turning the option off leaves `calculatedExpression` on the colDef, which warns.
        enableDevValidations({ suppress: [319] });
        api.setGridOption('calculatedColumns', false);
        await waitFor(() => {
            expect(listItem(api, 'Profit').querySelector('.ag-calculated-column-icon')).toBeNull();
            expect(chipIn(api, 'toolPanel', 'sum(Profit)').querySelector('.ag-calculated-column-icon')).toBeNull();
        });
    });

    test('icons replaced through the icons grid option are used in the list and chips', async () => {
        const api = createGrid(
            [{ field: 'country' }, { ...calcDef, aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' }],
            {
                icons: {
                    calculatedColumnsHeader: '<span class="custom-fx"></span>',
                    showValuesAs: '<span class="custom-sva"></span>',
                },
            }
        );

        await waitFor(() => {
            const item = listItem(api, 'Profit');
            const chip = chipIn(api, 'toolPanel', 'sum(Profit)');
            for (const host of [item, chip]) {
                expect(host.querySelector('.ag-calculated-column-icon .custom-fx')).not.toBeNull();
                expect(host.querySelector('.ag-show-values-as-icon .custom-sva')).not.toBeNull();
            }
        });
    });
});
