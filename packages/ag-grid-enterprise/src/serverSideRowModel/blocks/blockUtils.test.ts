import { describe, expect, it } from 'vitest';

import type { RowNode } from 'ag-grid-community';

import { BlockUtils } from './blockUtils';

// createNodeIdPrefix builds the stable id prefix for a block's rows by walking the parent-group keys
// (excluding the root). It is pure, so we exercise it directly on a fabricated parent chain. Previously untested.
describe('BlockUtils.createNodeIdPrefix', () => {
    const blockUtils = Object.create(BlockUtils.prototype) as BlockUtils;
    const createNodeIdPrefix = (node: RowNode | null): string | undefined =>
        (blockUtils as any).createNodeIdPrefix(node);

    // Build a parent chain leaf -> ... -> root(level -1). Keys are given root-first for readability.
    function chain(...keysRootFirst: (string | null)[]): RowNode {
        const root = { level: -1, key: null, parent: null } as unknown as RowNode;
        let parent: RowNode = root;
        for (let i = 0, len = keysRootFirst.length; i < len; ++i) {
            parent = { level: i, key: keysRootFirst[i], parent } as unknown as RowNode;
        }
        return parent;
    }

    it('returns undefined for a root-level node (nothing above the root)', () => {
        const rootLevelNode = { level: -1, key: null, parent: null } as unknown as RowNode;
        expect(createNodeIdPrefix(rootLevelNode)).toBeUndefined();
    });

    it('uses the single group key for a one-level-deep parent', () => {
        expect(createNodeIdPrefix(chain('Ireland'))).toBe('Ireland');
    });

    it('joins nested group keys root-first with hyphens', () => {
        expect(createNodeIdPrefix(chain('Ireland', 'Dublin'))).toBe('Ireland-Dublin');
    });

    it('substitutes the missing-key sentinel for an empty-string key', () => {
        expect(createNodeIdPrefix(chain(''))).toBe('ag-Grid-MissingKey');
        expect(createNodeIdPrefix(chain('Ireland', ''))).toBe('Ireland-ag-Grid-MissingKey');
    });
});
