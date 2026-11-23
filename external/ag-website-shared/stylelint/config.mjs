import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEBSITE_SHARED_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Stylelint config for the website's SCSS modules, shared by every repo that
 * hosts ag-website-shared. `websiteRoot` is the absolute path of the repo's own
 * website package, whose stylesheets are searched for token declarations
 * alongside the shared ones.
 */
export function createWebsiteStylelintConfig({ websiteRoot }) {
    const tokenSources = [WEBSITE_SHARED_ROOT, websiteRoot].map((root) => `${root}/src/**/*.{scss,css}`);

    return {
        customSyntax: 'postcss-scss',
        plugins: [resolve(WEBSITE_SHARED_ROOT, 'stylelint/plugin.mjs')],
        reportDescriptionlessDisables: true,
        reportNeedlessDisables: true,
        rules: {
            'ag-website/no-undeclared-token': [true, { tokenSources }],
        },
        overrides: [
            {
                files: ['**/*.module.scss'],
                rules: {
                    'color-no-hex': [true, { message: 'Use a design system colour token instead of a hex colour.' }],
                    'color-named': [
                        'never',
                        { message: 'Use a design system colour token instead of a named colour.' },
                    ],
                    'function-disallowed-list': [
                        ['rgb', 'rgba', 'hsl', 'hsla'],
                        {
                            message:
                                'Use a design system colour token, or color-mix() with one, instead of a raw colour.',
                        },
                    ],
                    'ag-website/no-palette-token': [true, { severity: 'warning' }],
                },
            },
        ],
    };
}
