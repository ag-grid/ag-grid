import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { wrapAgTestIdFor } from 'ag-grid-community';

async function loadE2ETestingExample(page: Page, framework: string): Promise<Page> {
    // https://www.ag-grid.com/javascript-data-grid/provided-cell-editors-text/#example-text-editor
    await page.goto(`examples/provided-cell-editors-text/text-editor/${framework}?enableTestIds=true&prod=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const FRAMEWORKS = ['typescript', 'reactFunctional', 'angular', 'vue3'] as const;

test.describe('Edit e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and edit a row in ${fw}`, async ({ page }) => {
            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            await loadE2ETestingExample(page, fw);

            await expect(agIdFor.overlay()).toBeHidden();

            await expect(agIdFor.cell('0', 'color')).toContainText('Violet');
            await expect(agIdFor.cell('0', 'value')).toContainText('£ 118');

            // Edit the color cell
            const cell = agIdFor.cell('0', 'color');
            await cell.dblclick();
            const editor = cell.locator('input');
            await editor.fill('Blue');

            await editor.press('Tab');

            // Edit the value cell
            const valueCell = agIdFor.cell('0', 'value');
            // Should already in in edit mode due to the previous tab
            const valueEditor = valueCell.locator('input');
            await valueEditor.fill('200');
            // Press enter to finish editing
            await valueEditor.press('Enter');
            // Check the values have been updated
            await expect(agIdFor.cell('0', 'color')).toContainText('Blue');
            await expect(agIdFor.cell('0', 'value')).toContainText('£ 200');
        });
    }
});
