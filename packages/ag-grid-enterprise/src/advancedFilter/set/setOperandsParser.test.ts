import { SET_TREE_SEPARATOR, joinSetPath } from './setOperandsParser';

describe('SET_TREE_SEPARATOR', () => {
    // Pinned because it is mirrored by a docs example spec that cannot import it:
    // documentation/ag-grid-docs/src/content/docs/filter-advanced/_examples/set-filters/example.spec.ts.
    // If this test fails, update that spec's local constant in the same change.
    test('is a single right-pointing angle quotation mark (U+203A)', () => {
        expect(SET_TREE_SEPARATOR).toBe('›');
    });

    test('joins a tree path with the separator surrounded by single spaces', () => {
        expect(joinSetPath(['2000', 'January', '1'])).toBe('2000 › January › 1');
    });
});
