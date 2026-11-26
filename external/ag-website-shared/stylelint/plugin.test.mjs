import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import stylelint from 'stylelint';
import { describe, expect, test, vi } from 'vitest';

import { createWebsiteStylelintConfig } from './config.mjs';
import plugin from './plugin.mjs';

const websiteRoot = mkdtempSync(join(tmpdir(), 'ag-website-stylelint-'));
mkdirSync(join(websiteRoot, 'src'));
writeFileSync(
    join(websiteRoot, 'src/tokens.scss'),
    `:root {
        --color-fg-primary: #000;
        --text-fs-base:16px;
        // --color-fg-line-comment: #000;
        /* --color-fg-block-comment: #000; */

        @media (prefers-color-scheme: dark) {
            --color-util-nested : #fff;
        }
    }`
);

const tokenSources = [`${websiteRoot}/src/**/*.{scss,css}`];

function pluginConfig(rules) {
    return { customSyntax: 'postcss-scss', plugins: plugin, rules };
}

async function lint(code, config, codeFilename = join(websiteRoot, 'src/test.module.scss')) {
    const {
        results: [result],
    } = await stylelint.lint({ code, codeFilename, config });
    return result;
}

async function warningsFor(code, config) {
    return (await lint(code, config)).warnings.map(({ rule, severity, text }) => ({ rule, severity, text }));
}

describe('ag-website/no-undeclared-token', () => {
    const config = pluginConfig({ 'ag-website/no-undeclared-token': [true, { tokenSources }] });

    test('flags a design system token that no stylesheet declares', async () => {
        expect(await warningsFor('.a { color: var(--color-fg-missing); }', config)).toEqual([
            {
                rule: 'ag-website/no-undeclared-token',
                severity: 'error',
                text: 'var(--color-fg-missing) is not declared in the design system or any website stylesheet. (ag-website/no-undeclared-token)',
            },
        ]);
    });

    test('flags a doubled hyphen with its own message, whatever the namespace', async () => {
        const warnings = await warningsFor('.a { color: var(---color-fg-primary); gap: var(--btn--gap); }', config);

        expect(warnings.map(({ text }) => text)).toEqual([
            'var(---color-fg-primary) has a doubled hyphen, which is not a valid design system token name. (ag-website/no-undeclared-token)',
            'var(--btn--gap) has a doubled hyphen, which is not a valid design system token name. (ag-website/no-undeclared-token)',
        ]);
    });

    test.each`
        description                             | code
        ${'a declared token'}                   | ${'.a { color: var(--color-fg-primary); font-size: var(--text-fs-base); }'}
        ${'a token declared inside an at-rule'} | ${'.a { color: var(--color-util-nested); }'}
        ${'a component-local variable'}         | ${'.a { color: var(--btn-roll-i); }'}
        ${'a token declared in the same file'}  | ${'.a { --layout-local: 1px; } .b { gap: var(--layout-local); }'}
        ${'a Sass-interpolated token name'}     | ${'.a { color: var(--color-code-#{$name}); }'}
        ${'a var() inside a Sass map'}          | ${'$m: (a: 1); .a { color: map-get($m, a); }'}
    `('allows $description', async ({ code }) => {
        expect(await warningsFor(code, config)).toEqual([]);
    });

    test.each`
        token
        ${'--color-fg-line-comment'}
        ${'--color-fg-block-comment'}
    `('flags $token, which is only declared in a comment', async ({ token }) => {
        expect(await warningsFor(`.a { color: var(${token}); }`, config)).toHaveLength(1);
    });

    test('rejects a config with no token sources', async () => {
        const result = await lint(
            '.a { color: var(--color-fg-missing); }',
            pluginConfig({ 'ag-website/no-undeclared-token': true })
        );

        expect(result.invalidOptionWarnings).not.toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    test('picks up a newly declared token once the cache expires', async () => {
        const root = mkdtempSync(join(tmpdir(), 'ag-website-stylelint-cache-'));
        const cacheConfig = pluginConfig({
            'ag-website/no-undeclared-token': [true, { tokenSources: [`${root}/*.scss`] }],
        });
        const code = '.a { color: var(--color-fg-new); }';

        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            expect(await warningsFor(code, cacheConfig)).toHaveLength(1);

            writeFileSync(join(root, 'tokens.scss'), ':root { --color-fg-new: #000; }');
            expect(await warningsFor(code, cacheConfig)).toHaveLength(1);

            vi.advanceTimersByTime(5000);
            expect(await warningsFor(code, cacheConfig)).toEqual([]);
        } finally {
            vi.useRealTimers();
        }
    });
});

describe('ag-website/no-palette-token', () => {
    const config = pluginConfig({ 'ag-website/no-palette-token': true });

    test('flags a raw palette step', async () => {
        expect(await warningsFor('.a { color: var(--color-gray-500); }', config)).toEqual([
            {
                rule: 'ag-website/no-palette-token',
                severity: 'error',
                text: 'var(--color-gray-500) is a raw palette step that does not adapt to dark mode. Use a semantic or --color-util-* token instead. (ag-website/no-palette-token)',
            },
        ]);
    });

    test('allows util and semantic tokens', async () => {
        expect(
            await warningsFor('.a { color: var(--color-util-gray-500); background: var(--color-bg-primary); }', config)
        ).toEqual([]);
    });
});

describe('createWebsiteStylelintConfig', () => {
    const config = createWebsiteStylelintConfig({ websiteRoot });

    async function rulesFor(code, filename = 'test.module.scss') {
        const result = await lint(code, config, join(websiteRoot, 'src', filename));
        return result.warnings.map(({ rule, severity }) => `${rule}:${severity}`);
    }

    test('bans raw colours and warns on palette steps in SCSS modules', async () => {
        const code = `.a {
            color: #fff;
            background: red;
            border-color: rgb(0 0 0);
            outline-color: var(--color-gray-500);
        }`;

        expect((await rulesFor(code)).sort()).toEqual([
            'ag-website/no-palette-token:warning',
            'color-named:error',
            'color-no-hex:error',
            'function-disallowed-list:error',
        ]);
    });

    test('allows tokens mixed with color-mix() and keywords in SCSS modules', async () => {
        const code = `.a {
            color: color-mix(in srgb, var(--color-fg-primary) 50%, transparent);
            border-color: currentcolor;
        }`;

        expect(await rulesFor(code)).toEqual([]);
    });

    test('checks only undeclared tokens outside SCSS modules', async () => {
        const code = '.a { color: #fff; background: var(--color-gray-500); border-color: var(--color-fg-missing); }';

        expect(await rulesFor(code, 'global.scss')).toEqual(['ag-website/no-undeclared-token:error']);
    });

    test('requires a description on a disable comment', async () => {
        const code = `.a {
            /* stylelint-disable-next-line color-no-hex */
            color: #fff;
        }`;

        expect(await rulesFor(code)).toEqual(['--report-descriptionless-disables:error']);
    });

    test('accepts a disable comment with a description', async () => {
        const code = `.a {
            /* stylelint-disable-next-line color-no-hex -- matches the third-party logo */
            color: #fff;
        }`;

        expect(await rulesFor(code)).toEqual([]);
    });

    test('reports a disable comment that disables nothing', async () => {
        const code = `.a {
            /* stylelint-disable-next-line color-no-hex -- not needed */
            color: var(--color-fg-primary);
        }`;

        expect(await rulesFor(code)).toEqual(['--report-needless-disables:error']);
    });
});
