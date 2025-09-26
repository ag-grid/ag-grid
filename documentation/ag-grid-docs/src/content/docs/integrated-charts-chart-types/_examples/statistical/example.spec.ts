import { clickAllButtons, ensureGridReady, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);

        await agIdFor.overlay().waitFor({ state: 'hidden' });

        await clickAllButtons(page);
        // END PLACEHOLDER
    });
});
