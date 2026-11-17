import { getByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager, mockGridLayout } from 'ag-test-utils';

import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('drop zone removal focus', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });

    beforeEach(() => {
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (element) =>
            element.classList.contains('ag-virtual-list-viewport') ? 200 : undefined;
    });
    afterEach(() => {
        grids.reset();
        mockGridLayout.resetOptions();
    });

    test.each([
        { start: 0, order: ['Country', 'sum(Gold)', 'Sport'] },
        { start: 1, order: ['sum(Gold)', 'Sport', 'Country'] },
        { start: 2, order: ['Sport', 'sum(Gold)', 'Country'] },
        { start: 0, order: ['Country', 'sum(Gold)'], pivot: false },
    ])('returns to the column list after deleting pills in order $order', async ({ start, order, pivot = true }) => {
        const api = await grids.createGridAndWait('grid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot },
                { field: 'gold', aggFunc: 'sum' },
            ],
            defaultColDef: { flex: 1, enableRowGroup: true, minWidth: 130 },
            pivotMode: true,
            sideBar: true,
            pagination: true,
            rowData: [{ country: 'France', sport: 'Skiing', gold: 1 }],
        });
        const grid = getGridElement(api)!;
        const list = grid.querySelector<HTMLElement>('.ag-column-select-list')!;
        const gold = await waitFor(() => getByText(list, 'Gold').closest<HTMLElement>('.ag-virtual-list-item')!);
        const user = userEvent.setup();
        await user.click(gold);
        await user.tab();
        for (let i = 0; i < start; i++) {
            await user.tab();
        }
        for (const name of order) {
            expect(document.activeElement?.textContent).toContain(name);
            await user.keyboard('{Delete}');
        }
        await waitFor(() => expect(document.activeElement).toBe(gold));
    });
});
