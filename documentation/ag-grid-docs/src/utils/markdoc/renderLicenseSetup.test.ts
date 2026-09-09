import type { MarkdownFramework } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { describe, expect, it } from 'vitest';

import { buildLicenseSetupMarkdown } from './renderLicenseSetup';

const SITE_ROOT = 'https://www.ag-grid.com/';

function build(framework: MarkdownFramework = 'javascript'): string {
    return buildLicenseSetupMarkdown({ framework, siteRoot: SITE_ROOT });
}

/** Fenced blocks in document order, as `[language, code]`. */
function fences(output: string): [string, string][] {
    return [...output.matchAll(/^(`{3,})(\S*)\n([\s\S]*?)^\1$/gm)].map(([, , language, code]) => [
        language,
        code.trimEnd(),
    ]);
}

describe('buildLicenseSetupMarkdown', () => {
    it('renders the tool headings in page order and at the page depths', () => {
        const headings = build()
            .split('\n')
            .filter((line) => line.startsWith('#'));

        expect(headings).toEqual([
            '## Validate Your Licence',
            '### Configure Your Application',
            '### Add Your Dependencies',
            '### Set Up Your Application',
            '## Seed Repositories',
        ]);
    });

    it('links the interactive-only steps back to the tool on the page', () => {
        const output = build('react');

        expect(output).toContain(
            '[Validate your licence key](https://www.ag-grid.com/react-data-grid/license-install/) using the tool on this page.'
        );
        expect(output).toContain(
            '[Use the tool on this page](https://www.ag-grid.com/react-data-grid/license-install/) to include Integrated Charts.'
        );
    });

    it('keeps the prose that introduces each snippet', () => {
        const output = build();

        expect(output).toContain('Copy the following dependencies into your `package.json`:');
        expect(output).toContain('Or install using npm:');
        expect(output).toContain('An example of how to set up your AG Grid Enterprise License Key:');
    });

    it('renders the selecting-modules note as a callout linking to the modules docs', () => {
        expect(build('react')).toContain(
            [
                '> **Note**',
                '>',
                '> To minimise bundle size, only register the modules you want to use. See the' +
                    ' [Selecting Modules](https://www.ag-grid.com/react-data-grid/modules/#selecting-modules)' +
                    ' docs for more information.',
            ].join('\n')
        );
    });

    // The UMD-bundle sentence is JavaScript-only on the page.
    it('adds the UMD bundle sentence for javascript only', () => {
        expect(build('javascript')).toContain(
            "docs for more information. If you're using the UMD bundle, you do not need to import or register the modules."
        );
        expect(build('react')).not.toContain('UMD bundle');
    });

    it('renders the older-version note as a callout linking to the archive', () => {
        expect(build()).toContain(
            [
                '> **Note**',
                '>',
                '> If you are using an AG Grid version before 33.0.0, please see the documentation for your' +
                    ' [version](https://www.ag-grid.com/documentation-archive/) for help on installing your license key.',
            ].join('\n')
        );
    });

    it('emits the dependencies and npm install snippets in page order', () => {
        const [dependencies, npmInstall] = fences(build('react'));

        // The page pins the dependencies snippet to json, whatever the framework.
        expect(dependencies[0]).toBe('json');
        expect(dependencies[1]).toContain('dependencies: {');
        expect(npmInstall).toEqual(['bash', 'npm install ag-grid-react ag-grid-enterprise']);
    });

    it.each([
        ['react', 'jsx', 'ag-grid-react'],
        ['angular', 'ts', 'ag-grid-angular'],
        ['vue', 'ts', 'ag-grid-vue3'],
    ] as const)('resolves the %s packages and fence language', (framework, language, wrapperPackage) => {
        const [dependencies, npmInstall, bootstrap] = fences(build(framework));

        expect(dependencies[1]).toContain(`"${wrapperPackage}"`);
        expect(npmInstall[1]).toBe(`npm install ${wrapperPackage} ag-grid-enterprise`);
        expect(bootstrap[0]).toBe(language);
        expect(bootstrap[1]).toContain(`YOUR_LICENSE_KEY`);
    });

    // The JavaScript page installs no framework wrapper, and bootstraps via createGrid.
    it('resolves the javascript packages', () => {
        const [dependencies, npmInstall, bootstrap] = fences(build('javascript'));

        expect(dependencies[1]).not.toContain('ag-grid-react');
        expect(npmInstall[1]).toBe('npm install ag-grid-enterprise');
        expect(bootstrap[0]).toBe('js');
        expect(bootstrap[1]).toContain('createGrid(<dom element>, gridOptions);');
    });

    // Integrated Charts is a page toggle, off by default, so the charts packages stay out.
    it('omits the Integrated Charts dependencies', () => {
        const output = build('react');

        expect(output).not.toContain('ag-charts-enterprise');
        expect(output).not.toContain('IntegratedChartsModule');
    });

    it('lists only the seed repositories for the framework', () => {
        const output = build('angular');
        const rows = output.split('\n').filter((line) => line.startsWith('| ['));

        expect(output).toContain('| GitHub Repo | Framework | Development Environment |');
        expect(rows.length).toBeGreaterThan(0);
        expect(rows.every((row) => row.includes('| angular |'))).toBe(true);
        expect(rows[0]).toContain(
            '[Angular CLI](https://github.com/ag-grid/ag-grid-seed/tree/main/enterprise/packages/angular-cli)'
        );
    });
});
