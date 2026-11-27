// @vitest-environment jsdom
import type { InternalFramework } from '@ag-grid-types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCodeSandboxFilesToSubmit, openCodeSandbox } from './codeSandbox';

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
        'serves the linked shared stylesheet from public/ and imported stylesheets from src/ for %s',
        (internalFramework) => {
            const files = getPayloadFiles({ internalFramework });

            expect(files).toHaveProperty(['public/index.html']);
            expect(files).toHaveProperty(['public/ag-example-styles.css']);
            expect(files).toHaveProperty(['src/styles.css']);
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

describe('openCodeSandbox', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('submits its fields in textareas, which Google Tag Manager does not scan for email addresses', () => {
        let submitted: HTMLFormElement | undefined;
        vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (this: HTMLFormElement) {
            submitted = this;
        });

        openCodeSandbox({
            title: 'Example',
            files: { 'main.js': 'console.log("example");' },
            internalFramework: 'vanilla',
        });

        expect(submitted?.querySelectorAll('input')).toHaveLength(0);
        const fields = Object.fromEntries(new FormData(submitted));
        expect(fields).toMatchObject({
            'tags[0]': 'ag-grid',
            'tags[1]': 'ag-charts',
            'tags[2]': 'example',
            published: 'false',
            title: 'Example',
        });
        expect(fields.parameters).toEqual(expect.stringMatching(/^[\w-]+$/));
    });
});
