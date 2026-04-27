import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const australiaId = 'row-group-country-Australia';
        const australia2004Id = 'row-group-country-Australia-year-2004';
        const unitedStatesId = 'row-group-country-United States';

        // Initial state: isGroupOpenByDefault expands Australia > 2004
        await expect(agIdFor.autoGroupExpanded(australiaId)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(australia2004Id)).toBeVisible();
        await expect(agIdFor.autoGroupContracted(unitedStatesId)).toBeVisible();

        // Expand All — United States should now be expanded
        await page.getByRole('button', { name: 'Expand All' }).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.autoGroupExpanded(unitedStatesId)).toBeVisible();

        // Reset to Defaults — back to isGroupOpenByDefault state
        await page.getByRole('button', { name: 'Reset to Defaults' }).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.autoGroupExpanded(australiaId)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(australia2004Id)).toBeVisible();
        await expect(agIdFor.autoGroupContracted(unitedStatesId)).toBeVisible();

        // Collapse All — everything collapsed
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.autoGroupContracted(australiaId)).toBeVisible();

        // Reset to Defaults — Australia > 2004 expanded again
        await page.getByRole('button', { name: 'Reset to Defaults' }).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.autoGroupExpanded(australiaId)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(australia2004Id)).toBeVisible();
        await expect(agIdFor.autoGroupContracted(unitedStatesId)).toBeVisible();
    });
});
