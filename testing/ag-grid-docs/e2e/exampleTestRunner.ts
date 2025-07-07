import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

import { clickAllButtons, getRowCountOrError, waitForGridReady } from './utils';

export type InternalFramework = 'vanilla' | 'typescript' | 'reactFunctional' | 'reactFunctionalTs' | 'angular' | 'vue3';

let examples: any;
interface ExampleTestCase {
    pageName: string;
    exampleName: string;
    internalFramework: InternalFramework;
}

const testExclusions: Partial<ExampleTestCase>[] = [
    { pageName: 'example-logger-test' },
    { pageName: 'security-test' },
    // Page contains test examples
    { pageName: 'cell-editing-batch-test' },
];

const matchesExclusion = (testCase: ExampleTestCase) => {
    return testExclusions.some((ex) => {
        return Object.keys(ex).every((key) => ex[key] === undefined || ex[key] === testCase[key]);
    });
};

export async function getFrameworkExamples(framework: InternalFramework) {
    if (!examples) {
        const filePath = join(__dirname, 'config', 'all-examples-cached.json');
        examples = JSON.parse(readFileSync(filePath, 'utf-8'));
    }

    return (examples as ExampleTestCase[]).filter(
        (e) =>
            e.internalFramework === framework &&
            !matchesExclusion(e) &&
            // ag-grid.com still uses the old importType
            ((e as any).importType === undefined || (e as any).importType === 'modules')
    );
    // .splice(0, 10); // Limit to 10 examples per framework for testing purposes
}

export async function getSelectionOfFrameworkExamples(
    framework: InternalFramework,
    nthExample: number,
    randomOffset: number
) {
    const allExamples = await getFrameworkExamples(framework);
    const filtered = allExamples.filter((_, i) => (i + randomOffset) % nthExample === 0);
    return filtered;
}

export function getExampleConfig(e) {
    const examplePath = `${e.pageName}/${e.exampleName}/${e.internalFramework}`;
    const url = `/examples/${examplePath}/`;
    return { examplePath, url };
}

const licenseTexts = [
    '****************************************************************************************************************************',
    '************************************************ AG Grid Enterprise License ************************************************',
    '************************************************** License Key Not Found ***************************************************',
    '* All AG Grid Enterprise features are unlocked for trial.                                                                  *',
    '* If you want to hide the watermark please email info@ag-grid.com for a trial license key.                                 *',
    '***************************************** AG Grid and AG Charts Enterprise License *****************************************',
    '* All AG Grid and AG Charts Enterprise features are unlocked for trial.                                                    *',
];

// TEMPORARY: maybe need a cleaner way of ignoring these warnings for specific tests
// Errors that we want to exclude from the test based on partial text match
const excludeErrors = [
    'AG Grid: Using custom components without `reactiveCustomComponents = true` is deprecated.',
    'ERROR ResizeObserver loop completed with undelivered notifications',
    // This error is thrown when a favicon is not found which is not relevant to the test
    'Failed to load resource: the server responded with a status of 404 ()',

    // Firefox specific errors that we want to ignore
    'InstallTrigger is deprecated and will be removed in the future.',
    'onmozfullscreenchange is deprecated.',
    'onmozfullscreenerror is deprecated.',
    'XML Parsing Error: not well-formed',
    'XML Parsing Error: syntax error',
    'Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content.',
];

export function setupConsoleExpectations(page) {
    const errors: string[] = [];

    // catch any errors or warnings and fail the test
    page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            const text = msg.text();
            if (!licenseTexts.includes(text)) {
                if (excludeErrors.some((e) => text.includes(e))) {
                    test.skip(false, text);
                } else {
                    errors.push(text);
                }
            }
        }
    });

    return errors;
}

export async function runExampleSpec(page: Page, url: string, errors: string[], clickButtons: boolean = true) {
    await page.goto(url);

    const rowCountOrError = await getRowCountOrError(page);
    if (typeof rowCountOrError === 'string') {
        expect(rowCountOrError).toBeUndefined();
        return;
    }

    if (
        !url.includes('/overlays/') &&
        !url.includes('component-loading-cell-renderer/custom-loading-cell-renderer-failed')
    ) {
        // Overlay examples do not load data so they will never pass the standard test
        await waitForGridReady(page);
    }

    const root = page.locator('.ag-root-wrapper');

    if (clickButtons) {
        await clickAllButtons(page);
    }

    expect(errors, 'Example Errors').toEqual([]);

    let exampleRemoved = false;
    await page.evaluate(() => {
        const win: any = window;
        if (win.tearDownExample) {
            win.tearDownExample();
            exampleRemoved = true;
        }
    });
    if (exampleRemoved) {
        await root.waitFor({ state: 'detached' });
    }

    expect(errors, 'Example Errors during destruction').toEqual([]);
}
