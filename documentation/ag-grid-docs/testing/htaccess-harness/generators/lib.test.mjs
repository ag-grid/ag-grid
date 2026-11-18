// node --test: the shared generator pieces, and the no-sample abort they give every generator.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { mainExpectations } from './gen-main-expectations.mjs';
import { subsiteExpectations } from './gen-subsite-expectations.mjs';
import { expandHosts, knownFailMarker, synthesises } from './lib.mjs';

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

describe('a parsed rule with no generated sample', () => {
    const GEN_DIR = fileURLToPath(new URL('.', import.meta.url));
    const tmp = () => mkdtempSync(join(tmpdir(), 'htaccess-gen-'));
    /** Runs a generator on `fixture`, with `curated` (TSV text, or none) as the hand-written rows. */
    const generate = (script, fixture, args, curated) => {
        const dir = tmp();
        const input = join(dir, 'input');
        writeFileSync(input, fixture);
        const curatedDir = join(dir, 'curated');
        mkdirSync(curatedDir);
        if (curated) {
            writeFileSync(join(curatedDir, 'curated.tsv'), curated);
        }
        return spawnSync('node', [join(GEN_DIR, script), input, ...args], {
            encoding: 'utf8',
            env: { ...process.env, CURATED_DIR: curatedDir },
        });
    };
    const minRowsOf = (stdout) => Number(stdout.match(/^# @min-rows (\d+)$/m)[1]);
    const rowCount = (stdout) => stdout.split('\n').filter((line) => line && !line.startsWith('#')).length;

    // ^old/[0-9]{2}$ synthesises old/1, which the rule does not match
    const SUBSITE = [
        'RewriteEngine On',
        'RewriteRule "^ok$" "https://www.ag-grid.com/charts/fine/" [R=301,L]',
        'RewriteRule "^old/[0-9]{2}$" "https://www.ag-grid.com/charts/new/" [R=301,L]',
    ].join('\n');
    const MAIN = ['Redirect 301 /a/ /b/', 'RedirectMatch 301 "^/old/[0-9]{2}$" "/new/"'].join('\n');
    const MARKDOWN = JSON.stringify([
        { category: 'c', base: '', kind: 'live', slug: 'page', groups: ['guide/[^/.]+', 'old/[0-9]{2}'] },
    ]);

    for (const [name, script, fixture, args, covering] of [
        [
            'subsite',
            'gen-subsite-expectations.mjs',
            SUBSITE,
            ['--base', '/charts'],
            'www\t/charts/old/12\t301\thttps://www.ag-grid.com/charts/new/\n',
        ],
        ['main', 'gen-main-expectations.mjs', MAIN, [], 'www\t/old/12\t301\t/new/\n'],
        ['markdown', 'gen-markdown-expectations.mjs', MARKDOWN, [], 'www\t/old/12/\t200\t\taccept=md\n'],
    ]) {
        it(`fails the ${name} generator, naming the rule`, () => {
            const result = generate(script, fixture, args);
            assert.equal(result.status, 1, result.stderr);
            assert.match(result.stderr, /no sample could be generated for 1 rule/);
            assert.match(result.stderr, /old\/\[0-9\]\{2\}/);
            assert.equal(result.stdout, '');
        });

        it(`lets the ${name} generator through when a curated row covers the rule, at its full row count`, () => {
            const result = generate(script, fixture, args, covering);
            assert.equal(result.status, 0, result.stderr);
            assert.match(result.stderr, /covered by curated\.tsv:1/);
            assert.ok(rowCount(result.stdout) > 0);
            assert.equal(minRowsOf(result.stdout), rowCount(result.stdout));
        });
    }
});

describe('a redirect that catches a protected live page', () => {
    const GEN_DIR = fileURLToPath(new URL('.', import.meta.url));
    const generateMain = (fixture, args = []) => {
        const dir = mkdtempSync(join(tmpdir(), 'htaccess-gen-'));
        const input = join(dir, 'input');
        writeFileSync(input, fixture);
        const curatedDir = join(dir, 'curated');
        mkdirSync(curatedDir);
        return spawnSync('node', [join(GEN_DIR, 'gen-main-expectations.mjs'), input, ...args], {
            encoding: 'utf8',
            env: { ...process.env, CURATED_DIR: curatedDir },
        });
    };

    for (const [name, fixture, args, page] of [
        ['root', 'Redirect 301 /angular-data-grid/grid-api/ /wrong/', [], '/angular-data-grid/grid-api/'],
        [
            'archive',
            'RedirectMatch 301 "^/archive/36\\.2\\.0/react-data-grid/components/$" "/wrong/"',
            ['--base', '/archive/36.2.0'],
            '/archive/36.2.0/react-data-grid/components/',
        ],
    ]) {
        it(`fails the ${name} generator, naming the page and the rule`, () => {
            const result = generateMain(fixture, args);
            assert.equal(result.status, 1, result.stderr);
            assert.ok(result.stderr.includes(page), result.stderr);
            assert.ok(result.stderr.includes(fixture), result.stderr);
            assert.equal(result.stdout, '');
        });
    }

    it('still asserts every protected page as 200 when no rule catches one', () => {
        const result = generateMain('Redirect 301 /a/ /b/');
        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, /^www\t\/angular-data-grid\/grid-api\/\t200\b/m);
    });
});

describe('a single-hop request that an alias rule also generates', () => {
    const GEN_DIR = fileURLToPath(new URL('.', import.meta.url));
    const FIXTURE = [
        'RewriteRule "^/?javascript-grid/$" "https://www.ag-grid.com/javascript-data-grid/getting-started/" [R=301,L]',
        'Redirect 301 /javascript-grid/ /javascript-data-grid/getting-started/',
    ].join('\n');

    it('keeps the hops=1 assertion for the www request', () => {
        const dir = mkdtempSync(join(tmpdir(), 'htaccess-gen-'));
        const input = join(dir, 'input');
        writeFileSync(input, FIXTURE);
        mkdirSync(join(dir, 'curated'));
        const result = spawnSync('node', [join(GEN_DIR, 'gen-main-expectations.mjs'), input], {
            encoding: 'utf8',
            env: { ...process.env, CURATED_DIR: join(dir, 'curated') },
        });
        assert.equal(result.status, 0, result.stderr);
        const www = result.stdout.split('\n').filter((line) => line.startsWith('www\t/javascript-grid/\t'));
        assert.ok(
            www.some((line) => line.split('\t').includes('hops=1')),
            www.join('\n')
        );
    });
});

describe('expandHosts', () => {
    it('lists every host of a nested alternation, an optional group included', () => {
        assert.deepEqual(
            expandHosts('^(?:ag-grid\\.com|(?:blog|react-grid)\\.ag-grid\\.com|(?:www\\.)?angulargrid\\.com)$'),
            ['ag-grid.com', 'blog.ag-grid.com', 'react-grid.ag-grid.com', 'angulargrid.com', 'www.angulargrid.com']
        );
    });

    it('refuses a pattern it cannot enumerate, rather than returning a short list', () => {
        assert.throws(() => expandHosts('^(?:.*\\.ag-grid\\.com)$'), /unsupported/);
        assert.throws(() => expandHosts('ag-grid\\.com'), /anchored/);
    });
});

describe('the first hop on an alias host', () => {
    const ALIAS_COND =
        '    RewriteCond %{HTTP_HOST}:%{SERVER_PORT} ^(?:www\\.ag-grid\\.com:80|(?:ag-grid\\.com|react-grid\\.ag-grid\\.com):[0-9]+)$ [NC]';
    const main = mainExpectations(
        [
            '    RewriteRule "^/?old-page/$" "https://www.ag-grid.com/new-page/" [R=301,L]',
            ALIAS_COND,
            'Redirect 301 /legacy /current',
        ].join('\n')
    );

    it('lists www, then the alias hosts the root file names', () => {
        assert.deepEqual(main.hosts, ['www.ag-grid.com', 'ag-grid.com', 'react-grid.ag-grid.com']);
    });

    it('applies the single-hop rewrites on the apex only', () => {
        const target = { status: 301, location: 'https://www.ag-grid.com/new-page/' };
        assert.deepEqual(main.firstHop('ag-grid.com', '/old-page/'), target);
        assert.deepEqual(main.firstHop('react-grid.ag-grid.com', '/old-page/'), {
            status: 301,
            location: 'https://www.ag-grid.com/old-page/',
        });
    });

    it('adds the slash with the host swap for a slash-less directory URL, and keeps a file as it is', () => {
        assert.deepEqual(main.firstHop('react-grid.ag-grid.com', '/legacy'), {
            status: 301,
            location: 'https://www.ag-grid.com/legacy/',
        });
        assert.deepEqual(main.firstHop('react-grid.ag-grid.com', '/feed.xml'), {
            status: 301,
            location: 'https://www.ag-grid.com/feed.xml',
        });
    });

    it('answers www with the rules themselves', () => {
        assert.deepEqual(main.firstHop('www.ag-grid.com', '/legacy/'), { status: 301, location: '/current/' });
    });

    it('refuses a host the root file does not name', () => {
        assert.throws(() => main.firstHop('blog.ag-grid.com', '/legacy/'), /not an alias host/);
    });

    it("gives each rule its www samples, with the rule's own answer", () => {
        assert.deepEqual(main.rules.find((r) => r.rule.startsWith('Redirect 301 /legacy')).samples, [
            { path: '/legacy', status: 301, location: '/legacy/' },
            { path: '/legacy/', status: 301, location: '/current/' },
        ]);
    });

    it('sends a subsite redirect to its final page on every host, and swaps the host of anything else', () => {
        const subsite = subsiteExpectations(
            [
                'RewriteRule "^old/?$" "https://www.ag-grid.com/charts/new/" [R=301,L]',
                '    RewriteCond %{HTTP_HOST} ^(?:ag-grid\\.com|(?:blog|react-grid)\\.ag-grid\\.com)$ [NC]',
            ].join('\n'),
            { base: '/charts' }
        );
        assert.deepEqual(subsite.hosts, [
            'www.ag-grid.com',
            'ag-grid.com',
            'blog.ag-grid.com',
            'react-grid.ag-grid.com',
        ]);
        for (const host of subsite.hosts) {
            assert.deepEqual(subsite.firstHop(host, '/charts/old'), {
                status: 301,
                location: 'https://www.ag-grid.com/charts/new/',
            });
        }
        assert.deepEqual(subsite.firstHop('react-grid.ag-grid.com', '/charts/page/'), {
            status: 301,
            location: 'https://www.ag-grid.com/charts/page/',
        });
        assert.equal(subsite.firstHop('www.ag-grid.com', '/charts/page/'), null);
    });
});

describe('a made-up sample', () => {
    it('is one whose pattern needs a wildcard filled in', () => {
        assert.equal(synthesises('^/old/(.*)$'), true);
        assert.equal(synthesises('^/v[0-9]+/$'), true);
        assert.equal(synthesises('^/forum/$'), false);
        assert.equal(synthesises('^/(?:react|vue)/whats-new/?$'), false);
    });

    it('is marked synthetic in the model, so no page is expected at the end of its chain', () => {
        const main = mainExpectations(
            ['Redirect 301 /renamed/ /current/', 'RedirectMatch 301 "^/legacy/(.*)$" "/current/$1"'].join('\n')
        );
        const synthetic = (rule) =>
            main.rules.find((r) => r.rule.includes(rule)).samples.map((s) => [s.path, Boolean(s.synthetic)]);
        assert.deepEqual(synthetic('/renamed/'), [
            ['/renamed/', false],
            ['/renamed/child/', true],
        ]);
        assert.deepEqual(synthetic('legacy'), [
            ['/legacy/sample', true],
            ['/legacy/sample/', true],
        ]);
    });
});
