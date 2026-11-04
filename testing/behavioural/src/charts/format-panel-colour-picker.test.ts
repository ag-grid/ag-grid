import { waitFor } from '@testing-library/dom';
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

    describe('dialog accessibility', () => {
        async function openColourDialog() {
            const { picker } = await openFirstColourPicker();
            picker
                .querySelector('.ag-picker-field-wrapper')!
                .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            const dialog = await waitFor(() => {
                const el = document.querySelector<HTMLElement>('.ag-color-dialog');
                expect(el).not.toBeNull();
                return el!;
            });
            return {
                picker,
                dialog,
                area: dialog.querySelector<HTMLElement>('.ag-spectrum-color')!,
                hue: dialog.querySelector<HTMLElement>('.ag-spectrum-hue .ag-spectrum-slider')!,
                alpha: dialog.querySelector<HTMLElement>('.ag-spectrum-alpha .ag-spectrum-slider')!,
                input: dialog.querySelector<HTMLInputElement>('.ag-color-panel input')!,
            };
        }

        function typeColour(input: HTMLInputElement, value: string) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        test('the dialog is named after the picker label', async () => {
            const { picker, dialog } = await openColourDialog();
            const pickerLabel = picker.querySelector('.ag-label')!.textContent!.trim();

            expect(pickerLabel).toBe('Color');
            expect(dialog.getAttribute('aria-label')).toBe(pickerLabel);
        });

        test('the colour area and both sliders are named sliders with a range', async () => {
            const { area, hue, alpha } = await openColourDialog();

            for (const [el, name, max] of [
                [area, 'Saturation and Brightness', '100'],
                [hue, 'Hue', '360'],
                [alpha, 'Opacity', '100'],
            ] as const) {
                expect(el.getAttribute('role')).toBe('slider');
                expect(el.getAttribute('aria-label')).toBe(name);
                expect(el.getAttribute('aria-valuemin')).toBe('0');
                expect(el.getAttribute('aria-valuemax')).toBe(max);
                expect(el.getAttribute('aria-valuenow')).toMatch(/^\d+$/);
            }
            expect(area.getAttribute('aria-valuetext')).toMatch(/^Saturation \d+%, Brightness \d+%$/);
        });

        test('the slider values follow the colour', async () => {
            const { area, hue, alpha, input } = await openColourDialog();

            typeColour(input, 'rgba(255, 0, 0, 0.5)');

            expect(area.getAttribute('aria-valuenow')).toBe('100');
            expect(area.getAttribute('aria-valuetext')).toBe('Saturation 100%, Brightness 100%');
            expect(hue.getAttribute('aria-valuenow')).toBe('0');
            expect(alpha.getAttribute('aria-valuenow')).toBe('50');

            typeColour(input, '#00008080');

            expect(area.getAttribute('aria-valuetext')).toBe('Saturation 100%, Brightness 50%');
            expect(hue.getAttribute('aria-valuenow')).toBe('240');
        });

        test('the hex input is named', async () => {
            const { input } = await openColourDialog();

            expect(input.getAttribute('aria-label')).toBe('Hex Color');
            expect(input.hasAttribute('aria-labelledby')).toBe(false);
        });
    });
});
