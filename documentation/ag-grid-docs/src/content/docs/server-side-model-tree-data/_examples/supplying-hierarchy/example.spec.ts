import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Hierarchy supplied client-side expands without a server call', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Only roots are served by the datasource; the first two levels open by default.
        await expect(groupRow('Kathryn Powers')).toBeVisible();
        await expect(groupRow('Kathryn Powers').locator('[col-id="employmentType"]')).toContainText('Contract');
        await expect(groupRow('Addie Meyer')).toBeVisible();
        await expect(groupRow('Troy Walsh')).toBeVisible();

        // Troy Walsh's children were pre-supplied via applyServerSideRowData, not yet displayed.
        await expect(groupRow('Joshua Matthews')).toHaveCount(0);

        // Expanding a deeper group shows the pre-supplied children without hitting the (failing) datasource.
        await groupRow('Troy Walsh').locator('.ag-group-contracted').first().click();
        await expect(groupRow('Joshua Matthews')).toBeVisible();
        await expect(groupRow('Mitchell Wong')).toBeVisible();
    });
});
