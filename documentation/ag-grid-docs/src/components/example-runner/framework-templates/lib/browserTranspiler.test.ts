import type { InternalFramework } from '@ag-grid-types';
import {
    COMPILER_OPTION_ENUMS,
    getCompilerOptionNames,
    getCompilerOptions,
    resolveCompilerOptions,
} from '@utils/exampleModules/transformExampleModule';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

/**
 * The transpiler is served to the example page as it is written, so the test runs the file itself
 * rather than a module built from it -- what it asserts on is what a browser executes.
 */
const TRANSPILER_PATH = join(__dirname, '../../../../../public/example-runner/browser-transpiler.js');
const transpilerSource = readFileSync(TRANSPILER_PATH, 'utf8');

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'];

describe('browser-transpiler.js', () => {
    /**
     * The served file cannot import the map the options are named against, so it carries its own
     * copy. A name this side resolves and the page's does not reaches `transpileModule` as
     * `undefined`, which silently changes what is emitted rather than failing -- so the copies are
     * checked against their source here instead.
     */
    test('carries the same enum map the options are named against', () => {
        const match = transpilerSource.match(/const COMPILER_OPTION_ENUMS = (\{[^}]*\});/);
        expect(match, 'COMPILER_OPTION_ENUMS not found in browser-transpiler.js').not.toBeNull();

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

        test('resolves the names the page carries to the options the server transpiles with', () => {
            // What the page ships, resolved the way `browser-transpiler.js` resolves it
            const fromPage = resolveCompilerOptions(ts, getCompilerOptionNames(internalFramework));

            expect(fromPage).toEqual(getCompilerOptions(ts, internalFramework));
        });
    });

    test('emits JSX only for React, and decorator metadata only for Angular', () => {
        // Angular's JIT compiler needs `design:paramtypes` to resolve constructor injection;
        // nothing else does, and an example's options should read as its own toolchain
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
