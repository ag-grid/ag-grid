import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Find is driven via grid options / API here. External controls: a text box updates
// findSearchValue, Previous/Next buttons call findPrevious()/findNext(), a span shows
// "current/total", and the Go To input + button call findGoTo(matchNumber).
// Matched text is wrapped in <mark class="ag-find-match">; active match adds ag-find-active-match.
//
// The control `id`s are dropped by the framework example transforms, so target the controls by
// structure (their position within .example-controls) so the selectors hold across every framework.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.example-controls input[type="text"]');
    const gotoInput = (page: any) => page.locator('.example-controls input[type="number"]');
    // The match counter is the trailing span of the first controls row (after the "Find:" label).
    const activeMatchNum = (page: any) => page.locator('.example-controls').first().locator('span').last();

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

        await gotoInput(page).fill('3');
        await page.getByRole('button', { name: 'Go To', exact: true }).click();

        await expect(activeMatchNum(page)).toHaveText(/^\s*3\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);
    });
});
