import assert from 'node:assert/strict';
import { test } from 'node:test';

import { browserCacheViolation } from './cacheCap.mjs';

const DATE = 'Thu, 01 Oct 2026 00:00:00 GMT';

test('the cap passes 7 days, no-cache and any s-maxage', () => {
    for (const cc of [
        'public, max-age=604800, s-maxage=31536000',
        'no-cache',
        'public, max-age=86400',
        's-maxage=999999999',
    ]) {
        assert.equal(browserCacheViolation({ 'cache-control': [cc] }), null, cc);
    }
    assert.equal(browserCacheViolation({ date: [DATE], expires: ['Thu, 08 Oct 2026 00:00:00 GMT'] }), null);
    assert.equal(browserCacheViolation({}), null);
});

test('the cap fails a max-age over 7 days, wherever it sits', () => {
    assert.match(
        browserCacheViolation({ 'cache-control': ['public, max-age=31536000, immutable'] }),
        /max-age=31536000/
    );
    assert.match(browserCacheViolation({ 'cache-control': ['no-cache', 's-maxage=1, max-age=604801'] }), /604801/);
});

test('the cap fails an Expires more than 7 days after Date', () => {
    assert.match(
        browserCacheViolation({ date: [DATE], expires: ['Fri, 01 Oct 2027 00:00:00 GMT'] }),
        /Expires is \d+s after Date/
    );
});
