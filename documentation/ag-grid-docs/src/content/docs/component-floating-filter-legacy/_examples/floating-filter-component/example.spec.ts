import { clickAllButtons, ensureGridReady, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agFramework, page }) => {
        test.skip(agFramework === 'vanilla' || agFramework === 'typescript', 'Examples only for frameworks.');

        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });
});
