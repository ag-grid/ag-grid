import { AgCharts, ModuleRegistry } from 'ag-charts-enterprise';
import type { AgChartInstance, AgChartOptions, AgFinancialChartOptions } from 'ag-charts-enterprise';
import { type RefObject, useEffect, useRef } from 'react';

import type { PreviewChartOptions, PreviewPreset, PreviewTooltipTarget } from './chartTypes';
import { PREVIEW_MODULES } from './previewModules';

ModuleRegistry.registerModules(PREVIEW_MODULES);

/**
 * Mount a chart into a container and keep it in step with `options`, which must
 * be memoised by the caller - it is the update trigger. Updates rather than
 * remounts, so a keystroke does not flash the canvas or restart the animation.
 * `preset` is fixed for the life of the chart, so switching presets remounts.
 * `tooltipTarget` holds a tooltip open on one datum.
 */
export const useChart = (
    options: PreviewChartOptions,
    preset?: PreviewPreset,
    tooltipTarget?: PreviewTooltipTarget
): RefObject<HTMLDivElement> => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<AgChartInstance<PreviewChartOptions> | null>(null);
    // Read through a ref so mounting does not depend on the first options value,
    // which would recreate the chart whenever the caller's memo changed.
    const latestOptions = useRef(options);
    latestOptions.current = options;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        chartRef.current =
            preset === 'price-volume'
                ? AgCharts.createFinancialChart({ ...(latestOptions.current as AgFinancialChartOptions), container })
                : AgCharts.create({ ...(latestOptions.current as AgChartOptions), container });
        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, []);

    // Kept so the effect below can wait for the update in hand: the chart's
    // state is only settled once it resolves.
    const pendingUpdate = useRef<Promise<void>>();
    useEffect(() => {
        const container = containerRef.current;
        if (!chartRef.current || !container) return;
        pendingUpdate.current = chartRef.current.update({ ...options, container });
    }, [options]);

    // Runs after every update, not only on a change of target: an options change
    // large enough to rebuild the series drops the active datum. Waits for the
    // update to settle, since until then the chart still reports the datum about
    // to be dropped, and reads back what it shows rather than re-applying blind.
    const appliedTarget = useRef<PreviewTooltipTarget>();
    useEffect(() => {
        let stale = false;
        const apply = async () => {
            // An update that failed is the update's own business; the state it
            // left behind is still what the chart is showing.
            await pendingUpdate.current?.catch(() => undefined);
            const chart = chartRef.current;
            if (stale || !chart) return;
            if (tooltipTarget) {
                const active = chart.getState().active?.activeItem;
                if (active?.seriesId === tooltipTarget.seriesId && active.itemId === tooltipTarget.itemId) return;
                appliedTarget.current = tooltipTarget;
                void chart.setState({
                    // The rest of the state as it stands - a zoom, a hidden
                    // series - so that opening a tooltip is all this does.
                    ...chart.getState(),
                    active: { activeItem: { type: 'series-node', ...tooltipTarget }, frozen: true },
                });
            } else if (appliedTarget.current) {
                appliedTarget.current = undefined;
                void chart.setState({ ...chart.getState(), active: { activeItem: undefined, frozen: false } });
            }
        };
        void apply();
        return () => {
            stale = true;
        };
    }, [options, tooltipTarget?.seriesId, tooltipTarget?.itemId]);

    return containerRef;
};
