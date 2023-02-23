import { expect, test } from '@jest/globals';
import { Rect } from './shape/rect';
import { Group } from './group';

test('isNode', () => {
    const rect = new Rect();

    expect(Rect.isNode(rect)).toBe(true);
    expect(Rect.isNode({})).toBe(false);
    expect(Rect.isNode(5)).toBe(false);
    expect(Rect.isNode(null as any)).toBe(false);
    expect(Rect.isNode(undefined as any)).toBe(false);
});

test('nextSibling', () => {
    const group = new Group();
    const node1 = new Rect();
    const node2 = new Rect();
    const node3 = new Rect();

    group.append([node1, node2, node3]);

    expect(node1.nextSibling).toBe(node2);
    expect(node2.nextSibling).toBe(node3);
    expect(node1.nextSibling && node1.nextSibling.nextSibling).toBe(node3);
});
