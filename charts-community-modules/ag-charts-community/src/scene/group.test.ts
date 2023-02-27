import { expect, test } from '@jest/globals';
import { Rect } from './shape/rect';
import { Group } from './group';

test('insertBefore', () => {
    const group = new Group();
    const node1 = new Rect();
    const node2 = new Rect();
    const node3 = new Rect();
    const node4 = new Rect();
    const node5 = new Rect();

    group.append([node1, node2, node3]);

    group.insertBefore(node4, node2);

    {
        const children = group.children;
        expect(children[0]).toBe(node1);
        expect(children[1]).toBe(node4);
        expect(children[2]).toBe(node2);
        expect(children[3]).toBe(node3);
    }

    group.insertBefore(node5);

    {
        const children = group.children;
        expect(children[0]).toBe(node1);
        expect(children[1]).toBe(node4);
        expect(children[2]).toBe(node2);
        expect(children[3]).toBe(node3);
        expect(children[4]).toBe(node5);
    }

    // simulating insertAfter

    const nextSibling = group.children[group.children.indexOf(node3) + 1];
    group.insertBefore(node4, nextSibling);

    {
        const children = group.children;
        expect(children[0]).toBe(node1);
        expect(children[1]).toBe(node2);
        expect(children[2]).toBe(node3);
        expect(children[3]).toBe(node4);
        expect(children[4]).toBe(node5);
    }
});
