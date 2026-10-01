import { strict as assert } from 'node:assert';

import { cfPatternMatches, selectBehaviour } from './cfPattern';
import { twinOf } from './html';
import { isAllowed, parseRobots, robotsPatternMatches } from './robots';
import { applyTransforms } from './waf';

/**
 * Offline assertions for the pure logic the live checks depend on. Runs before any request, so
 * a broken matcher cannot silently turn a real failure into a pass (or a markdown probe into a
 * cache-poisoning request).
 */
export function selfTest(): void {
    // CloudFront patterns
    assert.ok(cfPatternMatches('*/_astro/*', '/_astro/a.css'), '*/_astro/* matches the root /_astro/');
    assert.ok(cfPatternMatches('*/_astro/*', '/charts/_astro/a.css'));
    assert.ok(!cfPatternMatches('/example/', '/example/x'));
    assert.ok(cfPatternMatches('/example/*', '/example/'), '/example/* also matches the bare /example/');
    assert.ok(cfPatternMatches('images/*', '/images/a.png'), 'leading slash optional');
    assert.ok(!cfPatternMatches('/Images/*', '/images/a.png'), 'case-sensitive');
    assert.ok(cfPatternMatches('/a?c', '/abc') && !cfPatternMatches('/a?c', '/ac'));
    assert.ok(
        cfPatternMatches('/robots.txt', '/robots.txt') && !cfPatternMatches('/robots.txt', '/robotsXtxt'),
        'dot is literal'
    );
    assert.equal(selectBehaviour(['/example/', '/example/*'], '/example/'), 0, 'first match wins');
    assert.equal(selectBehaviour(['/example/*'], '/react-data-grid/'), -1, 'default behaviour');

    // robots.txt
    const r = parseRobots(
        [
            'User-agent: *',
            'Allow: /',
            'Disallow: /archive/',
            'Allow: /archive/$',
            'Disallow: /*searchQuery=',
            'Disallow: /charts/*/benchmarks/',
            '',
            'User-agent: GPTBot',
            'User-agent: ClaudeBot',
            'Allow: /',
            'Disallow: /debug/',
            'Sitemap: https://example.com/s.xml',
        ].join('\n')
    );
    assert.equal(r.groups.length, 2);
    assert.deepEqual(r.groups[1].agents, ['GPTBot', 'ClaudeBot']);
    assert.deepEqual(r.sitemaps, ['https://example.com/s.xml']);
    assert.ok(!isAllowed(r, 'Googlebot', '/archive/1.0/').allowed);
    assert.ok(isAllowed(r, 'Googlebot', '/archive/').allowed, 'longer Allow with $ wins for the exact URL');
    assert.ok(isAllowed(r, 'gptbot', '/archive/1.0/').allowed, 'named group, case-insensitive, no inheritance from *');
    assert.ok(!isAllowed(r, 'Googlebot', '/changelog/?searchQuery=x').allowed);
    assert.ok(!isAllowed(r, 'Googlebot', '/charts/react/benchmarks/').allowed);
    assert.ok(robotsPatternMatches('/a$', '/a') && !robotsPatternMatches('/a$', '/ab'));
    const tie = parseRobots('User-agent: *\nDisallow: /x\nAllow: /x\n');
    assert.ok(isAllowed(tie, 'bot', '/x').allowed, 'Allow wins a tie');

    // WAF transforms
    assert.equal(applyTransforms('/%2Eenv', ['LOWERCASE', 'URL_DECODE']), '/.env');

    // markdown twins
    assert.equal(twinOf('https://www.ag-grid.com/'), 'https://www.ag-grid.com/index.md');
    assert.equal(twinOf('https://www.ag-grid.com/charts/'), 'https://www.ag-grid.com/charts/index.md');
    assert.equal(twinOf('https://www.ag-grid.com/a/b/'), 'https://www.ag-grid.com/a/b.md');
    assert.equal(twinOf('https://www.ag-grid.com/llms.txt'), undefined);
    assert.equal(twinOf('https://github.com/ag-grid/ag-mcp'), undefined);
}
