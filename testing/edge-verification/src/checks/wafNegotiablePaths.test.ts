import { strict as assert } from 'node:assert';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { CF_ACL } from '../expected/edge';

/**
 * block-datacenter-except-agent-paths honours Accept: text/markdown only on the paths its regexes
 * list, which copy the origin's negotiation conditions. When the docs gain a negotiable page and
 * the regexes do not, the WAF quietly blocks agents on data-centre IPs from its markdown. This
 * test holds the regexes to the grid's page registry, GRID_MARKDOWN_PAGE_GROUPS, which is what
 * the .htaccess generator derives its negotiation condition from.
 *
 * The registry is loaded at run time from the docs source in this repo, not imported statically:
 * it is plain TypeScript with relative imports, so tsx loads it without a docs build, while a
 * static import would pull the docs package (and its Vite-only types) into this package's type
 * check. Charts and studio keep their registries in their own repos, so their two regexes cannot
 * be held to them from here.
 */

const REGISTRY = resolve(__dirname, '../../../../documentation/ag-grid-docs/src/utils/markdownPages.ts');
const ARCHIVE = '/archive/36.2.0';

/**
 * Every string a registry pattern matches, with each `[^/.]+` standing for one sample segment.
 * The registry uses only alternation, groups (capturing or not), `?` after a group, and `[^/.]+`;
 * anything else is refused, so a new construct fails here rather than being expanded wrongly.
 */
function expand(pattern: string): string[] {
    let i = 0;
    const alternation = (): string[] => {
        const out = [...sequence()];
        while (pattern[i] === '|') {
            i++;
            out.push(...sequence());
        }
        return out;
    };
    const sequence = (): string[] => {
        let acc = [''];
        while (i < pattern.length && pattern[i] !== '|' && pattern[i] !== ')') {
            let atom: string[];
            if (pattern[i] === '(') {
                i += pattern.startsWith('(?:', i) ? 3 : 1;
                atom = alternation();
                assert.equal(pattern[i], ')', `unbalanced group in ${pattern}`);
                i++;
            } else if (pattern.startsWith('[^/.]+', i)) {
                i += 6;
                atom = ['sample-page'];
            } else {
                assert.ok(!/[[\]\\*+.{}^$]/.test(pattern[i]), `unsupported regex construct at ${i} in ${pattern}`);
                atom = [pattern[i++]];
            }
            if (pattern[i] === '?') {
                i++;
                atom = ['', ...atom];
            }
            acc = acc.flatMap((a) => atom.map((b) => a + b));
        }
        return acc;
    };
    const out = alternation();
    assert.equal(i, pattern.length, `could not read ${pattern}`);
    return out;
}

async function negotiablePaths(): Promise<string[]> {
    const { GRID_MARKDOWN_PAGE_GROUPS } = await import(pathToFileURL(REGISTRY).href);
    const groups: Array<{ pattern?: string }> = GRID_MARKDOWN_PAGE_GROUPS;
    assert.ok(groups.length > 1, 'the page registry is empty');
    const pages = groups.flatMap((g) => (g.pattern ? expand(g.pattern) : []));
    // Each page live and archived, with and without its slash; the homepage (the group with no
    // pattern, negotiated by its own rule) only slashed, as the archive root's add-slash runs first.
    return [
        '/',
        `${ARCHIVE}/`,
        ...pages.flatMap((page) => [`/${page}`, `/${page}/`, `${ARCHIVE}/${page}`, `${ARCHIVE}/${page}/`]),
    ];
}

const exempt = (path: string, regexes = CF_ACL.dataCentreMarkdownPaths): boolean =>
    regexes.some((rx) => new RegExp(rx).test(path));

describe('the data-centre markdown exemption covers every negotiable grid page', () => {
    it('reads the registry patterns it is meant to', () => {
        assert.deepEqual(expand('a(?:/(?:b|c))?|d/[^/.]+'), ['a', 'a/b', 'a/c', 'd/sample-page']);
        assert.throws(() => expand('a.*'), /unsupported/);
    });

    it('every page shape the origin negotiates matches one of the regexes', async () => {
        const paths = await negotiablePaths();
        const missed = paths.filter((p) => !exempt(p));
        assert.deepEqual(missed, [], `not exempt, though the origin negotiates them: ${missed.join(', ')}`);
    });

    it('names the pages a regex has lost', async () => {
        const paths = await negotiablePaths();
        const without = CF_ACL.dataCentreMarkdownPaths.map((rx) => rx.replace('|theme-builder', ''));
        const missed = paths.filter((p) => !exempt(p, without));
        assert.deepEqual(missed, [
            '/theme-builder',
            '/theme-builder/',
            `${ARCHIVE}/theme-builder`,
            `${ARCHIVE}/theme-builder/`,
        ]);
    });

    it('assets and other paths stay unexempt', () => {
        for (const path of ['/_astro/index.js', '/images/logo.png', '/react-data-grid/x.json', '/blog/post/']) {
            assert.ok(!exempt(path), `${path} is exempt`);
        }
    });
});
