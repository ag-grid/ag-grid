import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import {
    AgCartesianAxisPosition,
    AgCartesianChartOptions,
    AgChartOptions,
    AgCartesianAxisOptions,
    AgEnterpriseCharts,
    _ModuleSupport,
} from '../main';
import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    hoverAction,
    prepareTestOptions,
} from 'ag-charts-community/dist/cjs/es5/main-test';

expect.extend({ toMatchImageSnapshot });

function applyAxesFlip<T>(opts: T): T {
    const positionFlip = (position: AgCartesianAxisPosition) => {
        switch (position) {
            case 'top':
                return 'bottom';
            case 'left':
                return 'right';
            case 'bottom':
                return 'top';
            case 'right':
                return 'left';
            default:
                return position;
        }
    };

    return {
        ...opts,
        axes: opts['axes']?.map((axis) => ({ ...axis, position: positionFlip(axis.position) })) || undefined,
    };
}

function applyCrosshairSnap<T>(opts: T, snap: boolean): T {
    return {
        ...opts,
        axes: opts['axes']?.map((axis) => ({
            ...axis,
            crosshair: {
                ...axis.crosshair,
                snap,
            },
        })),
    };
}

const CROSSHAIR_OPTIONS = {
    enabled: true,
    stroke: '#5470C6',
    strokeWidth: 3,
    lineDash: [10, 5],
    snap: false,
};

const BASE_OPTIONS: AgChartOptions = {
    theme: {
        palette: {
            strokes: ['#9A60B4', '#91CC75', '#EE6666'],
            fills: ['#9A60B4', '#91CC75', '#EE6666'],
        },
        overrides: {
            line: {
                series: {
                    marker: {
                        size: 10,
                    },
                },
            },
            area: {
                series: {
                    marker: {
                        enabled: true,
                        size: 10,
                    },
                },
            },
        },
    },
    data: [
        { x: 0, y1: 100, y2: 2, y3: 64 },
        { x: 1, y1: 50, y2: 20, y3: 55 },
        { x: 2, y1: 25, y2: 200, y3: 48 },
        { x: 3, y1: 75, y2: 2000, y3: 72 },
    ],
    series: [
        { type: 'line', xKey: 'x', yKey: 'y1' },
        { type: 'line', xKey: 'x', yKey: 'y2' },
        { type: 'line', xKey: 'x', yKey: 'y3' },
    ],
};

const SIMPLE_AXIS_OPTIONS: AgCartesianAxisOptions[] = [
    {
        position: 'left',
        type: 'number',
        crosshair: CROSSHAIR_OPTIONS,
    },
    {
        position: 'bottom',
        type: 'number',
        crosshair: CROSSHAIR_OPTIONS,
    },
];

const CATEGORY_AXIS_OPTIONS: AgCartesianAxisOptions[] = [
    {
        position: 'left',
        type: 'number',
        crosshair: CROSSHAIR_OPTIONS,
    },
    {
        position: 'bottom',
        type: 'category',
        crosshair: CROSSHAIR_OPTIONS,
    },
];

const SECONDARY_AXIS_OPTIONS: AgCartesianAxisOptions[] = [
    {
        position: 'left',
        type: 'number',
        keys: ['y1', 'y3'],
        crosshair: CROSSHAIR_OPTIONS,
    },
    {
        position: 'left',
        type: 'number',
        keys: ['y2'],
        crosshair: {
            ...CROSSHAIR_OPTIONS,
            stroke: '#73C0DE',
        },
    },
    {
        position: 'bottom',
        type: 'number',
        crosshair: CROSSHAIR_OPTIONS,
    },
];

const SIMPLE_LINE_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: SIMPLE_AXIS_OPTIONS,
};

const SIMPLE_COLUMN_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: CATEGORY_AXIS_OPTIONS,
    series: BASE_OPTIONS.series?.map((s) => ({ ...s, type: 'column' })),
};

const LINE_SECONDARY_AXIS_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: SECONDARY_AXIS_OPTIONS,
};

const STACKED_COLUMN_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: SIMPLE_AXIS_OPTIONS,
    series: BASE_OPTIONS.series?.map((s) => ({ ...s, type: 'column', stacked: true })),
};

const GROUPED_COLUMN_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: CATEGORY_AXIS_OPTIONS,
    series: BASE_OPTIONS.series?.map((s) => ({ ...s, type: 'column', stacked: false })),
};

const STACKED_BAR_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: SIMPLE_AXIS_OPTIONS,
    series: BASE_OPTIONS.series?.map((s) => ({ ...s, type: 'bar', stacked: true })),
};

const GROUPED_BAR_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    data: [
        { x: 0, y1: 100, y2: 2, y3: 1700 },
        { x: 1, y1: 50, y2: 20, y3: 55 },
        { x: 2, y1: 25, y2: 200, y3: 48 },
        { x: 3, y1: 75, y2: 2000, y3: 72 },
    ],
    axes: [
        {
            position: 'bottom',
            type: 'number',
            crosshair: CROSSHAIR_OPTIONS,
        },
        {
            position: 'left',
            type: 'category',
            crosshair: CROSSHAIR_OPTIONS,
        },
    ],
    series: BASE_OPTIONS.series?.map((s) => ({ ...s, type: 'bar', stacked: false })),
};

const STACKED_AREA_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: SIMPLE_AXIS_OPTIONS,
    series: BASE_OPTIONS.series?.map((s) => ({ ...s, type: 'area', stacked: true })),
};

const HISTOGRAM_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: SIMPLE_AXIS_OPTIONS,
    data: [
        { x: 0, y1: 100 },
        { x: 1, y1: 500 },
        { x: 2, y1: 250 },
        { x: 3, y1: 750 },
        { x: 4, y1: 100 },
        { x: 5, y1: 500 },
        { x: 6, y1: 250 },
        { x: 7, y1: 750 },
        { x: 8, y1: 100 },
        { x: 9, y1: 500 },
        { x: 10, y1: 250 },
        { x: 11, y1: 750 },
        { x: 12, y1: 100 },
        { x: 13, y1: 500 },
        { x: 14, y1: 250 },
        { x: 15, y1: 750 },
        { x: 16, y1: 250 },
    ],
    series: [
        {
            type: 'histogram',
            xKey: 'x',
            yKey: 'y1',
        },
    ],
};

describe('Crosshair', () => {
    let chart: any;
    const ctx = setupMockCanvas();

    beforeEach(() => {
        // eslint-disable-next-line no-console
        console.warn = jest.fn();
    });

    afterEach(() => {
        if (chart) {
            chart.destroy();
            (chart as unknown) = undefined;
        }
        // eslint-disable-next-line no-console
        expect(console.warn).not.toBeCalled();
    });

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    const CASES = [
        SIMPLE_LINE_OPTIONS,
        applyAxesFlip(SIMPLE_LINE_OPTIONS),
        SIMPLE_COLUMN_OPTIONS,
        LINE_SECONDARY_AXIS_OPTIONS,
        applyAxesFlip(LINE_SECONDARY_AXIS_OPTIONS),
        STACKED_COLUMN_OPTIONS,
        STACKED_BAR_OPTIONS,
        STACKED_AREA_OPTIONS,
        applyAxesFlip(STACKED_AREA_OPTIONS),
        HISTOGRAM_OPTIONS,
        GROUPED_COLUMN_OPTIONS,
        GROUPED_BAR_OPTIONS,
    ];

    for (const TEST_CASE of CASES) {
        it(`should follow mouse pointer on series hover`, async () => {
            const options: AgChartOptions = TEST_CASE;
            prepareTestOptions(options);

            chart = AgEnterpriseCharts.create(options);
            await waitForChartStability(chart);
            await hoverAction(605, 300)(chart);
            await compare();
        });

        it(`should snap to the closest highlighted node datum`, async () => {
            const options: AgChartOptions = applyCrosshairSnap(TEST_CASE, true);
            prepareTestOptions(options);

            chart = AgEnterpriseCharts.create(options);
            await waitForChartStability(chart);
            await hoverAction(605, 125)(chart);
            await compare();
        });

        it(`should layout correctly with series area padding`, async () => {
            const options: AgChartOptions = TEST_CASE;
            prepareTestOptions(options);
            options.seriesAreaPadding = {
                left: 100,
                right: 100,
                bottom: 100,
                top: 100,
            };

            chart = AgEnterpriseCharts.create(options);
            await waitForChartStability(chart);
            await hoverAction(300, 300)(chart);
            await compare();
        });
    }
});
