import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pivot mode groups the students by year group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The deterministic dataset produces Year 1 to Year 4 groups.
        await expect(agIdFor.autoGroupCell('row-group-yearGroup-Year 1')).toContainText('Year 1', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell('row-group-yearGroup-Year 4')).toContainText('Year 4', {
            useInnerText: true,
        });
    });

    test.eachFramework(
        'Adding rows for a new year group creates the group via change detection',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // No Year 5 group exists in the initial data.
            await expect(agIdFor.autoGroupCell('row-group-yearGroup-Year 5')).not.toBeVisible();

            await page.locator('button', { hasText: 'Add Year 5' }).click();

            await expect(agIdFor.autoGroupCell('row-group-yearGroup-Year 5')).toContainText('Year 5', {
                useInnerText: true,
            });
        }
    );
});
