import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import { agTestIdFor, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

/** The Move and Resize controls in a dialog's title bar must not take the test IDs of the buttons beside them. */
describe('dialog title bar test IDs', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('the Advanced Filter Builder keeps its Maximise and Close test IDs on those buttons', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            enableAdvancedFilter: true,
        });

        api.showAdvancedFilterBuilder();

        await waitFor(() => {
            const byTestId = (id: string) => document.querySelector(`[data-testid="${id}"]`);
            expect(byTestId(agTestIdFor.advancedFilterPanelMaximiseButton())).toHaveAttribute('aria-label', 'Maximize');
            expect(byTestId(agTestIdFor.advancedFilterPanelCloseButton())).toHaveAttribute('aria-label', 'Close');
        });
    });
});
