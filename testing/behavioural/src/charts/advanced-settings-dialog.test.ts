import { findByText, waitFor, within } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

describe('chart Advanced Settings dialog', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    test('Tab cycles between the settings and the Close button without leaving the dialog; Enter on Close closes it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', chartDataType: 'category' },
                { field: 'gold', chartDataType: 'series' },
            ],
            rowData: [
                { country: 'Russia', gold: 3 },
                { country: 'USA', gold: 4 },
            ],
            cellSelection: true,
            popupParent: document.body,
        });
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'groupedColumn',
        })!;
        await chartRef.chart.waitForUpdate();
        const user = userEvent.setup();

        await user.click(chartRef.chartElement.querySelector<HTMLElement>('.ag-chart-menu-toolbar-button')!);
        await user.click(await findByText(document.body, 'Advanced Settings'));
        const settings = await waitFor(() => {
            const el = document.querySelector<HTMLElement>('.ag-chart-advanced-settings');
            expect(el?.contains(document.activeElement)).toBe(true);
            return el!;
        });
        const dialog = settings.closest<HTMLElement>('.ag-dialog')!;
        const closeButton = within(dialog).getByRole('button', { name: 'Close' });

        for (let i = 0; i < 10 && settings.contains(document.activeElement); ++i) {
            await user.tab({ shift: true });
        }
        expect(closeButton).toHaveFocus();

        await user.tab({ shift: true });
        expect(settings).toContainElement(document.activeElement as HTMLElement);
        await user.tab();
        expect(closeButton).toHaveFocus();
        await user.tab();
        expect(settings).toContainElement(document.activeElement as HTMLElement);
        await user.tab({ shift: true });
        expect(closeButton).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(dialog.isConnected).toBe(false);
    });
});
