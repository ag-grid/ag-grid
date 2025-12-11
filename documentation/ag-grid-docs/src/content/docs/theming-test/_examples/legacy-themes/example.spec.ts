import { clickAllButtons, ensureGridReady, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.typescript('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });

    test.vanilla('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });
});
