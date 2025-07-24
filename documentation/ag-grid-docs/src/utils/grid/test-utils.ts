import type { Page } from '@playwright/test';

export const ALL_FRAMEWORKS = [
    'vanilla',
    'typescript',
    'reactFunctional',
    'reactFunctionalTs',
    'angular',
    'vue3',
] as const;

export async function loadPage(page: Page, pageExampleUrl: `${string}/${string}`, framework: string): Promise<Page> {
    await page.goto(`/examples/${pageExampleUrl}/${framework}?enableTestIds=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}
