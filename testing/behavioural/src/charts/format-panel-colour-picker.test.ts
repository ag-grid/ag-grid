import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/**
 * The format panel's colour picker, its panel and its hex input parse and print colours with the
 * Grid's own colour utility. These tests pin what a user sees: the upper-case hex label, the input
 * mirroring it, and the validity message for text that is not a colour.
 */
describe('chart format panel colour picker', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => gridsManager.reset());

    async function openFirstColourPicker() {
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

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'format' });
        await chartRef.chart.waitForUpdate();

        const picker = await waitFor(() => {
            const el = document.querySelector<HTMLElement>('.ag-color-picker');
            expect(el).not.toBeNull();
            return el!;
        });
        const label = picker.querySelector<HTMLElement>('.ag-color-picker-value')!;
        return { picker, label };
    }

    const triggerOf = (picker: Element) => picker.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;

    test('every colour picker trigger is a button that opens a dialog, named by its visible label', async () => {
        await openFirstColourPicker();
        const pickers = Array.from(document.querySelectorAll<HTMLElement>('.ag-color-picker'));
        expect(pickers.length).toBeGreaterThan(0);

        for (const picker of pickers) {
            const trigger = triggerOf(picker);
            const labelText = picker.querySelector<HTMLElement>('.ag-label')!.textContent!.trim();
            expect(trigger).toHaveAttribute('role', 'button');
            expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
            expect(trigger).toHaveAttribute('aria-expanded', 'false');
            expect(trigger).toHaveAccessibleName(labelText);
        }
    });

    test('select pickers in the format panel stay comboboxes', async () => {
        await openFirstColourPicker();
        const selectTrigger = await waitFor(() => {
            const el = document.querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper');
            expect(el).not.toBeNull();
            return el!;
        });

        expect(selectTrigger).toHaveAttribute('role', 'combobox');
        expect(selectTrigger).not.toHaveAttribute('aria-haspopup', 'dialog');
    });

    test('aria-expanded follows the colour dialog opening with Enter and closing with Escape', async () => {
        const { picker } = await openFirstColourPicker();
        const trigger = triggerOf(picker);
        const user = userEvent.setup();

        trigger.focus();
        await user.keyboard('{Enter}');
        const dialog = await waitFor(() => {
            const el = document.querySelector<HTMLElement>('.ag-color-dialog');
            expect(el).not.toBeNull();
            return el!;
        });
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(dialog.closest('[role="dialog"]') ?? dialog.querySelector('[role="dialog"]')).not.toBeNull();

        await user.keyboard('{Escape}');
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    });

    test('the picker label is the colour as upper-case hex', async () => {
        const { label } = await openFirstColourPicker();

        expect(label.textContent).toMatch(/^#[0-9A-F]{6}([0-9A-F]{2})?$/);
    });

    test('the panel input mirrors the label, and typing a colour updates the picker', async () => {
        const { picker, label } = await openFirstColourPicker();
        const initialHex = label.textContent;

        picker
            .querySelector('.ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-color-dialog .ag-color-panel input');
            expect(el).not.toBeNull();
            return el!;
        });

        expect(input.value).toBe(initialHex);

        input.value = 'rgba(255, 0, 0, 0.5)';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(input.validationMessage).toBe('');
        expect(label.textContent).toBe('#FF000080');
    });

    test('text that is not a colour marks the input invalid and leaves the picker unchanged', async () => {
        const { picker, label } = await openFirstColourPicker();
        const initialHex = label.textContent;

        picker
            .querySelector('.ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-color-dialog .ag-color-panel input');
            expect(el).not.toBeNull();
            return el!;
        });

        input.value = '#ggg';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(input.validationMessage).toBe('Color value is invalid');
        expect(label.textContent).toBe(initialHex);
    });
});
