import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.vue3('cell slot renders custom content for its column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'name')).toContainText('Wireless Mouse');
        await expect(agIdFor.cell('0', 'category')).toContainText('Electronics');
        await expect(agIdFor.cell('0', 'price')).toContainText('£24.99');
        await expect(agIdFor.cell('0', 'price').locator('strong')).toHaveCount(1);
    });
});
