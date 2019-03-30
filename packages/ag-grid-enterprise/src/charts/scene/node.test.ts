import { Rect } from "./shape/rect";

test('isNode', () => {
    const rect = new Rect();

    expect(Rect.isNode(rect)).toBe(true);
    expect(Rect.isNode({})).toBe(false);
    expect(Rect.isNode(5)).toBe(false);
    expect(Rect.isNode(null as any)).toBe(false);
    expect(Rect.isNode(undefined as any)).toBe(false);
});
