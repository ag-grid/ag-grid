import { describe, beforeAll, afterAll, test, expect } from '@jest/globals'
import { AgSparkline } from './agSparkline';
import { LineSparkline } from './lineSparkline';
import "jest-canvas-mock";
import { AreaSparkline } from './areaSparkline';
import { ColumnSparkline } from './columnSparkline';
import { ColumnFormat, ColumnFormatterParams, MarkerFormat, MarkerFormatterParams, SparklineOptions, TooltipRendererResult, TooltipRendererParams } from '@ag-grid-community/core';
import { Sparkline } from './sparkline';

const data = [7, 8.3, undefined, -9, '9.2', null, 5.5, Infinity, 6.75, -11.9, NaN, -Infinity, 5, 4, null, {}, 6, []] as any;

describe('line sparkline', () => {
    let sparkline: LineSparkline;
    let containerDiv: HTMLElement = document.createElement('div');
    let tooltipContainer: HTMLElement = document.createElement('div');
    let markerFormatter = (params: MarkerFormatterParams): MarkerFormat => { return {} }
    let tooltipRenderer = (params: TooltipRendererParams): TooltipRendererResult => { return {} }

    const options: SparklineOptions = {
        type: 'line',
        container: containerDiv,
        data,
        width: 100,
        height: 200,
        title: 'line test',
        padding: {
            top: 2,
            right: 5,
            bottom: 6,
            left: 9
        },
        line: {
            stroke: 'red',
            strokeWidth: 3
        },
        marker: {
            enabled: false,
            shape: 'diamond',
            size: 5,
            fill: 'blue',
            stroke: 'blue',
            strokeWidth: 2,
            formatter: markerFormatter
        },
        axis: {
            stroke: 'green',
            strokeWidth: 2
        },
        highlightStyle: {
            size: 7,
            fill: 'orange',
            stroke: 'orange',
            strokeWidth: 4
        },
        tooltip: {
            enabled: false,
            container: tooltipContainer,
            renderer: tooltipRenderer
        }
    }

    beforeAll(() => {
        sparkline = AgSparkline.create(options);

        options.height = 135;
        options.width = 265;
        options.title = 'updated line test'

        options.padding!.left = 11;
        options.marker!.fill = 'beige';
        options.axis!.stroke = 'chocolate';
        options.highlightStyle!.fill = 'aliceblue';

        AgSparkline.update(sparkline, options);
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.container).toBe(containerDiv);
        expect(sparkline.width).toBe(265);
        expect(sparkline.height).toBe(135);
        expect(sparkline.title).toBe('updated line test');
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(2);
        expect(padding.right).toBe(5);
        expect(padding.bottom).toBe(6);
        expect(padding.left).toBe(11);
    });
    test('line properties', () => {
        const { line } = sparkline;
        expect(line.stroke).toBe("red");
        expect(line.strokeWidth).toBe(3);
    });
    test('marker properties', () => {
        const { marker } = sparkline;
        expect(marker.enabled).toBe(false);
        expect(marker.shape).toBe("diamond");
        expect(marker.size).toBe(5);
        expect(marker.fill).toBe("beige");
        expect(marker.stroke).toBe("blue");
        expect(marker.strokeWidth).toBe(2);
        expect(marker.formatter).toBe(markerFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe("chocolate");
        expect(axis.strokeWidth).toBe(2);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(7);
        expect(highlightStyle.fill).toBe("aliceblue");
        expect(highlightStyle.stroke).toBe("orange");
        expect(highlightStyle.strokeWidth).toBe(4);
    });
    test('tooltip properties', () => {
        const { tooltip } = Sparkline;
        expect(tooltip.enabled).toBe(false);
        expect(tooltip.container).toBe(tooltipContainer);
        expect(tooltip.renderer).toBe(tooltipRenderer);
    });
})

describe('area sparkline', () => {
    let sparkline: AreaSparkline;
    let containerDiv: HTMLElement = document.createElement('div');
    let tooltipContainer: HTMLElement = document.createElement('div');
    let markerFormatter = (params: MarkerFormatterParams): MarkerFormat => { return {} }
    let tooltipRenderer = (params: TooltipRendererParams): TooltipRendererResult => { return {} }

    const options: SparklineOptions = {
        type: 'area',
        container: containerDiv,
        data,
        width: 200,
        height: 100,
        padding: {
            top: 1,
            right: 7,
        },
        title: 'area test',
        fill: 'lavender',
        line: {
            stroke: 'purple',
            strokeWidth: 3
        },
        marker: {
            enabled: true,
            shape: 'circle',
            size: 9,
            fill: 'yellow',
            stroke: 'yellow',
            strokeWidth: 4,
            formatter: markerFormatter
        },
        axis: {
            stroke: 'pink',
            strokeWidth: 6
        },
        highlightStyle: {
            size: 8,
            fill: 'brown',
            stroke: 'brown',
            strokeWidth: 1
        },
        tooltip: {
            enabled: true,
            container: tooltipContainer,
            renderer: tooltipRenderer
        }
    }

    beforeAll(() => {
        sparkline = AgSparkline.create(options);

        options.height = 67;
        options.width = 109;
        options.title = 'updated area test'

        options.padding!.right = 5;
        options.marker!.fill = 'salmon';
        options.axis!.stroke = 'khaki';
        options.highlightStyle!.fill = 'cornsilk';

        AgSparkline.update(sparkline, options);
    })

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.container).toBe(containerDiv);
        expect(sparkline.width).toBe(109);
        expect(sparkline.height).toBe(67);
        expect(sparkline.title).toBe('updated area test');
        expect(sparkline.fill).toBe('lavender');
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(1);
        expect(padding.right).toBe(5);
        expect(padding.bottom).toBe(3);
        expect(padding.left).toBe(3);
    });
    test('line properties', () => {
        const { line } = sparkline;
        expect(line.stroke).toBe("purple");
        expect(line.strokeWidth).toBe(3);
    });
    test('marker properties', () => {
        const { marker } = sparkline;
        expect(marker.enabled).toBe(true);
        expect(marker.shape).toBe("circle");
        expect(marker.size).toBe(9);
        expect(marker.fill).toBe("salmon");
        expect(marker.stroke).toBe("yellow");
        expect(marker.strokeWidth).toBe(4);
        expect(marker.formatter).toBe(markerFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe("khaki");
        expect(axis.strokeWidth).toBe(6);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(8);
        expect(highlightStyle.fill).toBe("cornsilk");
        expect(highlightStyle.stroke).toBe("brown");
        expect(highlightStyle.strokeWidth).toBe(1);
    });
    test('tooltip properties', () => {
        const { tooltip } = Sparkline;
        expect(tooltip.enabled).toBe(true);
        expect(tooltip.container).toBe(tooltipContainer);
        expect(tooltip.renderer).toBe(tooltipRenderer);
    });
})

describe('column sparkline', () => {
    let sparkline: ColumnSparkline;
    let containerDiv: HTMLElement = document.createElement('div');
    let tooltipContainer: HTMLElement = document.createElement('div');
    let columnFormatter = (params: ColumnFormatterParams): ColumnFormat => { return {} }
    let tooltipRenderer = (params: TooltipRendererParams): TooltipRendererResult => { return {} }

    const options: SparklineOptions = {
        type: 'column',
        container: containerDiv,
        data,
        width: 150,
        height: 50,
        padding: {
            top: 4,
            bottom: 9,
            left: 15,
        },
        title: 'column test',
        fill: 'silver',
        stroke: 'blue',
        strokeWidth: 2,
        paddingInner: 0.6,
        paddingOuter: 0.8,
        formatter: columnFormatter,
        axis: {
            stroke: 'aqua',
            strokeWidth: 2
        },
        highlightStyle: {
            size: 2,
            fill: 'coral',
            stroke: 'coral',
            strokeWidth: 3
        },
        tooltip: {
            enabled: false,
            container: tooltipContainer,
            renderer: tooltipRenderer
        }
    }

    beforeAll(() => {
        sparkline = AgSparkline.create(options);

        options.height = 84;
        options.width = 203;
        options.title = 'updated column test'

        options.padding!.bottom = 13;
        options.fill = 'firebrick';
        options.axis!.stroke = 'fuchsia';
        options.highlightStyle!.fill = 'gold';

        AgSparkline.update(sparkline, options);
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.container).toBe(containerDiv);
        expect(sparkline.width).toBe(203);
        expect(sparkline.height).toBe(84);
        expect(sparkline.title).toBe('updated column test');
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(4);
        expect(padding.right).toBe(3);
        expect(padding.bottom).toBe(13);
        expect(padding.left).toBe(15);
    });
    test('column properties', () => {
        expect(sparkline.fill).toBe("firebrick");
        expect(sparkline.stroke).toBe("blue");
        expect(sparkline.strokeWidth).toBe(2);
        expect(sparkline.paddingInner).toBe(0.6);
        expect(sparkline.paddingOuter).toBe(0.8);
        expect(sparkline.formatter).toBe(columnFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe("fuchsia");
        expect(axis.strokeWidth).toBe(2);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(2);
        expect(highlightStyle.fill).toBe("gold");
        expect(highlightStyle.stroke).toBe("coral");
        expect(highlightStyle.strokeWidth).toBe(3);
    });
    test('tooltip properties', () => {
        const { tooltip } = Sparkline;
        expect(tooltip.enabled).toBe(false);
        expect(tooltip.container).toBe(tooltipContainer);
        expect(tooltip.renderer).toBe(tooltipRenderer);
    });
})