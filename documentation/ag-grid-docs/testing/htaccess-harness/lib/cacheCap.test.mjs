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

test('the cap fails a cacheable response left to a heuristic lifetime', () => {
    const lastModified = { 'last-modified': ['Thu, 01 Jan 2015 00:00:00 GMT'] };
    for (const status of [200, 206, 301, 404]) {
        assert.match(browserCacheViolation(lastModified, status), /heuristically cacheable/, String(status));
    }
    // Not when anything explicit is there, nor without a Last-Modified, nor on a status that is
    // not cacheable by default.
    assert.equal(browserCacheViolation({ ...lastModified, 'cache-control': ['no-cache'] }, 200), null);
    assert.equal(browserCacheViolation({ ...lastModified, expires: ['0'] }, 200), null);
    assert.equal(browserCacheViolation({}, 200), null);
    for (const status of [302, 304, 307, 403, 500]) {
        assert.equal(browserCacheViolation(lastModified, status), null, String(status));
    }
});
