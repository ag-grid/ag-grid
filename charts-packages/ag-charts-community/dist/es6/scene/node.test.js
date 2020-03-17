import { Rect } from "./shape/rect";
import { Group } from "./group";
test('isNode', function () {
    var rect = new Rect();
    expect(Rect.isNode(rect)).toBe(true);
    expect(Rect.isNode({})).toBe(false);
    expect(Rect.isNode(5)).toBe(false);
    expect(Rect.isNode(null)).toBe(false);
    expect(Rect.isNode(undefined)).toBe(false);
});
test('nextSibling', function () {
    var group = new Group();
    var node1 = new Rect();
    var node2 = new Rect();
    var node3 = new Rect();
    group.append([node1, node2, node3]);
    expect(node1.nextSibling).toBe(node2);
    expect(node2.nextSibling).toBe(node3);
    expect(node1.nextSibling.nextSibling).toBe(node3);
});
