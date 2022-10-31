import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import {
    AgBarSeriesOptions,
    AgCartesianChartOptions,
    AgLineSeriesOptions,
    AgPolarChartOptions,
} from './agChartOptions';
import { AgChartV2 } from './agChartV2';
import { Chart } from './chart';
import {
    waitForChartStability,
    setupMockCanvas,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    hoverAction,
    clickAction,
} from './test/utils';

expect.extend({ toMatchImageSnapshot });

describe('Chart', () => {
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

    setupMockCanvas();

    const dataSamples = {
        randomAnnual: {
            data: [
                { year: '2018', gdp: 12000 },
                { year: '2019', gdp: 18000 },
                { year: '2020', gdp: 20000 },
            ],
            valueKey: 'gdp',
            categoryKey: 'year',
        },
    };

    const testPointerEvents = (testParams: {
        seriesOptions: any;
        chartOptions?: any;
        getNodeData: (series: any) => any[];
        getNodePoint: (nodeItem: any) => [number, number];
        getDatumValues: (datum: any, series: any) => any[];
    }) => {
        const format = (...values: any[]) => values.join(': ');

        const createChart = async (params: { hasTooltip: boolean; onNodeClick?: () => void }): Promise<Chart> => {
            const tooltip = params.hasTooltip
                ? {
                      renderer: (params) => {
                          return format(params.xValue, params.yValue);
                      },
                  }
                : {
                      enabled: false,
                  };

            const listeners = params.onNodeClick
                ? {
                      nodeClick: params.onNodeClick,
                  }
                : undefined;

            const options: AgCartesianChartOptions | AgPolarChartOptions = {
                container: document.body,
                autoSize: false,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                series: [
                    {
                        tooltip,
                        highlightStyle: {
                            item: {
                                fill: 'lime',
                            },
                        },
                        listeners,
                        ...testParams.seriesOptions,
                    },
                ],
                ...(testParams.chartOptions || {}),
            };
            const chart = AgChartV2.create(options);
            await waitForChartStability(chart);
            return chart;
        };

        const hoverChartNodes = async (
            chart: Chart,
            iterator: (params: { series: any; item: any; x: number; y: number }) => Promise<void>
        ) => {
            for (const series of chart.series) {
                const nodeData = testParams.getNodeData(series);
                expect(nodeData.length).toBeGreaterThan(0);
                for (const item of nodeData) {
                    const itemPoint = testParams.getNodePoint(item);
                    const { x, y } = series!.group.inverseTransformPoint(itemPoint[0], itemPoint[1]);
                    await hoverAction(x, y)(chart);
                    await waitForChartStability(chart);
                    await iterator({ series, item, x, y });
                }
            }
        };

        const checkHighlight = async (chart: Chart) => {
            await hoverChartNodes(chart, async ({ series, item }) => {
                // Check the highlighted marker
                expect(series.highlightNode).toBeDefined();
                expect(series.highlightNode.children.length).toEqual(1);
                const marker = series.highlightNode.children[0];
                expect(marker.datum.datum).toBe(item.datum);
                expect(marker['fill']).toEqual('lime');
            });
        };

        const checkNodeClick = async (chart: Chart, onNodeClick: () => void) => {
            await hoverChartNodes(chart, async ({ x, y }) => {
                // Perform click
                await clickAction(x, y)(chart);
                await waitForChartStability(chart);
            });

            // Check click handler
            const nodeCount = chart.series.reduce((sum, series) => sum + testParams.getNodeData(series).length, 0);
            expect(onNodeClick).toBeCalledTimes(nodeCount);
        };

        it(`should render tooltip correctly`, async () => {
            chart = await createChart({ hasTooltip: true });
            await hoverChartNodes(chart, async ({ series, item, x, y }) => {
                // Check the tooltip is shown
                const tooltip = document.querySelector('.ag-chart-tooltip');
                expect(tooltip).toBeInstanceOf(HTMLElement);
                expect(tooltip!.classList.contains('ag-chart-tooltip-hidden')).toBe(false);

                // Check the tooltip position
                const transformMatch = (tooltip as HTMLElement).style.transform.match(/translate\((.*?)px, (.*?)px\)/);
                const [, translateX, translateY] = Array.from(transformMatch!).map((s) => parseFloat(s));
                expect(translateX).toEqual(Math.round(x));
                expect(translateY).toEqual(Math.round(y - 8));

                // Check the tooltip text
                const values = testParams.getDatumValues(item.datum, series);
                expect(tooltip!.textContent).toEqual(format(...values));
            });

            // Check the tooltip is hidden
            await hoverAction(0, 0)(chart);
            await waitForChartStability(chart);
            const tooltip = document.querySelector('.ag-chart-tooltip');
            expect(tooltip!.classList.contains('ag-chart-tooltip-hidden')).toBe(true);
        });

        it(`should highlight hovered items`, async () => {
            chart = await createChart({ hasTooltip: true });
            await checkHighlight(chart);
        });

        it(`should handle nodeClick event`, async () => {
            const onNodeClick = jest.fn();
            chart = await createChart({ hasTooltip: true, onNodeClick });
            await checkNodeClick(chart, onNodeClick);
        });

        it(`should highlight hovered items when tooltip is disabled`, async () => {
            chart = await createChart({ hasTooltip: false });
            await checkHighlight(chart);
        });

        it(`should handle nodeClick event when tooltip is disabled`, async () => {
            const onNodeClick = jest.fn();
            chart = await createChart({ hasTooltip: false, onNodeClick });
            await checkNodeClick(chart, onNodeClick);
        });
    };

    describe(`Line Series Pointer Events`, () => {
        testPointerEvents({
            seriesOptions: <AgLineSeriesOptions>{
                type: 'line',
                data: dataSamples.randomAnnual.data,
                xKey: dataSamples.randomAnnual.categoryKey,
                yKey: dataSamples.randomAnnual.valueKey,
            },
            getNodeData: (series) => series.contextNodeData[0].nodeData,
            getNodePoint: (item) => [item.point.x, item.point.y],
            getDatumValues: (datum, series) => {
                const xValue = datum[series['xKey']];
                const yValue = datum[series['yKey']];
                return [xValue, yValue];
            },
        });
    });

    describe(`Column Series Pointer Events`, () => {
        testPointerEvents({
            seriesOptions: <AgBarSeriesOptions>{
                type: 'column',
                data: dataSamples.randomAnnual.data,
                xKey: dataSamples.randomAnnual.categoryKey,
                yKey: dataSamples.randomAnnual.valueKey,
            },
            getNodeData: (series) => series.contextNodeData[0].nodeData,
            getNodePoint: (item) => [item.x, item.y],
            getDatumValues: (datum, series) => {
                const xValue = datum[series.xKey];
                const yValue = datum[series.yKeys[0]];
                return [xValue, yValue];
            },
        });
    });
});
