import type { ChartType } from 'ag-grid-community';

import { benignUnresolved, setupFormatPanelSuite } from './formatPanelOptions';

const CHART_TYPES: ChartType[] = [
    'scatter',
    'bubble',
    'histogram',
    'rangeBar',
    'rangeArea',
    'boxPlot',
    'heatmap',
    'treemap',
    'sunburst',
];

describe('chart tool panel options - statistical and hierarchical', () => {
    const openFormatPanel = setupFormatPanelSuite();

    test.each(CHART_TYPES)(
        '%s - every format panel binding resolves and is accepted by the chart',
        async (chartType) => {
            const { count, unresolved, rejected, unexpected } = await openFormatPanel(chartType);

            // The instrumentation is silent when a hook stops matching, so a collapsed count is the only sign
            // that the assertions below now prove nothing.
            expect(count).toBeGreaterThan(20);

            // Any option AG Charts does not recognise is drift, and its own message names the replacement.
            expect(rejected).toEqual([]);

            // A diagnostic class neither known nor caused by the probe value; dropping these is how a new
            // one would go unnoticed.
            expect(unexpected).toEqual([]);

            expect(unresolved).toEqual(benignUnresolved(chartType));
        }
    );
});
