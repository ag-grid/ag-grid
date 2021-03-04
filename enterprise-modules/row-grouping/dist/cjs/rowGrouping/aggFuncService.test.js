"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aggFuncService_1 = require("./aggFuncService");
var core_1 = require("@ag-grid-community/core");
function createService() {
    var getAggFuncs = jest.fn();
    var gridOptionsWrapper = new core_1.GridOptionsWrapper();
    gridOptionsWrapper.getAggFuncs = getAggFuncs;
    var service = new aggFuncService_1.AggFuncService();
    service.gridOptionsWrapper = gridOptionsWrapper;
    return service;
}
function createParams(values) {
    return {
        values: values
    };
}
describe('aggSum', function () {
    var sum = createService().getAggFunc('sum');
    it('has function', function () {
        expect(sum).toBeDefined();
    });
    it('returns sum of numbers', function () {
        var result = sum(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(1467);
    });
    it('returns sum of bigints', function () {
        var result = sum(createParams([BigInt(3245234), BigInt(6654432), BigInt(67468456345), BigInt(-4657563), BigInt(45745456)]));
        expect(result).toBe(BigInt(67519443904));
    });
    it('returns sum of mixture of numbers and bigints', function () {
        var result = sum(createParams([20, BigInt(30), 40]));
        expect(result).toBe(BigInt(90));
    });
    it('returns sum of valid numbers', function () {
        var result = sum(createParams([35, 'foo', 921, undefined, -43, null, 65]));
        expect(result).toBe(978);
    });
    it('returns null for empty array', function () {
        expect(sum(createParams([]))).toBeNull();
    });
    it('returns null for invalid values', function () {
        expect(sum(createParams(['foo', undefined, null]))).toBeNull();
    });
});
describe('aggFirst', function () {
    var first = createService().getAggFunc('first');
    it('has function', function () {
        expect(first).toBeDefined();
    });
    it('returns first element in array', function () {
        var result = first(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(12);
    });
    it('returns null for empty array', function () {
        expect(first(createParams([]))).toBeNull();
    });
});
describe('aggLast', function () {
    var last = createService().getAggFunc('last');
    it('has function', function () {
        expect(last).toBeDefined();
    });
    it('returns first element in array', function () {
        var result = last(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(34);
    });
    it('returns null for empty array', function () {
        expect(last(createParams([]))).toBeNull();
    });
});
describe('aggMin', function () {
    var min = createService().getAggFunc('min');
    it('has function', function () {
        expect(min).toBeDefined();
    });
    it('returns min of numbers', function () {
        var result = min(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(-43);
    });
    it('returns min of bigints', function () {
        var result = min(createParams([BigInt(3124123), BigInt(622543), BigInt(-15234123), BigInt(85678543)]));
        expect(result).toBe(BigInt(-15234123));
    });
    it('returns min of mixture of numbers and bigints', function () {
        var result = min(createParams([BigInt(234), -435345, BigInt(-15345435), 34565]));
        expect(result).toBe(BigInt(-15345435));
    });
    it('returns min of valid numbers', function () {
        var result = min(createParams([35, 'foo', 921, undefined, -54, null, 65]));
        expect(result).toBe(-54);
    });
    it('returns null for empty array', function () {
        expect(min(createParams([]))).toBeNull();
    });
    it('returns null for invalid values', function () {
        expect(min(createParams(['foo', undefined, null]))).toBeNull();
    });
});
describe('aggMax', function () {
    var max = createService().getAggFunc('max');
    it('has function', function () {
        expect(max).toBeDefined();
    });
    it('returns max of numbers', function () {
        var result = max(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(921);
    });
    it('returns max of bigints', function () {
        var result = max(createParams([BigInt(4543), BigInt(5464524), BigInt(-435312), BigInt(453)]));
        expect(result).toBe(BigInt(5464524));
    });
    it('returns max of mixture of numbers and bigints', function () {
        var result = max(createParams([BigInt(234), BigInt(5645723), -435345, 34565]));
        expect(result).toBe(BigInt(5645723));
    });
    it('returns max of valid numbers', function () {
        var result = max(createParams([35, 'foo', 634, undefined, -54, null, 65]));
        expect(result).toBe(634);
    });
    it('returns null for empty array', function () {
        expect(max(createParams([]))).toBeNull();
    });
    it('returns null for invalid values', function () {
        expect(max(createParams(['foo', undefined, null]))).toBeNull();
    });
});
describe('aggCount', function () {
    var count = createService().getAggFunc('count');
    it('has function', function () {
        expect(count).toBeDefined();
    });
    it('returns count of elements', function () {
        var result = count(createParams([12, 'foo', 921, -43, null]));
        expect(result.toNumber()).toBe(5);
        expect(result.toString()).toBe('5');
    });
    it('sums count from group aggregation objects', function () {
        var result = count(createParams([14, { value: 12 }, { value: 3 }]));
        expect(result.toNumber()).toBe(16);
    });
});
describe('aggAvg', function () {
    var avg = createService().getAggFunc('avg');
    it('has function', function () {
        expect(avg).toBeDefined();
    });
    it('returns average of number elements', function () {
        var result = avg(createParams([5, 15, 34]));
        expect(result.toNumber()).toBe(18);
        expect(result.toString()).toBe('18');
    });
    it('returns average of bigint elements', function () {
        var result = avg(createParams([BigInt(53242342), BigInt(2565645), BigInt(1153456746)]));
        expect(result.toNumber()).toBe(BigInt(403088244));
        expect(result.toString()).toBe('403088244');
    });
    it('returns average of valid elements', function () {
        var result = avg(createParams([5, 'foo', 18, undefined, 34, null]));
        expect(result.toNumber()).toBe(19);
    });
    it('calculates average from group aggregation objects', function () {
        var result = avg(createParams([16, { count: 3, value: 12 }, { count: 4, value: 32 }]));
        expect(result.toNumber()).toBe(22.5);
    });
    it('calculates average from group aggregation objects with bigints', function () {
        var result = avg(createParams([16, { count: 3, value: 12 }, { count: 4, value: BigInt(32) }]));
        expect(result.toNumber()).toBe(BigInt(22));
    });
    it('returns null for empty array', function () {
        expect(avg(createParams([])).toNumber()).toBeNull();
    });
});
//# sourceMappingURL=aggFuncService.test.js.map