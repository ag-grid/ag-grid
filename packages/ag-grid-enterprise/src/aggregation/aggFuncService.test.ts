import type { GridOptionsService, IAggFuncParams } from 'ag-grid-community';

import { mock } from '../test-utils/mock';
import { AggFuncService } from './aggFuncService';

function createService(): AggFuncService {
    const gridOptionsService = mock<GridOptionsService>('get');

    const service = new AggFuncService() as any;

    service.gos = gridOptionsService;

    return service;
}

function createParams(values: any[]): IAggFuncParams {
    return {
        values: values,
    } as IAggFuncParams;
}

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
