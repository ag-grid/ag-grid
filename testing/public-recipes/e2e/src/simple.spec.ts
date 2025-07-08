import type { FrameLocator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { agTestIdFor } from 'ag-grid-community';

async function loadE2ETestingExample(page: Page, framework: string): Promise<FrameLocator> {
    await page.goto(`/examples/testing/hello-world/${framework}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page.frameLocator('[title="Hello World"]');
}

const FRAMEWORKS = ['typescript', 'reactFunctional', 'angular', 'vue3'] as const;

test.describe('Simple e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and select row in ${fw}`, async ({ page }) => {
            const frame = await loadE2ETestingExample(page, fw);
            expect(frame).toBeTruthy();

            await expect(frame.getByTestId(agTestIdFor.rowNode('row-group-country-South Korea'))).toBeVisible({
                timeout: 20_000,
            });
            await expect(
                frame.getByTestId(agTestIdFor.cell('row-group-country-South Korea', 'ag-Grid-AutoColumn'))
            ).toContainText('South Korea');

            const checkbox = frame.getByTestId(
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
            const frame = await loadE2ETestingExample(page, fw);
            expect(frame).toBeTruthy();

            await frame
                .getByTestId(agTestIdFor.groupContracted('row-group-country-South Korea', 'ag-Grid-AutoColumn'))
                .click();

            await expect(frame.getByTestId(agTestIdFor.cell('an-hyeon-su-2006', 'athlete'))).toContainText(
                'An Hyeon-Su'
            );

            await frame.getByTestId(agTestIdFor.pivotModeSelect()).click();

            await frame
                .getByTestId(agTestIdFor.columnSelectListItemDragHandle('Year Column'))
                .dragTo(frame.getByText('Drag here to set column labels'));

            await expect(frame.getByTestId(agTestIdFor.headerGroupCell('pivotGroup_year_2000_0'))).toBeVisible();
        });
    }
});
