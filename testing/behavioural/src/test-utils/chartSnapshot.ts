import type { ChartRef } from 'ag-grid-community';

interface AgChartActual {
    waitForUpdate(timeoutMs: number, skipAnimations: boolean): Promise<void>;
}

/** Unwraps ag-grid's internal chart proxy to reach the real AG Charts instance's `waitForUpdate`. */
function unwrapChart(chart: ChartRef['chart']): AgChartActual {
    const maybeWrapped = chart as { chart?: AgChartActual };
    return (maybeWrapped.chart ?? chart) as AgChartActual;
}

/** Resolves on the next animation frame - used to flush jsdom's polyfilled rAF/ResizeObserver queue. */
function flushPendingAnimationFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Waits for a chart's async render cycle to finish (including layout/auto-sizing, which never
 * settles under jsdom without this) and returns the highest-resolution rendered canvas as a PNG
 * buffer, suitable for `expect(buffer).toMatchImageSnapshot()`.
 */
export async function renderChartToBuffer(chartRef: ChartRef): Promise<Buffer> {
    const rawChart = unwrapChart(chartRef.chart);
    await rawChart.waitForUpdate(5000, true);

    // A second pass is needed: jsdom never fires the ResizeObserver callbacks that would otherwise
    // let a single waitForUpdate observe the chart's fully-settled, non-animating state. Flushing
    // the (polyfilled) animation-frame queue first gives any pending rAF-scheduled work a chance to
    // run before that second wait, rather than guessing at a fixed sleep duration.
    await flushPendingAnimationFrame();
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
