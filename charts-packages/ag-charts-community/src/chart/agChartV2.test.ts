import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgCartesianChartOptions, AgChartOptions } from './agChartOptions';
import { AgChartV2 } from './agChartV2';
import { Chart } from './chart';
import * as examples from './test/examples';
import {
    waitForChartStability,
    cartesianChartAssertions,
    combineAssertions,
    hoverAction,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    TestCase,
    toMatchImage,
} from './test/utils';

expect.extend({ toMatchImageSnapshot, toMatchImage });

function consoleWarnAssertions(options: AgCartesianChartOptions) {
    return async (chart: Chart) => {
        expect(console.warn).toBeCalledTimes(1);
        expect(console.warn).toBeCalledWith(
            'AG Charts - the axis label format string %H:%M is invalid. No formatting will be applied'
        );

        jest.clearAllMocks();
        options.axes[0].label.format = '%X %M'; // format string for Date objects, not valid for number values
        AgChartV2.update(chart, options);
        await waitForChartStability(chart);

        expect(console.warn).toBeCalledTimes(1);
        expect(console.warn).toBeCalledWith(
            'AG Charts - the axis label format string %X %M is invalid. No formatting will be applied'
        );

        jest.clearAllMocks();
        options.axes[0].label.format = '%'; // multiply by 100, and then decimal notation with a percent sign - valid format string for number values
        AgChartV2.update(chart, options);
        await waitForChartStability(chart);

        expect(console.warn).not.toBeCalled();

        // hovering on chart calls getTooltipHtml() which uses formatDatum() from NumberAxis to format the data points
        // if formatting non-numeric values (Date objects), a warning will be displayed
        await waitForChartStability(chart);
        await hoverAction(200, 100)(chart);

        expect(console.warn).toBeCalledTimes(1);
        expect(console.warn).toBeCalledWith(
            'AG Charts - Data contains Date objects which are being plotted against a number axis, please only use a number axis for numbers.'
        );

        jest.clearAllMocks(); // this is to make sure the afterAll check for console warnings passes
    };
}

const EXAMPLES: Record<string, TestCase> = {
    INVALID_AXIS_LABEL_FORMAT: {
        options: examples.INVALID_AXIS_LABEL_FORMAT,
        assertions: combineAssertions(
            cartesianChartAssertions({ axisTypes: ['number', 'number'], seriesTypes: ['line'] }),
            consoleWarnAssertions(examples.INVALID_AXIS_LABEL_FORMAT)
        ),
    },
    TRUNCATED_LEGEND_ITEMS: {
        options: examples.TRUNCATED_LEGEND_ITEMS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
};

describe('AgChartV2', () => {
    let ctx = setupMockCanvas();
    let chart: Chart;

    beforeEach(() => {
        console.warn = jest.fn();
    });

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
        expect(console.warn).not.toBeCalled();
    });

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    const snapshot = async () => {
        await waitForChartStability(chart);

        return ctx.nodeCanvas?.toBuffer('raw');
    };

    describe('#create', () => {
        for (const [exampleName, example] of Object.entries(EXAMPLES)) {
            it(`for ${exampleName} it should create chart instance as expected`, async () => {
                const options: AgChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChartV2.create<any>(options);
                await waitForChartStability(chart);
                await example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const options: AgChartOptions = { ...example.options };
                options.autoSize = false;
                options.width = CANVAS_WIDTH;
                options.height = CANVAS_HEIGHT;

                chart = AgChartV2.create<any>(options) as Chart;
                await compare();

                if (example.extraScreenshotActions) {
                    await example.extraScreenshotActions(chart);
                    await compare();
                }
            });
        }
    });

    describe('#update', () => {
        it('should allow switching between grouped and stacked types of chart', async () => {
            const exampleCycle = [
                { ...examples.GROUPED_BAR_CHART_EXAMPLE },
                { ...examples.GROUPED_BAR_CHART_EXAMPLE },
            ].map(({ series, ...opts }, idx) => ({
                ...opts,
                series: series?.map((s) => ({ ...s, grouped: idx === 0, stacked: idx !== 0 })),
                autoSize: false,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            }));
            const snapshots: any[] = [];

            // Create initial chart instance.
            chart = AgChartV2.create<any>(exampleCycle[0]) as Chart;
            snapshots[0] = await snapshot();

            // Execute 2 rounds of comparisons to try and catch any issues. On first round, just
            // make sure that the chart changes; on second+ round check the same chart image is
            // generated.
            let previousSnapshot: any = undefined;
            for (let round = 0; round <= 1; round++) {
                for (let index = 0; index < exampleCycle.length; index++) {
                    AgChartV2.update<any>(chart, exampleCycle[index]);

                    const exampleSnapshot = await snapshot();
                    if (snapshots[index] != null) {
                        (expect(exampleSnapshot) as any).toMatchImage(snapshots[index], { writeDiff: false });
                    }

                    if (previousSnapshot != null) {
                        (expect(exampleSnapshot) as any).not.toMatchImage(previousSnapshot, { writeDiff: false });
                    }

                    snapshots[index] = exampleSnapshot;
                    previousSnapshot = exampleSnapshot;
                }
            }
        });

        it('should allow switching positions of axes', async () => {
            const exampleCycle: AgCartesianChartOptions[] = [
                { ...examples.GROUPED_BAR_CHART_EXAMPLE },
                { ...examples.GROUPED_BAR_CHART_EXAMPLE },
            ].map(({ axes, ...opts }, idx) => ({
                ...opts,
                axes: axes?.map((a) => ({
                    ...a,
                    position: a.type === 'category' ? (idx === 0 ? 'left' : 'right') : idx === 0 ? 'bottom' : 'top',
                })),
                autoSize: false,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            }));

            // Create initial chart instance.
            chart = AgChartV2.create<any>(exampleCycle[0]) as Chart;
            await waitForChartStability(chart);

            // Execute 2 rounds of comparisons to try and catch any issues. On first round, just
            // make sure that the chart changes; on second+ round check the same chart image is
            // generated.
            for (let round = 0; round <= 1; round++) {
                for (let index = 0; index < exampleCycle.length; index++) {
                    AgChartV2.update<any>(chart, exampleCycle[index]);

                    await waitForChartStability(chart);
                }
            }
        });
    });
});
