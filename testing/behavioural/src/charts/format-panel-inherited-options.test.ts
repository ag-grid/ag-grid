import { setupFormatPanelSuite } from './formatPanelOptions';

/**
 * Options AG Charts leaves unset and resolves elsewhere at render time. The sibling suites only prove
 * these bindings resolve to *something*; this one pins *what* the panel shows to the value the chart
 * actually draws with, so a fallback wired to the wrong option cannot pass as resolved.
 */
describe('chart tool panel options - inherited values', () => {
    const openFormatPanel = setupFormatPanelSuite();
    const series = (expression: string) => `getSeriesOptionsProxy() -> ${expression}`;

    /** Sliders show their number as text, and an array-valued option (line dash) by its first entry. */
    const asSliderText = (value: unknown) => `${Array.isArray(value) ? value[0] : value}`;

    test('box plot whiskers show the series stroke styling they inherit', async () => {
        // Not every inherited option has a series-level control of its own, so ask for them directly.
        const inherited = ['stroke', 'strokeWidth', 'strokeOpacity', 'lineDash', 'lineDashOffset'];
        const { shown, options } = await openFormatPanel('boxPlot', inherited.map(series));

        // The theme leaves `whisker` unset and the chart strokes whiskers with the series stroke, so the
        // whisker controls must show the series' own values rather than blank or 0.
        expect(options.get(series('stroke'))).toEqual(expect.stringMatching(/^#/));
        expect(shown.get(series('whisker.stroke'))).toBe(options.get(series('stroke')));
        for (const key of inherited.slice(1)) {
            expect(options.get(series(key))).toBeDefined();
            expect(shown.get(series(`whisker.${key}`))).toBe(asSliderText(options.get(series(key))));
        }
    });

    test.each(['funnel', 'coneFunnel'] as const)(
        '%s stage labels toggle reflects the category axis',
        async (chartType) => {
            const { shown, options } = await openFormatPanel(chartType);

            // The series holds no `stageLabel` of its own: the theme clones it onto the category axis label,
            // which is enabled by default, so the toggle must open checked rather than masked to `false`.
            expect(options.get(series('stageLabel.enabled'))).toBeUndefined();
            expect(shown.get(series('stageLabel.enabled'))).toBe(true);
            expect(shown.get(series('stageLabel.fontSize'))).toEqual(expect.any(Number));
        }
    );
});
