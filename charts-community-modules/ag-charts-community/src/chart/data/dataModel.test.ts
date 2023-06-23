import { expect, it, describe } from '@jest/globals';
import { isNumber } from '../../util/value';
import { DATA_BROWSER_MARKET_SHARE } from '../test/data';

import * as examples from '../test/examples';

import { AggregatePropertyDefinition, DataModel, GroupByFn, PropertyId } from './dataModel';
import {
    area as actualArea,
    groupAverage as actualGroupAverage,
    groupCount as actualGroupCount,
    range as actualRange,
    sum as actualSum,
    accumulatedValue,
} from './aggregateFunctions';
import {
    AGG_VALUES_EXTENT,
    normaliseGroupTo as actualNormaliseGroupTo,
    normalisePropertyTo as actualNormalisePropertyTo,
    SMALLEST_KEY_INTERVAL,
    SORT_DOMAIN_GROUPS,
} from './processors';
import { rangedValueProperty } from '../series/series';

const rangeKey = (property: string) => ({ scope: 'test', property, type: 'key' as const, valueType: 'range' as const });
const categoryKey = (property: string) => ({
    scopes: ['test'],
    property,
    type: 'key' as const,
    valueType: 'category' as const,
});
const value = (property: string, id?: string) => ({
    scopes: ['test'],
    property,
    type: 'value' as const,
    valueType: 'range' as const,
    id,
});
const categoryValue = (property: string) => ({
    scopes: ['test'],
    property,
    type: 'value' as const,
    valueType: 'category' as const,
});
const accumulatedGroupValue = (property: string, id?: string) => ({
    ...value(property, id),
    processor: () => (next, total) => next + (total ?? 0),
});
const accumulatedPropertyValue = (property: string, id?: string) => ({
    ...value(property, id),
    processor: accumulatedValue(),
});
const sum = (props: string[]) => actualSum({ id: 'test' }, `sum-${props.join('-')}`, props);
const range = (props: string[]) => actualRange({ id: 'test' }, `range-${props.join('-')}`, props);
const groupAverage = (props: string[]) => actualGroupAverage({ id: 'test' }, `groupAverage-${props.join('-')}`, props);
const groupCount = () => actualGroupCount({ id: 'test' }, `groupCount`);
const area = (props: string[], aggFn: AggregatePropertyDefinition<any, any>) =>
    actualArea({ id: 'test' }, `area-${props.join('-')}`, props, aggFn);
const normaliseGroupTo = (props: string[], normaliseTo: number, mode?: 'sum' | 'range') =>
    actualNormaliseGroupTo({ id: 'test' }, props, normaliseTo, mode);
const normalisePropertyTo = (prop: PropertyId<any>, normaliseTo: [number, number]) =>
    actualNormalisePropertyTo({ id: 'test' }, prop, normaliseTo);

describe('DataModel', () => {
    describe('ungrouped processing', () => {
        it('should generated the expected results', () => {
            const data = examples.SIMPLE_LINE_CHART_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any>({
                props: [rangeKey('date'), value('petrol'), value('diesel')],
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            describe('simple data', () => {
                const dataModel = new DataModel<any, any>({
                    props: [rangeKey('kp'), value('vp1'), value('vp2'), SMALLEST_KEY_INTERVAL],
                });
                const data = [
                    { kp: 2, vp1: 5, vp2: 7 },
                    { kp: 3, vp1: 1, vp2: 2 },
                    { kp: 4, vp1: 6, vp2: 9 },
                ];

                it('should extract the configured keys', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(3);
                    expect(result?.data[0].keys).toEqual([2]);
                    expect(result?.data[1].keys).toEqual([3]);
                    expect(result?.data[2].keys).toEqual([4]);
                });

                it('should extract the configured values', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(3);
                    expect(result?.data[0].values).toEqual([5, 7]);
                    expect(result?.data[1].values).toEqual([1, 2]);
                    expect(result?.data[2].values).toEqual([6, 9]);
                });

                it('should calculate the domains', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.domain.keys).toEqual([[2, 4]]);
                    expect(result?.domain.values).toEqual([
                        [1, 6],
                        [2, 9],
                    ]);
                });

                it('should calculate smallest X interval', () => {
                    const result = dataModel.processData(data);

                    expect(result?.reduced?.[SMALLEST_KEY_INTERVAL.property]).toEqual(1);
                });
            });

            describe('category data', () => {
                const dataModel = new DataModel<any, any, false>({
                    props: [categoryKey('kp'), value('vp1'), value('vp2')],
                    groupByKeys: false,
                });
                const data = [
                    { kp: 'Q1', vp1: 5, vp2: 7 },
                    { kp: 'Q1', vp1: 1, vp2: 2 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                ];

                it('should extract the configured keys', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(4);
                    expect(result?.data[0].keys).toEqual(['Q1']);
                    expect(result?.data[1].keys).toEqual(['Q1']);
                    expect(result?.data[2].keys).toEqual(['Q2']);
                    expect(result?.data[3].keys).toEqual(['Q2']);
                });

                it('should extract the configured values', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(4);
                    expect(result?.data[0].values).toEqual([5, 7]);
                    expect(result?.data[1].values).toEqual([1, 2]);
                    expect(result?.data[2].values).toEqual([6, 9]);
                    expect(result?.data[3].values).toEqual([6, 9]);
                });
            });
        });
    });

    describe('ungrouped processing - accumulated and normalised properties', () => {
        it('should generated the expected results', () => {
            const data = examples.SIMPLE_PIE_CHART_EXAMPLE.series?.[0].data ?? [];
            const dataModel = new DataModel<any, any>({
                props: [
                    accumulatedPropertyValue('population'),
                    categoryValue('religion'),
                    value('population'),
                    normalisePropertyTo('population', [0, 2 * Math.PI]),
                ],
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            describe('simple data', () => {
                const dataModel = new DataModel<any, any>({
                    props: [
                        rangeKey('kp'),
                        accumulatedPropertyValue('vp1'),
                        accumulatedPropertyValue('vp2'),
                        value('vp3'),
                        normalisePropertyTo('vp1', [0, 100]),
                    ],
                });
                const data = [
                    { kp: 2, vp1: 5, vp2: 7, vp3: 1 },
                    { kp: 3, vp1: 1, vp2: 2, vp3: 2 },
                    { kp: 4, vp1: 6, vp2: 9, vp3: 3 },
                ];

                it('should extract the configured keys', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(3);
                    expect(result?.data[0].keys).toEqual([2]);
                    expect(result?.data[1].keys).toEqual([3]);
                    expect(result?.data[2].keys).toEqual([4]);
                });

                it('should extract the configured values', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(3);
                    expect(result?.data[0].values).toEqual([0, 7, 1]);
                    expect(result?.data[1].values).toEqual([14.285714285714285, 9, 2]);
                    expect(result?.data[2].values).toEqual([100, 18, 3]);
                });

                it('should calculate the domains', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.domain.keys).toEqual([[2, 4]]);
                    expect(result?.domain.values).toEqual([
                        [0, 100],
                        [7, 18],
                        [1, 3],
                    ]);
                });
            });

            describe('category data', () => {
                const dataModel = new DataModel<any, any, false>({
                    props: [categoryKey('kp'), value('vp1'), value('vp2')],
                    groupByKeys: false,
                });
                const data = [
                    { kp: 'Q1', vp1: 5, vp2: 7 },
                    { kp: 'Q1', vp1: 1, vp2: 2 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                ];

                it('should extract the configured keys', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(4);
                    expect(result?.data[0].keys).toEqual(['Q1']);
                    expect(result?.data[1].keys).toEqual(['Q1']);
                    expect(result?.data[2].keys).toEqual(['Q2']);
                    expect(result?.data[3].keys).toEqual(['Q2']);
                });

                it('should extract the configured values', () => {
                    const result = dataModel.processData(data);

                    expect(result?.type).toEqual('ungrouped');
                    expect(result?.data.length).toEqual(4);
                    expect(result?.data[0].values).toEqual([5, 7]);
                    expect(result?.data[1].values).toEqual([1, 2]);
                    expect(result?.data[2].values).toEqual([6, 9]);
                    expect(result?.data[3].values).toEqual([6, 9]);
                });
            });
        });
    });

    describe('grouped processing - grouped example', () => {
        it('should generated the expected results', () => {
            const data = examples.GROUPED_BAR_CHART_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [categoryKey('type'), value('total'), value('regular'), sum(['total', 'regular'])],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [categoryKey('kp'), value('vp1'), value('vp2')],
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

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].keys).toEqual(['Q1']);
                expect(result?.data[1].keys).toEqual(['Q2']);
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].values).toEqual([
                    [5, 7],
                    [1, 2],
                ]);
                expect(result?.data[1].values).toEqual([
                    [6, 9],
                    [6, 9],
                ]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.domain.keys).toEqual([['Q1', 'Q2']]);
                expect(result?.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                ]);
            });

            it('should not include sums', () => {
                const result = dataModel.processData(data);

                expect(result?.data.filter((g) => g.aggValues != null)).toEqual([]);
                expect(result?.domain.aggValues).toBeUndefined();
            });

            it('should only sum per data-item', () => {
                const dataModel = new DataModel<any, any, true>({
                    props: [categoryKey('kp'), value('vp1'), value('vp2'), sum(['vp1', 'vp2'])],
                    groupByKeys: true,
                });
                const data = [
                    { kp: 'Q1', vp1: 5, vp2: 7 },
                    { kp: 'Q1', vp1: 1, vp2: 2 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                ];

                const result = dataModel.processData(data);

                expect(result?.domain.aggValues).toEqual([[0, 15]]);
                expect(result?.data[0].aggValues).toEqual([[0, 12]]);
                expect(result?.data[1].aggValues).toEqual([[0, 15]]);
            });
        });
    });

    describe('grouped processing - category objects', () => {
        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [categoryKey('kp'), value('vp1'), value('vp2')],
                groupByKeys: true,
            });
            const data = [
                { kp: { id: 1, q: 'Q1' }, vp1: 5, vp2: 7 },
                { kp: { id: 2, q: 'Q1' }, vp1: 1, vp2: 2 },
                { kp: { id: 3, q: 'Q2' }, vp1: 6, vp2: 9 },
                { kp: { id: 4, q: 'Q2' }, vp1: 6, vp2: 9 },
            ];

            it('should extract the configured keys', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(4);
                expect(result?.data.map((d) => d.keys[0])).toEqual(data.map((d) => d.kp));
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(4);
                expect(result?.data.map((d) => d.values)).toEqual(data.map((d) => [[d.vp1, d.vp2]]));
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.domain.keys[0]).toEqual(data.map((d) => d.kp));
                expect(result?.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                ]);
            });

            it('should not include sums', () => {
                const result = dataModel.processData(data);

                expect(result?.data.filter((g) => g.aggValues != null)).toEqual([]);
                expect(result?.domain.aggValues).toBeUndefined();
            });
        });
    });

    describe('grouped processing - time-series example', () => {
        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [{ ...rangeKey('kp'), validation: (v) => v instanceof Date }, value('vp1'), value('vp2')],
                groupByKeys: true,
            });
            const data = [
                { kp: new Date('2023-01-01T00:00:00.000Z'), vp1: 5, vp2: 7 },
                { kp: new Date('2023-01-02T00:00:00.000Z'), vp1: 1, vp2: 2 },
                { kp: new Date('2023-01-03T00:00:00.000Z'), vp1: 6, vp2: 9 },
                { kp: new Date('2023-01-04T00:00:00.000Z'), vp1: 6, vp2: 9 },
                { kp: null, vp1: 6, vp2: 9 },
            ];

            it('should extract the configured keys', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(4);
                expect(result?.data[0].keys).toEqual([new Date('2023-01-01T00:00:00.000Z')]);
                expect(result?.data[1].keys).toEqual([new Date('2023-01-02T00:00:00.000Z')]);
                expect(result?.data[2].keys).toEqual([new Date('2023-01-03T00:00:00.000Z')]);
                expect(result?.data[3].keys).toEqual([new Date('2023-01-04T00:00:00.000Z')]);
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(4);
                expect(result?.data[0].values).toEqual([[5, 7]]);
                expect(result?.data[1].values).toEqual([[1, 2]]);
                expect(result?.data[2].values).toEqual([[6, 9]]);
                expect(result?.data[3].values).toEqual([[6, 9]]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.domain.keys).toEqual([[data[0].kp, data[3].kp]]);
                expect(result?.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                ]);
            });

            it('should not include sums', () => {
                const result = dataModel.processData(data);

                expect(result?.data.filter((g) => g.aggValues != null)).toEqual([]);
                expect(result?.domain.aggValues).toBeUndefined();
            });

            it('should only sum per data-item', () => {
                const dataModel = new DataModel<any, any, true>({
                    props: [categoryKey('kp'), value('vp1'), value('vp2'), sum(['vp1', 'vp2'])],
                    groupByKeys: true,
                });
                const data = [
                    { kp: 'Q1', vp1: 5, vp2: 7 },
                    { kp: 'Q1', vp1: 1, vp2: 2 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                    { kp: 'Q2', vp1: 6, vp2: 9 },
                ];

                const result = dataModel.processData(data);

                expect(result?.domain.aggValues).toEqual([[0, 15]]);
                expect(result?.data[0].aggValues).toEqual([[0, 12]]);
                expect(result?.data[1].aggValues).toEqual([[0, 15]]);
            });
        });
    });

    describe('grouped processing - stacked example', () => {
        it('should generated the expected results', () => {
            const data = examples.STACKED_BAR_CHART_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('type'),
                    value('ownerOccupied'),
                    value('privateRented'),
                    value('localAuthority'),
                    value('housingAssociation'),
                    sum(['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation']),
                    AGG_VALUES_EXTENT,
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('kp'),
                    value('vp1'),
                    value('vp2'),
                    value('vp3'),
                    value('vp4'),
                    sum(['vp1', 'vp2']),
                    sum(['vp3', 'vp4']),
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

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].keys).toEqual(['Q1']);
                expect(result?.data[1].keys).toEqual(['Q2']);
            });

            it('should extract the configured values', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].values).toEqual([
                    [5, 7, 1, 5],
                    [1, 2, 2, 4],
                ]);
                expect(result?.data[1].values).toEqual([
                    [6, 9, 3, 3],
                    [6, 9, 4, 2],
                ]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.domain.keys).toEqual([['Q1', 'Q2']]);
                expect(result?.domain.values).toEqual([
                    [1, 6],
                    [2, 9],
                    [1, 4],
                    [2, 5],
                ]);
            });

            it('should calculate the sums', () => {
                const result = dataModel.processData(data);

                expect(result?.data.map((g) => g.aggValues)).toEqual([
                    [
                        [0, 12],
                        [0, 6],
                    ],
                    [
                        [0, 15],
                        [0, 6],
                    ],
                ]);
                expect(result?.domain.aggValues).toEqual([
                    [0, 15],
                    [0, 6],
                ]);
            });
        });
    });

    describe('grouped processing - stacked with accumulation example', () => {
        it('should generated the expected results', () => {
            const data = examples.STACKED_BAR_CHART_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('type'),
                    accumulatedGroupValue('ownerOccupied'),
                    accumulatedGroupValue('privateRented'),
                    accumulatedGroupValue('localAuthority'),
                    accumulatedGroupValue('housingAssociation'),
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('kp'),
                    accumulatedGroupValue('vp1'),
                    accumulatedGroupValue('vp2'),
                    accumulatedGroupValue('vp3'),
                    accumulatedGroupValue('vp4'),
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

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].keys).toEqual(['Q1']);
                expect(result?.data[1].keys).toEqual(['Q2']);
            });

            it('should extract the configured accumulated values', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].values).toEqual([
                    [5, 12, 13, 18],
                    [1, 3, 5, 9],
                ]);
                expect(result?.data[1].values).toEqual([
                    [6, 15, 18, 21],
                    [6, 15, 19, 21],
                ]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.domain.keys).toEqual([['Q1', 'Q2']]);
                expect(result?.domain.values).toEqual([
                    [1, 6],
                    [3, 15],
                    [5, 19],
                    [9, 21],
                ]);
            });
        });
    });

    describe('grouped processing - stacked and normalised example', () => {
        it('should generated the expected results for 100% stacked columns example', () => {
            const data = examples.ONE_HUNDRED_PERCENT_STACKED_COLUMNS_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('type'),
                    value('white'),
                    value('mixed'),
                    value('asian'),
                    value('black'),
                    value('chinese'),
                    value('other'),
                    sum(['white', 'mixed', 'asian', 'black', 'chinese', 'other']),
                    normaliseGroupTo(['white', 'mixed', 'asian', 'black', 'chinese', 'other'], 100),
                    AGG_VALUES_EXTENT,
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        it('should generated the expected results for 100% stacked area example', () => {
            const data = examples.ONE_HUNDRED_PERCENT_STACKED_AREA_GRAPH_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('month'),
                    value('petroleum'),
                    value('naturalGas'),
                    value('bioenergyWaste'),
                    value('nuclear'),
                    value('windSolarHydro'),
                    value('imported'),
                    sum(['petroleum', 'naturalGas', 'bioenergyWaste', 'nuclear', 'windSolarHydro', 'imported']),
                    normaliseGroupTo(
                        ['petroleum', 'naturalGas', 'bioenergyWaste', 'nuclear', 'windSolarHydro', 'imported'],
                        100
                    ),
                    AGG_VALUES_EXTENT,
                ],
                groupByKeys: true,
            });

            const result = dataModel.processData(data);
            expect(result).toMatchSnapshot({
                time: expect.any(Number),
            });
            expect(result?.domain.aggValues).toEqual([[0, 100]]);
            expect(result?.reduced?.[AGG_VALUES_EXTENT.property]).toEqual([0, 100]);
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('kp'),
                    value('vp1'),
                    value('vp2'),
                    value('vp3'),
                    value('vp4'),
                    sum(['vp1', 'vp2']),
                    sum(['vp3', 'vp4']),
                    normaliseGroupTo(['vp1', 'vp2'], 100),
                    normaliseGroupTo(['vp3', 'vp4'], 100),
                ],
                groupByKeys: true,
            });
            const data = [
                { kp: 'Q1', vp1: 5, vp2: 7, vp3: 1, vp4: 5 },
                { kp: 'Q1', vp1: 1, vp2: 2, vp3: 2, vp4: 4 },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 3, vp4: 3 },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 4, vp4: 2 },
            ];

            it('should allow normalisation of values', () => {
                const result = dataModel.processData(data);

                expect(result?.data.map((g) => g.aggValues)).toEqual([
                    [
                        [0, 100],
                        [0, 100],
                    ],
                    [
                        [0, 100],
                        [0, 100],
                    ],
                ]);
                expect(result?.domain.aggValues).toEqual([
                    [0, 100],
                    [0, 100],
                ]);

                expect(result?.data.map((g) => g.values)).toEqual([
                    [
                        [41.666666666666664, 58.333333333333336, 16.666666666666668, 83.33333333333333],
                        [33.333333333333336, 66.66666666666667, 33.333333333333336, 66.66666666666667],
                    ],
                    [
                        [40, 60, 50, 50],
                        [40, 60, 66.66666666666667, 33.333333333333336],
                    ],
                ]);
            });
        });
    });

    describe('grouped processing - stacked with accumulation and normalised example', () => {
        it('should generated the expected results', () => {
            const data = examples.STACKED_BAR_CHART_EXAMPLE.data ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('type'),
                    accumulatedGroupValue('ownerOccupied'),
                    accumulatedGroupValue('privateRented'),
                    accumulatedGroupValue('localAuthority'),
                    accumulatedGroupValue('housingAssociation'),
                    range(['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation']),
                    AGG_VALUES_EXTENT,
                    normaliseGroupTo(
                        ['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation'],
                        100,
                        'range'
                    ),
                ],
                groupByKeys: true,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('kp'),
                    accumulatedGroupValue('vp1'),
                    accumulatedGroupValue('vp2'),
                    accumulatedGroupValue('vp3'),
                    accumulatedGroupValue('vp4'),
                    range(['vp1', 'vp2', 'vp3', 'vp4']),
                    AGG_VALUES_EXTENT,
                    normaliseGroupTo(['vp1', 'vp2', 'vp3', 'vp4'], 100, 'range'),
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

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].keys).toEqual(['Q1']);
                expect(result?.data[1].keys).toEqual(['Q2']);
            });

            it('should extract the configured accumulated values', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.data.length).toEqual(2);
                expect(result?.data[0].values).toEqual([
                    [27.77777777777778, 66.66666666666667, 72.22222222222223, 100],
                    [11.11111111111111, 33.333333333333336, 55.55555555555556, 100],
                ]);
                expect(result?.data[1].values).toEqual([
                    [28.571428571428573, 71.42857142857143, 85.71428571428571, 100],
                    [28.571428571428573, 71.42857142857143, 90.47619047619048, 100],
                ]);
            });

            it('should calculate the domains', () => {
                const result = dataModel.processData(data);

                expect(result?.type).toEqual('grouped');
                expect(result?.domain.keys).toEqual([['Q1', 'Q2']]);
                expect(result?.domain.values).toEqual([
                    [1, 6],
                    [3, 15],
                    [5, 19],
                    [9, 21],
                ]);
            });
        });
    });

    describe('grouped processing - calculated grouping', () => {
        const groupByFn: GroupByFn = () => {
            return (item) => {
                if (item.keys[0] < 100) {
                    return ['<100'];
                } else if (item.keys[0] <= 150) {
                    return ['100 - 150'];
                }
                return ['>150'];
            };
        };

        it('should generated the expected results for simple histogram example with hard-coded buckets', () => {
            const data = examples.SIMPLE_HISTOGRAM_CHART_EXAMPLE.data?.slice(0, 20) ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [categoryKey('engine-size'), groupCount(), SORT_DOMAIN_GROUPS],
                groupByFn,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        it('should generated the expected results for simple histogram example with average bucket calculation', () => {
            const data = examples.XY_HISTOGRAM_WITH_MEAN_EXAMPLE.data?.slice(0, 20) ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('engine-size'),
                    value('highway-mpg'),
                    groupAverage(['highway-mpg']),
                    SORT_DOMAIN_GROUPS,
                ],
                groupByFn,
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        it('should generated the expected results for simple histogram example with area bucket calculation', () => {
            const data = examples.HISTOGRAM_WITH_SPECIFIED_BINS_EXAMPLE.data?.slice(0, 20) ?? [];
            const dataModel = new DataModel<any, any, true>({
                props: [rangeKey('curb-weight'), value('curb-weight'), area([], groupCount()), SORT_DOMAIN_GROUPS],
                groupByFn: () => {
                    return (item) => {
                        if (item.keys[0] < 2000) {
                            return [0, 2000];
                        } else if (item.keys[0] <= 3000) {
                            return [2000, 3000];
                        }
                        return [3000, 4500];
                    };
                },
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });
    });

    describe('missing and invalid data processing', () => {
        it('should generated the expected results', () => {
            const data = [...DATA_BROWSER_MARKET_SHARE.map((v) => ({ ...v }))];
            const DEFAULTS = {
                invalidValue: NaN,
                missingValue: null,
                validation: isNumber,
            };
            const dataModel = new DataModel<any, any>({
                props: [
                    categoryKey('year'),
                    { ...DEFAULTS, ...value('ie') },
                    { ...DEFAULTS, ...value('chrome') },
                    { ...DEFAULTS, ...value('firefox') },
                    { ...DEFAULTS, ...value('safari') },
                ],
            });
            data.forEach((datum, idx) => {
                delete datum[['ie', 'chrome', 'firefox', 'safari'][idx % 4]];
                if (idx % 3 === 0) {
                    datum[['ie', 'chrome', 'firefox', 'safari'][(idx + 1) % 4]] = 'illegal value';
                }
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            const defaults = { missingValue: null, invalidValue: NaN };
            const validated = { ...defaults, validation: (v) => typeof v === 'number' };
            const dataModel = new DataModel<any, any, true>({
                props: [
                    categoryKey('kp'),
                    { ...value('vp1'), ...validated },
                    { ...value('vp2'), ...validated },
                    { ...value('vp3'), ...defaults },
                    sum(['vp1', 'vp2']),
                ],
                groupByKeys: true,
            });
            const data = [
                { kp: 'Q1', /* vp1: 5,*/ vp2: 7, vp3: 1 },
                { kp: 'Q1', vp1: 1, vp2: 'illegal value', vp3: 2 },
                { kp: 'Q2', vp1: 6, vp2: 9 /* vp3: 3 */ },
                { kp: 'Q2', vp1: 6, vp2: 9, vp3: 4 },
            ];

            it('should substitute missing value when configured', () => {
                const result = dataModel.processData(data);

                expect(result?.data[0].values).toEqual([
                    [null, 7, 1],
                    [1, NaN, 2],
                ]);
                expect(result?.data[1].values).toEqual([
                    [6, 9, null],
                    [6, 9, 4],
                ]);
            });
        });
    });

    describe('empty data set processing', () => {
        it('should generated the expected results', () => {
            const dataModel = new DataModel<any, any>({
                props: [categoryKey('year'), value('ie'), value('chrome'), value('firefox'), value('safari')],
            });

            expect(dataModel.processData([])).toMatchSnapshot({
                time: expect.any(Number),
            });
        });

        describe('property tests', () => {
            const dataModel = new DataModel<any, any>({
                props: [categoryKey('year'), value('ie'), value('chrome'), value('firefox'), value('safari')],
            });

            it('should not generate data extracts', () => {
                const result = dataModel.processData([]);

                expect(result?.data).toEqual([]);
            });

            it('should not generate values for domains', () => {
                const result = dataModel.processData([]);

                expect(result?.domain.keys).toEqual([[]]);
                expect(result?.domain.values).toEqual([[], [], [], []]);
            });
        });
    });

    describe('repeated property processing', () => {
        it('should generated the expected results', () => {
            const data = [...(examples.PIE_IN_A_DOUGHNUT.series?.[0]?.data?.map((v) => ({ ...v })) ?? [])];
            const dataModel = new DataModel<any, any>({
                props: [
                    accumulatedPropertyValue('share', 'angle'),
                    rangedValueProperty({ id: 'test' }, 'share', { id: 'radius', min: 0.05, max: 0.7 }),
                    normalisePropertyTo({ id: 'angle' }, [0, 1]),
                ],
            });

            expect(dataModel.processData(data)).toMatchSnapshot({
                time: expect.any(Number),
            });
        });
    });
});
