import type { InternalFramework } from '@ag-grid-types';
import {
    COMPILER_OPTION_ENUMS,
    resolveCompilerOptions,
} from '@ag-website-shared/components/example-runner/utils/transformExampleModule';
import { getCompilerOptionNames } from '@utils/exampleModules/exampleCompilerOptions';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

const CLIENT_PATH = join(__dirname, '../../../../../public/example-runner/example-runner.js');
const clientSource = readFileSync(CLIENT_PATH, 'utf8');

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'];

describe('example-runner.js runTranspiled', () => {
    test('carries the same enum map the options are named against', () => {
        const match = clientSource.match(/const COMPILER_OPTION_ENUMS = (\{[^}]*\});/);
        expect(match, 'COMPILER_OPTION_ENUMS not found in example-runner.js').not.toBeNull();

        expect(new Function(`return ${match![1]}`)()).toEqual(COMPILER_OPTION_ENUMS);
    });

    describe.each(FRAMEWORKS)('%s', (internalFramework) => {
        test('names every enum option, so the page says what it selects', () => {
            const named = getCompilerOptionNames(internalFramework);

            for (const [name, value] of Object.entries(named)) {
                if (name in COMPILER_OPTION_ENUMS) {
                    expect(typeof value, `${name} -> ${value}`).toBe('string');
                }
            }
        });

        test('resolves every name the page carries to a real TypeScript enum member', () => {
            const fromPage = resolveCompilerOptions(ts, getCompilerOptionNames(internalFramework));

            for (const name of Object.keys(COMPILER_OPTION_ENUMS)) {
                if (name in fromPage) {
                    expect(fromPage[name], `${name} did not name an enum member`).toBeTypeOf('number');
                }
            }
        });
    });

    test('emits JSX only for React, and decorator metadata only for Angular', () => {
        expect(getCompilerOptionNames('angular')).toEqual({
            module: 'ESNext',
            target: 'ES2022',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
        });
        expect(getCompilerOptionNames('reactFunctionalTs')).toEqual({
            module: 'ESNext',
            target: 'ES2022',
            jsx: 'React',
        });
        expect(getCompilerOptionNames('typescript')).toEqual({ module: 'ESNext', target: 'ES2022' });
        expect(getCompilerOptionNames('vue3')).toEqual({ module: 'ESNext', target: 'ES2022' });
    });
});
