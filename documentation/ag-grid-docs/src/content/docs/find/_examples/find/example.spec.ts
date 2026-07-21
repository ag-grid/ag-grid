import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Find is driven via grid options / API here. External controls: #find-text-box updates
// findSearchValue, Previous/Next buttons call findPrevious()/findNext(), #activeMatchNum shows
// "current/total", and the Go To input + button call findGoTo(matchNumber).
// Matched text is wrapped in <mark class="ag-find-match">; active match adds ag-find-active-match.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('#find-text-box');
    const activeMatchNum = (page: any) => page.locator('#activeMatchNum');

    test.eachFramework('Typing highlights matches and reports the total', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Swimming');

        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();
        // Before navigating there is no active match, so the display starts at 0/total (anchored).
        await expect(activeMatchNum(page)).toHaveText(/^\s*0\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(0);
    });

    test.eachFramework('Next and Previous buttons move the active match', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Swimming');
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();

        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expect(activeMatchNum(page)).toHaveText(/^\s*1\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);

        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expect(activeMatchNum(page)).toHaveText(/^\s*2\/\d+\s*$/);

        await page.getByRole('button', { name: 'Previous', exact: true }).click();
        await expect(activeMatchNum(page)).toHaveText(/^\s*1\/\d+\s*$/);
    });

    test.eachFramework('Go To jumps directly to a match number', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Swimming');
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();

        await page.locator('#find-goto').fill('3');
        await page.getByRole('button', { name: 'Go To', exact: true }).click();

        await expect(activeMatchNum(page)).toHaveText(/^\s*3\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);
    });
});
