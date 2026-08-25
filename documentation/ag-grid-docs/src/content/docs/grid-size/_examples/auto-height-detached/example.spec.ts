import { expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// TypeScript only - the framework wrappers mount into the document, so they cannot build a grid detached.
test.agExample(import.meta, () => {
    test.typescript('renders only a small window while detached', async ({ page }) => {
        // A detached grid has no measurable height, so poll until it has rendered at all.
        await expect(async () => {
            await page.getByRole('button', { name: 'Measure detached' }).click();
            expect(await readCount(page)).toBeGreaterThan(0);
        }).toPass();

        // The grid renders a window of rows, but must not render the whole dataset before it is measurable.
        const rendered = await readCount(page);
        expect(rendered).toBeGreaterThan(1);
        expect(rendered).toBeLessThan(25);
    });
});

async function readCount(page: Page) {
    return Number(await page.locator('#count').textContent());
}
