"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rect_1 = require("./shape/rect");
var group_1 = require("./group");
test('insertBefore', function () {
    var group = new group_1.Group();
    var node1 = new rect_1.Rect();
    var node2 = new rect_1.Rect();
    var node3 = new rect_1.Rect();
    var node4 = new rect_1.Rect();
    var node5 = new rect_1.Rect();
    group.append([node1, node2, node3]);
    group.insertBefore(node4, node2);
    {
        var children = group.children;
        expect(children[0]).toBe(node1);
        expect(children[1]).toBe(node4);
        expect(children[2]).toBe(node2);
        expect(children[3]).toBe(node3);
    }
    group.insertBefore(node5);
    {
        var children = group.children;
        expect(children[0]).toBe(node1);
        expect(children[1]).toBe(node4);
        expect(children[2]).toBe(node2);
        expect(children[3]).toBe(node3);
        expect(children[4]).toBe(node5);
    }
    // simulating insertAfter
    group.insertBefore(node4, node3.nextSibling);
    {
        var children = group.children;
        expect(children[0]).toBe(node1);
        expect(children[1]).toBe(node2);
        expect(children[2]).toBe(node3);
        expect(children[3]).toBe(node4);
        expect(children[4]).toBe(node5);
    }
});
//# sourceMappingURL=group.test.js.map