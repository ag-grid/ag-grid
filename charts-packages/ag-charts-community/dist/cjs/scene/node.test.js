"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rect_1 = require("./shape/rect");
var group_1 = require("./group");
test('isNode', function () {
    var rect = new rect_1.Rect();
    expect(rect_1.Rect.isNode(rect)).toBe(true);
    expect(rect_1.Rect.isNode({})).toBe(false);
    expect(rect_1.Rect.isNode(5)).toBe(false);
    expect(rect_1.Rect.isNode(null)).toBe(false);
    expect(rect_1.Rect.isNode(undefined)).toBe(false);
});
test('nextSibling', function () {
    var group = new group_1.Group();
    var node1 = new rect_1.Rect();
    var node2 = new rect_1.Rect();
    var node3 = new rect_1.Rect();
    group.append([node1, node2, node3]);
    expect(node1.nextSibling).toBe(node2);
    expect(node2.nextSibling).toBe(node3);
    expect(node1.nextSibling.nextSibling).toBe(node3);
});
//# sourceMappingURL=node.test.js.map