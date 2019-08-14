import { extent, numericExtent } from "./array";

test('extent', () => {
    {
        const result = extent([3, 7, 1, 2, 9, -2]);
        expect(result[0]).toBe(-2);
        expect(result[1]).toBe(9);
    }

    {
        const result = extent([NaN, null, undefined]);
        expect(result[0]).toBe(undefined);
        expect(result[1]).toBe(undefined);
    }

    {
        const result = extent([]);
        expect(result[0]).toBe(undefined);
        expect(result[1]).toBe(undefined);
    }

    {
        const result = extent([5]);
        expect(result[0]).toBe(5);
        expect(result[1]).toBe(5);
    }

    {
        const result = extent([undefined, 4, 3, 7, null, {}, 1, 5]);
        expect(result[0]).toBe(1);
        expect(result[1]).toBe(7);
    }

    {
        const result = extent([new Date(), new Date('03/03/1970'), new Date('05/05/1985')]);
        expect(result[0]!.getFullYear()).toBe(1970);
        expect(result[1]!.getFullYear()).toBe(2019);
    }

    {
        const result = extent(['A']);
        expect(result[0]).toBe('A');
        expect(result[1]).toBe('A');
    }

    {
        const result = extent(['X', 'A', 'Y', 'Z', 'C', 'B']);
        expect(result[0]).toBe('A');
        expect(result[1]).toBe('Z');
    }
});

test('numericExtent', () => {
    {
        const result = numericExtent([3, 7, 1, 2, 9, -2]);
        expect(result![0]).toBe(-2);
        expect(result![1]).toBe(9);
    }

    {
        const result = numericExtent([NaN, null, undefined]);
        expect(result).toBe(undefined);
    }

    {
        const result = numericExtent([]);
        expect(result).toBe(undefined);
    }

    {
        const result = numericExtent([5]);
        expect(result![0]).toBe(5);
        expect(result![1]).toBe(5);
    }

    {
        const result = numericExtent([undefined, 4, 3, 7, null, {}, 1, 5]);
        expect(result![0]).toBe(1);
        expect(result![1]).toBe(7);
    }
});
