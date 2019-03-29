import { extent } from "./array";

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
        const result = extent([new Date(), new Date('03/03/1970'), new Date('05/05/1985')]);
        expect(result[0]!.getFullYear()).toBe(1970);
        expect(result[1]!.getFullYear()).toBe(2019);
    }

    {
        const result = extent(['X', 'A', 'Y', 'Z', 'C', 'B']);
        expect(result[0]).toBe('A');
        expect(result[1]).toBe('Z');
    }
});
