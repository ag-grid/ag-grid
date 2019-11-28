import { convertToMap } from "./map";

describe("convertToMap", () => {
    test("returns empty map for empty array", () => {
        const map = convertToMap([]);

        expect(map).not.toBeUndefined();
        expect(map.size).toBe(0);
    });

    test("returns map with all supplied values", () => {
        const firstPair: [string, number] = ['foo', 123];
        const secondPair: [string, number] = ['bar', 456];

        const map = convertToMap([firstPair, secondPair]);

        expect(map).not.toBeUndefined();
        expect(map.size).toBe(2);
        expect(map.get(firstPair[0])).toBe(firstPair[1]);
        expect(map.get(secondPair[0])).toBe(secondPair[1]);
    });
});
