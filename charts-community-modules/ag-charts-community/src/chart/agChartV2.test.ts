import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgCartesianChartOptions, AgChartInstance, AgChartOptions } from './agChartOptions';
import { AgChart } from './agChartV2';
import { Chart } from './chart';
import * as examples from './test/examples';
import {
    waitForChartStability,
    cartesianChartAssertions,
    IMAGE_SNAPSHOT_DEFAULTS,
    setupMockCanvas,
    extractImageData,
    TestCase,
    toMatchImage,
    prepareTestOptions,
} from './test/utils';

expect.extend({ toMatchImageSnapshot, toMatchImage });

const EXAMPLES: Record<string, TestCase> = {
    TRUNCATED_LEGEND_ITEMS: {
        options: examples.TRUNCATED_LEGEND_ITEMS,
        assertions: cartesianChartAssertions({ axisTypes: ['number', 'category'], seriesTypes: ['bar'] }),
    },
};

describe('AgChartV2', () => {
    const ctx = setupMockCanvas();
    let chart: AgChartInstance;
    let container: HTMLElement;

    beforeEach(() => {
        console.warn = jest.fn();
        container = document.createElement('div');
        document.body.append(container);
    });

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
        document.body.removeChild(container);
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
                prepareTestOptions(options, container);

                chart = AgChart.create(options);
                await waitForChartStability(chart);
                await example.assertions(chart);
            });

            it(`for ${exampleName} it should render to canvas as expected`, async () => {
                const options: AgChartOptions = { ...example.options };
                prepareTestOptions(options, container);

                chart = AgChart.create(options);
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
            }));
            exampleCycle.forEach((opts) => prepareTestOptions(opts));
            const snapshots: any[] = [];

            // Create initial chart instance.
            chart = AgChart.create(exampleCycle[0]) as Chart;
            snapshots[0] = await snapshot();

            // Execute 2 rounds of comparisons to try and catch any issues. On first round, just
            // make sure that the chart changes; on second+ round check the same chart image is
            // generated.
            let previousSnapshot: any = undefined;
            for (let round = 0; round <= 1; round++) {
                for (let index = 0; index < exampleCycle.length; index++) {
                    AgChart.update(chart, exampleCycle[index]);

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
            }));
            exampleCycle.forEach((opts) => prepareTestOptions(opts));

            // Create initial chart instance.
            chart = AgChart.create(exampleCycle[0]) as Chart;
            await waitForChartStability(chart);

            // Execute 2 rounds of comparisons to try and catch any issues. On first round, just
            // make sure that the chart changes; on second+ round check the same chart image is
            // generated.
            for (let round = 0; round <= 1; round++) {
                for (let index = 0; index < exampleCycle.length; index++) {
                    AgChart.update(chart, exampleCycle[index]);

                    await waitForChartStability(chart);
                }
            }
        });
    });
});
