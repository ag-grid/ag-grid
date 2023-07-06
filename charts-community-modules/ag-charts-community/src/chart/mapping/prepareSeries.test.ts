import { describe, expect, test } from '@jest/globals';
import 'jest-canvas-mock';
import { groupSeriesByType, processSeriesOptions } from './prepareSeries';
import type { AgColumnSeriesOptions, AgLineSeriesOptions } from '../agChartOptions';

const colSeriesIPhone: AgColumnSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'iphone',
    yName: 'Iphone',
};
const lineSeriesMac: AgLineSeriesOptions = {
    type: 'line',
    xKey: 'quarter',
    yKey: 'mac',
    yName: 'Mac',
};
const colSeriesMac: AgColumnSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'mac',
    yName: 'Mac',
};
const lineSeriesIPhone: AgLineSeriesOptions = {
    type: 'line',
    xKey: 'quarter',
    yKey: 'iphone',
    yName: 'iPhone',
};
const colSeriesWearables: AgColumnSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'wearables',
    yName: 'Wearables',
};
const colSeriesServices: AgColumnSeriesOptions = {
    type: 'column',
    xKey: 'quarter',
    yKey: 'services',
    yName: 'Services',
};

const seriesOptions: Array<AgColumnSeriesOptions | AgLineSeriesOptions> = [
    {
        ...colSeriesIPhone,
        fill: 'pink',
        showInLegend: true,
    },
    lineSeriesMac,
    {
        ...colSeriesMac,
        fill: 'red',
        showInLegend: false,
    },
    lineSeriesIPhone,
    {
        ...colSeriesWearables,
        showInLegend: true,
        grouped: true,
    },
    {
        ...colSeriesServices,
        showInLegend: false,
        grouped: true,
    },
];

describe('transform series options', () => {
    test('groupSeriesByType', () => {
        const result = groupSeriesByType(seriesOptions);

        expect(result).toMatchInlineSnapshot(`
            [
              {
                "opts": [
                  {
                    "fill": "pink",
                    "showInLegend": true,
                    "type": "column",
                    "xKey": "quarter",
                    "yKey": "iphone",
                    "yName": "Iphone",
                  },
                ],
                "type": "ungrouped",
              },
              {
                "opts": [
                  {
                    "type": "line",
                    "xKey": "quarter",
                    "yKey": "mac",
                    "yName": "Mac",
                  },
                ],
                "type": "ungrouped",
              },
              {
                "opts": [
                  {
                    "fill": "red",
                    "showInLegend": false,
                    "type": "column",
                    "xKey": "quarter",
                    "yKey": "mac",
                    "yName": "Mac",
                  },
                ],
                "type": "ungrouped",
              },
              {
                "opts": [
                  {
                    "type": "line",
                    "xKey": "quarter",
                    "yKey": "iphone",
                    "yName": "iPhone",
                  },
                ],
                "type": "ungrouped",
              },
              {
                "opts": [
                  {
                    "grouped": true,
                    "showInLegend": true,
                    "type": "column",
                    "xKey": "quarter",
                    "yKey": "wearables",
                    "yName": "Wearables",
                  },
                  {
                    "grouped": true,
                    "showInLegend": false,
                    "type": "column",
                    "xKey": "quarter",
                    "yKey": "services",
                    "yName": "Services",
                  },
                ],
                "type": "group",
              },
            ]
        `);
    });

    test('processSeriesOptions', () => {
        const result = processSeriesOptions({}, seriesOptions);

        expect(result).toMatchInlineSnapshot(`
            [
              {
                "fill": "pink",
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 0,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "iphone",
                "yName": "Iphone",
              },
              {
                "fill": "red",
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 1,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": false,
                "type": "column",
                "xKey": "quarter",
                "yKey": "mac",
                "yName": "Mac",
              },
              {
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 2,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "wearables",
                "yName": "Wearables",
              },
              {
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 3,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": false,
                "type": "column",
                "xKey": "quarter",
                "yKey": "services",
                "yName": "Services",
              },
              {
                "type": "line",
                "xKey": "quarter",
                "yKey": "mac",
                "yName": "Mac",
              },
              {
                "type": "line",
                "xKey": "quarter",
                "yKey": "iphone",
                "yName": "iPhone",
              },
            ]
        `);
    });

    test('processSeriesOptions with grouped columns', () => {
        const result = processSeriesOptions(
            {},
            seriesOptions.map((s) => (s.type === 'column' ? { ...s, grouped: true } : s))
        );

        expect(result).toMatchInlineSnapshot(`
            [
              {
                "fill": "pink",
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 0,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "iphone",
                "yName": "Iphone",
              },
              {
                "fill": "red",
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 1,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": false,
                "type": "column",
                "xKey": "quarter",
                "yKey": "mac",
                "yName": "Mac",
              },
              {
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 2,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "wearables",
                "yName": "Wearables",
              },
              {
                "grouped": true,
                "seriesGrouping": {
                  "groupCount": 4,
                  "groupIndex": 3,
                  "stackCount": 0,
                  "stackIndex": 0,
                },
                "showInLegend": false,
                "type": "column",
                "xKey": "quarter",
                "yKey": "services",
                "yName": "Services",
              },
              {
                "type": "line",
                "xKey": "quarter",
                "yKey": "mac",
                "yName": "Mac",
              },
              {
                "type": "line",
                "xKey": "quarter",
                "yKey": "iphone",
                "yName": "iPhone",
              },
            ]
        `);
    });

    test('processSeriesOptions with stacked columns', () => {
        const result = processSeriesOptions(
            {},
            seriesOptions.map((s) => (s.type === 'column' ? { ...s, stacked: true, grouped: undefined } : s))
        );

        expect(result).toMatchInlineSnapshot(`
            [
              {
                "fill": "pink",
                "grouped": undefined,
                "seriesGrouping": {
                  "groupCount": 1,
                  "groupIndex": 0,
                  "stackCount": 4,
                  "stackIndex": 0,
                },
                "showInLegend": true,
                "stacked": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "iphone",
                "yName": "Iphone",
              },
              {
                "fill": "red",
                "grouped": undefined,
                "seriesGrouping": {
                  "groupCount": 1,
                  "groupIndex": 0,
                  "stackCount": 4,
                  "stackIndex": 1,
                },
                "showInLegend": false,
                "stacked": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "mac",
                "yName": "Mac",
              },
              {
                "grouped": undefined,
                "seriesGrouping": {
                  "groupCount": 1,
                  "groupIndex": 0,
                  "stackCount": 4,
                  "stackIndex": 2,
                },
                "showInLegend": true,
                "stacked": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "wearables",
                "yName": "Wearables",
              },
              {
                "grouped": undefined,
                "seriesGrouping": {
                  "groupCount": 1,
                  "groupIndex": 0,
                  "stackCount": 4,
                  "stackIndex": 3,
                },
                "showInLegend": false,
                "stacked": true,
                "type": "column",
                "xKey": "quarter",
                "yKey": "services",
                "yName": "Services",
              },
              {
                "type": "line",
                "xKey": "quarter",
                "yKey": "mac",
                "yName": "Mac",
              },
              {
                "type": "line",
                "xKey": "quarter",
                "yKey": "iphone",
                "yName": "iPhone",
              },
            ]
        `);
    });
});
