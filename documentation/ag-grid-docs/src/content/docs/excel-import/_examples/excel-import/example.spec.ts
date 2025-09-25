import { clickAllButtons, ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await clickAllButtons(page);
        // END PLACEHOLDER

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Gong Jinjie');
    });
});
