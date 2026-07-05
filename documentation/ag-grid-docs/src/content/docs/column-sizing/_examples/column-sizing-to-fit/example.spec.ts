import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

test.agExample(import.meta, () => {
    test.eachFramework('Athlete column is excluded from size-to-fit', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // athlete has width: 150 and suppressSizeToFit: true, so it keeps its fixed width
        // even after the autoSizeStrategy (fitGridWidth) has run on load.
        expect(await getWidth(agIdFor.headerCell('athlete'))).toBe(150);

        // country has a minWidth: 900 column limit, but its colDef maxWidth: 300 wins,
        // so it is capped at 300.
        expect(await getWidth(agIdFor.headerCell('country'))).toBe(300);
    });

    test.eachFramework('sizeColumnsToFit keeps the athlete column fixed', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        expect(await getWidth(agIdFor.headerCell('athlete'))).toBe(150);

        // Re-apply size-to-fit on demand via the API button.
        await page.locator('button', { hasText: 'Resize Columns to Fit Grid Width' }).click();

        // athlete stays fixed; country stays capped at its maxWidth of 300.
        expect(await getWidth(agIdFor.headerCell('athlete'))).toBe(150);
        expect(await getWidth(agIdFor.headerCell('country'))).toBe(300);
    });
});
