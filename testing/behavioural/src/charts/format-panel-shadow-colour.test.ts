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

    interface ShadowOptions {
        enabled?: boolean;
        blur?: number;
        xOffset?: number;
        yOffset?: number;
        color?: string;
        fill?: string;
        fillOpacity?: number;
    }

    /** Theme overrides for the bar series shadow. `fill` and `fillOpacity` are not in the 14.3.0 option types yet. */
    const barShadow = (shadow: ShadowOptions): AgChartThemeOverrides => ({
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

        /** What the picker has written: the shadow in the chart's public theme overrides. */
        const writtenShadow = (): ShadowOptions => {
            const theme = chartRef.chart.getOptions().theme as { overrides?: AgChartThemeOverrides };
            return (theme.overrides?.bar?.series?.shadow as ShadowOptions | undefined) ?? {};
        };

        /**
         * What the first bar is drawn with: the shadow the series resolved from the theme and the overrides.
         * Only the series node carries this, so it is the one place the suite reads chart internals.
         */
        const drawnShadow = (): ShadowOptions => {
            const series = (chartRef.chart as any).chart.series[0] as {
                datumSelection: { nodes(): { fillShadow: ShadowOptions }[] };
            };
            return series.datumSelection.nodes()[0].fillShadow;
        };

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

        return { label, writtenShadow, drawnShadow, pick };
    }

    test('shows the theme default shadow colour with its opacity, not an opaque colour', async () => {
        const { label, drawnShadow } = await openShadowPicker();

        // The theme default is a black `fill` with a separate, partial `fillOpacity`.
        expect(drawnShadow().fill).toBe('#000');
        expect(drawnShadow().fillOpacity).toBeLessThan(1);
        expect(label.textContent).toBe('#00000080');
    });

    test('shows the fill and fillOpacity the chart is set to as one colour with an alpha', async () => {
        const { label } = await openShadowPicker(barShadow({ fill: '#336699', fillOpacity: 0.2 }));

        expect(label.textContent).toBe('#33669933');
    });

    test('shows a fully opaque shadow without an alpha', async () => {
        const { label } = await openShadowPicker(barShadow({ fill: '#336699', fillOpacity: 1 }));

        expect(label.textContent).toBe('#336699');
    });

    test('keeps the colour of a shadow set through the legacy colour option', async () => {
        const { label } = await openShadowPicker(barShadow({ color: 'rgba(255, 0, 0, 0.5)' }));

        expect(label.textContent).toBe('#FF000080');
    });

    test('a pick writes the colour as an opaque fill and the alpha as fillOpacity', async () => {
        const { label, writtenShadow, pick } = await openShadowPicker();

        await pick('rgba(255, 0, 0, 0.2)');

        // The alpha lives in `fillOpacity` alone, so the opacity is not applied twice.
        expect(writtenShadow()).toEqual({ fill: 'rgb(255, 0, 0)', fillOpacity: 0.2 });
        expect(label.textContent).toBe('#FF000033');
    });

    test('a pick of an opaque colour sets the fillOpacity to 1', async () => {
        const { label, writtenShadow, pick } = await openShadowPicker();

        await pick('rgb(0, 128, 0)');

        expect(writtenShadow()).toEqual({ fill: 'rgb(0, 128, 0)', fillOpacity: 1 });
        expect(label.textContent).toBe('#008000');
    });

    test('a pick changes the colour and opacity of a shadow that is cast', async () => {
        const { drawnShadow, pick } = await openShadowPicker(barShadow({ enabled: true, blur: 11 }));
        expect(drawnShadow().enabled).toBe(true);

        await pick('rgba(255, 0, 0, 0.2)');

        expect(drawnShadow()).toMatchObject({
            enabled: true,
            blur: 11,
            fill: 'rgb(255, 0, 0)',
            fillOpacity: 0.2,
        });
    });

    test('a pick on a chart that already has a legacy shadow colour changes the shadow it draws', async () => {
        const { label, writtenShadow, drawnShadow, pick } = await openShadowPicker(
            barShadow({ enabled: true, color: 'rgba(255, 0, 0, 0.5)' })
        );

        await pick('rgba(0, 0, 255, 0.2)');

        // The saved `color` is still in the chart's options, so the pick only works if `fill` takes precedence.
        expect(writtenShadow()).toEqual({ fill: 'rgb(0, 0, 255)', fillOpacity: 0.2 });
        expect(drawnShadow()).toMatchObject({ enabled: true, fill: 'rgb(0, 0, 255)', fillOpacity: 0.2 });
        expect(label.textContent).toBe('#0000FF33');
    });

    test('a pick leaves the rest of the shadow alone', async () => {
        const { writtenShadow, drawnShadow, pick } = await openShadowPicker(
            barShadow({ enabled: true, blur: 11, xOffset: 7, yOffset: -2 })
        );

        await pick('rgba(255, 0, 0, 0.2)');

        // Only the colour is written, and the shadow drawn still has the seeded values around it.
        expect(writtenShadow()).toEqual({ fill: 'rgb(255, 0, 0)', fillOpacity: 0.2 });
        expect(drawnShadow()).toMatchObject({
            enabled: true,
            blur: 11,
            xOffset: 7,
            yOffset: -2,
            fill: 'rgb(255, 0, 0)',
            fillOpacity: 0.2,
        });
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
