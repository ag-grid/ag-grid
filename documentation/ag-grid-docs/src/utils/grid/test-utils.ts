import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

type ExampleUrl = `${string}/${string}`;

export const ALL_FRAMEWORKS = [
    'typescript',
    'vanilla',
    // 'reactFunctional', // These are computed from reactFunctionalTs by Typescript striping the types so very unlikely to result in different errors to the typescript version
    'reactFunctionalTs',
    'angular',
    'vue3',
] as const;
type Framework = (typeof ALL_FRAMEWORKS)[number];

export function runForAllFrameworks(testFn: (fw: Framework) => void): void {
    for (const fw of ALL_FRAMEWORKS) {
        testFn(fw);
    }
}

export async function loadPage(
    page: Page,
    pageExampleUrl: ExampleUrl,
    framework: (typeof ALL_FRAMEWORKS)[number]
): Promise<Page> {
    await page.goto(`/examples/${pageExampleUrl}/${framework}?enableTestIds=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

/**
 *
 * @param testName Names of this test case. Useful if running multiple tests against the same example.
 * @param exampleUrl Example URL in the format 'page/exampleName'
 * @param testBody The test body function that will be executed for each framework
 */
export function testAllFrameworks(
    testName: string,
    exampleUrl: ExampleUrl,
    testBody: ({ page, framework }: { page: Page; framework: Framework }) => Promise<void>
): void {
    test.describe(`${exampleUrl} ${testName}`, () => {
        for (const framework of ALL_FRAMEWORKS) {
            test(`${framework}`, async ({ page }) => {
                await loadPage(page, exampleUrl, framework);
                await testBody({ page, framework });
            });
        }
    });
}
