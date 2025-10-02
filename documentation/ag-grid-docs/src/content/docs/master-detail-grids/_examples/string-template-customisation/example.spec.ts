import { clickAllButtons, ensureGridReady, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agFramework, page }) => {
        test.skip(agFramework.includes('react'), 'Example not for React.');

        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });
});
