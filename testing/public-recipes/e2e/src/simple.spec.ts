import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { agTestIdFor } from 'ag-grid-community';

async function loadE2ETestingExample(page: Page, framework: string): Promise<Page> {
    await page.goto(`/examples/testing/hello-world/${framework}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const FRAMEWORKS = ['typescript', 'reactFunctional', 'angular', 'vue3'] as const;

test.describe('Simple e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and select row in ${fw}`, async ({ page }) => {
            await loadE2ETestingExample(page, fw);

            await expect(page.getByTestId(agTestIdFor.rowNode('row-group-country-South Korea'))).toBeVisible({
                timeout: 20_000,
            });
            await expect(
                page.getByTestId(agTestIdFor.cell('row-group-country-South Korea', 'ag-Grid-AutoColumn'))
            ).toContainText('South Korea');

            const checkbox = page.getByTestId(
                agTestIdFor.checkbox('row-group-country-Norway', 'ag-Grid-SelectionColumn')
            );
            await checkbox.click();
            await expect(checkbox).toBeChecked();
        });
    }
});

test.describe('Interactive e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can expand a group row and then enable pivoting in ${fw}`, async ({ page }) => {
            await loadE2ETestingExample(page, fw);

            await page
                .getByTestId(agTestIdFor.groupContracted('row-group-country-South Korea', 'ag-Grid-AutoColumn'))
                .click();

            await expect(page.getByTestId(agTestIdFor.cell('an-hyeon-su-2006', 'athlete'))).toContainText(
                'An Hyeon-Su'
            );

            await page.getByTestId(agTestIdFor.pivotModeSelect()).click();

            await page
                .getByTestId(agTestIdFor.columnSelectListItemDragHandle('Year Column'))
                .dragTo(page.getByText('Drag here to set column labels'));

            await expect(page.getByTestId(agTestIdFor.headerGroupCell('pivotGroup_year_2000_0'))).toBeVisible();
        });
    }
});
