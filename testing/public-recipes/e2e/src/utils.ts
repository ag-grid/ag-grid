import type { Page } from 'playwright/test';

export const FRAMEWORKS = ['vanilla', 'typescript', 'reactFunctional', 'angular', 'vue3'] as const;

export function createPageLoader(url: string) {
    return async function loadE2ETestingExample(page: Page, framework: string): Promise<Page> {
        await page.goto(`/${url}/${framework}?enableTestIds=true`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('load');
        await page.waitForLoadState('networkidle');

        return page;
    };
}
