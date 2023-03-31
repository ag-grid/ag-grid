import { expect, it, describe } from '@jest/globals';

import * as examples from '../test/examples';

import { DataModel, SMALLEST_KEY_INTERVAL } from './dataModel';

describe('DataModel', () => {
    describe('ungrouped processing', () => {
        it('should generated the expected results', () => {
            const data = examples.SIMPLE_LINE_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any>({
                props: [
                    { property: 'date', type: 'key', valueType: 'range' },
                    { property: 'petrol', type: 'value', valueType: 'range' },
                    { property: 'diesel', type: 'value', valueType: 'range' },
                ],
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any>({
                props: [
                    { property: 'kp', type: 'key', valueType: 'range' },
                    { property: 'vp1', type: 'value', valueType: 'range' },
                    { property: 'vp2', type: 'value', valueType: 'range' },
                    SMALLEST_KEY_INTERVAL,
                ],
            });
            const data = [
                { kp: 2, vp1: 5, vp2: 7 },
                { kp: 3, vp1: 1, vp2: 2 },
                { kp: 4, vp1: 6, vp2: 9 },
            ];

            it('should extract the configured keys', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('ungrouped');
                expect(result.data.length).toEqual(3);
                expect(result.data[0].keys).toEqual([2]);
                expect(result.data[1].keys).toEqual([3]);
                expect(result.data[2].keys).toEqual([4]);
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('ungrouped');
                expect(result.data.length).toEqual(3);
                expect(result.data[0].values).toEqual([5, 7]);
                expect(result.data[1].values).toEqual([1, 2]);
                expect(result.data[2].values).toEqual([6, 9]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('ungrouped');
                expect(result.domain.keys).toEqual([[2, 4]]);
                expect(result.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                ]);
            });

            it('should calculate smallest X interval', () => {
                const result = dataModel.processData(data);

                expect(result.reduced?.[SMALLEST_KEY_INTERVAL.property]).toEqual(1);
            });
        });
    });

    describe('grouped processing - grouped example', () => {
        it('should generated the expected results', () => {
            const data = examples.GROUPED_BAR_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any, true>({
                props: [
                    { property: 'type', type: 'key', valueType: 'category' },
                    { property: 'total', type: 'value', valueType: 'range' },
                    { property: 'regular', type: 'value', valueType: 'range' },
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    { property: 'kp', type: 'key', valueType: 'category' },
                    { property: 'vp1', type: 'value', valueType: 'range' },
                    { property: 'vp2', type: 'value', valueType: 'range' },
                ],
                groupByKeys: true,
            });
            const data = [
                { kp: 'Q1', vp1: 5, vp2: 7 },
                { kp: 'Q1', vp1: 1, vp2: 2 },
                { kp: 'Q2', vp1: 6, vp2: 9 },
                { kp: 'Q2', vp1: 6, vp2: 9 },
            ];

            it('should extract the configured keys', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('grouped');
                expect(result.data.length).toEqual(2);
                expect(result.data[0].keys).toEqual(['Q1']);
                expect(result.data[1].keys).toEqual(['Q2']);
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('grouped');
                expect(result.data.length).toEqual(2);
                expect(result.data[0].values).toEqual([
                    [5, 7],
                    [1, 2],
                ]);
                expect(result.data[1].values).toEqual([
                    [6, 9],
                    [6, 9],
                ]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('grouped');
                expect(result.domain.keys).toEqual([['Q1', 'Q2']]);
                expect(result.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                ]);
            });

            it('should not include sums', () => {
                const result = dataModel.processData(data);

                expect(result.data.filter((g) => g.sumValues != null)).toEqual([]);
                expect(result.domain.sumValues).toBeUndefined();
            });
        });
    });

    describe('grouped processing - stacked example', () => {
        it('should generated the expected results', () => {
            const data = examples.STACKED_BAR_CHART_EXAMPLE.data!;
            const dataModel = new DataModel<any, any, true>({
                props: [
                    { property: 'type', type: 'key', valueType: 'category' },
                    { property: 'ownerOccupied', type: 'value', valueType: 'range' },
                    { property: 'privateRented', type: 'value', valueType: 'range' },
                    { property: 'localAuthority', type: 'value', valueType: 'range' },
                    { property: 'housingAssociation', type: 'value', valueType: 'range' },
                    {
                        properties: ['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation'],
                        type: 'sum',
                    },
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    { property: 'kp', type: 'key', valueType: 'category' },
                    { property: 'vp1', type: 'value', valueType: 'range' },
                    { property: 'vp2', type: 'value', valueType: 'range' },
                    { property: 'vp3', type: 'value', valueType: 'range' },
                    { property: 'vp4', type: 'value', valueType: 'range' },
                    { properties: ['vp1', 'vp2'], type: 'sum' },
                    { properties: ['vp3', 'vp4'], type: 'sum' },
                ],
                groupByKeys: true,
            });
            const data = [
                { kp: 'Q1', vp1: 5, vp2: 7, vp3: 1, vp4: 5 },
                { kp: 'Q1', vp1: 1, vp2: 2, vp3: 2, vp4: 4 },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 3, vp4: 3 },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 4, vp4: 2 },
            ];

            it('should extract the configured keys', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('grouped');
                expect(result.data.length).toEqual(2);
                expect(result.data[0].keys).toEqual(['Q1']);
                expect(result.data[1].keys).toEqual(['Q2']);
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('grouped');
                expect(result.data.length).toEqual(2);
                expect(result.data[0].values).toEqual([
                    [5, 7, 1, 5],
                    [1, 2, 2, 4],
                ]);
                expect(result.data[1].values).toEqual([
                    [6, 9, 3, 3],
                    [6, 9, 4, 2],
                ]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result.type).toEqual('grouped');
                expect(result.domain.keys).toEqual([['Q1', 'Q2']]);
                expect(result.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                    [1, 4],
                    [2, 5],
                ]);
            });

            it('should calculate the sums', () => {
                const result = dataModel.processData(data);

                expect(result.data.map((g) => g.sumValues)).toEqual([
                    [
                        [0, 15],
                        [0, 12],
                    ],
                    [
                        [0, 30],
                        [0, 12],
                    ],
                ]);
                expect(result.domain.sumValues).toEqual([
                    [0, 30],
                    [0, 12],
                ]);
            });
        });
    });

    describe('grouped processing - stacked and normalised example', () => {
        it('should generated the expected results', () => {
            const data = examples.ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE.data!;
            const dataModel = new DataModel<any, any, true>({
                props: [
                    { property: 'type', type: 'key', valueType: 'category' },
                    { property: 'white', type: 'value', valueType: 'range' },
                    { property: 'mixed', type: 'value', valueType: 'range' },
                    { property: 'asian', type: 'value', valueType: 'range' },
                    { property: 'black', type: 'value', valueType: 'range' },
                    { property: 'chinese', type: 'value', valueType: 'range' },
                    { property: 'other', type: 'value', valueType: 'range' },
                    {
                        properties: ['white', 'mixed', 'asian', 'black', 'chinese', 'other'],
                        type: 'sum',
                    },
                ],
                groupByKeys: true,
                normaliseTo: 100,
            });

            expect(dataModel.processData(data)).toMatchSnapshot();
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    { property: 'kp', type: 'key', valueType: 'category' },
                    { property: 'vp1', type: 'value', valueType: 'range' },
                    { property: 'vp2', type: 'value', valueType: 'range' },
                    { property: 'vp3', type: 'value', valueType: 'range' },
                    { property: 'vp4', type: 'value', valueType: 'range' },
                    { properties: ['vp1', 'vp2'], type: 'sum' },
                    { properties: ['vp3', 'vp4'], type: 'sum' },
                ],
                groupByKeys: true,
                normaliseTo: 100,
            });
            const data = [
                { kp: 'Q1', vp1: 5, vp2: 7, vp3: 1, vp4: 5 },
                { kp: 'Q1', vp1: 1, vp2: 2, vp3: 2, vp4: 4 },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 3, vp4: 3 },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 4, vp4: 2 },
            ];

            it('should allow normalisation of values', () => {
                const result = dataModel.processData(data);

                expect(result.data.map((g) => g.sumValues)).toEqual([
                    [
                        [0, 100],
                        [0, 100],
                    ],
                    [
                        [0, 100],
                        [0, 100],
                    ],
                ]);
                expect(result.domain.sumValues).toEqual([
                    [0, 100],
                    [0, 100],
                ]);

                expect(result.data.map((g) => g.values)).toEqual([
                    [
                        [33.333333333333336, 46.66666666666667, 8.333333333333334, 41.66666666666667],
                        [6.666666666666667, 13.333333333333334, 16.666666666666668, 33.333333333333336],
                    ],
                    [
                        [20, 30, 25, 25],
                        [20, 30, 33.333333333333336, 16.666666666666668],
                    ],
                ]);
            });
        });
    });
});
