import { setupFormatPanelSuite } from './formatPanelOptions';

/**
 * The sibling suites only prove these bindings resolve to *something*; this one pins *what* the panel
 * shows to the value the chart draws with, so a fallback wired to the wrong option cannot pass as resolved.
 */
describe('chart tool panel options - inherited values', () => {
    const openFormatPanel = setupFormatPanelSuite();
    const series = (expression: string) => `getSeriesOptionsProxy() -> ${expression}`;

    /** Sliders show their number as text, and an array-valued option (line dash) by its first entry. */
    const asSliderText = (value: unknown) => `${Array.isArray(value) ? value[0] : value}`;

    test('box plot whiskers show the series stroke styling they inherit', async () => {
        // Not every inherited option has a series-level control of its own, so ask for them directly.
        const inherited = ['stroke', 'strokeWidth', 'strokeOpacity', 'lineDash', 'lineDashOffset'];
        const { shown, options } = await openFormatPanel('boxPlot', {
            read: inherited.map(series),
            // The theme's solid dash is the same 0 an unresolved slider masks with, so pin a visible one.
            chartThemeOverrides: { 'box-plot': { series: { lineDash: [4, 2], lineDashOffset: 3 } } },
        });

        // The theme leaves `whisker` unset, so the controls must show the series' own stroke values.
        expect(options.get(series('stroke'))).toEqual(expect.stringMatching(/^#/));
        expect(shown.get(series('whisker.stroke'))).toBe(options.get(series('stroke')));
        for (const key of inherited.slice(1)) {
            const value = options.get(series(key));
            expect(value).toBeDefined();
            expect(asSliderText(value)).not.toBe('0');
            expect(shown.get(series(`whisker.${key}`))).toBe(asSliderText(value));
        }
    });

    test.each(['funnel', 'coneFunnel'] as const)(
        '%s stage labels toggle reflects the category axis',
        async (chartType) => {
            const { shown, options } = await openFormatPanel(chartType);

            // The theme clones the unset `stageLabel` onto the category axis label, which is enabled by default.
            expect(options.has(series('stageLabel.enabled'))).toBe(true);
            expect(options.get(series('stageLabel.enabled'))).toBeUndefined();
            expect(shown.get(series('stageLabel.enabled'))).toBe(true);
            expect(shown.get(series('stageLabel.fontSize'))).toEqual(expect.any(Number));
        }
    );
});
