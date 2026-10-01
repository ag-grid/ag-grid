import type { GeneratedContents } from '@components/example-generator/types';
import { describe, expect, it } from 'vitest';

import { getExampleViewerFiles, pruneExampleFiles } from './exampleViewerFiles';

const files = {
    'main.ts': 'const gridOptions = {};\n',
    'interfaces.ts': 'export interface IRow {}\n',
    'index.html': '<div id="myGrid"></div>\n',
    'styles.css': '.red { color: red; }\n',
    'example.spec.ts': "test('grid', () => {});\n",
    'main.test.ts': "test('grid', () => {});\n",
};

describe('pruneExampleFiles', () => {
    it('drops spec and test files for every framework', () => {
        for (const internalFramework of ['vanilla', 'typescript', 'reactFunctionalTs', 'angular', 'vue3'] as const) {
            const pruned = Object.keys(pruneExampleFiles(files, internalFramework));
            expect(pruned, internalFramework).not.toContain('example.spec.ts');
            expect(pruned, internalFramework).not.toContain('main.test.ts');
        }
    });

    it('hides the TypeScript interfaces from the JavaScript variants only', () => {
        expect(Object.keys(pruneExampleFiles(files, 'vanilla'))).not.toContain('interfaces.ts');
        expect(Object.keys(pruneExampleFiles(files, 'reactFunctional'))).not.toContain('interfaces.ts');
        expect(Object.keys(pruneExampleFiles(files, 'typescript'))).toContain('interfaces.ts');
        expect(Object.keys(pruneExampleFiles(files, 'reactFunctionalTs'))).toContain('interfaces.ts');
        expect(Object.keys(pruneExampleFiles(files, 'angular'))).toContain('interfaces.ts');
    });

    it('hides the HTML shell for React and Vue, whose markup lives in the component', () => {
        expect(Object.keys(pruneExampleFiles(files, 'reactFunctional'))).not.toContain('index.html');
        expect(Object.keys(pruneExampleFiles(files, 'reactFunctionalTs'))).not.toContain('index.html');
        expect(Object.keys(pruneExampleFiles(files, 'vue3'))).not.toContain('index.html');
        expect(Object.keys(pruneExampleFiles(files, 'vanilla'))).toContain('index.html');
        expect(Object.keys(pruneExampleFiles(files, 'typescript'))).toContain('index.html');
        expect(Object.keys(pruneExampleFiles(files, 'angular'))).toContain('index.html');
    });

    it('keeps the remaining files and their contents, without mutating the input', () => {
        const input = { ...files };
        const pruned = pruneExampleFiles(input, 'typescript');

        expect(pruned).toEqual({
            'main.ts': files['main.ts'],
            'interfaces.ts': files['interfaces.ts'],
            'index.html': files['index.html'],
            'styles.css': files['styles.css'],
        });
        expect(input).toEqual(files);
    });
});

describe('getExampleViewerFiles', () => {
    const contents = {
        files: {
            ...files,
            'main.ts': [
                "const AI_API_TOKEN = 'secret-token';",
                'const gridOptions = {};',
                '/** DARK INTEGRATED START **/',
                'document.documentElement.dataset.agThemeMode = "dark";',
                '/** DARK INTEGRATED END **/',
                '',
            ].join('\n'),
        },
        entryFileName: 'main.ts',
        mainFileName: 'main.ts',
    } as unknown as GeneratedContents;

    it('prunes for the framework and strips the generator harness from the main file', () => {
        const { files: viewerFiles, mainFileName } = getExampleViewerFiles(contents, 'vanilla');

        expect(mainFileName).toBe('main.ts');
        expect(Object.keys(viewerFiles)).toEqual(['main.ts', 'index.html', 'styles.css']);
        expect(viewerFiles['main.ts']).not.toContain('DARK INTEGRATED');
        expect(viewerFiles['main.ts']).toContain('const gridOptions = {};');
    });

    it('redacts AI API tokens so they never reach the page', () => {
        const { files: viewerFiles } = getExampleViewerFiles(contents, 'typescript');

        expect(viewerFiles['main.ts']).not.toContain('secret-token');
        expect(viewerFiles['main.ts']).toContain("const AI_API_TOKEN = '<TOKEN_REDACTED>'");
    });

    it('falls back to the entry file when there is no main file', () => {
        const { mainFileName } = getExampleViewerFiles(
            { ...contents, mainFileName: undefined } as unknown as GeneratedContents,
            'typescript'
        );

        expect(mainFileName).toBe('main.ts');
    });

    it('leaves the generated contents untouched', () => {
        const before = JSON.stringify(contents);
        getExampleViewerFiles(contents, 'vanilla');

        expect(JSON.stringify(contents)).toBe(before);
    });
});
