import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RowNode } from 'ag-grid-community';

import { LazyCache } from './lazyCache';

// isNodeCached decides which nodes survive block-cache eviction (purgeExcessRows). Beyond expanded groups,
// focused rows and unbalanced group nodes, a row that is currently being edited must also be retained —
// otherwise scrolling far enough to evict its block destroys the in-progress edit state and popup (AG-14958).
describe('LazyCache.isNodeCached (retention rules)', () => {
    let cache: LazyCache;
    let isRowEditing: ReturnType<typeof vi.fn>;
    let groupAllowUnbalanced: boolean;
    let focused: boolean;

    function isNodeCached(node: Partial<RowNode>): boolean {
        return (cache as any).isNodeCached(node);
    }

    beforeEach(() => {
        isRowEditing = vi.fn().mockReturnValue(false);
        groupAllowUnbalanced = false;
        focused = false;

        // Bypass the BeanStub constructor; inject only what isNodeCached reads.
        cache = Object.create(LazyCache.prototype) as LazyCache;
        (cache as any).gos = {
            get: (key: string) => (key === 'groupAllowUnbalanced' ? groupAllowUnbalanced : undefined),
        };
        (cache as any).beans = { editSvc: { isRowEditing } };
        (cache as any).isNodeFocused = () => focused;
    });

    const plainNode = (): Partial<RowNode> =>
        ({ isExpandable: () => false, expanded: false, key: 'a' }) as unknown as Partial<RowNode>;

    it('does not retain an ordinary, idle row', () => {
        expect(isNodeCached(plainNode())).toBe(false);
    });

    it('retains an expanded group so collapsing rows below do not jump', () => {
        expect(isNodeCached({ isExpandable: () => true, expanded: true, key: 'g' } as any)).toBe(true);
    });

    it('retains a focused row', () => {
        focused = true;
        expect(isNodeCached(plainNode())).toBe(true);
    });

    it('retains an unbalanced (empty-key) group when groupAllowUnbalanced is on', () => {
        groupAllowUnbalanced = true;
        expect(isNodeCached({ isExpandable: () => false, expanded: false, key: '' } as any)).toBe(true);
    });

    // AG-14958
    it('retains a row that is currently being edited', () => {
        isRowEditing.mockReturnValue(true);
        const node = plainNode();
        expect(isNodeCached(node)).toBe(true);
        expect(isRowEditing).toHaveBeenCalledWith(node);
    });

    it('does not retain when there is no edit service', () => {
        (cache as any).beans = {};
        expect(isNodeCached(plainNode())).toBe(false);
    });
});
