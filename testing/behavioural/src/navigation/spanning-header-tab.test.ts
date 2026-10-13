import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('Tab navigation from spanning headers', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridsManager.reset());

    test.each([
        { enableRtl: false, pivotDefaultExpanded: 0 },
        { enableRtl: false, pivotDefaultExpanded: -1 },
        { enableRtl: true, pivotDefaultExpanded: 0 },
        { enableRtl: true, pivotDefaultExpanded: -1 },
    ])(
        'Shift+Tab reaches the last pivot chip (RTL=$enableRtl, expanded=$pivotDefaultExpanded)',
        async ({ enableRtl, pivotDefaultExpanded }) => {
            const api = await gridsManager.createGridAndWait('grid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', pivot: true, pivotSort: 'asc', initialPivotSort: 'asc' },
                    { field: 'year', pivot: true, pivotSort: 'asc', initialPivotSort: 'asc' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                defaultColDef: { flex: 1, minWidth: 130, enableValue: true, enableRowGroup: true, enablePivot: true },
                autoGroupColumnDef: { minWidth: 200, pinned: enableRtl ? 'right' : 'left' },
                enableRtl,
                pivotMode: true,
                pivotDefaultExpanded,
                pivotPanelShow: 'always',
                rowData: [
                    { country: 'France', sport: 'Alpine Skiing', year: 2000, gold: 1 },
                    { country: 'France', sport: 'Wrestling', year: 2000, gold: 2 },
                ],
            });
            const grid = getGridElement(api)!;
            const column = api.getDisplayedCenterColumns()[0];
            const cell = grid.querySelector<HTMLElement>(
                `.ag-row[row-index="0"] .ag-cell[col-id="${column.getColId()}"]`
            )!;
            cell.focus();
            const user = userEvent.setup();
            await user.keyboard(pivotDefaultExpanded === 0 ? '{ArrowUp}{ArrowUp}' : '{ArrowUp}{ArrowUp}{ArrowUp}');
            expect(document.activeElement?.textContent).toContain('Alpine Skiing');
            await user.keyboard(enableRtl ? '{ArrowRight}' : '{ArrowLeft}');
            expect(document.activeElement?.getAttribute('col-id')).toBe('ag-Grid-AutoColumn');
            await user.tab({ shift: true });
            await waitFor(() => {
                expect(document.activeElement?.closest('.ag-column-drop-cell')?.textContent).toContain('Year');
            });
        }
    );
});
