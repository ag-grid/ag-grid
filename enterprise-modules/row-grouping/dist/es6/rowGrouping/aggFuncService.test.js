import { AggFuncService } from "./aggFuncService";
import { GridOptionsWrapper } from "@ag-grid-community/core";
function createService() {
    var getAggFuncs = jest.fn();
    var gridOptionsWrapper = new GridOptionsWrapper();
    gridOptionsWrapper.getAggFuncs = getAggFuncs;
    var service = new AggFuncService();
    service.gridOptionsWrapper = gridOptionsWrapper;
    return service;
}
describe("aggSum", function () {
    var sum = createService().getAggFunc("sum");
    test("function exists", function () {
        expect(sum).toBeDefined();
    });
    test("returns sum of numbers", function () {
        var result = sum([12, 543, 921, -43, 34]);
        expect(result).toBe(1467);
    });
    test("returns sum of valid numbers", function () {
        var result = sum([35, 'foo', 921, undefined, -43, null, 65]);
        expect(result).toBe(978);
    });
    test("returns null for empty array", function () {
        expect(sum([])).toBeNull();
    });
    test("returns null for invalid values", function () {
        expect(sum(['foo', undefined, null])).toBeNull();
    });
});
describe("aggFirst", function () {
    var first = createService().getAggFunc("first");
    test("function exists", function () {
        expect(first).toBeDefined();
    });
    test("returns first element in array", function () {
        var result = first([12, 543, 921, -43, 34]);
        expect(result).toBe(12);
    });
    test("returns null for empty array", function () {
        expect(first([])).toBeNull();
    });
});
describe("aggLast", function () {
    var last = createService().getAggFunc("last");
    test("function exists", function () {
        expect(last).toBeDefined();
    });
    test("returns first element in array", function () {
        var result = last([12, 543, 921, -43, 34]);
        expect(result).toBe(34);
    });
    test("returns null for empty array", function () {
        expect(last([])).toBeNull();
    });
});
describe("aggMin", function () {
    var min = createService().getAggFunc("min");
    test("function exists", function () {
        expect(min).toBeDefined();
    });
    test("returns min of numbers", function () {
        var result = min([12, 543, 921, -43, 34]);
        expect(result).toBe(-43);
    });
    test("returns min of valid numbers", function () {
        var result = min([35, 'foo', 921, undefined, -54, null, 65]);
        expect(result).toBe(-54);
    });
    test("returns null for empty array", function () {
        expect(min([])).toBeNull();
    });
    test("returns null for invalid values", function () {
        expect(min(['foo', undefined, null])).toBeNull();
    });
});
describe("aggMax", function () {
    var max = createService().getAggFunc("max");
    test("function exists", function () {
        expect(max).toBeDefined();
    });
    test("returns min of numbers", function () {
        var result = max([12, 543, 921, -43, 34]);
        expect(result).toBe(921);
    });
    test("returns min of valid numbers", function () {
        var result = max([35, 'foo', 634, undefined, -54, null, 65]);
        expect(result).toBe(634);
    });
    test("returns null for empty array", function () {
        expect(max([])).toBeNull();
    });
    test("returns null for invalid values", function () {
        expect(max(['foo', undefined, null])).toBeNull();
    });
});
describe("aggCount", function () {
    var count = createService().getAggFunc("count");
    test("function exists", function () {
        expect(count).toBeDefined();
    });
    test("returns count of elements", function () {
        var result = count([12, "foo", 921, -43, null]);
        expect(result.toNumber()).toBe(5);
        expect(result.toString()).toBe("5");
    });
    test("sums count from group aggregation objects", function () {
        var result = count([14, { value: 12 }, { value: 3 }]);
        expect(result.toNumber()).toBe(16);
    });
});
describe("aggAvg", function () {
    var avg = createService().getAggFunc("avg");
    test("function exists", function () {
        expect(avg).toBeDefined();
    });
    test("returns average of elements", function () {
        var result = avg([5, 15, 34]);
        expect(result.toNumber()).toBe(18);
        expect(result.toString()).toBe("18");
    });
    test("returns average of valid elements", function () {
        var result = avg([5, "foo", 18, undefined, 34, null]);
        expect(result.toNumber()).toBe(19);
    });
    test("calculates average from group aggregation objects", function () {
        var result = avg([16, { count: 3, value: 12 }, { count: 4, value: 32 }]);
        expect(result.toNumber()).toBe(22.5);
    });
    test("returns null for empty array", function () {
        expect(avg([]).toNumber()).toBeNull();
    });
});
