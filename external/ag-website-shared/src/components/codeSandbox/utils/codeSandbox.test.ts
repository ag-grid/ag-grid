import type { InternalFramework } from '@ag-grid-types';
import { describe, expect, it } from 'vitest';

import { getCodeSandboxFilesToSubmit } from './codeSandbox';

const getPayloadFiles = ({
    internalFramework,
    boilerPlateFiles,
}: {
    internalFramework: InternalFramework;
    boilerPlateFiles?: Record<string, string>;
}) =>
    getCodeSandboxFilesToSubmit({
        title: 'Example',
        files: {
            'index.html': '<html></html>',
            'main.js': 'console.log("example");',
            'styles.css': '.example {}',
            'ag-example-styles.css': '.example-controls {}',
            'package.json': '{ "name": "example" }',
        },
        boilerPlateFiles,
        internalFramework,
    });

const hasPackageJson = (files: Record<string, unknown>) =>
    Object.keys(files).some((path) => path === 'package.json' || path.endsWith('/package.json'));

describe('getCodeSandboxFilesToSubmit', () => {
    it.each(['reactFunctional', 'reactFunctionalTs'] as InternalFramework[])(
        'keeps package.json for %s, which runs on a create-react-app sandbox template',
        (internalFramework) => {
            expect(hasPackageJson(getPayloadFiles({ internalFramework }))).toBe(true);
        }
    );

    it.each(['typescript', 'vanilla', 'angular', 'vue3'] as InternalFramework[])(
        'omits package.json for %s, which runs on the static sandbox runtime',
        (internalFramework) => {
            expect(hasPackageJson(getPayloadFiles({ internalFramework }))).toBe(false);
        }
    );

    it.each(['reactFunctional', 'reactFunctionalTs'] as InternalFramework[])(
        'serves every stylesheet from public/ for %s, where the linking index.html lives',
        (internalFramework) => {
            const files = getPayloadFiles({ internalFramework });

            expect(files).toHaveProperty(['public/index.html']);
            expect(files).toHaveProperty(['public/styles.css']);
            expect(files).toHaveProperty(['public/ag-example-styles.css']);
        }
    );

    it('keeps stylesheets beside index.html on the static sandbox runtime', () => {
        const files = getPayloadFiles({ internalFramework: 'vanilla' });

        expect(files).toHaveProperty(['index.html']);
        expect(files).toHaveProperty(['styles.css']);
    });

    it('omits a boilerplate-supplied package.json for the static sandbox runtime', () => {
        const files = getPayloadFiles({
            internalFramework: 'vanilla',
            boilerPlateFiles: { 'package.json': '{ "name": "boilerplate" }' },
        });

        expect(hasPackageJson(files)).toBe(false);
    });
});
