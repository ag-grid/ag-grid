import {
    IAggFuncParams
} from "@ag-grid-community/core";
import { AggFuncService } from "./aggFuncService";
import { GridOptionsWrapper } from "@ag-grid-community/core";

function createService(): AggFuncService {
    const getAggFuncs = jest.fn();
    const gridOptionsWrapper = new GridOptionsWrapper();

    gridOptionsWrapper.getAggFuncs = getAggFuncs;

    const service = new AggFuncService() as any;

    service.gridOptionsWrapper = gridOptionsWrapper;

    return service;
}

function createParams(values: any[]): IAggFuncParams {
    return {
        values: values
    } as IAggFuncParams;
}

describe("aggSum", () => {
    const sum = createService().getAggFunc("sum");

    test("function exists", () => {
        expect(sum).toBeDefined();
    });

    test("returns sum of numbers", () => {
        const result = sum(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(1467);
    });

    test("returns sum of valid numbers", () => {
        const result = sum(createParams([35, 'foo', 921, undefined, -43, null, 65]));

        expect(result).toBe(978);
    });

    test("returns null for empty array", () => {
        expect(sum(createParams([]))).toBeNull();
    });

    test("returns null for invalid values", () => {
        expect(sum(createParams(['foo', undefined, null]))).toBeNull();
    });
});

describe("aggFirst", () => {
    const first = createService().getAggFunc("first");

    test("function exists", () => {
        expect(first).toBeDefined();
    });

    test("returns first element in array", () => {
        const result = first(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(12);
    });

    test("returns null for empty array", () => {
        expect(first(createParams([]))).toBeNull();
    });
});

describe("aggLast", () => {
    const last = createService().getAggFunc("last");

    test("function exists", () => {
        expect(last).toBeDefined();
    });

    test("returns first element in array", () => {
        const result = last(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(34);
    });

    test("returns null for empty array", () => {
        expect(last(createParams([]))).toBeNull();
    });
});

describe("aggMin", () => {
    const min = createService().getAggFunc("min");

    test("function exists", () => {
        expect(min).toBeDefined();
    });

    test("returns min of numbers", () => {
        const result = min(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(-43);
    });

    test("returns min of valid numbers", () => {
        const result = min(createParams([35, 'foo', 921, undefined, -54, null, 65]));

        expect(result).toBe(-54);
    });

    test("returns null for empty array", () => {
        expect(min(createParams([]))).toBeNull();
    });

    test("returns null for invalid values", () => {
        expect(min(createParams(['foo', undefined, null]))).toBeNull();
    });
});

describe("aggMax", () => {
    const max = createService().getAggFunc("max");

    test("function exists", () => {
        expect(max).toBeDefined();
    });

    test("returns min of numbers", () => {
        const result = max(createParams([12, 543, 921, -43, 34]));

        expect(result).toBe(921);
    });

    test("returns min of valid numbers", () => {
        const result = max(createParams([35, 'foo', 634, undefined, -54, null, 65]));

        expect(result).toBe(634);
    });

    test("returns null for empty array", () => {
        expect(max(createParams([]))).toBeNull();
    });

    test("returns null for invalid values", () => {
        expect(max(createParams(['foo', undefined, null]))).toBeNull();
    });
});

describe("aggCount", () => {
    const count = createService().getAggFunc("count");

    test("function exists", () => {
        expect(count).toBeDefined();
    });

    test("returns count of elements", () => {
        const result = count(createParams([12, "foo", 921, -43, null]));

        expect(result.toNumber()).toBe(5);
        expect(result.toString()).toBe("5");
    });

    test("sums count from group aggregation objects", () => {
        const result = count(createParams([14, { value: 12 }, { value: 3 }]));

        expect(result.toNumber()).toBe(16);
    });
});

describe("aggAvg", () => {
    const avg = createService().getAggFunc("avg");

    test("function exists", () => {
        expect(avg).toBeDefined();
    });

    test("returns average of elements", () => {
        const result = avg(createParams([5, 15, 34]));

        expect(result.toNumber()).toBe(18);
        expect(result.toString()).toBe("18");
    });

    test("returns average of valid elements", () => {
        const result = avg(createParams([5, "foo", 18, undefined, 34, null]));

        expect(result.toNumber()).toBe(19);
    });

    test("calculates average from group aggregation objects", () => {
        const result = avg(createParams([16, { count: 3, value: 12 }, { count: 4, value: 32 }]));

        expect(result.toNumber()).toBe(22.5);
    });

    test("returns null for empty array", () => {
        expect(avg(createParams([])).toNumber()).toBeNull();
    });
});
