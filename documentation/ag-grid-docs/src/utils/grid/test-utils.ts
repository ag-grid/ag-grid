import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

type ExampleUrl = `${string}/${string}`;

export const ALL_FRAMEWORKS = [
    'typescript',
    'vanilla',
    // 'reactFunctional', // These are computed from reactFunctionalTs by Typescript striping the types so very unlikely to result in different errors to the typescript version
    'reactFunctionalTs',
    'angular',
    'vue3',
] as const;

export function runForAllFrameworks(testFn: (fw: (typeof ALL_FRAMEWORKS)[number]) => void): void {
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

export function testAllFrameworks(
    testName: string,
    exampleUrl: ExampleUrl,
    testBody: (page: Page) => Promise<void>
): void {
    test.describe(`${exampleUrl} ${testName}`, () => {
        for (const fw of ALL_FRAMEWORKS) {
            test(`${fw}`, async ({ page }) => {
                await loadPage(page, exampleUrl, fw);
                await testBody(page);
            });
        }
    });
}
