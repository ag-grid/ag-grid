import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { AgCartesianChartOptions } from './agChartOptions';
import { AgChartV2 } from './agChartV2';
import { CartesianChart } from './cartesianChart';
import { SeriesNodeDataContext } from './series/series';
import {
    waitForChartStability,
    setupMockCanvas,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    hoverAction,
    clickAction,
} from './test/utils';

expect.extend({ toMatchImageSnapshot });

function parseTransform(transform: string) {
    const match = transform.match(/translate\((.*?)px, (.*?)px\)/);
    const [, tx, ty] = Array.from(match!).map((s) => parseFloat(s));
    return {
        translate: { x: tx, y: ty },
    };
}

describe('Chart', () => {
    let chart: CartesianChart;

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

    describe(`Line Series Pointer Events`, () => {
        const format = (x: any, y: any) => `${x}: ${y}`;
        const createChart = async (params: {
            hasTooltip: boolean;
            onNodeClick?: () => void;
        }): Promise<CartesianChart> => {
            const options: AgCartesianChartOptions = {
                type: 'line',
                title: {
                    text: 'GDP of Krakozhia',
                },
                container: document.body,
                autoSize: false,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                data: [
                    { year: '2018', gdp: 12000 },
                    { year: '2019', gdp: 18000 },
                    { year: '2020', gdp: 20000 },
                ],
                series: [
                    {
                        type: 'line',
                        xKey: 'year',
                        yKey: 'gdp',
                        tooltip: params.hasTooltip
                            ? {
                                  renderer: (params) => {
                                      return format(params.xValue, params.yValue);
                                  },
                              }
                            : {
                                  enabled: false,
                              },
                        highlightStyle: {
                            item: {
                                fill: 'lime',
                            },
                        },
                        listeners: params.onNodeClick
                            ? {
                                  nodeClick: params.onNodeClick,
                              }
                            : undefined,
                    },
                ],
            };
            const chart = AgChartV2.create<CartesianChart>(options);
            await waitForChartStability(chart);
            return chart;
        };

        it(`should render tooltip correctly`, async () => {
            chart = await createChart({ hasTooltip: true });

            const series = chart.series[0];
            const nodeDataArray: SeriesNodeDataContext<any, any>[] = series!['contextNodeData'];
            const context = nodeDataArray[0];
            expect(context.nodeData.length).toBeGreaterThan(0);

            for (const item of context.nodeData) {
                const { x, y } = series!.group.inverseTransformPoint(item.point.x, item.point.y);
                await hoverAction(x, y)(chart);
                await waitForChartStability(chart);

                // Check the tooltip is shown
                const tooltip = document.querySelector('.ag-chart-tooltip');
                expect(tooltip).toBeInstanceOf(HTMLElement);
                expect(tooltip!.classList.contains('ag-chart-tooltip-hidden')).toBe(false);

                // Check the tooltip position
                const transform = parseTransform((tooltip as HTMLElement).style.transform);
                expect(transform.translate.x).toEqual(Math.round(x));
                expect(transform.translate.y).toEqual(Math.round(y - 8));

                // Check the tooltip text
                const xValue = item.datum[series['xKey']];
                const yValue = item.datum[series['yKey']];
                expect(tooltip!.textContent).toEqual(format(xValue, yValue));
            }

            // Check the tooltip is hidden
            await hoverAction(0, 0)(chart);
            await waitForChartStability(chart);
            const tooltip = document.querySelector('.ag-chart-tooltip');
            expect(tooltip!.classList.contains('ag-chart-tooltip-hidden')).toBe(true);
        });

        const checkHighlight = async (chart: CartesianChart) => {
            const series = chart.series[0];

            const nodeDataArray: SeriesNodeDataContext<any, any>[] = series!['contextNodeData'];
            const context = nodeDataArray[0];
            expect(context.nodeData.length).toBeGreaterThan(0);

            for (const item of context.nodeData) {
                const { x, y } = series!.group.inverseTransformPoint(item.point.x, item.point.y);
                await hoverAction(x, y)(chart);
                await waitForChartStability(chart);

                // Check the highlighted marker
                expect(series.highlightNode).toBeDefined();
                expect(series.highlightNode.children.length).toEqual(1);
                const marker = series.highlightNode.children[0];
                expect(marker.datum.datum).toBe(item.datum);
                expect(marker['fill']).toEqual('lime');
            }
        };

        const checkNodeClick = async (chart: CartesianChart, onNodeClick: () => void) => {
            const series = chart.series[0];

            const nodeDataArray: SeriesNodeDataContext<any, any>[] = series!['contextNodeData'];
            const context = nodeDataArray[0];
            expect(context.nodeData.length).toBeGreaterThan(0);

            for (const item of context.nodeData) {
                const { x, y } = series!.group.inverseTransformPoint(item.point.x, item.point.y);
                await hoverAction(x, y)(chart);
                await waitForChartStability(chart);

                // Perform click
                await clickAction(x, y)(chart);
                await waitForChartStability(chart);
            }

            // Check click handler
            expect(onNodeClick).toBeCalledTimes(context.nodeData.length);
        };

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
    });
});
