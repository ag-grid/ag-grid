import type { ChartRef } from 'ag-grid-community';

interface AgChartActual {
    skipAnimations(): void;
    waitForUpdate(timeoutMs: number, failOnTimeout: boolean): Promise<void>;
}

/** Unwraps ag-grid's internal chart proxy to reach the real AG Charts instance, matching ag-grid's own `deproxy` pattern. */
function unwrapChart(chart: ChartRef['chart']): AgChartActual {
    const maybeWrapped = chart as { chart?: AgChartActual };
    return (maybeWrapped.chart ?? chart) as AgChartActual;
}

/**
 * Waits for a chart's async render cycle to finish (including layout/auto-sizing, which never
 * settles under jsdom without this) and returns the highest-resolution rendered canvas as a PNG
 * buffer, suitable for `expect(buffer).toMatchImageSnapshot()`.
 */
export async function renderChartToBuffer(chartRef: ChartRef): Promise<Buffer> {
    const rawChart = unwrapChart(chartRef.chart);
    // Without this, series entrance animations (e.g. bars growing from zero height) never complete
    // under jsdom - nothing drives a continuous requestAnimationFrame loop - so the chart would
    // otherwise be captured at its initial, pre-animation (invisible series) frame.
    rawChart.skipAnimations();
    await rawChart.waitForUpdate(5000, true);

    const canvases = chartRef.chartElement.querySelectorAll('canvas');
    let buffer: Buffer | undefined;
    let bestArea = -1;
    for (const canvasEl of canvases) {
        // Select by actual pixel area, not compressed PNG byte size - a visually simpler canvas can
        // compress to a larger buffer than a bigger, busier one, so byte length isn't a reliable proxy
        // for "the canvas that matters" across chart types or future rendering changes.
        const area = canvasEl.width * canvasEl.height;
        if (area <= bestArea) {
            continue;
        }
        const ctx = canvasEl.getContext('2d') as unknown as { canvas: { toBuffer: (fmt: string) => Promise<Buffer> } };
        buffer = await ctx.canvas.toBuffer('png');
        bestArea = area;
    }

    if (!buffer) {
        throw new Error('renderChartToBuffer: chart has no canvas elements to render');
    }
    return buffer;
}
