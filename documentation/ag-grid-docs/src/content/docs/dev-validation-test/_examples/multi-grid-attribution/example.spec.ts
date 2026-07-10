import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const overlay = '.ag-overlay-error-wrapper';
const unattributed = '.ag-overlay-error-unattributed';

test.agExample(import.meta, () => {
    test.eachFramework(
        'diagnostics attribute to the grid that emitted them',
        async ({ page }) => {
            await ensureGridReady(page);

            const grids = page.locator('.ag-root-wrapper');
            const gridA = grids.nth(0);
            const gridB = grids.nth(1);

            // Both grids start valid, so neither shows a diagnostic overlay.
            await expect(page.locator(overlay)).toHaveCount(0);

            // An error on Grid A surfaces on Grid A only, attributed to it (so not flagged as unattributed).
            await page.getByRole('button', { name: 'Trigger error', exact: true }).nth(0).click();
            await expect(gridA.locator(overlay)).toBeVisible();
            await expect(page.locator(overlay)).toHaveCount(1);
            await expect(gridA.locator(unattributed)).toHaveCount(0);

            // A warning on Grid B surfaces on Grid B, independent of Grid A.
            await page.getByRole('button', { name: 'Trigger warning', exact: true }).nth(1).click();
            await expect(gridB.locator(overlay)).toBeVisible();
            await expect(page.locator(overlay)).toHaveCount(2);
        },
        // Grid A's error #200 (unregistered module) and Grid B's warning #22 (initial-only option changed).
        { allowedConsoleMessages: ['error #200', 'warning #22'] }
    );

    test.eachFramework(
        'an async diagnostic stays on the grid that produced it',
        async ({ page }) => {
            await ensureGridReady(page);

            const grids = page.locator('.ag-root-wrapper');
            const gridA = grids.nth(0);

            // The transaction is flushed on a later frame, so the row-id warning is emitted from the
            // grid's own async work. It must still land on Grid A only.
            await page.getByRole('button', { name: 'Trigger async warning', exact: true }).nth(0).click();
            await expect(gridA.locator(overlay)).toBeVisible();
            await expect(page.locator(overlay)).toHaveCount(1);
        },
        // The added row's numeric id isn't a string, surfacing warning #25.
        { allowedConsoleMessages: ['warning #25'] }
    );

    test.eachFramework(
        'a diagnostic from a destroyed grid surfaces on the surviving grid',
        async ({ page }) => {
            await ensureGridReady(page);

            // Destroying Grid A and then calling its API produces a diagnostic no grid can own. Grid A
            // no longer has an overlay listener, so it surfaces on the remaining live grid (Grid B)
            // rather than being lost. Because Grid B did not emit it, the overlay flags it as unattributed.
            await page.getByRole('button', { name: 'Destroy grid, then call API', exact: true }).click();
            await expect(page.locator(overlay)).toBeVisible();
            await expect(page.locator(overlay)).toHaveCount(1);
            await expect(page.locator(unattributed)).toBeVisible();
        },
        // Calling the API of a destroyed grid surfaces warning #26.
        { allowedConsoleMessages: ['warning #26'] }
    );
});
