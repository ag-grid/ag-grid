import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import {
    AgCartesianAxisOptions,
    AgCartesianAxisPosition,
    AgCartesianChartOptions,
    AgChartOptions,
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
    const getAxisOpts = (axisOpts: AgCartesianAxisOptions) => {
        if (axisOpts.type !== 'category') {
            return {
                ...axisOpts,
                crosshair: {
                    ...axisOpts.crosshair,
                    snap,
                },
            };
        }

        return axisOpts;
    };

    return {
        ...opts,
        axes: opts['axes']?.map((axis) => getAxisOpts(axis)) || undefined,
    };
}

const CROSSHAIR_OPTIONS = {
    stroke: '#5470C6',
    strokeWidth: 3,
    lineDash: [10, 5],
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

const SIMPLE_AXIS_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: [
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
    ],
};

const CATEGORY_AXIS_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    series: SIMPLE_AXIS_OPTIONS.series?.map((s) => ({ ...s, type: 'column' })),
    axes: [
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
    ],
};

const SECONDARY_AXIS_OPTIONS: AgCartesianChartOptions = {
    ...BASE_OPTIONS,
    axes: [
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
    ],
};

const STACKED_COLUMN_OPTIONS: AgCartesianChartOptions = {
    ...SIMPLE_AXIS_OPTIONS,
    series: SIMPLE_AXIS_OPTIONS.series?.map((s) => ({ ...s, type: 'column', stacked: true })),
};

const STACKED_BAR_OPTIONS: AgCartesianChartOptions = {
    ...SIMPLE_AXIS_OPTIONS,
    series: SIMPLE_AXIS_OPTIONS.series?.map((s) => ({ ...s, type: 'bar', stacked: true })),
};

const STACKED_AREA_OPTIONS: AgCartesianChartOptions = {
    ...SIMPLE_AXIS_OPTIONS,
    series: SIMPLE_AXIS_OPTIONS.series?.map((s) => ({ ...s, type: 'area', stacked: true })),
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
        SIMPLE_AXIS_OPTIONS,
        applyAxesFlip(SIMPLE_AXIS_OPTIONS),
        CATEGORY_AXIS_OPTIONS,
        SECONDARY_AXIS_OPTIONS,
        applyAxesFlip(SECONDARY_AXIS_OPTIONS),
        STACKED_COLUMN_OPTIONS,
        STACKED_BAR_OPTIONS,
        STACKED_AREA_OPTIONS,
        applyAxesFlip(STACKED_AREA_OPTIONS),
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
            await hoverAction(605, 120)(chart);
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
