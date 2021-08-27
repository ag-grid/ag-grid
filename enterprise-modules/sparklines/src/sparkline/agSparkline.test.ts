import { describe, beforeAll, afterAll, test, expect } from '@jest/globals'
import { AgSparkline } from './agSparkline';
import { LineSparkline } from './lineSparkline';
import "jest-canvas-mock";
import { AreaSparkline } from './areaSparkline';
import { ColumnSparkline } from './columnSparkline';
import { ColumnFormat, ColumnFormatterParams, MarkerFormat, MarkerFormatterParams } from '@ag-grid-community/core';

const data = [7, 8.3, undefined, -9, '9.2', null, 5.5, Infinity, 6.75, -11.9, NaN, -Infinity, 5, 4, null, {}, 6, []] as any;

describe('line sparkline', () => {
    let sparkline: LineSparkline;
    let containerDiv: HTMLElement = document.createElement('div');
    let markerFormatter = (params: MarkerFormatterParams): MarkerFormat => { return {} }

    beforeAll(() => {
        sparkline = AgSparkline.create({
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
            }
        });
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.container).toBe(containerDiv);
        expect(sparkline.width).toBe(100);
        expect(sparkline.height).toBe(200);
        expect(sparkline.title).toBe('line test');
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(2);
        expect(padding.right).toBe(5);
        expect(padding.bottom).toBe(6);
        expect(padding.left).toBe(9);
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
        expect(marker.fill).toBe("blue");
        expect(marker.stroke).toBe("blue");
        expect(marker.strokeWidth).toBe(2);
        expect(marker.formatter).toBe(markerFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe("green");
        expect(axis.strokeWidth).toBe(2);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(7);
        expect(highlightStyle.fill).toBe("orange");
        expect(highlightStyle.stroke).toBe("orange");
        expect(highlightStyle.strokeWidth).toBe(4);
    });
})

describe('area sparkline', () => {
    let sparkline: AreaSparkline;
    let containerDiv: HTMLElement = document.createElement('div');
    let markerFormatter = (params: MarkerFormatterParams): MarkerFormat => { return {} }

    beforeAll(() => {
        sparkline = AgSparkline.create({
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
            }
        });
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.container).toBe(containerDiv);
        expect(sparkline.width).toBe(200);
        expect(sparkline.height).toBe(100);
        expect(sparkline.title).toBe('area test');
        expect(sparkline.fill).toBe('lavender');
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(1);
        expect(padding.right).toBe(7);
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
        expect(marker.fill).toBe("yellow");
        expect(marker.stroke).toBe("yellow");
        expect(marker.strokeWidth).toBe(4);
        expect(marker.formatter).toBe(markerFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe("pink");
        expect(axis.strokeWidth).toBe(6);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(8);
        expect(highlightStyle.fill).toBe("brown");
        expect(highlightStyle.stroke).toBe("brown");
        expect(highlightStyle.strokeWidth).toBe(1);
    });
})

describe('column sparkline', () => {
    let sparkline: ColumnSparkline;
    let containerDiv: HTMLElement = document.createElement('div');
    let columnFormatter = (params: ColumnFormatterParams): ColumnFormat => { return {} }

    beforeAll(() => {
        sparkline = AgSparkline.create({
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
            }
        });
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.container).toBe(containerDiv);
        expect(sparkline.width).toBe(150);
        expect(sparkline.height).toBe(50);
        expect(sparkline.title).toBe('column test');
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(4);
        expect(padding.right).toBe(3);
        expect(padding.bottom).toBe(9);
        expect(padding.left).toBe(15);
    });
    test('column properties', () => {
        expect(sparkline.fill).toBe("silver");
        expect(sparkline.stroke).toBe("blue");
        expect(sparkline.strokeWidth).toBe(2);
        expect(sparkline.paddingInner).toBe(0.6);
        expect(sparkline.paddingOuter).toBe(0.8);
        expect(sparkline.formatter).toBe(columnFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe("aqua");
        expect(axis.strokeWidth).toBe(2);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(2);
        expect(highlightStyle.fill).toBe("coral");
        expect(highlightStyle.stroke).toBe("coral");
        expect(highlightStyle.strokeWidth).toBe(3);
    });
})