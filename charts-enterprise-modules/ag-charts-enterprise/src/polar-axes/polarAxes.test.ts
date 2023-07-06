import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import type { AgChartOptions } from '../main';
import { AgEnterpriseCharts, _ModuleSupport } from '../main';

import {
    waitForChartStability,
    setupMockCanvas,
    extractImageData,
    IMAGE_SNAPSHOT_DEFAULTS,
    prepareTestOptions,
} from 'ag-charts-community-test';

expect.extend({ toMatchImageSnapshot });

describe('Polar Axes', () => {
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

    const EXAMPLE_OPTIONS: AgChartOptions = {
        data: [
            { skill: 'Communication', Bob: 7, Collin: 4, Giovanni: 10 },
            { skill: 'Technical Skills', Bob: 8, Collin: 10, Giovanni: 3 },
            { skill: 'Team Player', Bob: 6, Collin: 3, Giovanni: 8 },
            { skill: 'Punctuality', Bob: 5, Collin: 10, Giovanni: 3 },
            { skill: 'Meeting Deadlines', Bob: 9, Collin: 10, Giovanni: 2 },
            { skill: 'Problem Solving', Bob: 8, Collin: 5, Giovanni: 10 },
        ],
        title: {
            text: 'Skill Analysis',
        },
        series: [
            {
                type: 'radar-area',
                angleKey: 'skill',
                radiusKey: 'Bob',
                fillOpacity: 0.25,
            },
            {
                type: 'radar-area',
                angleKey: 'skill',
                radiusKey: 'Collin',
                fillOpacity: 0.25,
            },
            {
                type: 'radar-area',
                angleKey: 'skill',
                radiusKey: 'Giovanni',
                fillOpacity: 0.25,
            },
        ],
        legend: {
            enabled: true,
        },
    };

    const compare = async () => {
        await waitForChartStability(chart);

        const imageData = extractImageData(ctx);
        (expect(imageData) as any).toMatchImageSnapshot(IMAGE_SNAPSHOT_DEFAULTS);
    };

    it(`should render polar axes as expected`, async () => {
        const options: AgChartOptions = { ...EXAMPLE_OPTIONS };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render polar axes with angle offset as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [{ type: 'angle-category', startAngle: -30 }, { type: 'radius-number' }],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render polar axes with circle shape as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                { type: 'angle-category', shape: 'circle' },
                { type: 'radius-number', shape: 'circle' },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render angle cross line as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                {
                    type: 'angle-category',
                    crossLines: [
                        {
                            type: 'line',
                            value: 'Meeting Deadlines',
                            strokeWidth: 2,
                            label: {
                                text: 'Useless Skill',
                                color: 'rgb(30, 122, 152)',
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
                { type: 'radius-number' },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render angle cross line range as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                {
                    type: 'angle-category',
                    crossLines: [
                        {
                            type: 'range',
                            range: ['Communication', 'Team Player'],
                            label: {
                                text: 'Valuable Skills',
                                color: 'rgb(30, 122, 152)',
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
                { type: 'radius-number' },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render angle cross line range with circle shape as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                {
                    type: 'angle-category',
                    shape: 'circle',
                    crossLines: [
                        {
                            type: 'range',
                            range: ['Communication', 'Team Player'],
                            label: {
                                text: 'Valuable Skills',
                                color: 'rgb(30, 122, 152)',
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
                { type: 'radius-number', shape: 'circle' },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render radius cross line as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                { type: 'angle-category' },
                {
                    type: 'radius-number',
                    crossLines: [
                        {
                            type: 'line',
                            value: 5,
                            strokeWidth: 2,
                            label: {
                                text: 'Minimal\nRequirement',
                                color: 'rgb(0, 64, 144)',
                                rotation: 180,
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render radius cross line with circle shape as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                { type: 'angle-category', shape: 'circle', startAngle: -30 },
                {
                    type: 'radius-number',
                    shape: 'circle',
                    crossLines: [
                        {
                            type: 'line',
                            value: 5,
                            strokeWidth: 2,
                            label: {
                                text: 'Minimal\nRequirement',
                                color: 'rgb(0, 64, 144)',
                                rotation: 180,
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render radius cross line range as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                { type: 'angle-category' },
                {
                    type: 'radius-number',
                    crossLines: [
                        {
                            type: 'range',
                            fill: 'rgb(224, 64, 112)',
                            fillOpacity: 0.2,
                            stroke: undefined,
                            range: [0, 5],
                            label: {
                                text: 'Needs\nImprovement',
                                color: 'rgb(144, 0, 64)',
                                rotation: 210,
                                fontWeight: 'bold',
                            },
                        },
                        {
                            type: 'range',
                            fill: 'rgb(32, 128, 192)',
                            fillOpacity: 0.2,
                            stroke: undefined,
                            range: [7, 10],
                            label: {
                                text: 'Excellent',
                                color: 'rgb(32, 128, 192)',
                                rotation: 150,
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });

    it(`should render radius cross line range with circle shape as expected`, async () => {
        const options: AgChartOptions = {
            ...EXAMPLE_OPTIONS,
            axes: [
                { type: 'angle-category', shape: 'circle' },
                {
                    type: 'radius-number',
                    shape: 'circle',
                    crossLines: [
                        {
                            type: 'range',
                            fill: 'rgb(224, 64, 112)',
                            fillOpacity: 0.2,
                            stroke: undefined,
                            range: [0, 5],
                            label: {
                                text: 'Needs\nImprovement',
                                color: 'rgb(144, 0, 64)',
                                rotation: 210,
                                fontWeight: 'bold',
                            },
                        },
                        {
                            type: 'range',
                            fill: 'rgb(32, 128, 192)',
                            fillOpacity: 0.2,
                            stroke: undefined,
                            range: [7, 10],
                            label: {
                                text: 'Excellent',
                                color: 'rgb(32, 128, 192)',
                                rotation: 150,
                                fontWeight: 'bold',
                            },
                        },
                    ],
                },
            ],
        };
        prepareTestOptions(options as any);

        chart = AgEnterpriseCharts.create(options);
        await compare();
    });
});
