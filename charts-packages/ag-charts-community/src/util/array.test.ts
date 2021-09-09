import { describe, expect, test, it } from "@jest/globals";
import { extent } from "./array";
import { isComparable, isContinuous } from "./value";

describe("extent with isComparable", () => {
    test("returns lowest and highest numbers from list of numbers", () => {
        const result = extent([3, 7, 1, 2, 9, -2], isComparable);
        expect(result![0]).toBe(-2);
        expect(result![1]).toBe(9);
    });

    test("returns undefined for invalid values", () => {
        const result = extent([NaN, null, undefined], isComparable);
        expect(result).toBe(undefined);
    });

    test("returns undefined for empty values", () => {
        const result = extent([], isComparable);
        expect(result).toBe(undefined);
    });

    test("returns same lowest and highest number for single number", () => {
        {
            const result = extent([5], isComparable);
            expect(result![0]).toBe(5);
            expect(result![1]).toBe(5);
        }
        {
            const result = extent([5, {}], isComparable);
            expect(result![0]).toBe(5);
            expect(result![1]).toBe(5);
        }
        {
            const result = extent([5, []], isComparable);
            expect(result![0]).toBe(5);
            expect(result![1]).toBe(5);
        }
        {
            const result = extent([5, undefined], isComparable);
            expect(result![0]).toBe(5);
            expect(result![1]).toBe(5);
        }
        {
            const result = extent([5, NaN], isComparable);
            expect(result![0]).toBe(5);
            expect(result![1]).toBe(5);
        }
    });

    test("returns valid lowest and highest numbers from mixed values", () => {
        const result = extent([undefined, 4, 3, 7, null, {}, 1, 5], isComparable);
        expect(result![0]).toBe(1);
        expect(result![1]).toBe(7);
    });

    test("returns earliest and latest date from list of dates", () => {
        const result = extent([new Date(2019, 8, 13), new Date("03/03/1970"), new Date("05/05/1985")], isComparable);
        expect(result![0]!.getFullYear()).toBe(1970);
        expect(result![1]!.getFullYear()).toBe(2019);
    });

    test("returns same earliest and latest letter for single letter", () => {
        const result = extent(['A'], isComparable);
        expect(result![0]).toBe('A');
        expect(result![1]).toBe('A');
    });

    test("return ['', ''] for empty strings", () => {
        {
            const result = extent([''], isComparable);
            expect(result).toEqual(['', '']);
        }
        {
            const result = extent(['', ''], isComparable);
            expect(result).toEqual(['', '']);
        }
    });

    test("returns earliest and latest letter from list of letters", () => {
        const result = extent(['X', 'A', 'Y', 'Z', 'C', 'B'], isComparable);
        expect(result![0]).toBe('A');
        expect(result![1]).toBe('Z');
    });
});

describe("extent with isContinuous", () => {
    test("returns lowest and highest numbers from list of numbers", () => {
        {
            const result = extent([3, 7, 1, 2, 9, -2], isContinuous);
            expect(result![0]).toBe(-2);
            expect(result![1]).toBe(9);
        }
        {
            const result = extent([0, 13, 10, 19], isContinuous);
            expect(result![0]).toBe(0);
            expect(result![1]).toBe(19);
        }
        {
            const result = extent([null, 0, 13, 10, 19], isContinuous);
            expect(result![0]).toBe(0);
            expect(result![1]).toBe(19);
        }
    });

    test("returns undefined for list of invalid values", () => {
        const result = extent([NaN, null, undefined], isContinuous);
        expect(result).toBe(undefined);
    });

    test("returns undefined for empty list", () => {
        const result = extent([], isContinuous);
        expect(result).toBe(undefined);
    });

    test("returns same lowest and highest number for single number", () => {
        const result = extent([5], isContinuous);
        expect(result![0]).toBe(5);
        expect(result![1]).toBe(5);
    });

    test("returns valid lowest and highest number from mixed values", () => {
        const result = extent([undefined, 4, 3, 7, null, {}, 1, 5], isContinuous);
        expect(result![0]).toBe(1);
        expect(result![1]).toBe(7);
    });

    test("does not coerce objects", () => {
        const result = extent([{ toString: () => "2" }, { toString: () => "1" }], isContinuous);
        expect(result).toBe(undefined);
    });

    test("coerces Dates to numbers", () => {
        const earliest = 5270400000;
        const latest = 1568332800000;

        const result = extent([new Date(earliest), new Date(latest), new Date(1985, 5, 5)], isContinuous, x => +x);

        expect(result![0]).toBe(earliest);
        expect(result![1]).toBe(latest);
    });

    test("returns earliest and latest timestamp for mixed Dates and numbers", () => {
        const earliest = 5270400000;
        const latest = 1568468277000;

        const result = extent([new Date(2019, 7, 20), new Date(earliest), latest, new Date(1985, 5, 5)], isContinuous, x => +x);

        expect(result![0]).toBe(earliest);
        expect(result![1]).toBe(latest);
    });
});