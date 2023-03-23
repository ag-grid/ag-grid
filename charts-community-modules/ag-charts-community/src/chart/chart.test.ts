import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import {
    AgAreaSeriesOptions,
    AgBarSeriesOptions,
    AgCartesianChartOptions,
    AgChartInteractionRange,
    AgLineSeriesOptions,
    AgPieSeriesOptions,
    AgPolarChartOptions,
    AgScatterSeriesOptions,
    AgTreemapSeriesOptions,
} from './agChartOptions';
import { AgChart } from './agChartV2';
import { Chart } from './chart';
import {
    waitForChartStability,
    setupMockCanvas,
    hoverAction,
    clickAction,
    deproxy,
    prepareTestOptions,
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

    const datasets = {
        economy: {
            data: [
                { year: '2018', gdp: 12000 },
                { year: '2019', gdp: 18000 },
                { year: '2020', gdp: 20000 },
            ],
            valueKey: 'gdp',
            categoryKey: 'year',
        },
        food: {
            data: {
                name: 'Food',
                children: [
                    {
                        name: 'Fruits',
                        children: [
                            { name: 'Banana', count: 10 },
                            { name: 'Apple', count: 5 },
                        ],
                    },
                    {
                        name: 'Vegetables',
                        children: [{ name: 'Cucumber', count: 2 }],
                    },
                ],
            },
            valueKey: 'count',
            labelKey: 'name',
        },
    };

    const testPointerEvents = (testParams: {
        seriesOptions: any;
        chartOptions?: any;
        getNodeData: (series: any) => any[];
        getNodePoint: (nodeItem: any) => [number, number];
        getDatumValues: (datum: any, series: any) => any[];
        getTooltipRenderedValues: (tooltipRendererParams: any) => any[];
        getHighlightNode: (series: any) => any;
    }) => {
        const format = (...values: any[]) => values.join(': ');

        const createChart = async (params: {
            hasTooltip: boolean;
            onNodeClick?: () => void;
            nodeClickRange?: AgChartInteractionRange;
        }): Promise<Chart> => {
            const tooltip = params.hasTooltip
                ? {
                      renderer: (params) => {
                          const values = testParams.getTooltipRenderedValues!(params);
                          return format(...values);
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

            const nodeClickRangeParams = params.nodeClickRange ? { nodeClickRange: params.nodeClickRange } : {};

            const options: AgCartesianChartOptions | AgPolarChartOptions = {
                container: document.body,
                autoSize: false,
                series: [
                    {
                        tooltip,
                        highlightStyle: {
                            item: {
                                fill: 'lime',
                            },
                        },
                        listeners,
                        ...nodeClickRangeParams,
                        ...testParams.seriesOptions,
                    },
                ],
                ...(testParams.chartOptions || {}),
            };
            prepareTestOptions(options);
            const chart = deproxy(AgChart.create(options));
            await waitForChartStability(chart);
            return chart;
        };

        const hoverChartNodes = async (
            chart: Chart,
            iterator: (params: { series: any; item: any; x: number; y: number }) => Promise<void>
        ) => {
            for (const series of chart.series) {
                const nodeData = testParams.getNodeData!(series);
                expect(nodeData.length).toBeGreaterThan(0);
                for (const item of nodeData) {
                    const itemPoint = testParams.getNodePoint!(item);
                    const { x, y } = series!.rootGroup.inverseTransformPoint(itemPoint[0], itemPoint[1]);
                    await hoverAction(x, y)(chart);
                    await waitForChartStability(chart);
                    await iterator({ series, item, x, y });
                }
            }
        };

        const checkHighlight = async (chart: Chart) => {
            await hoverChartNodes(chart, async ({ series }) => {
                // Check the highlighted marker
                const highlightNode = testParams.getHighlightNode!(series);
                expect(highlightNode).toBeDefined();
                expect(highlightNode.fill).toEqual('lime');
            });
        };

        const checkNodeClick = async (chart: Chart, onNodeClick: () => void, offset?: { x: number; y: number }) => {
            await hoverChartNodes(chart, async ({ x, y }) => {
                // Perform click
                await clickAction(x + (offset?.x ?? 0), y + (offset?.y ?? 0))(chart);
                await waitForChartStability(chart);
            });

            // Check click handler
            const nodeCount = chart.series.reduce((sum, series) => sum + testParams.getNodeData!(series).length, 0);
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
                const values = testParams.getDatumValues!(item, series);
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

        it(`should handle nodeClick event with offset click when range is 'nearest'`, async () => {
            const onNodeClick = jest.fn();
            chart = await createChart({ hasTooltip: true, onNodeClick, nodeClickRange: 'nearest' });
            await checkNodeClick(chart, onNodeClick, { x: 5, y: 5 });
        });

        it(`should handle nodeClick event with offset click when range is within pixel distance`, async () => {
            const onNodeClick = jest.fn();
            chart = await createChart({ hasTooltip: true, onNodeClick, nodeClickRange: 6 });
            await checkNodeClick(chart, onNodeClick, { x: 0, y: 5 });
        });
    };

    const cartesianTestParams = {
        getNodeData: (series) => series.contextNodeData[0].nodeData,
        getTooltipRenderedValues: (params) => [params.xValue, params.yValue],
        // Returns a highlighted marker
        getHighlightNode: (series) => series.highlightNode.children[0],
    } as Parameters<typeof testPointerEvents>[0];

    describe(`Line Series Pointer Events`, () => {
        testPointerEvents({
            ...cartesianTestParams,
            seriesOptions: <AgLineSeriesOptions>{
                type: 'line',
                data: datasets.economy.data,
                xKey: datasets.economy.categoryKey,
                yKey: datasets.economy.valueKey,
            },
            getNodePoint: (item) => [item.point.x, item.point.y],
            getDatumValues: (item, series) => {
                const xValue = item.datum[series['xKey']];
                const yValue = item.datum[series['yKey']];
                return [xValue, yValue];
            },
        });
    });

    describe(`Area Series Pointer Events`, () => {
        testPointerEvents({
            ...cartesianTestParams,
            seriesOptions: <AgAreaSeriesOptions>{
                type: 'area',
                data: datasets.economy.data,
                xKey: datasets.economy.categoryKey,
                yKey: datasets.economy.valueKey,
                marker: {
                    enabled: true,
                },
            },
            getNodePoint: (item) => [item.point.x, item.point.y],
            getDatumValues: (item, series) => {
                const xValue = item.datum[series['xKey']];
                const yValue = item.datum[series.yKeys[0]];
                return [xValue, yValue];
            },
        });
    });

    describe(`Scatter Series Pointer Events`, () => {
        testPointerEvents({
            ...cartesianTestParams,
            seriesOptions: <AgScatterSeriesOptions>{
                type: 'scatter',
                data: datasets.economy.data,
                xKey: datasets.economy.categoryKey,
                yKey: datasets.economy.valueKey,
            },
            chartOptions: {
                axes: [
                    { type: 'number', position: 'left' },
                    { type: 'category', position: 'bottom' },
                ],
            },
            getNodePoint: (item) => [item.point.x, item.point.y],
            getDatumValues: (item, series) => {
                const xValue = item.datum[series['xKey']];
                const yValue = item.datum[series['yKey']];
                return [xValue, yValue];
            },
        });
    });

    describe(`Column Series Pointer Events`, () => {
        testPointerEvents({
            ...cartesianTestParams,
            seriesOptions: <AgBarSeriesOptions>{
                type: 'column',
                data: datasets.economy.data,
                xKey: datasets.economy.categoryKey,
                yKey: datasets.economy.valueKey,
            },
            getNodePoint: (item) => [item.x + item.width / 2, item.y + item.height / 2],
            getDatumValues: (item, series) => {
                const xValue = item.datum[series.xKey];
                const yValue = item.datum[series.yKeys[0]];
                return [xValue, yValue];
            },
        });
    });

    describe(`Pie Series Pointer Events`, () => {
        testPointerEvents({
            seriesOptions: <AgPieSeriesOptions>{
                type: 'pie',
                data: datasets.economy.data,
                angleKey: datasets.economy.valueKey,
                sectorLabelKey: datasets.economy.categoryKey,
            },
            getNodeData: (series) => series.sectorLabelSelection.nodes(),
            getNodePoint: (item) => [item.x, item.y],
            getDatumValues: (item, series) => {
                const category = item.datum.datum[series.sectorLabelKey];
                const value = item.datum.datum[series.angleKey];
                return [category, value];
            },
            getTooltipRenderedValues: (params) => [params.datum[params.sectorLabelKey], params.angleValue],
            getHighlightNode: (series) => {
                // Returns a highlighted sector
                const highlightedDatum = series.chart.highlightManager.getActiveHighlight();
                return series.highlightGroup.children.find((child: any) => child?.datum === highlightedDatum)
                    .children[0];
            },
        });
    });

    describe(`Treemap Series Pointer Events`, () => {
        testPointerEvents({
            ...cartesianTestParams,
            seriesOptions: <AgTreemapSeriesOptions>{
                type: 'treemap',
                labelKey: datasets.food.labelKey,
                sizeKey: datasets.food.valueKey,
                colorKey: undefined,
            },
            chartOptions: {
                data: datasets.food.data,
            },
            getNodeData: (series) => {
                const nodes = series.contentGroup.children.map((group) => group.children[0]);
                const maxDepth = Math.max(...nodes.map((n) => n.datum.depth));
                return nodes.filter((node) => node.datum.depth === maxDepth);
            },
            getNodePoint: (item) => [item.x + item.width / 2, item.y + item.height / 2],
            getDatumValues: (item, series) => {
                const { datum } = item.datum;
                return [datum[series.labelKey], datum[series.sizeKey]];
            },
            getTooltipRenderedValues: (params) => {
                const { datum } = params;
                return [datum[params.labelKey], datum[params.sizeKey]];
            },
            getHighlightNode: (series) => {
                const highlightedDatum = series.chart.highlightManager.getActiveHighlight();
                return series.highlightGroup.children.find((child: any) => child?.datum === highlightedDatum)
                    .children[0];
            },
        });
    });
});
