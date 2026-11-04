import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import type { AgChartThemeOverrides } from 'ag-charts-enterprise';
import { TestGridsManager, canvasPolyfill } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule, IntegratedChartsModule } from 'ag-grid-enterprise';

/**
 * The series format panel's shadow colour picker. The shadow casts `fill` at `fillOpacity`, so the picker
 * has to show those two as one colour with an alpha, and a pick has to change both, so the rendered
 * shadow takes the picked colour and opacity. The sibling suites only prove the binding resolves.
 */
describe('chart format panel shadow colour picker', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, IntegratedChartsModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => {
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    /** Theme overrides for the bar series shadow. `fill` and `fillOpacity` are not in the 14.3.0 option types yet. */
    const barShadow = (shadow: Record<string, unknown>): AgChartThemeOverrides => ({
        bar: { series: { shadow: shadow as any } },
    });

    async function openShadowPicker(chartThemeOverrides?: AgChartThemeOverrides) {
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
            chartThemeOverrides,
        })!;
        await chartRef.chart.waitForUpdate();

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'format' });
        await chartRef.chart.waitForUpdate();

        // The Shadow toggle group sits under Series; its title is the toggle's label.
        const group = await waitFor(() => {
            const title = Array.from(document.querySelectorAll<HTMLElement>('.ag-toggle-button-label')).find(
                (el) => el.textContent === 'Shadow'
            );
            expect(title).toBeDefined();
            return title!.closest<HTMLElement>('.ag-group')!;
        });
        const picker = group.querySelector<HTMLElement>('.ag-color-picker')!;
        const label = picker.querySelector<HTMLElement>('.ag-color-picker-value')!;

        // What the chart draws the first series' shadow with: the resolved options, not the user's input.
        const shadow = () => (chartRef.chart as any).chart.series[0].options.shadow;

        /** Types a colour into the picker's dialog, as a user would, and lets the chart settle. */
        const pick = async (colour: string) => {
            picker
                .querySelector('.ag-picker-field-wrapper')!
                .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            const input = await waitFor(() => {
                const el = document.querySelector<HTMLInputElement>('.ag-color-dialog .ag-color-panel input');
                expect(el).not.toBeNull();
                return el!;
            });
            input.value = colour;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await chartRef.chart.waitForUpdate();
        };

        return { label, shadow, pick };
    }

    test('shows the theme default shadow colour with its opacity, not an opaque colour', async () => {
        const { label, shadow } = await openShadowPicker();

        // The theme default is a black `fill` with a separate, partial `fillOpacity`.
        expect(shadow().fill).toBe('#000');
        expect(shadow().fillOpacity).toBeLessThan(1);
        expect(label.textContent).toBe('#00000080');
    });

    test('shows the fill and fillOpacity the chart is set to as one colour with an alpha', async () => {
        const { label } = await openShadowPicker(barShadow({ fill: '#336699', fillOpacity: 0.2 }));

        expect(label.textContent).toBe('#33669933');
    });

    test('shows a fully opaque shadow without an alpha', async () => {
        const { label } = await openShadowPicker(barShadow({ fill: '#336699', fillOpacity: 1 }));

        expect(label.textContent).toMatch(/^#336699(FF)?$/);
    });

    test('keeps the colour of a shadow set through the legacy colour option', async () => {
        const { label, shadow } = await openShadowPicker(barShadow({ color: 'rgba(255, 0, 0, 0.5)' }));

        expect(shadow().fill).toBeDefined();
        expect(label.textContent).toBe('#FF000080');
    });

    test('a pick changes the shadow fill and fillOpacity the chart draws with, and the label follows', async () => {
        const { label, shadow, pick } = await openShadowPicker();

        await pick('rgba(255, 0, 0, 0.2)');

        // The colour is opaque and the alpha lives in `fillOpacity` alone, so the opacity is not applied twice.
        expect(shadow().fill).toBe('rgb(255, 0, 0)');
        expect(shadow().fillOpacity).toBe(0.2);
        expect(label.textContent).toBe('#FF000033');
    });

    test('a pick of an opaque colour sets the fillOpacity to 1', async () => {
        const { label, shadow, pick } = await openShadowPicker();

        await pick('rgb(0, 128, 0)');

        expect(shadow().fill).toBe('rgb(0, 128, 0)');
        expect(shadow().fillOpacity).toBe(1);
        expect(label.textContent).toMatch(/^#008000(FF)?$/);
    });

    test('a pick leaves the rest of the shadow alone', async () => {
        const { shadow, pick } = await openShadowPicker();
        const { enabled, blur, xOffset, yOffset } = shadow();

        await pick('rgba(255, 0, 0, 0.2)');

        expect({
            enabled: shadow().enabled,
            blur: shadow().blur,
            xOffset: shadow().xOffset,
            yOffset: shadow().yOffset,
        }).toEqual({ enabled, blur, xOffset, yOffset });
    });

    test('a pick raises no chart warning or error', async () => {
        const { pick } = await openShadowPicker();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await pick('rgba(255, 0, 0, 0.2)');

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
    });
});
