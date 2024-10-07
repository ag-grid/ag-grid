import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import 'jest-canvas-mock';

import type { ColumnFormat, ColumnFormatterParams, MarkerFormat, MarkerFormatterParams } from 'ag-grid-community';

import type { SparklineFactoryOptions } from './agSparkline';
import { createAgSparkline } from './agSparkline';
import { SparklineTooltip } from './tooltip/sparklineTooltip';

// mock the DOMMatrix
const matrixMock = jest.fn(() => ({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    multiplySelf: () => matrixMock,
    preMultiplySelf: () => matrixMock,
    inverse: () => matrixMock,
    invertSelf: () => matrixMock,
}));

global.DOMMatrix = matrixMock as any;

const data = [
    7,
    8.3,
    undefined,
    -9,
    '9.2',
    null,
    5.5,
    Infinity,
    6.75,
    -11.9,
    NaN,
    -Infinity,
    5,
    4,
    null,
    {},
    6,
    [],
] as any;

describe('line sparkline', () => {
    let sparkline: any;
    const containerDiv: HTMLElement = document.createElement('div');
    const markerFormatter = (params: MarkerFormatterParams): MarkerFormat => {
        return {};
    };

    const options: SparklineFactoryOptions = {
        data,
        width: 135,
        height: 265,
        type: 'line',
        container: containerDiv,
        padding: {
            top: 2,
            right: 5,
            bottom: 6,
            left: 9,
        },
        line: {
            stroke: 'red',
            strokeWidth: 3,
        },
        marker: {
            enabled: false,
            shape: 'diamond',
            size: 5,
            fill: 'blue',
            stroke: 'blue',
            strokeWidth: 2,
            formatter: markerFormatter,
        },
        axis: {
            stroke: 'green',
            strokeWidth: 2,
        },
        highlightStyle: {
            size: 7,
            fill: 'orange',
            stroke: 'orange',
            strokeWidth: 4,
        },
    };

    beforeAll(() => {
        sparkline = createAgSparkline(options, new SparklineTooltip());
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.width).toBe(135);
        expect(sparkline.height).toBe(265);
        expect(sparkline.container).toBe(containerDiv);
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
        expect(line.stroke).toBe('red');
        expect(line.strokeWidth).toBe(3);
    });
    test('marker properties', () => {
        const { marker } = sparkline;
        expect(marker.enabled).toBe(false);
        expect(marker.shape).toBe('diamond');
        expect(marker.size).toBe(5);
        expect(marker.fill).toBe('blue');
        expect(marker.stroke).toBe('blue');
        expect(marker.strokeWidth).toBe(2);
        expect(marker.formatter).toBe(markerFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe('green');
        expect(axis.strokeWidth).toBe(2);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(7);
        expect(highlightStyle.fill).toBe('orange');
        expect(highlightStyle.stroke).toBe('orange');
        expect(highlightStyle.strokeWidth).toBe(4);
    });
});

describe('area sparkline', () => {
    let sparkline: any;
    const containerDiv: HTMLElement = document.createElement('div');
    const markerFormatter = (params: MarkerFormatterParams): MarkerFormat => {
        return {};
    };

    const options: SparklineFactoryOptions = {
        data,
        width: 67,
        height: 109,
        container: containerDiv,
        type: 'area',
        padding: {
            top: 1,
            right: 7,
        },
        fill: 'lavender',
        line: {
            stroke: 'purple',
            strokeWidth: 3,
        },
        marker: {
            enabled: true,
            shape: 'circle',
            size: 9,
            fill: 'yellow',
            stroke: 'yellow',
            strokeWidth: 4,
            formatter: markerFormatter,
        },
        axis: {
            stroke: 'pink',
            strokeWidth: 6,
        },
        highlightStyle: {
            size: 8,
            fill: 'brown',
            stroke: 'brown',
            strokeWidth: 1,
        },
    };

    beforeAll(() => {
        sparkline = createAgSparkline(options, new SparklineTooltip());
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.width).toBe(67);
        expect(sparkline.height).toBe(109);
        expect(sparkline.container).toBe(containerDiv);
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
        expect(line.stroke).toBe('purple');
        expect(line.strokeWidth).toBe(3);
    });
    test('marker properties', () => {
        const { marker } = sparkline;
        expect(marker.enabled).toBe(true);
        expect(marker.shape).toBe('circle');
        expect(marker.size).toBe(9);
        expect(marker.fill).toBe('yellow');
        expect(marker.stroke).toBe('yellow');
        expect(marker.strokeWidth).toBe(4);
        expect(marker.formatter).toBe(markerFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe('pink');
        expect(axis.strokeWidth).toBe(6);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(8);
        expect(highlightStyle.fill).toBe('brown');
        expect(highlightStyle.stroke).toBe('brown');
        expect(highlightStyle.strokeWidth).toBe(1);
    });
});

describe('column sparkline', () => {
    let sparkline: any;
    const containerDiv: HTMLElement = document.createElement('div');
    const columnFormatter = (params: ColumnFormatterParams): ColumnFormat => {
        return {};
    };

    const options: SparklineFactoryOptions = {
        data,
        width: 150,
        height: 50,
        container: containerDiv,
        type: 'column',
        padding: {
            top: 4,
            bottom: 9,
            left: 15,
        },
        fill: 'silver',
        stroke: 'blue',
        strokeWidth: 2,
        paddingInner: 0.6,
        paddingOuter: 0.8,
        formatter: columnFormatter,
        axis: {
            stroke: 'aqua',
            strokeWidth: 2,
        },
        highlightStyle: {
            size: 2,
            fill: 'coral',
            stroke: 'coral',
            strokeWidth: 3,
        },
    };

    beforeAll(() => {
        sparkline = createAgSparkline(options, new SparklineTooltip());
    });

    afterAll(() => {
        sparkline.destroy();
    });

    test('base properties', () => {
        expect(sparkline.width).toBe(150);
        expect(sparkline.height).toBe(50);
        expect(sparkline.container).toBe(containerDiv);
    });
    test('padding', () => {
        const { padding } = sparkline;
        expect(padding.top).toBe(4);
        expect(padding.right).toBe(3);
        expect(padding.bottom).toBe(9);
        expect(padding.left).toBe(15);
    });
    test('column properties', () => {
        expect(sparkline.fill).toBe('silver');
        expect(sparkline.stroke).toBe('blue');
        expect(sparkline.strokeWidth).toBe(2);
        expect(sparkline.paddingInner).toBe(0.6);
        expect(sparkline.paddingOuter).toBe(0.8);
        expect(sparkline.formatter).toBe(columnFormatter);
    });
    test('axis properties', () => {
        const { axis } = sparkline;
        expect(axis.stroke).toBe('aqua');
        expect(axis.strokeWidth).toBe(2);
    });
    test('highlightStyle properties', () => {
        const { highlightStyle } = sparkline;
        expect(highlightStyle.size).toBe(2);
        expect(highlightStyle.fill).toBe('coral');
        expect(highlightStyle.stroke).toBe('coral');
        expect(highlightStyle.strokeWidth).toBe(3);
    });
});
