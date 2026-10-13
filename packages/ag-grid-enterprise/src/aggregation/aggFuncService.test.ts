import { _parseDateTimeFromString } from 'ag-stack';

import type { AgColumn, DataTypeService, GridOptionsService, IAggFuncParams } from 'ag-grid-community';

import { mock } from '../test-utils/mock';
import { AggFuncService } from './aggFuncService';

function createService(dataTypeSvc?: Partial<DataTypeService>): AggFuncService {
    const gridOptionsService = mock<GridOptionsService>('get');

    const service = new AggFuncService() as any;

    service.gos = gridOptionsService;
    service.beans = { dataTypeSvc };

    return service;
}

/** Mimics the data type service for a column whose base data type is `baseDataType`, with the default ISO parser. */
function createDataTypeSvc(baseDataType: string): Partial<DataTypeService> {
    return {
        getBaseDataType: () => baseDataType as any,
        getDateParserFunction: () => (value) => _parseDateTimeFromString(value) ?? undefined,
    };
}

function createColumn(allowedAggFuncs?: string[]): AgColumn {
    return { colDef: { allowedAggFuncs } } as AgColumn;
}

function createParams(values: any[], column?: AgColumn): IAggFuncParams {
    return {
        values: values,
        column,
    } as unknown as IAggFuncParams;
}

describe('getFuncNames', () => {
    it('returns built-in functions in priority order', () => {
        const service = createService();
        service.getAggFunc('sum');
        const result = service.getFuncNames(createColumn());

        expect(result).toEqual(['sum', 'avg', 'max', 'min', 'count', 'first', 'last']);
    });

    it('appends custom functions after built-ins in alphabetical order', () => {
        const service = createService();
        service.addAggFuncs({
            median: () => 0,
            absolute: () => 0,
            zScore: () => 0,
        });
        const result = service.getFuncNames(createColumn());

        expect(result).toEqual(['sum', 'avg', 'max', 'min', 'count', 'first', 'last', 'absolute', 'median', 'zScore']);
    });

    it('returns allowedAggFuncs as-is when specified on the column', () => {
        const service = createService();
        const result = service.getFuncNames(createColumn(['count', 'sum']));

        expect(result).toEqual(['count', 'sum']);
    });
});

describe('aggSum', () => {
    const sum = createService().getAggFunc('sum');

    it('has function', () => {
        expect(sum).toBeDefined();
    });

    it('returns sum of numbers', () => {
        const result = sum(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(1467);
    });

    it('returns sum of bigints', () => {
        const result = sum(
            createParams([BigInt(3245234), BigInt(6654432), BigInt(67468456345), BigInt(-4657563), BigInt(45745456)])
        );

        expect(result).toBe(BigInt(67519443904));
    });

    it('returns sum of mixture of numbers and bigints', () => {
        const result = sum(createParams([20, BigInt(30), 40]));

        expect(result).toBe(BigInt(90));
    });

    it('returns sum of valid numbers', () => {
        const result = sum(createParams([35, 'foo', 921, undefined, -43, null, 65]));

        expect(result).toBe(978);
    });

    it('returns null for empty array', () => {
        expect(sum(createParams([]))).toBeNull();
    });

    it('returns null for invalid values', () => {
        expect(sum(createParams(['foo', undefined, null]))).toBeNull();
    });
});

describe('aggFirst', () => {
    const first = createService().getAggFunc('first');

    it('has function', () => {
        expect(first).toBeDefined();
    });

    it('returns first element in array', () => {
        const result = first(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(12);
    });

    it('returns null for empty array', () => {
        expect(first(createParams([]))).toBeNull();
    });
});

describe('aggLast', () => {
    const last = createService().getAggFunc('last');

    it('has function', () => {
        expect(last).toBeDefined();
    });

    it('returns first element in array', () => {
        const result = last(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(34);
    });

    it('returns null for empty array', () => {
        expect(last(createParams([]))).toBeNull();
    });
});

describe('aggMin', () => {
    const min = createService().getAggFunc('min');

    it('has function', () => {
        expect(min).toBeDefined();
    });

    it('returns min of numbers', () => {
        const result = min(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(-43);
    });

    it('returns min of bigints', () => {
        const result = min(createParams([BigInt(3124123), BigInt(622543), BigInt(-15234123), BigInt(85678543)]));

        expect(result).toBe(BigInt(-15234123));
    });

    it('returns min of mixture of numbers and bigints', () => {
        const result = min(createParams([BigInt(234), -435345, BigInt(-15345435), 34565]));

        expect(result).toBe(BigInt(-15345435));
    });

    it('returns min of valid numbers', () => {
        const result = min(createParams([35, 'foo', 921, undefined, -54, null, 65]));

        expect(result).toBe(-54);
    });

    it('returns null for empty array', () => {
        expect(min(createParams([]))).toBeNull();
    });

    it('returns null for invalid values', () => {
        expect(min(createParams(['foo', undefined, null]))).toBeNull();
    });
});

describe('aggMax', () => {
    const max = createService().getAggFunc('max');

    it('has function', () => {
        expect(max).toBeDefined();
    });

    it('returns max of numbers', () => {
        const result = max(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(921);
    });

    it('returns max of bigints', () => {
        const result = max(createParams([BigInt(4543), BigInt(5464524), BigInt(-435312), BigInt(453)]));

        expect(result).toBe(BigInt(5464524));
    });

    it('returns max of mixture of numbers and bigints', () => {
        const result = max(createParams([BigInt(234), BigInt(5645723), -435345, 34565]));

        expect(result).toBe(BigInt(5645723));
    });

    it('returns max of valid numbers', () => {
        const result = max(createParams([35, 'foo', 634, undefined, -54, null, 65]));

        expect(result).toBe(634);
    });

    it('returns null for empty array', () => {
        expect(max(createParams([]))).toBeNull();
    });

    it('returns null for invalid values', () => {
        expect(max(createParams(['foo', undefined, null]))).toBeNull();
    });
});

describe.each([
    { name: 'min', isMax: false },
    { name: 'max', isMax: true },
])('agg $name with dates', ({ name, isMax }) => {
    const pick = <T>(earliest: T, latest: T): T => (isMax ? latest : earliest);
    const column = {} as AgColumn;

    it('returns the original Date instance of the earliest / latest date', () => {
        const fn = createService().getAggFunc(name);
        const earliest = new Date(2000, 9, 1);
        const latest = new Date(2012, 7, 12, 12, 25, 59);

        const result = fn(createParams([new Date(2008, 7, 24), latest, null, earliest, undefined], column));

        expect(result).toBe(pick(earliest, latest));
    });

    it('ignores invalid dates', () => {
        const fn = createService().getAggFunc(name);
        const valid = new Date(2008, 7, 24);

        expect(fn(createParams([new Date(Number.NaN), valid, new Date('foo')], column))).toBe(valid);
        expect(fn(createParams([new Date(Number.NaN)], column))).toBeNull();
    });

    it('returns the numeric result when numbers and dates are mixed', () => {
        const fn = createService().getAggFunc(name);

        expect(fn(createParams([new Date(2008, 7, 24), 5, new Date(2012, 7, 12), 3], column))).toBe(pick(3, 5));
    });

    it('returns the original string for date string columns', () => {
        const fn = createService(createDataTypeSvc('dateString')).getAggFunc(name);

        const result = fn(createParams(['2008-08-24', 'foo', '2012-08-12', '2000-10-01', null], column));

        expect(result).toBe(pick('2000-10-01', '2012-08-12'));
    });

    it('compares date time strings by their time', () => {
        const fn = createService(createDataTypeSvc('dateTimeString')).getAggFunc(name);

        const result = fn(createParams(['2012-08-12T09:00:00', '2012-08-12T12:25:59', '2012-08-12T08:15:00'], column));

        expect(result).toBe(pick('2012-08-12T08:15:00', '2012-08-12T12:25:59'));
    });

    it('uses the date parser of the column', () => {
        const parseDayMonthYear = (value: string | undefined) => {
            const [day, month, year] = (value ?? '').split('/').map(Number);
            return year ? new Date(year, month - 1, day) : undefined;
        };
        const fn = createService({
            getBaseDataType: () => 'dateString',
            getDateParserFunction: () => parseDayMonthYear,
        }).getAggFunc(name);

        const result = fn(createParams(['24/08/2008', '29/08/2004', '12/08/2012'], column));

        expect(result).toBe(pick('29/08/2004', '12/08/2012'));
    });

    it('ignores strings in columns which do not hold date strings', () => {
        const fn = createService(createDataTypeSvc('text')).getAggFunc(name);

        expect(fn(createParams(['2008-08-24', '2012-08-12'], column))).toBeNull();
    });
});

describe('aggCount', () => {
    const count = createService().getAggFunc('count');

    it('has function', () => {
        expect(count).toBeDefined();
    });

    it('returns count of elements', () => {
        const result = count(createParams([12, 'foo', 921, -43, null]));

        expect(result.value).toBe(5);
    });

    it('sums count from group aggregation objects', () => {
        const result = count(createParams([14, { value: 12 }, { value: 3 }]));

        expect(result.value).toBe(16);
    });
});

describe('aggAvg', () => {
    const avg = createService().getAggFunc('avg');

    it('has function', () => {
        expect(avg).toBeDefined();
    });

    it('returns average of number elements', () => {
        const result = avg(createParams([5, 15, 34]));

        expect(result.toNumber()).toBe(18);
        expect(result.toString()).toBe('18');
    });

    it('returns average of bigint elements', () => {
        const result = avg(createParams([BigInt(53242342), BigInt(2565645), BigInt(1153456746)]));

        expect(result.toNumber()).toBe(BigInt(403088244));
        expect(result.toString()).toBe('403088244');
    });

    it('returns average of valid elements', () => {
        const result = avg(createParams([5, 'foo', 18, undefined, 34, null]));

        expect(result.toNumber()).toBe(19);
    });

    it('calculates average from group aggregation objects', () => {
        const result = avg(createParams([16, { count: 3, value: 12 }, { count: 4, value: 32 }]));

        expect(result.toNumber()).toBe(22.5);
    });

    it('calculates average from group aggregation objects with bigints', () => {
        const result = avg(createParams([16, { count: 3, value: 12 }, { count: 4, value: BigInt(32) }]));

        expect(result.toNumber()).toBe(BigInt(22));
    });

    it('returns null for empty array', () => {
        expect(avg(createParams([])).toNumber()).toBeNull();
    });
});
