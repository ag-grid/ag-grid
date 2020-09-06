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
describe("aggSum", function () {
    var sum = createService().getAggFunc("sum");
    test("function exists", function () {
        expect(sum).toBeDefined();
    });
    test("returns sum of numbers", function () {
        var result = sum(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(1467);
    });
    test("returns sum of valid numbers", function () {
        var result = sum(createParams([35, 'foo', 921, undefined, -43, null, 65]));
        expect(result).toBe(978);
    });
    test("returns null for empty array", function () {
        expect(sum(createParams([]))).toBeNull();
    });
    test("returns null for invalid values", function () {
        expect(sum(createParams(['foo', undefined, null]))).toBeNull();
    });
});
describe("aggFirst", function () {
    var first = createService().getAggFunc("first");
    test("function exists", function () {
        expect(first).toBeDefined();
    });
    test("returns first element in array", function () {
        var result = first(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(12);
    });
    test("returns null for empty array", function () {
        expect(first(createParams([]))).toBeNull();
    });
});
describe("aggLast", function () {
    var last = createService().getAggFunc("last");
    test("function exists", function () {
        expect(last).toBeDefined();
    });
    test("returns first element in array", function () {
        var result = last(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(34);
    });
    test("returns null for empty array", function () {
        expect(last(createParams([]))).toBeNull();
    });
});
describe("aggMin", function () {
    var min = createService().getAggFunc("min");
    test("function exists", function () {
        expect(min).toBeDefined();
    });
    test("returns min of numbers", function () {
        var result = min(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(-43);
    });
    test("returns min of valid numbers", function () {
        var result = min(createParams([35, 'foo', 921, undefined, -54, null, 65]));
        expect(result).toBe(-54);
    });
    test("returns null for empty array", function () {
        expect(min(createParams([]))).toBeNull();
    });
    test("returns null for invalid values", function () {
        expect(min(createParams(['foo', undefined, null]))).toBeNull();
    });
});
describe("aggMax", function () {
    var max = createService().getAggFunc("max");
    test("function exists", function () {
        expect(max).toBeDefined();
    });
    test("returns min of numbers", function () {
        var result = max(createParams([12, 543, 921, -43, 34]));
        expect(result).toBe(921);
    });
    test("returns min of valid numbers", function () {
        var result = max(createParams([35, 'foo', 634, undefined, -54, null, 65]));
        expect(result).toBe(634);
    });
    test("returns null for empty array", function () {
        expect(max(createParams([]))).toBeNull();
    });
    test("returns null for invalid values", function () {
        expect(max(createParams(['foo', undefined, null]))).toBeNull();
    });
});
describe("aggCount", function () {
    var count = createService().getAggFunc("count");
    test("function exists", function () {
        expect(count).toBeDefined();
    });
    test("returns count of elements", function () {
        var result = count(createParams([12, "foo", 921, -43, null]));
        expect(result.toNumber()).toBe(5);
        expect(result.toString()).toBe("5");
    });
    test("sums count from group aggregation objects", function () {
        var result = count(createParams([14, { value: 12 }, { value: 3 }]));
        expect(result.toNumber()).toBe(16);
    });
});
describe("aggAvg", function () {
    var avg = createService().getAggFunc("avg");
    test("function exists", function () {
        expect(avg).toBeDefined();
    });
    test("returns average of elements", function () {
        var result = avg(createParams([5, 15, 34]));
        expect(result.toNumber()).toBe(18);
        expect(result.toString()).toBe("18");
    });
    test("returns average of valid elements", function () {
        var result = avg(createParams([5, "foo", 18, undefined, 34, null]));
        expect(result.toNumber()).toBe(19);
    });
    test("calculates average from group aggregation objects", function () {
        var result = avg(createParams([16, { count: 3, value: 12 }, { count: 4, value: 32 }]));
        expect(result.toNumber()).toBe(22.5);
    });
    test("returns null for empty array", function () {
        expect(avg(createParams([])).toNumber()).toBeNull();
    });
});
//# sourceMappingURL=aggFuncService.test.js.map