import { Rect } from "./shape/rect";
test('isNode', function () {
    var rect = new Rect();
    expect(Rect.isNode(rect)).toBe(true);
    expect(Rect.isNode({})).toBe(false);
    expect(Rect.isNode(5)).toBe(false);
    expect(Rect.isNode(null)).toBe(false);
    expect(Rect.isNode(undefined)).toBe(false);
});
