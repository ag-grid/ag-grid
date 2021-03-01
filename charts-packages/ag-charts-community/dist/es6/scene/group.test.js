import { Rect } from "./shape/rect";
import { Group } from "./group";
test('insertBefore', function () {
    var group = new Group();
    var node1 = new Rect();
    var node2 = new Rect();
    var node3 = new Rect();
    var node4 = new Rect();
    var node5 = new Rect();
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
