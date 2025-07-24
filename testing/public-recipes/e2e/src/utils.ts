import type { Page } from 'playwright/test';

export const FRAMEWORKS = ['vanilla', 'typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'] as const;

export async function loadPage(page: Page, url: string, framework: string): Promise<Page> {
    await page.goto(`${url}/${framework}?enableTestIds=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}
