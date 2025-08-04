/* eslint-disable no-empty-pattern */
import type { Page, TestType } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

import { wrapAgTestIdFor } from 'ag-grid-community';

type ExtractFixtures<T> = T extends TestType<infer A, infer O> ? A & O : never;

// Extract the fixtures from the base test type as Playwright doesn't export them directly
type PlaywrightFixtures = ExtractFixtures<typeof base>;

type AgGridFixtures = {
    agFramework: AgFramework;
    agExampleUrl?: AgExampleUrl;
    /**
     * A locator to get the ag-grid test ID for a specific cell or element.
     */
    agIdFor: ReturnType<typeof wrapAgTestIdFor<any>>;
};

type TestFixtures = PlaywrightFixtures & AgGridFixtures;

type AgExampleUrl = `${string}/${string}`;

const ALL_FRAMEWORKS = [
    'typescript',
    'vanilla',
    // 'reactFunctional', // These are computed from reactFunctionalTs by Typescript striping the types so very unlikely to result in different errors to the typescript version
    'reactFunctionalTs',
    'angular',
    'vue3',
] as const;
type AgFramework = (typeof ALL_FRAMEWORKS)[number];

async function loadPage(
    page: Page,
    agExampleUrl: AgExampleUrl,
    agFramework: (typeof ALL_FRAMEWORKS)[number]
): Promise<Page> {
    await page.goto(`/examples/${agExampleUrl}/${agFramework}?enableTestIds=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const extended = base.extend<TestFixtures>({
    agExampleUrl: [({}, use) => use(undefined), { option: true }],
    agFramework: [({}, use) => use(ALL_FRAMEWORKS[0]), { option: true }],
    agIdFor: [({ page }, use) => use(wrapAgTestIdFor((testId: string) => page.getByTestId(testId))), { option: true }],
});

const frameworkTest =
    (agFramework: AgFramework) =>
    /**
     * Run the test against a specific framework.
     * @param testName Names of this test case. Useful if running multiple tests against the same example.
     * @param testBody The test body function that will be executed for each framework.
     */
    (testName: string | undefined, testBody: (fixtures: TestFixtures) => Promise<void>): void => {
        extended.use({ agFramework });
        const testWrapper = async ({ page, agExampleUrl, agIdFor }: TestFixtures) => {
            if (!agExampleUrl) {
                throw new Error(
                    `Missing 'setAgExampleUrl(import.meta)' in the test file. This is required to set the example URL for the test.`
                );
            }

            await loadPage(page, agExampleUrl, agFramework);
            await testBody({ page, agExampleUrl, agIdFor, agFramework } as TestFixtures);
        };

        if (testName) {
            extended.describe(testName, () => {
                extended(`${agFramework} (only)`, testWrapper);
            });
        } else {
            extended(`${agFramework}`, testWrapper);
        }
    };

/**
 * Run the same test against all frameworks.
 * @param testName Names of this test case. Useful if running multiple tests against the same example.
 * @param testBody The test body function that will be executed for each framework.
 */
const eachFramework = (testName: string, testBody: (fixtures: TestFixtures) => Promise<void>) => {
    extended.describe(testName, () =>
        ALL_FRAMEWORKS.forEach((framework) => frameworkTest(framework)(undefined, testBody))
    );
};

/**
 * Set the example URL for the tests.
 * @param importMeta The import.meta object from the module where this function is called.
 */
export function setAgExampleUrl(importMeta: ImportMeta) {
    const pSegment = importMeta.url.split('/');

    const page = pSegment[pSegment.length - 4];
    const example = pSegment[pSegment.length - 2];

    extended.use({ agExampleUrl: `${page}/${example}` as AgExampleUrl });
}

// Expose call for each framework
const singleFrameworkTests = ALL_FRAMEWORKS.map((fw) => ({ [fw]: frameworkTest(fw) })).reduce(Object.assign);

const agGridTestExtension = {
    setAgExampleUrl,
    eachFramework,
};

type ExternalTestType = typeof extended & typeof agGridTestExtension & typeof singleFrameworkTests;

const test = Object.assign(extended, agGridTestExtension, singleFrameworkTests) as ExternalTestType;

export { expect, test };
