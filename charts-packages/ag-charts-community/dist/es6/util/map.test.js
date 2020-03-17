import { convertToMap } from "./map";
describe("convertToMap", function () {
    test("returns empty map for empty array", function () {
        var map = convertToMap([]);
        expect(map).not.toBeUndefined();
        expect(map.size).toBe(0);
    });
    test("returns map with all supplied values", function () {
        var firstPair = ['foo', 123];
        var secondPair = ['bar', 456];
        var map = convertToMap([firstPair, secondPair]);
        expect(map).not.toBeUndefined();
        expect(map.size).toBe(2);
        expect(map.get(firstPair[0])).toBe(firstPair[1]);
        expect(map.get(secondPair[0])).toBe(secondPair[1]);
    });
});
