// node --test: the shared generator pieces.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { knownFailMarker } from './lib.mjs';

describe('knownFailMarker', () => {
    it('names only the assertions whose answer differs', () => {
        assert.equal(
            knownFailMarker('ref', { status: 301, loc: '/a/' }, { status: 301, loc: '/a//' }),
            'known-fail=location:ref'
        );
        assert.equal(
            knownFailMarker('ref', { status: 410, loc: '' }, { status: 301, loc: '/b/' }),
            'known-fail=status,location:ref'
        );
    });

    it('names the redirect no-cache check when Apache does not redirect at all', () => {
        assert.equal(
            knownFailMarker('ref', { status: 301, loc: '/a/' }, { status: 410, loc: '' }),
            'known-fail=status,location,cc:ref'
        );
    });

    it('marks nothing when the answers agree', () => {
        assert.equal(knownFailMarker('ref', { status: 301, loc: '/a/' }, { status: 301, loc: '/a/' }), null);
    });
});
